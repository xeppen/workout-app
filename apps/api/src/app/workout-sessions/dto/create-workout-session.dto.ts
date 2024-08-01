// create-workout-session.dto.ts
import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class SetDto {
  @IsNumber()
  reps: number;

  @IsNumber()
  weight: number;
}

class ExercisePerformedDto {
  @IsUUID()
  exerciseId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetDto)
  sets: SetDto[];
}

export class CreateWorkoutSessionDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID()
  workoutPlanId?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExercisePerformedDto)
  exercisesPerformed?: ExercisePerformedDto[];
}
