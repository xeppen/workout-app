// update-workout-session.dto.ts
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateWorkoutSessionDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  exercisesPerformed?: ExercisePerformedDto[];

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class ExercisePerformedDto {
  id?: string;
  exerciseId: string;
  sets: SetDto[];
}

export class SetDto {
  reps: number;
  weight: number;
}
