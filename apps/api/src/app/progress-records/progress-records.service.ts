import { Injectable } from '@nestjs/common';
import { CreateProgressRecordDto } from './dto/create-progress-record.dto';
import { UpdateProgressRecordDto } from './dto/update-progress-record.dto';

@Injectable()
export class ProgressRecordsService {
  create(createProgressRecordDto: CreateProgressRecordDto) {
    return 'This action adds a new progressRecord';
  }

  findAll() {
    return `This action returns all progressRecords`;
  }

  findOne(id: number) {
    return `This action returns a #${id} progressRecord`;
  }

  update(id: number, updateProgressRecordDto: UpdateProgressRecordDto) {
    return `This action updates a #${id} progressRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} progressRecord`;
  }
}
