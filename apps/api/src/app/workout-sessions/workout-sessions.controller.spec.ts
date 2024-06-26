import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutSessionsController } from './workout-sessions.controller';
import { WorkoutSessionsService } from './workout-sessions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkoutSession } from './entities/workout-session.entity';
import { ExercisePerformed } from './entities/exercise-performed.entity';
import { Set } from './entities/set.entity';
import { Repository } from 'typeorm';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateWorkoutSessionDto } from './dto/update-workout-session.dto';

describe('WorkoutSessionsController', () => {
  let controller: WorkoutSessionsController;
  let service: WorkoutSessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutSessionsController],
      providers: [
        WorkoutSessionsService,
        {
          provide: getRepositoryToken(WorkoutSession),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ExercisePerformed),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Set),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<WorkoutSessionsController>(
      WorkoutSessionsController
    );
    service = module.get<WorkoutSessionsService>(WorkoutSessionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a workout session', async () => {
      const createWorkoutSessionDto: CreateWorkoutSessionDto = {
        userId: 'user-id',
        workoutPlanId: 'workout-plan-id',
        notes: 'Session notes',
      };
      const createdWorkoutSession: WorkoutSession = {
        id: '1',
        ...createWorkoutSessionDto,
        user: null,
        workoutPlan: null,
        date: new Date(),
        exercisesPerformed: [],
      };

      jest.spyOn(service, 'create').mockResolvedValue(createdWorkoutSession);

      expect(await controller.create(createWorkoutSessionDto)).toBe(
        createdWorkoutSession
      );
      expect(service.create).toHaveBeenCalledWith(createWorkoutSessionDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of workout sessions', async () => {
      const workoutSessions: WorkoutSession[] = [
        {
          id: '1',
          userId: 'user-id',
          workoutPlanId: 'workout-plan-id',
          notes: 'Session notes',
          user: null,
          workoutPlan: null,
          date: new Date(),
          exercisesPerformed: [],
        },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(workoutSessions);

      expect(await controller.findAll()).toBe(workoutSessions);
    });
  });

  describe('findOne', () => {
    it('should return a workout session by id', async () => {
      const workoutSession: WorkoutSession = {
        id: '1',
        userId: 'user-id',
        workoutPlanId: 'workout-plan-id',
        notes: 'Session notes',
        user: null,
        workoutPlan: null,
        date: new Date(),
        exercisesPerformed: [],
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(workoutSession);

      expect(await controller.findOne('1')).toBe(workoutSession);
    });

    it('should throw NotFoundException if workout session is not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      try {
        await controller.findOne('1');
      } catch (e) {
        expect(e.status).toBe(404);
        expect(e.response).toBe('Not Found');
      }
    });
  });

  describe('update', () => {
    it('should update a workout session', async () => {
      const updateWorkoutSessionDto: UpdateWorkoutSessionDto = {
        notes: 'Updated session notes',
      };
      const updatedWorkoutSession: WorkoutSession = {
        id: '1',
        userId: 'user-id',
        workoutPlanId: 'workout-plan-id',
        ...updateWorkoutSessionDto,
        user: null,
        workoutPlan: null,
        date: new Date(),
        exercisesPerformed: [],
      };

      jest.spyOn(service, 'update').mockResolvedValue(updatedWorkoutSession);

      expect(await controller.update('1', updateWorkoutSessionDto)).toBe(
        updatedWorkoutSession
      );
      expect(service.update).toHaveBeenCalledWith('1', updateWorkoutSessionDto);
    });
  });

  describe('remove', () => {
    it('should remove a workout session', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      expect(await controller.remove('1')).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
