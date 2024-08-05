import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutSessionsController } from './workout-sessions.controller';
import { WorkoutSessionsService } from './workout-sessions.service';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateWorkoutSessionDto } from './dto/update-workout-session.dto';
import { AddExerciseDto } from './dto/add-exercise.dto';
import { AddSetDto, UpdateSetDto } from './dto/add-set.dto';
import { WorkoutSession } from './entities/workout-session.entity';
import { ExercisePerformed } from './entities/exercise-performed.entity';
import { Set } from './entities/set.entity';
import { Exercise } from '../exercises/entities/exercise.entity';

describe('WorkoutSessionsController', () => {
  let controller: WorkoutSessionsController;
  let service: WorkoutSessionsService;

  const mockWorkoutSession: WorkoutSession = {
    id: '1',
    userId: 'user-id',
    workoutPlanId: 'workout-plan-id',
    notes: 'Session notes',
    user: null,
    workoutPlan: null,
    date: new Date(),
    exercisesPerformed: [],
    completed: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutSessionsController],
      providers: [
        {
          provide: WorkoutSessionsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            addExerciseToSession: jest.fn(),
            addSetToExercise: jest.fn(),
            updateSet: jest.fn(),
            removeSet: jest.fn(),
            removeExerciseFromSession: jest.fn(),
          },
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
        date: new Date().toISOString(),
        exercisesPerformed: [],
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockWorkoutSession);

      expect(await controller.create(createWorkoutSessionDto)).toBe(
        mockWorkoutSession
      );
      expect(service.create).toHaveBeenCalledWith(createWorkoutSessionDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of workout sessions', async () => {
      const workoutSessions = [mockWorkoutSession];
      jest.spyOn(service, 'findAll').mockResolvedValue(workoutSessions);

      expect(await controller.findAll()).toBe(workoutSessions);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a workout session by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkoutSession);

      expect(await controller.findOne('1')).toBe(mockWorkoutSession);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a workout session', async () => {
      const updateWorkoutSessionDto: UpdateWorkoutSessionDto = {
        notes: 'Updated session notes',
      };

      jest.spyOn(service, 'update').mockResolvedValue(mockWorkoutSession);

      expect(await controller.update('1', updateWorkoutSessionDto)).toBe(
        mockWorkoutSession
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

  describe('addExerciseToSession', () => {
    it('should add an exercise to the workout session', async () => {
      const addExerciseDto: AddExerciseDto = {
        exerciseId: 'exercise-id',
        sets: [],
      };

      jest
        .spyOn(service, 'addExerciseToSession')
        .mockResolvedValue(mockWorkoutSession);

      expect(await controller.addExerciseToSession('1', addExerciseDto)).toBe(
        mockWorkoutSession
      );
      expect(service.addExerciseToSession).toHaveBeenCalledWith(
        '1',
        addExerciseDto
      );
    });
  });

  describe('addSetToExercise', () => {
    it('should add a set to an exercise in the workout session', async () => {
      const addSetDto: AddSetDto = { reps: 10, weight: 100 };

      jest
        .spyOn(service, 'addSetToExercise')
        .mockResolvedValue(mockWorkoutSession);

      expect(
        await controller.addSetToExercise('1', 'exercise-id', addSetDto)
      ).toBe(mockWorkoutSession);
      expect(service.addSetToExercise).toHaveBeenCalledWith(
        '1',
        'exercise-id',
        addSetDto
      );
    });
  });

  describe('updateSet', () => {
    it('should update a set in an exercise in the workout session', async () => {
      const updateSetDto: UpdateSetDto = { reps: 12, weight: 110 };

      jest.spyOn(service, 'updateSet').mockResolvedValue(mockWorkoutSession);

      expect(
        await controller.updateSet('1', 'exercise-id', 'set-id', updateSetDto)
      ).toBe(mockWorkoutSession);
      expect(service.updateSet).toHaveBeenCalledWith(
        '1',
        'exercise-id',
        'set-id',
        updateSetDto
      );
    });
  });

  describe('removeSet', () => {
    it('should remove a set from an exercise in the workout session', async () => {
      jest.spyOn(service, 'removeSet').mockResolvedValue(mockWorkoutSession);

      expect(await controller.removeSet('1', 'exercise-id', 'set-id')).toBe(
        mockWorkoutSession
      );
      expect(service.removeSet).toHaveBeenCalledWith(
        '1',
        'exercise-id',
        'set-id'
      );
    });
  });

  describe('removeExerciseFromSession', () => {
    it('should remove an exercise from the workout session', async () => {
      jest
        .spyOn(service, 'removeExerciseFromSession')
        .mockResolvedValue(mockWorkoutSession);

      expect(
        await controller.removeExerciseFromSession('1', 'exercise-id')
      ).toBe(mockWorkoutSession);
      expect(service.removeExerciseFromSession).toHaveBeenCalledWith(
        '1',
        'exercise-id'
      );
    });
  });
});
