// create-workout-session.dto.ts
import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
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

  @IsUUID()
  workoutPlanId: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExercisePerformedDto)
  exercisesPerformed: ExercisePerformedDto[];
}
