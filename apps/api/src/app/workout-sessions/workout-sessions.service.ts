import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutSession } from './entities/workout-session.entity';
import { ExercisePerformed } from './entities/exercise-performed.entity';
import { Set } from './entities/set.entity';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateWorkoutSessionDto } from './dto/update-workout-session.dto';
import { AddSetDto, SetDto } from './dto/add-set.dto';
import { AddExerciseDto } from './dto/add-exercise.dto';

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
          for (const exercisePerformedData of exercisesPerformed) {
            const exercisePerformed = transactionalEntityManager.create(
              ExercisePerformed,
              {
                exerciseId: exercisePerformedData.exerciseId,
                workoutSession,
              }
            );
            await transactionalEntityManager.save(exercisePerformed);

            if (
              exercisePerformedData.sets &&
              exercisePerformedData.sets.length > 0
            ) {
              for (let i = 0; i < exercisePerformedData.sets.length; i++) {
                const setData = exercisePerformedData.sets[i];
                const set = transactionalEntityManager.create(Set, {
                  ...setData,
                  exercisePerformed,
                  order: i, // Set the order explicitly
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
                id: 'ASC',
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
    const workoutSession = await this.workoutSessionRepository.findOneOrFail({
      where: { id },
      relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
      order: {
        exercisesPerformed: {
          id: 'ASC',
        },
      },
    });

    // Sort the sets for each exercisePerformed
    workoutSession.exercisesPerformed.forEach((exercise) => {
      exercise.sets.sort((a, b) => a.order - b.order);
    });

    return workoutSession;
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

        const exercisePerformed = transactionalEntityManager.create(
          ExercisePerformed,
          {
            exerciseId: addExerciseDto.exerciseId,
            workoutSession: session,
          }
        );

        await transactionalEntityManager.save(exercisePerformed);

        for (const [index, setData] of addExerciseDto.sets.entries()) {
          const set = transactionalEntityManager.create(Set, {
            ...setData,
            exercisePerformed,
            order: index,
          });
          await transactionalEntityManager.save(set);
        }

        return this.findOne(sessionId);
      }
    );
  }

  async addSetToExercise(
    sessionId: string,
    exerciseId: string,
    addSetDto: AddSetDto
  ): Promise<WorkoutSession> {
    const session = await this.findOne(sessionId);
    const exercisePerformed = session.exercisesPerformed.find(
      (ep) => ep.exerciseId === exerciseId
    );

    if (!exercisePerformed) {
      throw new NotFoundException('Exercise not found in session');
    }

    const newOrder = exercisePerformed.sets.length; // Get the next order number
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
}
