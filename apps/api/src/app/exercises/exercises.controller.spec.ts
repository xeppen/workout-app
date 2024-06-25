import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { Exercise } from './entities/exercise.entity';
import { NotFoundException } from '@nestjs/common';

describe('ExercisesController', () => {
  let controller: ExercisesController;
  let service: ExercisesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExercisesController],
      providers: [
        {
          provide: ExercisesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ExercisesController>(ExercisesController);
    service = module.get<ExercisesService>(ExercisesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an exercise', async () => {
      const createExerciseDto: CreateExerciseDto = {
        name: 'Push Up',
        description: 'Push up exercise',
        targetMuscleGroups: ['chest', 'triceps'],
      };

      const createdExercise = { id: '1', ...createExerciseDto };
      jest
        .spyOn(service, 'create')
        .mockResolvedValue(createdExercise as Exercise);

      expect(await controller.create(createExerciseDto)).toBe(createdExercise);
      expect(service.create).toHaveBeenCalledWith(createExerciseDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of exercises', async () => {
      const exercises: Exercise[] = [
        {
          id: '1',
          name: 'Push Up',
          description: 'Push up exercise',
          targetMuscleGroups: ['chest', 'triceps'],
          videoURL: '',
          progressRecords: [],
          exercisesInPlan: [],
          exercisesPerformed: [],
        },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(exercises);

      expect(await controller.findAll()).toBe(exercises);
    });
  });

  describe('findOne', () => {
    it('should return an exercise by id', async () => {
      const exercise = {
        id: '1',
        name: 'Push Up',
        description: 'Push up exercise',
        targetMuscleGroups: ['chest', 'triceps'],
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(exercise as Exercise);

      expect(await controller.findOne('1')).toBe(exercise);
    });

    it('should throw NotFoundException if exercise is not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      try {
        await controller.findOne('1');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('update', () => {
    it('should update an exercise', async () => {
      const updateExerciseDto: UpdateExerciseDto = {
        name: 'Push Up Updated',
        description: 'Updated description',
        targetMuscleGroups: ['chest', 'triceps'],
      };

      const updatedExercise = { id: '1', ...updateExerciseDto };
      jest
        .spyOn(service, 'update')
        .mockResolvedValue(updatedExercise as Exercise);

      expect(await controller.update('1', updateExerciseDto)).toBe(
        updatedExercise
      );
      expect(service.update).toHaveBeenCalledWith('1', updateExerciseDto);
    });
  });

  describe('remove', () => {
    it('should remove an exercise', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      expect(await controller.remove('1')).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
