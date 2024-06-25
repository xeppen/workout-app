import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExerciseInPlanDto } from './execise-in-plan.dto';

export class UpdateWorkoutPlanDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseInPlanDto)
  @IsOptional()
  exercises?: ExerciseInPlanDto[];
}
