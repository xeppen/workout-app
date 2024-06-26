import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProgressRecordsService } from './progress-records.service';
import { CreateProgressRecordDto } from './dto/create-progress-record.dto';
import { UpdateProgressRecordDto } from './dto/update-progress-record.dto';
import { ProgressRecord } from './entities/progress-record.entity';

@Controller('progress-records')
export class ProgressRecordsController {
  constructor(
    private readonly progressRecordsService: ProgressRecordsService
  ) {}

  @Post()
  create(
    @Body() createProgressRecordDto: CreateProgressRecordDto
  ): Promise<ProgressRecord> {
    return this.progressRecordsService.create(createProgressRecordDto);
  }

  @Get()
  findAll(): Promise<ProgressRecord[]> {
    return this.progressRecordsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProgressRecord> {
    return this.progressRecordsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProgressRecordDto: UpdateProgressRecordDto
  ): Promise<ProgressRecord> {
    return this.progressRecordsService.update(id, updateProgressRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.progressRecordsService.remove(id);
  }
}
