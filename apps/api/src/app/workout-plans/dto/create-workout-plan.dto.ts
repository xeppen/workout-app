import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ExerciseInPlanDto } from './execise-in-plan.dto';

export class CreateWorkoutPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseInPlanDto)
  exercises: ExerciseInPlanDto[];
}
