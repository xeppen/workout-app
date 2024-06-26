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
  ): Promise<WorkoutPlan> {
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

  async findOne(id: string): Promise<WorkoutPlan> {
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
    return workoutPlan;
  }

  async update(
    id: string,
    updateWorkoutPlanDto: UpdateWorkoutPlanDto
  ): Promise<WorkoutPlan> {
    await this.workoutPlanRepository.update(id, updateWorkoutPlanDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.workoutPlanRepository.delete(id);
  }
}
