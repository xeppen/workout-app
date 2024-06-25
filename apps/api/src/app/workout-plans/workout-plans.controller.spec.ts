import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutPlansController } from './workout-plans.controller';
import { WorkoutPlansService } from './workout-plans.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { ExerciseInPlan } from './entities/exercise-in-plan.entity';
import { Repository } from 'typeorm';

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

  // Additional tests go here
});
