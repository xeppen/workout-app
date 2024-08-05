import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkoutSessionsService } from './workout-sessions.service';
import { WorkoutSession } from './entities/workout-session.entity';
import { ExercisePerformed } from './entities/exercise-performed.entity';
import { Set } from './entities/set.entity';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateWorkoutSessionDto } from './dto/update-workout-session.dto';
import { AddExerciseDto } from './dto/add-exercise.dto';
import { AddSetDto, UpdateSetDto } from './dto/add-set.dto';
import { NotFoundException } from '@nestjs/common';
import { Exercise } from '../exercises/entities/exercise.entity';

describe('WorkoutSessionsService', () => {
  let service: WorkoutSessionsService;
  let mockWorkoutSessionRepository: any;
  let mockExercisePerformedRepository: any;
  let mockSetRepository: any;

  beforeEach(async () => {
    mockWorkoutSessionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneOrFail: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      manager: {
        transaction: jest.fn((cb) =>
          cb({
            findOneOrFail: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          })
        ),
      },
    };
    mockExercisePerformedRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    mockSetRepository = {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutSessionsService,
        {
          provide: getRepositoryToken(WorkoutSession),
          useValue: mockWorkoutSessionRepository,
        },
        {
          provide: getRepositoryToken(ExercisePerformed),
          useValue: mockExercisePerformedRepository,
        },
        { provide: getRepositoryToken(Set), useValue: mockSetRepository },
      ],
    }).compile();

    service = module.get<WorkoutSessionsService>(WorkoutSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new workout session with exercises performed', async () => {
      const createDto: CreateWorkoutSessionDto = {
        userId: 'user-id',
        workoutPlanId: 'plan-id',
        notes: 'Test session',
        date: new Date().toISOString(),
        exercisesPerformed: [
          {
            exerciseId: 'exercise-id',
            sets: [
              { reps: 10, weight: 100, order: 0 },
              { reps: 8, weight: 110, order: 1 },
            ],
          },
        ],
      };

      const mockWorkoutSession = {
        id: 'session-id',
        ...createDto,
        date: new Date(),
        exercisesPerformed: [],
      };

      mockWorkoutSessionRepository.manager.transaction.mockImplementation(
        async (cb) => {
          const transactionalEntityManager = {
            create: jest.fn().mockReturnValue(mockWorkoutSession),
            save: jest.fn().mockResolvedValue(mockWorkoutSession),
            findOneOrFail: jest.fn().mockResolvedValue(mockWorkoutSession),
            findOne: jest.fn().mockResolvedValue(mockWorkoutSession),
          };
          await cb(transactionalEntityManager);
          return mockWorkoutSession;
        }
      );

      const result = await service.create(createDto);

      expect(result).toEqual(mockWorkoutSession);
      expect(
        mockWorkoutSessionRepository.manager.transaction
      ).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a workout session by id', async () => {
      const mockSession = {
        id: '1',
        exercisesPerformed: [
          { sets: [{ order: 0 }, { order: 1 }] },
          { sets: [{ order: 1 }, { order: 0 }] },
        ],
      };
      mockWorkoutSessionRepository.findOneOrFail.mockResolvedValue(mockSession);

      const result = await service.findOne('1');

      expect(result).toEqual(mockSession);
      expect(mockWorkoutSessionRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
        order: { exercisesPerformed: { order: 'ASC' } },
      });
      expect(result.exercisesPerformed[0].sets).toEqual([
        { order: 0 },
        { order: 1 },
      ]);
      expect(result.exercisesPerformed[1].sets).toEqual([
        { order: 0 },
        { order: 1 },
      ]);
    });

    it('should throw NotFoundException if workout session is not found', async () => {
      mockWorkoutSessionRepository.findOneOrFail.mockRejectedValue(
        new Error('Not found')
      );

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeExerciseFromSession', () => {
    it('should remove an exercise from the workout session', async () => {
      const mockSession = {
        id: '1',
        exercisesPerformed: [
          {
            exercise: { id: 'exercise-1' },
            sets: [{ id: 'set-1' }, { id: 'set-2' }],
          },
          { exercise: { id: 'exercise-2' }, sets: [{ id: 'set-3' }] },
        ],
      };

      mockWorkoutSessionRepository.manager.transaction.mockImplementation(
        async (cb) => {
          const transactionalEntityManager = {
            findOne: jest.fn().mockResolvedValue(mockSession),
            remove: jest.fn(),
            save: jest.fn().mockResolvedValue(mockSession),
          };
          return await cb(transactionalEntityManager);
        }
      );

      const result = await service.removeExerciseFromSession('1', 'exercise-1');

      expect(result).toEqual(mockSession);
      expect(
        mockWorkoutSessionRepository.manager.transaction
      ).toHaveBeenCalled();
    });

    it('should throw NotFoundException if workout session is not found', async () => {
      mockWorkoutSessionRepository.findOneOrFail.mockRejectedValue(
        new Error('Not found')
      );

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if exercise is not found in session', async () => {
      const mockSession = {
        id: '1',
        exercisesPerformed: [{ exercise: { id: 'exercise-2' }, sets: [] }],
      };

      mockWorkoutSessionRepository.manager.transaction.mockImplementation(
        async (cb) => {
          const transactionalEntityManager = {
            findOne: jest.fn().mockResolvedValue(mockSession),
          };
          return await cb(transactionalEntityManager);
        }
      );

      await expect(
        service.removeExerciseFromSession('1', 'exercise-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addSetToExercise', () => {
    it('should add a set to an exercise in the workout session', async () => {
      const mockSession = {
        id: '1',
        exercisesPerformed: [
          {
            exercise: { id: 'exercise-1' },
            sets: [{ order: 0 }, { order: 1 }],
          },
        ],
      };
      const mockExercisePerformed = {
        sets: [{ order: 0 }, { order: 1 }],
      };
      const addSetDto: AddSetDto = { reps: 10, weight: 100 };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockSession as WorkoutSession);
      mockExercisePerformedRepository.findOne.mockResolvedValue(
        mockExercisePerformed
      );
      mockSetRepository.create.mockReturnValue({ ...addSetDto, order: 2 });
      mockSetRepository.save.mockResolvedValue({
        id: 'new-set',
        ...addSetDto,
        order: 2,
      });

      const result = await service.addSetToExercise(
        '1',
        'exercise-1',
        addSetDto
      );

      expect(result).toEqual(mockSession);
      expect(mockExercisePerformedRepository.findOne).toHaveBeenCalledWith({
        where: { workoutSession: { id: '1' }, exercise: { id: 'exercise-1' } },
        relations: ['sets', 'workoutSession', 'exercise'],
      });
      expect(mockSetRepository.create).toHaveBeenCalledWith({
        ...addSetDto,
        exercisePerformed: mockExercisePerformed,
        order: 2,
      });
      expect(mockSetRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if exercise is not found in session', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: '1',
        exercisesPerformed: [],
      } as WorkoutSession);
      mockExercisePerformedRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addSetToExercise('1', 'exercise-1', { reps: 10, weight: 100 })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSet', () => {
    it('should update a set in an exercise', async () => {
      const mockSession = {
        id: '1',
        exercisesPerformed: [
          {
            exercise: { id: 'exercise-1' },
            sets: [{ id: 'set-1', reps: 10, weight: 100 }],
          },
        ],
      };
      const updateSetDto: UpdateSetDto = { reps: 12, weight: 110 };

      mockWorkoutSessionRepository.findOneOrFail.mockResolvedValue(mockSession);
      mockSetRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateSet(
        '1',
        'exercise-1',
        'set-1',
        updateSetDto
      );

      expect(result).toEqual(mockSession);
      expect(mockSetRepository.update).toHaveBeenCalledWith(
        'set-1',
        updateSetDto
      );
    });

    it('should throw NotFoundException if exercise is not found in session', async () => {
      const mockSession = {
        id: '1',
        exercisesPerformed: [],
      };

      mockWorkoutSessionRepository.findOneOrFail.mockResolvedValue(mockSession);

      await expect(
        service.updateSet('1', 'exercise-1', 'set-1', { reps: 12, weight: 110 })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if set is not found in exercise', async () => {
      const mockSession = {
        id: '1',
        exercisesPerformed: [
          {
            exercise: { id: 'exercise-1' },
            sets: [],
          },
        ],
      };

      mockWorkoutSessionRepository.findOneOrFail.mockResolvedValue(mockSession);

      await expect(
        service.updateSet('1', 'exercise-1', 'set-1', { reps: 12, weight: 110 })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeSet', () => {
    it('should remove a set from an exercise', async () => {
      const mockSession = {
        id: '1',
        exercisesPerformed: [
          {
            exercise: { id: 'exercise-1' },
            sets: [
              { id: 'set-1', order: 0 },
              { id: 'set-2', order: 1 },
              { id: 'set-3', order: 2 },
            ],
          },
        ],
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockSession as WorkoutSession);
      mockSetRepository.delete.mockResolvedValue({ affected: 1 });
      mockSetRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.removeSet('1', 'exercise-1', 'set-2');

      expect(result).toEqual(mockSession);
      expect(mockSetRepository.delete).toHaveBeenCalledWith('set-2');
      expect(mockSetRepository.update).toHaveBeenCalledTimes(2);
      expect(mockSetRepository.update).toHaveBeenNthCalledWith(1, 'set-2', {
        order: 1,
      });
      expect(mockSetRepository.update).toHaveBeenNthCalledWith(2, 'set-3', {
        order: 2,
      });
    });

    it('should throw NotFoundException if exercise is not found in session', async () => {
      const mockSession = {
        id: '1',
        exercisesPerformed: [],
      };

      mockWorkoutSessionRepository.findOneOrFail.mockResolvedValue(mockSession);

      await expect(
        service.removeSet('1', 'exercise-1', 'set-1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if set is not found in exercise', async () => {
      const mockSession = {
        id: '1',
        exercisesPerformed: [
          {
            exercise: { id: 'exercise-1' },
            sets: [],
          },
        ],
      };

      mockWorkoutSessionRepository.findOneOrFail.mockResolvedValue(mockSession);

      await expect(
        service.removeSet('1', 'exercise-1', 'set-1')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
