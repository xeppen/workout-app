import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExercisesService } from './exercises.service';
import { Exercise } from './entities/exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { NotFoundException } from '@nestjs/common';

describe('ExercisesService', () => {
  let service: ExercisesService;
  let repo: Repository<Exercise>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        {
          provide: getRepositoryToken(Exercise),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ExercisesService>(ExercisesService);
    repo = module.get<Repository<Exercise>>(getRepositoryToken(Exercise));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create an exercise', async () => {
      const createExerciseDto: CreateExerciseDto = {
        name: 'Push-up',
        description: 'A classic bodyweight exercise',
        targetMuscleGroups: ['chest', 'triceps', 'shoulders'],
      };
      const exercise = { id: 'some-uuid', ...createExerciseDto };

      jest.spyOn(repo, 'create').mockReturnValue(exercise as Exercise);
      jest.spyOn(repo, 'save').mockResolvedValue(exercise as Exercise);

      expect(await service.create(createExerciseDto)).toEqual(exercise);
      expect(repo.create).toHaveBeenCalledWith(createExerciseDto);
      expect(repo.save).toHaveBeenCalledWith(exercise);
    });
  });

  describe('findAll', () => {
    it('should return an array of exercises', async () => {
      const exercises = [
        { id: '1', name: 'Push-up' },
        { id: '2', name: 'Pull-up' },
      ];
      jest.spyOn(repo, 'find').mockResolvedValue(exercises as Exercise[]);

      expect(await service.findAll()).toEqual(exercises);
      expect(repo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single exercise', async () => {
      const exercise = { id: '1', name: 'Push-up' };
      jest.spyOn(repo, 'findOne').mockResolvedValue(exercise as Exercise);

      expect(await service.findOne('1')).toEqual(exercise);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if exercise is not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an exercise', async () => {
      const exercise = {
        id: '1',
        name: 'Push-up',
        description: 'Old description',
      };
      const updateExerciseDto: UpdateExerciseDto = {
        description: 'New description',
      };
      const updatedExercise = { ...exercise, ...updateExerciseDto };

      jest.spyOn(repo, 'findOne').mockResolvedValue(exercise as Exercise);
      jest.spyOn(repo, 'save').mockResolvedValue(updatedExercise as Exercise);

      expect(await service.update('1', updateExerciseDto)).toEqual(
        updatedExercise
      );
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(repo.save).toHaveBeenCalledWith(updatedExercise);
    });

    it('should throw NotFoundException if exercise to update is not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(service.update('1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an exercise', async () => {
      jest.spyOn(repo, 'delete').mockResolvedValue({ affected: 1, raw: {} });

      await service.remove('1');
      expect(repo.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if exercise to remove is not found', async () => {
      jest.spyOn(repo, 'delete').mockResolvedValue({ affected: 0, raw: {} });

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
