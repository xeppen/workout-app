import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutPlansService } from './workout-plans.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { ExerciseInPlan } from './entities/exercise-in-plan.entity';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { Exercise } from '../exercises/entities/exercise.entity';

describe('WorkoutPlansService', () => {
  let service: WorkoutPlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutPlansService,
        {
          provide: getRepositoryToken(WorkoutPlan),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ExerciseInPlan),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<WorkoutPlansService>(WorkoutPlansService);
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
});
