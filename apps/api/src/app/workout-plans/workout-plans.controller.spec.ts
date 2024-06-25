import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutPlansController } from './workout-plans.controller';
import { WorkoutPlansService } from './workout-plans.service';

describe('WorkoutPlansController', () => {
  let controller: WorkoutPlansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutPlansController],
      providers: [WorkoutPlansService],
    }).compile();

    controller = module.get<WorkoutPlansController>(WorkoutPlansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
