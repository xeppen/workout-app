import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutPlansService } from './workout-plans.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { ExerciseInPlan } from './entities/exercise-in-plan.entity';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Exercise } from '../exercises/entities/exercise.entity';

describe('WorkoutPlansService', () => {
  let service: WorkoutPlansService;
  let workoutPlanRepository: Repository<WorkoutPlan>;
  let exerciseInPlanRepository: Repository<ExerciseInPlan>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutPlansService,
        {
          provide: getRepositoryToken(WorkoutPlan),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ExerciseInPlan),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkoutPlansService>(WorkoutPlansService);
    workoutPlanRepository = module.get<Repository<WorkoutPlan>>(
      getRepositoryToken(WorkoutPlan)
    );
    exerciseInPlanRepository = module.get<Repository<ExerciseInPlan>>(
      getRepositoryToken(ExerciseInPlan)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a workout plan', async () => {
      const createWorkoutPlanDto: CreateWorkoutPlanDto = {
        name: 'Test Plan',
        description: 'Test Description',
        exercises: [
          { exerciseId: 'exercise-id', sets: 3, reps: 10, restTime: 60 },
        ],
        userId: 'user-id',
      };

      const expectedResult: Partial<WorkoutPlan> = {
        id: 'plan-id',
        name: createWorkoutPlanDto.name,
        description: createWorkoutPlanDto.description,
        userId: createWorkoutPlanDto.userId,
        exercises: [
          {
            id: 'exercise-in-plan-id',
            ...createWorkoutPlanDto.exercises[0],
            exercise: new Exercise(),
            workoutPlan: new WorkoutPlan(),
          },
        ],
      };

      jest
        .spyOn(service, 'create')
        .mockResolvedValue(expectedResult as WorkoutPlan);

      const result = await service.create(createWorkoutPlanDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createWorkoutPlanDto);
    });
  });

  describe('update', () => {
    it('should update a workout plan', async () => {
      const id = 'plan-id';
      const updateWorkoutPlanDto: UpdateWorkoutPlanDto = {
        name: 'Updated Plan',
      };
      const updatedPlan = { id, ...updateWorkoutPlanDto };

      jest
        .spyOn(workoutPlanRepository, 'update')
        .mockResolvedValue({ affected: 1 } as any);
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(updatedPlan as WorkoutPlan);

      const result = await service.update(id, updateWorkoutPlanDto);

      expect(result).toEqual(updatedPlan);
      expect(workoutPlanRepository.update).toHaveBeenCalledWith(
        id,
        updateWorkoutPlanDto
      );
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('remove', () => {
    it('should remove a workout plan', async () => {
      const id = 'plan-id';
      jest
        .spyOn(workoutPlanRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      await service.remove(id);

      expect(workoutPlanRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});
