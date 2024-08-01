import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkoutSessionsService } from './workout-sessions.service';
import { WorkoutSession } from './entities/workout-session.entity';
import { ExercisePerformed } from './entities/exercise-performed.entity';
import { Set } from './entities/set.entity';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateWorkoutSessionDto } from './dto/update-workout-session.dto';
import { AddExerciseDto } from './dto/add-exercise.dto';

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
              { reps: 10, weight: 100 },
              { reps: 8, weight: 110 },
            ],
          },
        ],
      };

      const mockWorkoutSession = {
        id: 'session-id',
        ...createDto,
        date: new Date(),
      };

      const mockExercisePerformed = {
        id: 'exercise-performed-id',
        exerciseId: 'exercise-id',
        workoutSession: mockWorkoutSession,
      };

      const mockSets = [
        {
          id: 'set-1',
          ...createDto.exercisesPerformed[0].sets[0],
          exercisePerformed: mockExercisePerformed,
        },
        {
          id: 'set-2',
          ...createDto.exercisesPerformed[0].sets[1],
          exercisePerformed: mockExercisePerformed,
        },
      ];

      mockWorkoutSessionRepository.create.mockReturnValue(mockWorkoutSession);
      mockWorkoutSessionRepository.save.mockResolvedValue(mockWorkoutSession);
      mockExercisePerformedRepository.create.mockReturnValue(
        mockExercisePerformed
      );
      mockExercisePerformedRepository.save.mockResolvedValue(
        mockExercisePerformed
      );
      mockSetRepository.create
        .mockReturnValue(mockSets[0])
        .mockReturnValueOnce(mockSets[1]);
      mockSetRepository.save
        .mockResolvedValue(mockSets[0])
        .mockResolvedValueOnce(mockSets[1]);

      mockWorkoutSessionRepository.findOne.mockResolvedValue({
        ...mockWorkoutSession,
        exercisesPerformed: [{ ...mockExercisePerformed, sets: mockSets }],
      });

      const result = await service.create(createDto);

      expect(result).toEqual({
        ...mockWorkoutSession,
        exercisesPerformed: [{ ...mockExercisePerformed, sets: mockSets }],
      });
      expect(mockWorkoutSessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: createDto.userId,
          workoutPlanId: createDto.workoutPlanId,
          notes: createDto.notes,
        })
      );
      expect(mockWorkoutSessionRepository.save).toHaveBeenCalledWith(
        mockWorkoutSession
      );
      expect(mockExercisePerformedRepository.create).toHaveBeenCalledWith({
        exerciseId: createDto.exercisesPerformed[0].exerciseId,
        workoutSession: mockWorkoutSession,
      });
      expect(mockExercisePerformedRepository.save).toHaveBeenCalledWith(
        mockExercisePerformed
      );
      expect(mockSetRepository.create).toHaveBeenCalledTimes(2);
      expect(mockSetRepository.save).toHaveBeenCalledTimes(2);
      expect(mockWorkoutSessionRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockWorkoutSession.id },
        relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
      });
    });
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

      const mockSession: Partial<WorkoutSession> = {
        id: sessionId,
        exercisesPerformed: [],
      };
      const mockExercisePerformed: Partial<ExercisePerformed> = {
        id: 'exercise-performed-id',
        exerciseId,
        workoutSession: mockSession as WorkoutSession,
        sets: [],
      };

      mockWorkoutSessionRepository.findOneOrFail.mockResolvedValue(mockSession);
      mockExercisePerformedRepository.create.mockReturnValue(
        mockExercisePerformed
      );
      mockExercisePerformedRepository.save.mockResolvedValue(
        mockExercisePerformed
      );
      mockSetRepository.create.mockImplementation((setData) => setData);
      mockSetRepository.save.mockImplementation((set) => Promise.resolve(set));

      const result = await service.addExerciseToSession(
        sessionId,
        addExerciseDto
      );

      expect(result).toEqual(mockSession);
      expect(mockWorkoutSessionRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: sessionId },
        relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
        order: {
          exercisesPerformed: {
            id: 'ASC',
            sets: {
              id: 'ASC',
            },
          },
        },
      });
      expect(mockExercisePerformedRepository.create).toHaveBeenCalledWith({
        exerciseId,
        workoutSession: mockSession,
        sets: [],
      });
      expect(mockExercisePerformedRepository.save).toHaveBeenCalledWith(
        mockExercisePerformed
      );
      expect(mockSetRepository.create).toHaveBeenCalledTimes(sets.length);
      sets.forEach((set, index) => {
        expect(mockSetRepository.create).toHaveBeenNthCalledWith(index + 1, {
          ...set,
          exercisePerformed: mockExercisePerformed,
        });
      });
      expect(mockSetRepository.save).toHaveBeenCalledTimes(sets.length);
      expect(mockWorkoutSessionRepository.findOneOrFail).toHaveBeenCalledTimes(
        2
      );
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
      const mockUpdatedSession = { id: '1', ...updateDto };
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
            id: 'ASC',
            sets: {
              id: 'ASC',
            },
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
      const mockSession = { id: '1', userId: 'user1' };
      mockWorkoutSessionRepository.findOneOrFail.mockResolvedValue(mockSession);
      mockWorkoutSessionRepository.save.mockResolvedValue(mockSession);

      const result = await service.completeSession('1');

      expect(result).toEqual(mockSession);
      expect(mockWorkoutSessionRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
        order: {
          exercisesPerformed: {
            id: 'ASC',
            sets: {
              id: 'ASC',
            },
          },
        },
      });
      expect(mockWorkoutSessionRepository.save).toHaveBeenCalledWith(
        mockSession
      );
    });
  });
});
