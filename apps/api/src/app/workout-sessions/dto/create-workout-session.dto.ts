// create-workout-session.dto.ts
import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsDateString,
  Min,
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

export class CreateSetDto {
  @IsNumber()
  @Min(1)
  reps: number;

  @IsNumber()
  @Min(0)
  weight: number;

  @IsNumber()
  @Min(0)
  order: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  restTime?: number;
}

export class CreateExercisePerformedDto {
  @IsUUID()
  exerciseId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSetDto)
  sets: CreateSetDto[];
}

export class CreateWorkoutSessionDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  workoutPlanId: string;

  @IsDateString()
  date: string;

  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExercisePerformedDto)
  exercisesPerformed: CreateExercisePerformedDto[];
}
