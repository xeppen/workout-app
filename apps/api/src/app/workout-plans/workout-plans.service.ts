import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { ExerciseInPlan } from './entities/exercise-in-plan.entity';
import {
  CreateWorkoutPlanDto,
  ProgressWorkoutPlanDto,
} from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { WorkoutSession } from '../workout-sessions/entities/workout-session.entity';
import { ExercisePerformed } from '../workout-sessions/entities/exercise-performed.entity';

@Injectable()
export class WorkoutPlansService {
  private readonly logger = new Logger(WorkoutPlansService.name);

  constructor(
    @InjectRepository(WorkoutPlan)
    private workoutPlanRepository: Repository<WorkoutPlan>,
    @InjectRepository(ExerciseInPlan)
    private exerciseInPlanRepository: Repository<ExerciseInPlan>,
    @InjectRepository(WorkoutSession)
    private workoutSessionRepository: Repository<WorkoutSession>,
    @InjectRepository(ExercisePerformed)
    private exercisePerformedRepository: Repository<ExercisePerformed>
  ) {}

  async create(
    createWorkoutPlanDto: CreateWorkoutPlanDto
  ): Promise<Partial<WorkoutPlan>> {
    const { exercises, ...workoutPlanData } = createWorkoutPlanDto;

    const workoutPlan = this.workoutPlanRepository.create(workoutPlanData);
    const savedWorkoutPlan = await this.workoutPlanRepository.save(workoutPlan);

    const exercisesInPlan = exercises.map((exercise) =>
      this.exerciseInPlanRepository.create({
        ...exercise,
        workoutPlan: savedWorkoutPlan,
      })
    );

    await this.exerciseInPlanRepository.save(exercisesInPlan);

    return this.findOne(savedWorkoutPlan.id);
  }

  async findAll(): Promise<WorkoutPlan[]> {
    this.logger.debug('Finding all workout plans');
    const workoutPlans = await this.workoutPlanRepository.find({
      relations: ['exercises'],
    });
    this.logger.debug(`Found ${workoutPlans.length} workout plans`);
    return workoutPlans;
  }

  async findOne(id: string): Promise<Partial<WorkoutPlan>> {
    const workoutPlanId = String(id);
    this.logger.debug(`Finding workout plan with id: ${id}`);
    const workoutPlan = await this.workoutPlanRepository.findOne({
      where: { id },
      relations: ['exercises'],
    });
    if (!workoutPlan) {
      this.logger.warn(`Workout plan with id ${id} not found`);
      throw new NotFoundException(`Workout plan with ID "${id}" not found`);
    }
    this.logger.debug(`Found workout plan: ${JSON.stringify(workoutPlan)}`);
    return this.sanitizeWorkoutPlan(workoutPlan);
  }

  async update(
    id: string,
    updateWorkoutPlanDto: UpdateWorkoutPlanDto
  ): Promise<WorkoutPlan> {
    const workoutPlan = await this.workoutPlanRepository.findOne({
      where: { id },
      relations: ['exercises'],
    });

    if (!workoutPlan) {
      throw new NotFoundException(`Workout plan with ID "${id}" not found`);
    }

    // Update basic properties
    Object.assign(workoutPlan, updateWorkoutPlanDto);

    // Handle exercises update
    if (updateWorkoutPlanDto.exercises) {
      // Remove existing exercises
      await this.exerciseInPlanRepository.delete({ workoutPlan: { id } });

      // Create new exercises
      const newExercises = updateWorkoutPlanDto.exercises.map((exercise) =>
        this.exerciseInPlanRepository.create({
          ...exercise,
          workoutPlan,
        })
      );

      // Save new exercises
      workoutPlan.exercises = await this.exerciseInPlanRepository.save(
        newExercises
      );
    }

    // Save and return updated workout plan
    const savedWorkoutPlan = await this.workoutPlanRepository.save(workoutPlan);

    this.logger.debug(
      `Updated workout plan: ${this.stringifyWithoutCircularReferences(
        savedWorkoutPlan
      )}`
    );

    return this.sanitizeWorkoutPlan(savedWorkoutPlan);
  }

  private stringifyWithoutCircularReferences(obj: any): string {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
  }

  private sanitizeWorkoutPlan(workoutPlan: WorkoutPlan): WorkoutPlan {
    return {
      ...workoutPlan,
      exercises: workoutPlan.exercises?.map((exercise) => ({
        ...exercise,
        workoutPlan: undefined,
      })),
    };
  }

  async remove(id: string): Promise<void> {
    await this.workoutPlanRepository.delete(id);
  }

  async createSession(
    workoutPlanId: string,
    userId: string
  ): Promise<WorkoutSession> {
    const workoutPlan = await this.findOne(workoutPlanId);
    if (!workoutPlan) {
      throw new NotFoundException(
        `Workout plan with ID "${workoutPlanId}" not found`
      );
    }

    const session = this.workoutSessionRepository.create({
      userId,
      workoutPlanId,
      date: new Date(),
    });

    const savedSession = await this.workoutSessionRepository.save(session);

    // Create ExercisePerformed entities for each exercise in the plan
    const exercisesPerformed = workoutPlan.exercises.map((exerciseInPlan) =>
      this.exercisePerformedRepository.create({
        workoutSession: savedSession,
        exerciseId: exerciseInPlan.exerciseId,
      })
    );

    await this.exercisePerformedRepository.save(exercisesPerformed);

    return this.workoutSessionRepository.findOne({
      where: { id: savedSession.id },
      relations: ['exercisesPerformed'],
    });
  }

  async progressPlan(
    id: string,
    progressDto: ProgressWorkoutPlanDto
  ): Promise<WorkoutPlan> {
    const workoutPlan = await this.findOne(id);
    if (!workoutPlan) {
      throw new NotFoundException(`Workout plan with ID "${id}" not found`);
    }

    // Since ExerciseInPlan doesn't have a weight property, we'll need to adjust how we progress the plan
    // For this example, we'll increase the number of reps
    workoutPlan.exercises = workoutPlan.exercises.map((exercise) => ({
      ...exercise,
      reps: exercise.reps + progressDto.incrementReps,
    }));

    return this.workoutPlanRepository.save(workoutPlan);
  }

  async clonePlan(id: string, name: string): Promise<WorkoutPlan> {
    const originalPlan = await this.findOne(id);
    if (!originalPlan) {
      throw new NotFoundException(`Workout plan with ID "${id}" not found`);
    }

    const clonedPlan = this.workoutPlanRepository.create({
      ...originalPlan,
      id: undefined,
      name,
    });

    const savedClonedPlan = await this.workoutPlanRepository.save(clonedPlan);

    const clonedExercises = originalPlan.exercises.map((exercise) =>
      this.exerciseInPlanRepository.create({
        ...exercise,
        id: undefined,
        workoutPlan: savedClonedPlan,
      })
    );

    savedClonedPlan.exercises = await this.exerciseInPlanRepository.save(
      clonedExercises
    );

    return this.sanitizeWorkoutPlan(savedClonedPlan);
  }

  async getStatistics(id: string): Promise<any> {
    const workoutPlan = await this.findOne(id);
    if (!workoutPlan) {
      throw new NotFoundException(`Workout plan with ID "${id}" not found`);
    }

    const sessions = await this.workoutSessionRepository.find({
      where: { workoutPlanId: id },
      relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
    });

    const totalSessions = sessions.length;
    const exerciseStats = {};

    workoutPlan.exercises.forEach((exercise) => {
      exerciseStats[exercise.exerciseId] = {
        totalSets: 0,
        totalReps: 0,
        plannedSets: exercise.sets,
        plannedReps: exercise.reps,
      };
    });

    sessions.forEach((session) => {
      session.exercisesPerformed.forEach((exercise) => {
        const stats = exerciseStats[exercise.exerciseId];
        if (stats) {
          stats.totalSets += exercise.sets.length;
          exercise.sets.forEach((set) => {
            stats.totalReps += set.reps;
          });
        }
      });
    });

    const averageCompletionRate =
      Object.values(exerciseStats).reduce(
        (sum: number, stat: any) =>
          sum + stat.totalSets / (stat.plannedSets * totalSessions),
        0
      ) / Object.keys(exerciseStats).length;

    const mostPerformedExercise = Object.entries(exerciseStats).reduce(
      (max, [exerciseId, stat]: [string, any]) =>
        stat.totalSets > max.totalSets
          ? { exerciseId, totalSets: stat.totalSets }
          : max,
      { exerciseId: null, totalSets: 0 }
    ).exerciseId;

    return {
      totalSessions,
      averageCompletionRate,
      mostPerformedExercise,
      exerciseStats,
    };
  }
}
