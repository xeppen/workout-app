import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { ExerciseInPlan } from './entities/exercise-in-plan.entity';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
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
    const workoutPlan = this.workoutPlanRepository.create(createWorkoutPlanDto);
    const savedWorkoutPlan = await this.workoutPlanRepository.save(workoutPlan);

    if (createWorkoutPlanDto.exercises) {
      const exercises = createWorkoutPlanDto.exercises.map((exercise) =>
        this.exerciseInPlanRepository.create({
          ...exercise,
          workoutPlan: savedWorkoutPlan,
        })
      );
      await this.exerciseInPlanRepository.save(exercises);
    }

    return this.findOne(savedWorkoutPlan.id);
  }

  async findAll(): Promise<WorkoutPlan[]> {
    return this.workoutPlanRepository.find({ relations: ['exercises'] });
  }

  async findOne(id: string): Promise<WorkoutPlan> {
    return this.workoutPlanRepository.findOne({
      where: { id },
      relations: ['exercises'],
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
