import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
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
  ): Promise<WorkoutPlan> {
    this.logger.debug(
      `Creating workout plan: ${JSON.stringify(createWorkoutPlanDto)}`
    );

    const { exercises, ...workoutPlanData } = createWorkoutPlanDto;

    const workoutPlan = this.workoutPlanRepository.create(workoutPlanData);
    const savedWorkoutPlan = await this.workoutPlanRepository.save(workoutPlan);

    if (exercises && exercises.length > 0) {
      const exercisesInPlan = exercises.map((exercise) =>
        this.exerciseInPlanRepository.create({
          ...exercise,
          workoutPlan: savedWorkoutPlan,
        })
      );

      await this.exerciseInPlanRepository.save(exercisesInPlan);
      savedWorkoutPlan.exercises = exercisesInPlan;
    }

    this.logger.debug(`Created workout plan with id: ${savedWorkoutPlan.id}`);
    return savedWorkoutPlan;
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
    const workoutPlan = await this.workoutPlanRepository.findOne({
      where: { id },
      relations: ['exercises', 'workoutSessions'],
    });

    if (!workoutPlan) {
      throw new NotFoundException(`Workout plan with ID "${id}" not found`);
    }

    try {
      // Remove associated exercises
      if (workoutPlan.exercises) {
        await this.workoutPlanRepository.manager.remove(workoutPlan.exercises);
      }

      // You might want to handle workout sessions differently
      // For example, you might want to keep them but set workoutPlanId to null
      if (workoutPlan.workoutSessions) {
        for (const session of workoutPlan.workoutSessions) {
          session.workoutPlanId = null;
          await this.workoutPlanRepository.manager.save(session);
        }
      }

      // Finally, remove the workout plan
      await this.workoutPlanRepository.remove(workoutPlan);
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      throw new InternalServerErrorException('Could not delete workout plan');
    }
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

  async progressCompoundLifts(
    progressDto: ProgressWorkoutPlanDto
  ): Promise<WorkoutPlan> {
    const workoutPlan = await this.findOne(
      progressDto.workoutPlanId.toString()
    );
    if (!workoutPlan) {
      throw new NotFoundException(`Workout plan not found`);
    }

    // Update max weights and reps for compound lifts
    for (const [category, progress] of Object.entries(
      progressDto.compoundLiftsProgress
    )) {
      const exercise = workoutPlan.exercises.find(
        (e) => e.category === category
      );
      if (exercise) {
        exercise.maxWeight = progress.maxWeight;
        exercise.maxReps = progress.maxReps;
      }
    }

    // If completing the current cycle, calculate new weights for the next cycle
    if (progressDto.completeCurrentCycle) {
      workoutPlan.exercises = workoutPlan.exercises.map((exercise) => {
        switch (exercise.category) {
          case 'press':
          case 'bench_press':
            exercise.weight += 2.5;
            break;
          case 'squat':
          case 'deadlift':
            exercise.weight += 5;
            break;
          default:
            // For other exercises, you could implement a custom progression rule
            break;
        }
        return exercise;
      });
    }

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

    let totalCompletionRate = 0;
    let exerciseCount = 0;

    for (const stat of Object.values(exerciseStats)) {
      const plannedTotalSets = (stat as any).plannedSets * totalSessions;
      if (plannedTotalSets > 0) {
        totalCompletionRate += (stat as any).totalSets / plannedTotalSets;
        exerciseCount++;
      }
    }

    const averageCompletionRate =
      exerciseCount > 0 ? totalCompletionRate / exerciseCount : 0;

    const mostPerformedExercise = Object.entries(exerciseStats).reduce(
      (max, [exerciseId, stat]) =>
        (stat as any).totalSets > max.totalSets
          ? { exerciseId, totalSets: (stat as any).totalSets }
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
