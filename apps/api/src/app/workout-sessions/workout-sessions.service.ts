import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutSession } from './entities/workout-session.entity';
import { ExercisePerformed } from './entities/exercise-performed.entity';
import { Set } from './entities/set.entity';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateWorkoutSessionDto } from './dto/update-workout-session.dto';
import { AddSetDto, UpdateSetDto } from './dto/add-set.dto';
import { AddExerciseDto } from './dto/add-exercise.dto';
import { Exercise } from '../exercises/entities/exercise.entity';

@Injectable()
export class WorkoutSessionsService {
  constructor(
    @InjectRepository(WorkoutSession)
    private workoutSessionRepository: Repository<WorkoutSession>,
    @InjectRepository(ExercisePerformed)
    private exercisePerformedRepository: Repository<ExercisePerformed>,
    @InjectRepository(Set)
    private setRepository: Repository<Set>
  ) {}

  async create(
    createWorkoutSessionDto: CreateWorkoutSessionDto
  ): Promise<WorkoutSession> {
    const { exercisesPerformed, ...sessionData } = createWorkoutSessionDto;

    // Ensure date is set if not provided
    if (!sessionData.date) {
      sessionData.date = new Date().toDateString();
    }

    return this.workoutSessionRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const workoutSession = transactionalEntityManager.create(
          WorkoutSession,
          sessionData
        );
        await transactionalEntityManager.save(workoutSession);

        if (exercisesPerformed && exercisesPerformed.length > 0) {
          for (let i = 0; i < exercisesPerformed.length; i++) {
            const exercisePerformedData = exercisesPerformed[i];
            const exercisePerformed = transactionalEntityManager.create(
              ExercisePerformed,
              {
                exerciseId: exercisePerformedData.exerciseId,
                workoutSession,
                order: i, // Set the order for ExercisePerformed
              }
            );
            await transactionalEntityManager.save(exercisePerformed);

            if (
              exercisePerformedData.sets &&
              exercisePerformedData.sets.length > 0
            ) {
              for (let j = 0; j < exercisePerformedData.sets.length; j++) {
                const setData = exercisePerformedData.sets[j];
                const set = transactionalEntityManager.create(Set, {
                  ...setData,
                  exercisePerformed,
                  order: j, // Set the order explicitly
                });
                await transactionalEntityManager.save(set);
              }
            }
          }
        }

        const savedSession = await transactionalEntityManager.findOne(
          WorkoutSession,
          {
            where: { id: workoutSession.id },
            relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
            order: {
              exercisesPerformed: {
                order: 'ASC', // Changed from id to order
                sets: {
                  order: 'ASC',
                },
              },
            },
          }
        );

        return savedSession;
      }
    );
  }

  async findAll(): Promise<WorkoutSession[]> {
    return await this.workoutSessionRepository.find({
      relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
    });
  }

  async findOne(id: string): Promise<WorkoutSession> {
    try {
      const workoutSession = await this.workoutSessionRepository.findOneOrFail({
        where: { id },
        relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
        order: {
          exercisesPerformed: {
            order: 'ASC',
          },
        },
      });

      // Sort the sets for each exercisePerformed
      workoutSession.exercisesPerformed.forEach((exercise) => {
        exercise.sets.sort((a, b) => a.order - b.order);
      });

      return workoutSession;
    } catch (error) {
      throw new NotFoundException(`Workout session with ID "${id}" not found`);
    }
  }

  async update(
    id: string,
    updateWorkoutSessionDto: UpdateWorkoutSessionDto
  ): Promise<WorkoutSession> {
    await this.workoutSessionRepository.update(id, updateWorkoutSessionDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.workoutSessionRepository.delete(id);
  }

  async startSession(
    userId: string,
    workoutPlanId: string
  ): Promise<WorkoutSession> {
    const newSession = this.workoutSessionRepository.create({
      userId,
      workoutPlanId,
      date: new Date(),
    });
    return await this.workoutSessionRepository.save(newSession);
  }

  async addExerciseToSession(
    sessionId: string,
    addExerciseDto: AddExerciseDto
  ): Promise<WorkoutSession> {
    return this.workoutSessionRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const session = await transactionalEntityManager.findOneOrFail(
          WorkoutSession,
          {
            where: { id: sessionId },
            relations: ['exercisesPerformed'],
          }
        );

        const exercise: Exercise =
          await transactionalEntityManager.findOneOrFail(Exercise, {
            where: { id: addExerciseDto.exerciseId },
          });
        console.log('exercise', exercise);

        const exercisePerformed = transactionalEntityManager.create(
          ExercisePerformed,
          {
            exerciseId: exercise.id,
            workoutSession: session,
            order: session.exercisesPerformed.length,
          }
        );

        await transactionalEntityManager.save(exercisePerformed);

        for (const [index, setData] of addExerciseDto.sets.entries()) {
          const set = transactionalEntityManager.create(Set, {
            reps: setData.reps,
            weight: setData.weight,
            exercisePerformed,
            order: index,
          });
          await transactionalEntityManager.save(set);
        }
        return this.findOne(sessionId);
      }
    );
  }

  async removeExerciseFromSession(
    sessionId: string,
    exerciseId: string
  ): Promise<WorkoutSession> {
    return this.workoutSessionRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const session = await transactionalEntityManager.findOne(
          WorkoutSession,
          {
            where: { id: sessionId },
            relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
          }
        );

        if (!session) {
          throw new NotFoundException('Workout session not found');
        }

        const exercisePerformedIndex = session.exercisesPerformed.findIndex(
          (ep) => ep.exerciseId === exerciseId
        );

        if (exercisePerformedIndex === -1) {
          throw new NotFoundException('Exercise not found in session');
        }

        const exercisePerformed =
          session.exercisesPerformed[exercisePerformedIndex];

        // Remove all sets associated with this exercise
        await transactionalEntityManager.remove(exercisePerformed.sets);

        // Remove the exercisePerformed entity
        await transactionalEntityManager.remove(exercisePerformed);

        // Remove the exercise from the session's exercisesPerformed array
        session.exercisesPerformed.splice(exercisePerformedIndex, 1);

        // Save the updated session
        await transactionalEntityManager.save(session);

        return this.findOne(sessionId);
      }
    );
  }

  async addSetToExercise(
    sessionId: string,
    exerciseId: string,
    addSetDto: AddSetDto
  ): Promise<WorkoutSession> {
    const exercisePerformed = await this.exercisePerformedRepository.findOne({
      where: {
        workoutSession: { id: sessionId },
        exerciseId: exerciseId,
      },
      relations: ['sets', 'workoutSession'],
    });

    if (!exercisePerformed) {
      throw new NotFoundException('Exercise not found in session');
    }

    const newOrder = exercisePerformed.sets.length;
    const set = this.setRepository.create({
      ...addSetDto,
      exercisePerformed,
      order: newOrder,
    });

    await this.setRepository.save(set);

    return this.findOne(sessionId);
  }

  async completeSession(sessionId: string): Promise<WorkoutSession> {
    const session = await this.findOne(sessionId);
    // If you want to add a completedAt field, you'll need to add it to the entity first
    // session.completedAt = new Date();
    return await this.workoutSessionRepository.save(session);
  }

  async updateSet(
    sessionId: string,
    exerciseId: string,
    setId: string,
    updateSetDto: UpdateSetDto
  ): Promise<WorkoutSession> {
    const session = await this.findOne(sessionId);
    const exercisePerformed = session.exercisesPerformed.find(
      (ep) => ep.exerciseId === exerciseId
    );

    if (!exercisePerformed) {
      throw new NotFoundException('Exercise not found in session');
    }

    const set = exercisePerformed.sets.find((s) => s.id === setId);

    if (!set) {
      throw new NotFoundException('Set not found in exercise');
    }

    await this.setRepository.update(setId, updateSetDto);

    return this.findOne(sessionId);
  }

  async removeSet(
    sessionId: string,
    exerciseId: string,
    setId: string
  ): Promise<WorkoutSession> {
    const session = await this.findOne(sessionId);
    const exercisePerformed = session.exercisesPerformed.find(
      (ep) => ep.exerciseId === exerciseId
    );

    if (!exercisePerformed) {
      throw new NotFoundException('Exercise not found in session');
    }

    const setIndex = exercisePerformed.sets.findIndex((s) => s.id === setId);

    if (setIndex === -1) {
      throw new NotFoundException('Set not found in exercise');
    }

    await this.setRepository.delete(setId);

    // Remove the set from the array
    exercisePerformed.sets.splice(setIndex, 1);

    // Update the order of remaining sets
    for (let i = setIndex; i < exercisePerformed.sets.length; i++) {
      exercisePerformed.sets[i].order = i;
      await this.setRepository.update(exercisePerformed.sets[i].id, {
        order: i,
      });
    }

    return this.workoutSessionRepository.save(session);
  }
}
