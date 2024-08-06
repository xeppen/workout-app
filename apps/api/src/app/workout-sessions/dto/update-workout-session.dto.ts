// update-workout-session.dto.ts
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { SetDto } from './add-set.dto';
import { Type } from 'class-transformer';

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
  @IsUUID()
  exerciseId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => SetDto)
  sets: SetDto[];
}
