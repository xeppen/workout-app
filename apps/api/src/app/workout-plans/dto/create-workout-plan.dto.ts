import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsUUID,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExerciseInPlanDto } from './execise-in-plan.dto';

export class CreateWorkoutPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseInPlanDto)
  exercises: ExerciseInPlanDto[];
}

export class ProgressWorkoutPlanDto {
  @IsString()
  @IsOptional()
  progressionType?: 'linear' | 'percentage';

  @IsNumber()
  @IsPositive()
  incrementWeight: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  incrementPercentage?: number;
}
