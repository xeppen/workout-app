import { Test, TestingModule } from '@nestjs/testing';
import { ProgressRecordsController } from './progress-records.controller';
import { ProgressRecordsService } from './progress-records.service';

describe('ProgressRecordsController', () => {
  let controller: ProgressRecordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressRecordsController],
      providers: [ProgressRecordsService],
    }).compile();

    controller = module.get<ProgressRecordsController>(
      ProgressRecordsController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
