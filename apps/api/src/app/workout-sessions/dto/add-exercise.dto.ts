import { IsArray, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddSetDto, SetDto } from './add-set.dto';

export class AddExerciseDto {
  @IsUUID()
  exerciseId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddSetDto)
  sets: AddSetDto[];
}
