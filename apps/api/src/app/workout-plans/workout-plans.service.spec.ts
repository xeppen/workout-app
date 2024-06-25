import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkoutPlansService } from './workout-plans.service';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { ExerciseInPlan } from './entities/exercise-in-plan.entity';

describe('WorkoutPlansService', () => {
  let service: WorkoutPlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutPlansService,
        {
          provide: getRepositoryToken(WorkoutPlan),
          useValue: {
            // Mock repository methods here
          },
        },
        {
          provide: getRepositoryToken(ExerciseInPlan),
          useValue: {
            // Mock repository methods here
          },
        },
      ],
    }).compile();

    service = module.get<WorkoutPlansService>(WorkoutPlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests here
});
