// update-workout-session.dto.ts
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { SetDto } from './add-set.dto';

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
