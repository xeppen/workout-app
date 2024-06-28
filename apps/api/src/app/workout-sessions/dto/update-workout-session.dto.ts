import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkoutSessionDto } from './create-workout-session.dto';

// update-workout-session.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateWorkoutSessionDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
