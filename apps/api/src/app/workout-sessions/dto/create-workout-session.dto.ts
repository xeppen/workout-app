// create-workout-session.dto.ts
export class CreateWorkoutSessionDto {
  userId: string;
  workoutPlanId: string;
  notes?: string;
}
