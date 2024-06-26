import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProgressRecordDto } from './dto/create-progress-record.dto';
import { UpdateProgressRecordDto } from './dto/update-progress-record.dto';
import { ProgressRecord } from './entities/progress-record.entity';
import { User } from '../users/entities/user.entity';
import { Exercise } from '../exercises/entities/exercise.entity';

@Injectable()
export class ProgressRecordsService {
  constructor(
    @InjectRepository(ProgressRecord)
    private progressRecordRepository: Repository<ProgressRecord>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>
  ) {}

  async create(
    createProgressRecordDto: CreateProgressRecordDto
  ): Promise<ProgressRecord> {
    const user = await this.userRepository.findOne({
      where: { id: createProgressRecordDto.userId },
    });
    const exercise = await this.exerciseRepository.findOne({
      where: { id: createProgressRecordDto.exerciseId },
    });

    if (!user || !exercise) {
      throw new NotFoundException('User or Exercise not found');
    }

    const progressRecord = this.progressRecordRepository.create({
      ...createProgressRecordDto,
      user,
      exercise,
    });

    return this.progressRecordRepository.save(progressRecord);
  }

  async findAll(): Promise<ProgressRecord[]> {
    return this.progressRecordRepository.find({
      relations: ['user', 'exercise'],
    });
  }

  async findOne(id: string): Promise<ProgressRecord> {
    const progressRecord = await this.progressRecordRepository.findOne({
      where: { id },
      relations: ['user', 'exercise'],
    });
    if (!progressRecord) {
      throw new NotFoundException(`Progress record with ID "${id}" not found`);
    }
    return progressRecord;
  }

  async update(
    id: string,
    updateProgressRecordDto: UpdateProgressRecordDto
  ): Promise<ProgressRecord> {
    const progressRecord = await this.findOne(id);
    Object.assign(progressRecord, updateProgressRecordDto);
    return this.progressRecordRepository.save(progressRecord);
  }

  async remove(id: string): Promise<void> {
    const result = await this.progressRecordRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Progress record with ID "${id}" not found`);
    }
  }
}
