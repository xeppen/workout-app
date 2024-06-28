import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateExerciseInPlanDto {
  @IsString()
  exerciseId: string;

  @IsNumber()
  sets: number;

  @IsNumber()
  reps: number;

  @IsNumber()
  restTime: number;
}

export class UpdateWorkoutPlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateExerciseInPlanDto)
  exercises?: UpdateExerciseInPlanDto[];
}
