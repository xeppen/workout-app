import { Module } from '@nestjs/common';
import { ProgressRecordsService } from './progress-records.service';
import { ProgressRecordsController } from './progress-records.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressRecord } from './entities/progress-record.entity';
import { User } from '../users/entities/user.entity';
import { Exercise } from '../exercises/entities/exercise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProgressRecord, User, Exercise])],
  controllers: [ProgressRecordsController],
  providers: [ProgressRecordsService],
})
export class ProgressRecordsModule {}
