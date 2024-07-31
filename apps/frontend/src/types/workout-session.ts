// apps/frontend/src/types/workout-session.ts
export interface WorkoutSession {
  id: string;
  userId: string;
  workoutPlanId: string;
  date: Date;
  exercisesPerformed: ExercisePerformed[];
  notes?: string;
}

export interface ExercisePerformed {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  // Add other properties as needed
}
