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

    const workoutSession = this.workoutSessionRepository.create(sessionData);
    await this.workoutSessionRepository.save(workoutSession);

    if (exercisesPerformed && exercisesPerformed.length > 0) {
      for (const exercisePerformedData of exercisesPerformed) {
        const exercisePerformed = this.exercisePerformedRepository.create({
          exerciseId: exercisePerformedData.exerciseId,
          workoutSession,
        });
        await this.exercisePerformedRepository.save(exercisePerformed);

        if (
          exercisePerformedData.sets &&
          exercisePerformedData.sets.length > 0
        ) {
          for (const setData of exercisePerformedData.sets) {
            const set = this.setRepository.create({
              ...setData,
              exercisePerformed,
            });
            await this.setRepository.save(set);
          }
        }
      }
    }

    return this.workoutSessionRepository.findOne({
      where: { id: workoutSession.id },
      relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
    });
  }

  async findAll(): Promise<WorkoutSession[]> {
    return await this.workoutSessionRepository.find({
      relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
    });
  }

  async findOne(id: string): Promise<WorkoutSession> {
    return await this.workoutSessionRepository.findOneOrFail({
      where: { id },
      relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
      order: {
        exercisesPerformed: {
          id: 'ASC',
          sets: {
            id: 'ASC',
          },
        },
      },
    });
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
    const session = await this.findOne(sessionId);
    const exercisePerformed = this.exercisePerformedRepository.create({
      exerciseId: addExerciseDto.exerciseId,
      workoutSession: session,
      sets: [],
    });

    const savedExercisePerformed = await this.exercisePerformedRepository.save(
      exercisePerformed
    );

    for (const setData of addExerciseDto.sets) {
      const set = this.setRepository.create({
        ...setData,
        exercisePerformed: savedExercisePerformed,
      });
      await this.setRepository.save(set);
    }

    return this.findOne(sessionId);
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

    const set = this.setRepository.create(addSetDto);
    exercisePerformed.sets.push(set);

    await this.exercisePerformedRepository.save(exercisePerformed);

    return this.findOne(sessionId);
  }

  async completeSession(sessionId: string): Promise<WorkoutSession> {
    const session = await this.findOne(sessionId);
    // If you want to add a completedAt field, you'll need to add it to the entity first
    // session.completedAt = new Date();
    return await this.workoutSessionRepository.save(session);
  }
}
