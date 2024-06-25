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

@Controller('progress-records')
export class ProgressRecordsController {
  constructor(
    private readonly progressRecordsService: ProgressRecordsService
  ) {}

  @Post()
  create(@Body() createProgressRecordDto: CreateProgressRecordDto) {
    return this.progressRecordsService.create(createProgressRecordDto);
  }

  @Get()
  findAll() {
    return this.progressRecordsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.progressRecordsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProgressRecordDto: UpdateProgressRecordDto
  ) {
    return this.progressRecordsService.update(+id, updateProgressRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.progressRecordsService.remove(+id);
  }
}
