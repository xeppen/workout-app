import { IsUUID, IsDate, IsNumber, Min } from 'class-validator';

export class CreateProgressRecordDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  exerciseId: string;

  @IsDate()
  date: Date;

  @IsNumber()
  @Min(0)
  weightLifted: number;

  @IsNumber()
  @Min(1)
  reps: number;

  @IsNumber()
  @Min(1)
  sets: number;
}
