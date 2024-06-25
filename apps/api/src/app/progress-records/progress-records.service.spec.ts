import { Test, TestingModule } from '@nestjs/testing';
import { ProgressRecordsService } from './progress-records.service';

describe('ProgressRecordsService', () => {
  let service: ProgressRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgressRecordsService],
    }).compile();

    service = module.get<ProgressRecordsService>(ProgressRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
