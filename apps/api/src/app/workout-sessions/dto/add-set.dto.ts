import { IsNumber, IsOptional, Min } from 'class-validator';

export class AddSetDto {
  @IsNumber()
  @Min(1)
  reps: number;

  @IsNumber()
  @Min(0)
  weight: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  restTime?: number;
}

export class SetDto {
  @IsNumber()
  @Min(1)
  reps: number;

  @IsNumber()
  @Min(0)
  weight: number;
}
