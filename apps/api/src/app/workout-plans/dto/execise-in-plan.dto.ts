import { Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  Min,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsObject,
  IsUUID,
  ValidateNested,
  IsEnum,
  IsOptional,
} from 'class-validator';

export enum ExerciseCategory {
  PRESS = 'press',
  BENCH_PRESS = 'bench_press',
  SQUAT = 'squat',
  DEADLIFT = 'deadlift',
  OTHER = 'other',
}

export class ExerciseInPlanDto {
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  sets: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  reps: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  restTime: number;

  @IsEnum(ExerciseCategory)
  category: ExerciseCategory;

  @IsNumber()
  @Min(0)
  weight: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxWeight?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  maxReps?: number;
}

export class CompoundLiftProgress {
  @IsNumber()
  @Min(0)
  maxWeight: number;

  @IsInt()
  @Min(1)
  maxReps: number;
}

export class ProgressWorkoutPlanDto {
  @IsUUID()
  workoutPlanId: string;

  @IsBoolean()
  completeCurrentCycle: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => CompoundLiftProgress)
  compoundLiftsProgress: {
    [ExerciseCategory.PRESS]?: CompoundLiftProgress;
    [ExerciseCategory.BENCH_PRESS]?: CompoundLiftProgress;
    [ExerciseCategory.SQUAT]?: CompoundLiftProgress;
    [ExerciseCategory.DEADLIFT]?: CompoundLiftProgress;
  };
}
