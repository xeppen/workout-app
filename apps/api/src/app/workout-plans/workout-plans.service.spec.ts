import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkoutPlansService } from './workout-plans.service';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { ExerciseInPlan } from './entities/exercise-in-plan.entity';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { NotFoundException } from '@nestjs/common';
import { Repository, DeepPartial, SaveOptions } from 'typeorm';
import { Exercise } from '../exercises/entities/exercise.entity';

describe('WorkoutPlansService', () => {
  let service: WorkoutPlansService;
  let workoutPlanRepository: jest.Mocked<Repository<WorkoutPlan>>;
  let exerciseInPlanRepository: jest.Mocked<Repository<ExerciseInPlan>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutPlansService,
        {
          provide: getRepositoryToken(WorkoutPlan),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ExerciseInPlan),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkoutPlansService>(WorkoutPlansService);
    workoutPlanRepository = module.get(getRepositoryToken(WorkoutPlan));
    exerciseInPlanRepository = module.get(getRepositoryToken(ExerciseInPlan));

    workoutPlanRepository.save.mockImplementation(
      (plan: DeepPartial<WorkoutPlan>) =>
        Promise.resolve({
          ...plan,
          id: plan.id || `mock-plan-id-${Math.random()}`,
        } as WorkoutPlan)
    );

    exerciseInPlanRepository.create.mockImplementation(
      (dto: DeepPartial<ExerciseInPlan>) =>
        ({
          id: `mock-exercise-id-${Math.random()}`,
          workoutPlan: {} as WorkoutPlan,
          exercise: {} as Exercise,
          exerciseId: '',
          sets: 0,
          reps: 0,
          restTime: 0,
          ...dto,
        } as ExerciseInPlan)
    );

    exerciseInPlanRepository.save.mockImplementation(
      (
        entity: DeepPartial<ExerciseInPlan> | DeepPartial<ExerciseInPlan>[],
        options?: SaveOptions
      ) => {
        const result = Array.isArray(entity) ? entity : [entity];
        return Promise.resolve(
          result.map((e) => {
            if (typeof e !== 'object' || e === null) {
              return {
                id: `mock-exercise-id-${Math.random()}`,
                exerciseId: `mock-exercise-${Math.random()}`,
                exercise: { id: `mock-exercise-${Math.random()}` },
                sets: 0,
                reps: 0,
                restTime: 0,
              };
            }
            return {
              id: `mock-exercise-id-${Math.random()}`,
              exerciseId: e.exerciseId || `mock-exercise-${Math.random()}`,
              exercise: {
                id: e.exerciseId || `mock-exercise-${Math.random()}`,
              },
              sets: e.sets || 0,
              reps: e.reps || 0,
              restTime: e.restTime || 0,
              ...e,
            };
          }) as unknown as DeepPartial<ExerciseInPlan> & ExerciseInPlan
        );
      }
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a workout plan', async () => {
      const createWorkoutPlanDto: CreateWorkoutPlanDto = {
        name: 'Test Plan',
        description: 'Test Description',
        exercises: [
          { exerciseId: 'exercise-id', sets: 3, reps: 10, restTime: 60 },
        ],
        userId: 'user-id',
      };

      const savedWorkoutPlan: Partial<WorkoutPlan> = {
        id: 'plan-id',
        name: createWorkoutPlanDto.name,
        description: createWorkoutPlanDto.description,
        userId: createWorkoutPlanDto.userId,
      };

      const exercisesInPlan = [
        {
          id: 'exercise-in-plan-id',
          ...createWorkoutPlanDto.exercises[0],
          workoutPlan: savedWorkoutPlan as WorkoutPlan,
        },
      ];

      workoutPlanRepository.create.mockReturnValue(
        savedWorkoutPlan as WorkoutPlan
      );
      workoutPlanRepository.save.mockResolvedValue(
        savedWorkoutPlan as WorkoutPlan
      );
      workoutPlanRepository.findOne.mockResolvedValue({
        ...savedWorkoutPlan,
        exercises: exercisesInPlan,
      } as WorkoutPlan);

      exerciseInPlanRepository.create.mockReturnValue(
        exercisesInPlan[0] as ExerciseInPlan
      );
      exerciseInPlanRepository.save.mockResolvedValue(exercisesInPlan as any); // Change to any to match type

      const result = await service.create(createWorkoutPlanDto);

      const expectedResult = {
        ...savedWorkoutPlan,
        exercises: exercisesInPlan.map((exercise) => ({
          ...exercise,
          workoutPlan: undefined,
        })),
      };

      expect(result).toEqual(expectedResult);
      expect(workoutPlanRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createWorkoutPlanDto.name,
          description: createWorkoutPlanDto.description,
          userId: createWorkoutPlanDto.userId,
        })
      );
      expect(workoutPlanRepository.save).toHaveBeenCalled();
      expect(exerciseInPlanRepository.save).toHaveBeenCalledWith(
        exercisesInPlan
      );
    });
  });

  describe('update', () => {
    it('should update a workout plan without exercises', async () => {
      const id = 'plan-id';
      const updateWorkoutPlanDto: UpdateWorkoutPlanDto = {
        name: 'Updated Plan',
      };
      const existingPlan = {
        id,
        name: 'Old Plan',
        description: 'Old Description',
        exercises: [],
      };
      const updatedPlan = { ...existingPlan, ...updateWorkoutPlanDto };

      workoutPlanRepository.findOne.mockResolvedValue(
        existingPlan as WorkoutPlan
      );
      workoutPlanRepository.save.mockResolvedValue(updatedPlan as WorkoutPlan);

      const result = await service.update(id, updateWorkoutPlanDto);

      expect(result).toEqual(updatedPlan);
      expect(workoutPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['exercises'],
      });
      expect(workoutPlanRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updatedPlan)
      );
    });

    it('should update a workout plan with exercises', async () => {
      const id = 'plan-id';
      const updateWorkoutPlanDto: UpdateWorkoutPlanDto = {
        name: 'Updated Plan',
        exercises: [
          { exerciseId: 'exercise-1', sets: 3, reps: 10, restTime: 60 },
          { exerciseId: 'exercise-2', sets: 4, reps: 8, restTime: 90 },
        ],
      };
      const existingPlan: WorkoutPlan = {
        id,
        name: 'Old Plan',
        description: 'Old Description',
        exercises: [],
        userId: 'user-id',
      } as WorkoutPlan;

      workoutPlanRepository.findOne.mockResolvedValue(existingPlan);

      exerciseInPlanRepository.create.mockImplementation(
        (dto: DeepPartial<ExerciseInPlan>) =>
          ({
            id: `mock-exercise-id-${Math.random()}`,
            workoutPlan: { id: existingPlan.id } as WorkoutPlan,
            exercise: { id: dto.exerciseId } as Exercise,
            exerciseId: dto.exerciseId || '',
            sets: dto.sets || 0,
            reps: dto.reps || 0,
            restTime: dto.restTime || 0,
            ...dto,
          } as ExerciseInPlan)
      );

      const result = await service.update(id, updateWorkoutPlanDto);

      console.log('Result:', JSON.stringify(result, null, 2));

      expect(result.id).toBe(id);
      expect(result.name).toBe('Updated Plan');
      expect(result.exercises).toHaveLength(2);
      result.exercises.forEach((exercise, index) => {
        expect(exercise).toMatchObject({
          id: expect.any(String),
          exerciseId: updateWorkoutPlanDto.exercises[index].exerciseId,
          sets: updateWorkoutPlanDto.exercises[index].sets,
          reps: updateWorkoutPlanDto.exercises[index].reps,
          restTime: updateWorkoutPlanDto.exercises[index].restTime,
          exercise: expect.objectContaining({
            id: updateWorkoutPlanDto.exercises[index].exerciseId,
          }),
        });
      });

      expect(workoutPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['exercises'],
      });
      expect(exerciseInPlanRepository.delete).toHaveBeenCalledWith({
        workoutPlan: { id },
      });
      expect(exerciseInPlanRepository.create).toHaveBeenCalledTimes(2);
      expect(exerciseInPlanRepository.save).toHaveBeenCalled();
      expect(workoutPlanRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if workout plan is not found', async () => {
      const id = 'non-existent-id';
      const updateWorkoutPlanDto: UpdateWorkoutPlanDto = {
        name: 'Updated Plan',
      };

      workoutPlanRepository.findOne.mockResolvedValue(null);

      await expect(service.update(id, updateWorkoutPlanDto)).rejects.toThrow(
        NotFoundException
      );
      expect(workoutPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['exercises'],
      });
    });
  });

  describe('remove', () => {
    it('should remove a workout plan', async () => {
      const id = 'plan-id';
      workoutPlanRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove(id);

      expect(workoutPlanRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});
