import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkoutSessionDto } from './create-workout-session.dto';

// update-workout-session.dto.ts
export class UpdateWorkoutSessionDto {
  notes?: string;
}
