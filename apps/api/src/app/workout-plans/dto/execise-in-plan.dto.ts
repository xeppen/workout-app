import { IsString, IsInt, Min, IsNotEmpty, IsNumber } from 'class-validator';

export class ExerciseInPlanDto {
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @IsNumber()
  @IsNotEmpty()
  sets: number;

  @IsNumber()
  @IsNotEmpty()
  reps: number;

  @IsNumber()
  @IsNotEmpty()
  restTime: number;
}
