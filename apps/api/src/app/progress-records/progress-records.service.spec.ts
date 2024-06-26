import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgressRecordsService } from './progress-records.service';
import { ProgressRecord } from './entities/progress-record.entity';
import { User } from '../users/entities/user.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { CreateProgressRecordDto } from './dto/create-progress-record.dto';
import { UpdateProgressRecordDto } from './dto/update-progress-record.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProgressRecordsService', () => {
  let service: ProgressRecordsService;
  let progressRecordRepository: jest.Mocked<Repository<ProgressRecord>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let exerciseRepository: jest.Mocked<Repository<Exercise>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressRecordsService,
        {
          provide: getRepositoryToken(ProgressRecord),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Exercise),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProgressRecordsService>(ProgressRecordsService);
    progressRecordRepository = module.get(getRepositoryToken(ProgressRecord));
    userRepository = module.get(getRepositoryToken(User));
    exerciseRepository = module.get(getRepositoryToken(Exercise));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a progress record', async () => {
      const createDto: CreateProgressRecordDto = {
        userId: 'user-id',
        exerciseId: 'exercise-id',
        date: new Date(),
        weightLifted: 100,
        reps: 10,
        sets: 3,
      };
      const user = { id: 'user-id' } as User;
      const exercise = { id: 'exercise-id' } as Exercise;
      const progressRecord: ProgressRecord = {
        id: 'record-id',
        user,
        exercise,
        date: createDto.date,
        weightLifted: createDto.weightLifted,
        reps: createDto.reps,
        sets: createDto.sets,
      };

      userRepository.findOne.mockResolvedValue(user);
      exerciseRepository.findOne.mockResolvedValue(exercise);
      progressRecordRepository.create.mockReturnValue(progressRecord);
      progressRecordRepository.save.mockResolvedValue(progressRecord);

      const result = await service.create(createDto);
      expect(result).toEqual(progressRecord);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.userId },
      });
      expect(exerciseRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.exerciseId },
      });
      expect(progressRecordRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user,
          exercise,
          date: createDto.date,
          weightLifted: createDto.weightLifted,
          reps: createDto.reps,
          sets: createDto.sets,
        })
      );
      expect(progressRecordRepository.save).toHaveBeenCalledWith(
        progressRecord
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      const createDto: CreateProgressRecordDto = {
        userId: 'non-existent-user-id',
        exerciseId: 'exercise-id',
        date: new Date(),
        weightLifted: 100,
        reps: 10,
        sets: 3,
      };

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw NotFoundException if exercise is not found', async () => {
      const createDto: CreateProgressRecordDto = {
        userId: 'user-id',
        exerciseId: 'non-existent-exercise-id',
        date: new Date(),
        weightLifted: 100,
        reps: 10,
        sets: 3,
      };

      userRepository.findOne.mockResolvedValue({ id: 'user-id' } as User);
      exerciseRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of progress records', async () => {
      const expectedResult: ProgressRecord[] = [
        {
          id: 'record-id',
          user: { id: 'user-id' } as User,
          exercise: { id: 'exercise-id' } as Exercise,
          date: new Date(),
          weightLifted: 100,
          reps: 10,
          sets: 3,
        },
      ];
      progressRecordRepository.find.mockResolvedValue(expectedResult);

      const result = await service.findAll();
      expect(result).toEqual(expectedResult);
      expect(progressRecordRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'exercise'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a single progress record', async () => {
      const expectedResult: ProgressRecord = {
        id: 'record-id',
        user: { id: 'user-id' } as User,
        exercise: { id: 'exercise-id' } as Exercise,
        date: new Date(),
        weightLifted: 100,
        reps: 10,
        sets: 3,
      };
      progressRecordRepository.findOne.mockResolvedValue(expectedResult);

      const result = await service.findOne('record-id');
      expect(result).toEqual(expectedResult);
      expect(progressRecordRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'record-id' },
        relations: ['user', 'exercise'],
      });
    });

    it('should throw NotFoundException if progress record is not found', async () => {
      progressRecordRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update', () => {
    it('should update a progress record', async () => {
      const updateDto: UpdateProgressRecordDto = { weightLifted: 110 };
      const existingRecord: ProgressRecord = {
        id: 'record-id',
        user: { id: 'user-id' } as User,
        exercise: { id: 'exercise-id' } as Exercise,
        date: new Date(),
        weightLifted: 100,
        reps: 10,
        sets: 3,
      };
      const updatedRecord: ProgressRecord = { ...existingRecord, ...updateDto };

      progressRecordRepository.findOne.mockResolvedValue(existingRecord);
      progressRecordRepository.save.mockResolvedValue(updatedRecord);

      const result = await service.update('record-id', updateDto);
      expect(result).toEqual(updatedRecord);
      expect(progressRecordRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'record-id' },
        relations: ['user', 'exercise'],
      });
      expect(progressRecordRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updatedRecord)
      );
    });

    it('should throw NotFoundException if progress record is not found', async () => {
      progressRecordRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { weightLifted: 110 })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a progress record', async () => {
      progressRecordRepository.delete.mockResolvedValue({
        affected: 1,
        raw: {},
      });

      await expect(service.remove('record-id')).resolves.not.toThrow();
      expect(progressRecordRepository.delete).toHaveBeenCalledWith('record-id');
    });

    it('should throw NotFoundException if progress record is not found', async () => {
      progressRecordRepository.delete.mockResolvedValue({
        affected: 0,
        raw: {},
      });

      try {
        await service.remove('non-existent-id');
      } catch (error) {
        console.log('Caught error:', error);
      }

      await expect(service.remove('non-existent-id')).rejects.toThrowError(
        NotFoundException
      );
    });
  });
});
