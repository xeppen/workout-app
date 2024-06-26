import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutSession } from './entities/workout-session.entity';
import { ExercisePerformed } from './entities/exercise-performed.entity';
import { Set } from './entities/set.entity';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateWorkoutSessionDto } from './dto/update-workout-session.dto';

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
    const newSession = this.workoutSessionRepository.create({
      userId: createWorkoutSessionDto.userId,
      workoutPlanId: createWorkoutSessionDto.workoutPlanId,
      date: new Date(),
      notes: createWorkoutSessionDto.notes,
    });
    return await this.workoutSessionRepository.save(newSession);
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
    exerciseId: string,
    sets: { reps: number; weight: number }[]
  ): Promise<WorkoutSession> {
    const session = await this.findOne(sessionId);
    const exercisePerformed = this.exercisePerformedRepository.create({
      exerciseId,
      workoutSession: session,
    });
    const savedExercisePerformed = await this.exercisePerformedRepository.save(
      exercisePerformed
    );

    for (const setData of sets) {
      const set = this.setRepository.create({
        reps: setData.reps,
        weight: setData.weight,
        exercisePerformed: savedExercisePerformed,
      });
      await this.setRepository.save(set);
    }

    return this.findOne(sessionId);
  }

  async completeSession(sessionId: string): Promise<WorkoutSession> {
    const session = await this.findOne(sessionId);
    // If you want to add a completedAt field, you'll need to add it to the entity first
    // session.completedAt = new Date();
    return await this.workoutSessionRepository.save(session);
  }
}
