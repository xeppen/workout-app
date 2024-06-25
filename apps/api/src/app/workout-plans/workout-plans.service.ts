import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { ExerciseInPlan } from './entities/exercise-in-plan.entity';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';

@Injectable()
export class WorkoutPlansService {
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
    return await this.workoutPlanRepository.find({
      relations: ['user', 'exercises'],
      select: ['id', 'name', 'description', 'userId'],
    });
  }

  async findOne(id: string): Promise<WorkoutPlan> {
    return await this.workoutPlanRepository.findOne({
      where: { id },
      relations: ['user', 'exercises'],
      select: ['id', 'name', 'description', 'userId'],
    });
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
