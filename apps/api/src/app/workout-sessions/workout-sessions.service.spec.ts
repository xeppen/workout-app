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

  const createMockWorkoutSession = (
    partial: Partial<WorkoutSession> = {}
  ): WorkoutSession => ({
    id: 'test-id',
    userId: 'test-user-id',
    workoutPlanId: 'test-plan-id',
    date: new Date(),
    notes: '',
    completed: false,
    exercisesPerformed: [],
    user: null,
    workoutPlan: null,
    ...partial,
  });

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

    it('should create a new workout session with no exercises', async () => {
      const createDto: CreateWorkoutSessionDto = {
        userId: 'user-id',
        workoutPlanId: 'plan-id',
        notes: 'Test session',
        date: '',
        exercisesPerformed: [],
      };

      const mockWorkoutSession = {
        id: 'session-id',
        ...createDto,
        date: expect.any(String),
        exercisesPerformed: [],
      };

      mockWorkoutSessionRepository.manager.transaction.mockImplementation(
        async (cb) => {
          const transactionalEntityManager = {
            create: jest.fn().mockReturnValue(mockWorkoutSession),
            save: jest.fn().mockResolvedValue(mockWorkoutSession),
            findOne: jest.fn().mockResolvedValue(mockWorkoutSession),
          };
          return await cb(transactionalEntityManager);
        }
      );

      const result = await service.create(createDto);

      expect(result).toEqual(mockWorkoutSession);
      expect(result.date).toBeDefined();
      expect(
        mockWorkoutSessionRepository.manager.transaction
      ).toHaveBeenCalled();
    });

    it('should create a new workout session with exercises but no sets', async () => {
      const createDto: CreateWorkoutSessionDto = {
        userId: 'user-id',
        workoutPlanId: 'plan-id',
        notes: 'Test session',
        date: '2023-05-01',
        exercisesPerformed: [
          {
            exerciseId: 'exercise-1',
            sets: [],
          },
          {
            exerciseId: 'exercise-2',
            sets: [],
          },
        ],
      };

      const mockWorkoutSession = {
        id: 'session-id',
        ...createDto,
        exercisesPerformed: [
          { id: 'ep-1', exerciseId: 'exercise-1', order: 0, sets: [] },
          { id: 'ep-2', exerciseId: 'exercise-2', order: 1, sets: [] },
        ],
      };

      mockWorkoutSessionRepository.manager.transaction.mockImplementation(
        async (cb) => {
          const transactionalEntityManager = {
            create: jest.fn().mockImplementation((entity, data) => {
              if (entity === WorkoutSession) return mockWorkoutSession;
              if (entity === ExercisePerformed) return data;
            }),
            save: jest
              .fn()
              .mockImplementation((entity) => Promise.resolve(entity)),
            findOne: jest.fn().mockResolvedValue(mockWorkoutSession),
          };
          return await cb(transactionalEntityManager);
        }
      );

      const result = await service.create(createDto);

      expect(result).toEqual(mockWorkoutSession);
      expect(result.exercisesPerformed).toHaveLength(2);
      expect(result.exercisesPerformed[0].sets).toHaveLength(0);
      expect(result.exercisesPerformed[1].sets).toHaveLength(0);
    });

    it('should create a new workout session with exercises and sets', async () => {
      const createDto: CreateWorkoutSessionDto = {
        userId: 'user-id',
        workoutPlanId: 'plan-id',
        notes: 'Test session',
        date: '2023-05-01',
        exercisesPerformed: [
          {
            exerciseId: 'exercise-1',
            sets: [
              {
                reps: 10,
                weight: 100,
                order: 0,
              },
              {
                reps: 8,
                weight: 110,
                order: 1,
              },
            ],
          },
        ],
      };

      const mockWorkoutSession = {
        id: 'session-id',
        ...createDto,
        exercisesPerformed: [
          {
            id: 'ep-1',
            exerciseId: 'exercise-1',
            order: 0,
            sets: [
              { id: 'set-1', reps: 10, weight: 100, order: 0 },
              { id: 'set-2', reps: 8, weight: 110, order: 1 },
            ],
          },
        ],
      };

      mockWorkoutSessionRepository.manager.transaction.mockImplementation(
        async (cb) => {
          const transactionalEntityManager = {
            create: jest.fn().mockImplementation((entity, data) => {
              if (entity === WorkoutSession) return mockWorkoutSession;
              if (entity === ExercisePerformed) return { id: 'ep-1', ...data };
              if (entity === Set)
                return { id: `set-${data.order + 1}`, ...data };
            }),
            save: jest
              .fn()
              .mockImplementation((entity) => Promise.resolve(entity)),
            findOne: jest.fn().mockResolvedValue(mockWorkoutSession),
          };
          return await cb(transactionalEntityManager);
        }
      );

      const result = await service.create(createDto);

      expect(result).toEqual(mockWorkoutSession);
      expect(result.exercisesPerformed).toHaveLength(1);
      expect(result.exercisesPerformed[0].sets).toHaveLength(2);
      expect(result.exercisesPerformed[0].sets[0].order).toBe(0);
      expect(result.exercisesPerformed[0].sets[1].order).toBe(1);
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

  describe('findAll', () => {
    it('should return an array of workout sessions', async () => {
      const mockSessions = [{ id: '1' }, { id: '2' }];
      mockWorkoutSessionRepository.find.mockResolvedValue(mockSessions);

      const result = await service.findAll();

      expect(result).toEqual(mockSessions);
      expect(mockWorkoutSessionRepository.find).toHaveBeenCalledWith({
        relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
      });
    });
  });

  describe('update', () => {
    it('should update a workout session', async () => {
      const updateDto: UpdateWorkoutSessionDto = { notes: 'Updated notes' };
      const mockUpdatedSession = { id: '1', ...updateDto };

      mockWorkoutSessionRepository.update.mockResolvedValue({ affected: 1 });
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockUpdatedSession as unknown as WorkoutSession);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockUpdatedSession);
      expect(mockWorkoutSessionRepository.update).toHaveBeenCalledWith(
        '1',
        updateDto
      );
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('remove', () => {
    it('should remove a workout session', async () => {
      mockWorkoutSessionRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(mockWorkoutSessionRepository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('startSession', () => {
    it('should start a new workout session', async () => {
      const mockSession = {
        id: '1',
        userId: 'user1',
        workoutPlanId: 'plan1',
        date: new Date(),
      };
      mockWorkoutSessionRepository.create.mockReturnValue(mockSession);
      mockWorkoutSessionRepository.save.mockResolvedValue(mockSession);

      const result = await service.startSession('user1', 'plan1');

      expect(result).toEqual(mockSession);
      expect(mockWorkoutSessionRepository.create).toHaveBeenCalledWith({
        userId: 'user1',
        workoutPlanId: 'plan1',
        date: expect.any(Date),
      });
      expect(mockWorkoutSessionRepository.save).toHaveBeenCalledWith(
        mockSession
      );
    });
  });

  describe('addExerciseToSession', () => {
    it('should add an exercise to the session', async () => {
      const addExerciseDto: AddExerciseDto = {
        exerciseId: 'exercise1',
        sets: [{ reps: 10, weight: 100 }],
      };
      const mockSession = {
        id: '1',
        exercisesPerformed: [],
      };
      const mockUpdatedSession = {
        ...mockSession,
        exercisesPerformed: [
          {
            id: 'ep1',
            exerciseId: 'exercise1',
            sets: [{ reps: 10, weight: 100 }],
          },
        ],
      };

      mockWorkoutSessionRepository.manager.transaction.mockImplementation(
        async (cb) => {
          const transactionalEntityManager = {
            findOneOrFail: jest.fn().mockResolvedValue(mockSession),
            create: jest.fn().mockImplementation((entity, data) => data),
            save: jest
              .fn()
              .mockImplementation((entity) => Promise.resolve(entity)),
          };
          return await cb(transactionalEntityManager);
        }
      );

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockUpdatedSession as unknown as WorkoutSession);

      const result = await service.addExerciseToSession('1', addExerciseDto);

      expect(result).toEqual(mockUpdatedSession);
      expect(
        mockWorkoutSessionRepository.manager.transaction
      ).toHaveBeenCalled();
      expect(service.findOne).toHaveBeenCalledWith('1');
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

    it('should throw NotFoundException when session is not found', async () => {
      mockWorkoutSessionRepository.manager.transaction.mockImplementation(
        async (cb) => {
          const transactionalEntityManager = {
            findOne: jest.fn().mockResolvedValue(null),
          };
          return await cb(transactionalEntityManager);
        }
      );

      await expect(
        service.removeExerciseFromSession('1', 'exercise1')
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

  describe('completeSession', () => {
    it('should complete a workout session', async () => {
      const mockSession = { id: '1', completed: false };
      const mockCompletedSession = { ...mockSession, completed: true };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockSession as WorkoutSession);
      mockWorkoutSessionRepository.save.mockResolvedValue(mockCompletedSession);

      const result = await service.completeSession('1');

      expect(result).toEqual(mockCompletedSession);
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(mockWorkoutSessionRepository.save).toHaveBeenCalledWith(
        mockSession
      );
    });
  });
});
