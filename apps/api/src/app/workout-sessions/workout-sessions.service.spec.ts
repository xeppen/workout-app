import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkoutSessionsService } from './workout-sessions.service';
import { WorkoutSession } from './entities/workout-session.entity';
import { ExercisePerformed } from './entities/exercise-performed.entity';
import { Set } from './entities/set.entity';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateWorkoutSessionDto } from './dto/update-workout-session.dto';

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
    it('should create a new workout session', async () => {
      const createDto: CreateWorkoutSessionDto = {
        userId: 'user-id',
        workoutPlanId: 'plan-id',
        notes: 'Test session',
      };
      const expectedResult: Partial<WorkoutSession> = {
        id: 'session-id',
        ...createDto,
        date: expect.any(Date),
        exercisesPerformed: [],
      };

      mockWorkoutSessionRepository.create.mockReturnValue(expectedResult);
      mockWorkoutSessionRepository.save.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);
      expect(result).toEqual(expectedResult);
      expect(mockWorkoutSessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(createDto)
      );
      expect(mockWorkoutSessionRepository.save).toHaveBeenCalledWith(
        expectedResult
      );
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
      const mockSets: Partial<Set>[] = sets.map((set, index) => ({
        id: `set-id-${index}`,
        ...set,
        exercisePerformed: mockExercisePerformed as ExercisePerformed,
      }));

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
        exerciseId,
        sets
      );

      expect(result).toEqual(mockSession);
      expect(mockWorkoutSessionRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: sessionId },
        relations: ['exercisesPerformed', 'exercisesPerformed.sets'],
      });
      expect(mockExercisePerformedRepository.create).toHaveBeenCalledWith({
        exerciseId,
        workoutSession: mockSession,
      });
      expect(mockExercisePerformedRepository.save).toHaveBeenCalledWith(
        mockExercisePerformed
      );
      expect(mockSetRepository.create).toHaveBeenCalledTimes(sets.length);
      expect(mockSetRepository.save).toHaveBeenCalledTimes(sets.length);
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
      });
      expect(mockWorkoutSessionRepository.save).toHaveBeenCalledWith(
        mockSession
      );
    });
  });
});
