import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkoutSessionsService } from './workout-sessions.service';
import { WorkoutSession } from './entities/workout-session.entity';
import { ExercisePerformed } from './entities/exercise-performed.entity';
import { Set } from './entities/set.entity';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateWorkoutSessionDto } from './dto/update-workout-session.dto';
import { AddExerciseDto } from './dto/add-exercise.dto';
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
          })
        ),
      },
    };
    mockExercisePerformedRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    mockSetRepository = {
      create: jest.fn(),
      save: jest.fn(),
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
        {
          provide: getRepositoryToken(Set),
          useValue: mockSetRepository,
        },
      ],
    }).compile();

    service = module.get<WorkoutSessionsService>(WorkoutSessionsService);
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startSession', () => {
    it('should start a new workout session', async () => {
      const userId = 'user-id';
      const workoutPlanId = 'plan-id';
      const expectedResult: Partial<WorkoutSession> = {
        id: 'session-id',
        userId,
        workoutPlanId,
        date: expect.any(Date),
        exercisesPerformed: [],
      };

      mockWorkoutSessionRepository.create.mockReturnValue(expectedResult);
      mockWorkoutSessionRepository.save.mockResolvedValue(expectedResult);

      const result = await service.startSession(userId, workoutPlanId);
      expect(result).toEqual(expectedResult);
      expect(mockWorkoutSessionRepository.create).toHaveBeenCalledWith({
        userId,
        workoutPlanId,
        date: expect.any(Date),
      });
      expect(mockWorkoutSessionRepository.save).toHaveBeenCalledWith(
        expectedResult
      );
    });
  });

  describe('addExerciseToSession', () => {
    it('should add an exercise to the workout session', async () => {
      const sessionId = 'session-id';
      const exerciseId = 'exercise-id';
      const sets = [
        { reps: 10, weight: 100 },
        { reps: 8, weight: 110 },
      ];

      const addExerciseDto: AddExerciseDto = {
        exerciseId,
        sets,
      };

      const initialMockSession: Partial<WorkoutSession> = {
        id: sessionId,
        exercisesPerformed: [],
      };

      const updatedMockSession: Partial<WorkoutSession> = {
        ...initialMockSession,
        exercisesPerformed: [
          {
            sets: sets.map((set, index) => ({ ...set, order: index })) as Set[],
            id: '',
            workoutSession: new WorkoutSession(),
            exercise: new Exercise(),
            order: 0,
          },
        ],
      };

      const mockTransactionManager = {
        findOneOrFail: jest.fn().mockResolvedValue(initialMockSession),
        create: jest.fn().mockImplementation((entity, data) => data),
        save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      };

      mockWorkoutSessionRepository.manager = {
        transaction: jest.fn().mockImplementation(async (cb) => {
          return await cb(mockTransactionManager);
        }),
      };

      // Mock the findOne method to return the updated session
      service.findOne = jest.fn().mockResolvedValue(updatedMockSession);

      const result = await service.addExerciseToSession(
        sessionId,
        addExerciseDto
      );

      expect(result).toEqual(updatedMockSession);
      expect(mockTransactionManager.findOneOrFail).toHaveBeenCalledWith(
        WorkoutSession,
        {
          where: { id: sessionId },
          relations: ['exercisesPerformed'],
        }
      );
      expect(mockTransactionManager.create).toHaveBeenCalledWith(
        ExercisePerformed,
        expect.objectContaining({
          exerciseId,
          workoutSession: initialMockSession,
        })
      );
      expect(mockTransactionManager.save).toHaveBeenCalledTimes(3); // Once for ExercisePerformed, twice for Sets
      expect(service.findOne).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('findAll', () => {
    it('should return an array of workout sessions', async () => {
      const mockSessions = [
        { id: '1', userId: 'user1' },
        { id: '2', userId: 'user2' },
      ];
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
      const mockUpdatedSession = {
        id: '1',
        ...updateDto,
        exercisesPerformed: [
          {
            sets: [
              { order: 0, reps: 10, weight: 100 },
              { order: 1, reps: 8, weight: 110 },
            ],
          },
        ],
      };
      mockWorkoutSessionRepository.update.mockResolvedValue({ affected: 1 });
      mockWorkoutSessionRepository.findOneOrFail.mockResolvedValue(
        mockUpdatedSession
      );

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockUpdatedSession);
      expect(mockWorkoutSessionRepository.update).toHaveBeenCalledWith(
        '1',
        updateDto
      );
      expect(mockWorkoutSessionRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
        order: {
          exercisesPerformed: {
            order: 'ASC',
          },
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove a workout session', async () => {
      mockWorkoutSessionRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(mockWorkoutSessionRepository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('completeSession', () => {
    it('should complete a workout session', async () => {
      const mockSession = {
        id: '1',
        userId: 'user1',
        exercisesPerformed: [
          {
            sets: [
              { order: 0, reps: 10, weight: 100 },
              { order: 1, reps: 8, weight: 110 },
            ],
          },
        ],
      };
      mockWorkoutSessionRepository.findOneOrFail.mockResolvedValue(mockSession);
      mockWorkoutSessionRepository.save.mockResolvedValue(mockSession);

      const result = await service.completeSession('1');

      expect(result).toEqual(mockSession);
      expect(mockWorkoutSessionRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
        order: {
          exercisesPerformed: {
            order: 'ASC',
          },
        },
      });
      expect(mockWorkoutSessionRepository.save).toHaveBeenCalledWith(
        mockSession
      );
    });
  });
});
