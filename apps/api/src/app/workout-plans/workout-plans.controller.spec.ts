import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutPlansController } from './workout-plans.controller';
import { WorkoutPlansService } from './workout-plans.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { ExerciseInPlan } from './entities/exercise-in-plan.entity';
import { Repository } from 'typeorm';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { NotFoundException } from '@nestjs/common';

describe('WorkoutPlansController', () => {
  let controller: WorkoutPlansController;
  let service: WorkoutPlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutPlansController],
      providers: [
        WorkoutPlansService,
        {
          provide: getRepositoryToken(WorkoutPlan),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ExerciseInPlan),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<WorkoutPlansController>(WorkoutPlansController);
    service = module.get<WorkoutPlansService>(WorkoutPlansService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a workout plan', async () => {
      const createWorkoutPlanDto: CreateWorkoutPlanDto = {
        name: 'Test Plan',
        description: 'Test Description',
        exercises: [
          { exerciseId: 'exercise-id', sets: 3, reps: 10, restTime: 60 },
        ],
        userId: '',
      };

      const result = { id: 'plan-id', ...createWorkoutPlanDto };
      jest
        .spyOn(service, 'create')
        .mockResolvedValue(result as unknown as WorkoutPlan);

      expect(await controller.create(createWorkoutPlanDto)).toBe(result);
    });
  });

  describe('findAll', () => {
    it('should return an array of workout plans', async () => {
      const result = [{ id: '1', name: 'Plan 1' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(result as WorkoutPlan[]);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a workout plan by id', async () => {
      const result = { id: '1', name: 'Plan 1' };
      jest.spyOn(service, 'findOne').mockResolvedValue(result as WorkoutPlan);

      expect(await controller.findOne('1')).toBe(result);
    });

    it('should throw NotFoundException if workout plan is not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      try {
        await controller.findOne('1');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe('Workout plan not found');
      }
    });
  });

  describe('update', () => {
    it('should update a workout plan', async () => {
      const updateWorkoutPlanDto: UpdateWorkoutPlanDto = {
        name: 'Updated Plan',
        description: 'Updated Description',
      };

      const result = { id: '1', ...updateWorkoutPlanDto };
      jest
        .spyOn(service, 'update')
        .mockResolvedValue(result as unknown as WorkoutPlan);

      expect(await controller.update('1', updateWorkoutPlanDto)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a workout plan', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      expect(await controller.remove('1')).toBeUndefined();
    });
  });
});
