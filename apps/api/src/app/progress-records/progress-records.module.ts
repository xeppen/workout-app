import { Module } from '@nestjs/common';
import { ProgressRecordsService } from './progress-records.service';
import { ProgressRecordsController } from './progress-records.controller';

@Module({
  controllers: [ProgressRecordsController],
  providers: [ProgressRecordsService],
})
export class ProgressRecordsModule {}
