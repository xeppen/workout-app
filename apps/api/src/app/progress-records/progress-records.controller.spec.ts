import { Test, TestingModule } from '@nestjs/testing';
import { ProgressRecordsController } from './progress-records.controller';
import { ProgressRecordsService } from './progress-records.service';
import { CreateProgressRecordDto } from './dto/create-progress-record.dto';
import { UpdateProgressRecordDto } from './dto/update-progress-record.dto';
import { ProgressRecord } from './entities/progress-record.entity';
import { User } from '../users/entities/user.entity';
import { Exercise } from '../exercises/entities/exercise.entity';

describe('ProgressRecordsController', () => {
  let controller: ProgressRecordsController;
  let service: jest.Mocked<ProgressRecordsService>;

  beforeEach(async () => {
    const mockProgressRecordsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressRecordsController],
      providers: [
        {
          provide: ProgressRecordsService,
          useValue: mockProgressRecordsService,
        },
      ],
    }).compile();

    controller = module.get<ProgressRecordsController>(
      ProgressRecordsController
    );
    service = module.get(ProgressRecordsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      const expectedResult: ProgressRecord = {
        id: 'record-id',
        user: { id: 'user-id' } as User,
        exercise: { id: 'exercise-id' } as Exercise,
        date: createDto.date,
        weightLifted: createDto.weightLifted,
        reps: createDto.reps,
        sets: createDto.sets,
      };

      service.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
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
      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
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
      service.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('record-id');
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith('record-id');
    });
  });

  describe('update', () => {
    it('should update a progress record', async () => {
      const updateDto: UpdateProgressRecordDto = { weightLifted: 110 };
      const expectedResult: ProgressRecord = {
        id: 'record-id',
        user: { id: 'user-id' } as User,
        exercise: { id: 'exercise-id' } as Exercise,
        date: new Date(),
        weightLifted: 110,
        reps: 10,
        sets: 3,
      };
      service.update.mockResolvedValue(expectedResult);

      const result = await controller.update('record-id', updateDto);
      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith('record-id', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a progress record', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('record-id');
      expect(service.remove).toHaveBeenCalledWith('record-id');
    });
  });
});
