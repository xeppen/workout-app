import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { ExerciseInPlan } from './entities/exercise-in-plan.entity';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';

@Injectable()
export class WorkoutPlansService {
  private readonly logger = new Logger(WorkoutPlansService.name);

  constructor(
    @InjectRepository(WorkoutPlan)
    private workoutPlanRepository: Repository<WorkoutPlan>,
    @InjectRepository(ExerciseInPlan)
    private exerciseInPlanRepository: Repository<ExerciseInPlan>
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

  public async updateForTesting(
    id: string,
    updateWorkoutPlanDto: UpdateWorkoutPlanDto
  ): Promise<any> {
    const result = await this.update(id, updateWorkoutPlanDto);
    return {
      ...result,
      exercises: result.exercises?.map((exercise) => ({
        ...exercise,
        workoutPlan: undefined, // Remove circular reference for easier testing
      })),
    };
  }
}
