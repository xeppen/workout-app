import { IsString, IsInt, Min, IsNotEmpty } from 'class-validator';

export class ExerciseInPlanDto {
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @IsNotEmpty()
  sets: number;

  @IsNotEmpty()
  reps: number;

  @IsNotEmpty()
  restTime: number;
}
