import { IsString, IsInt, Min, IsNotEmpty } from 'class-validator';

export class ExerciseInPlanDto {
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @IsInt()
  @Min(1)
  sets: number;

  @IsInt()
  @Min(1)
  reps: number;

  @IsInt()
  @Min(0)
  restTime: number; // in seconds
}
