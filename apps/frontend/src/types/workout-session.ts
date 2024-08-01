// apps/frontend/src/types/workout-session.ts
export interface WorkoutSession {
  id: string;
  userId: string;
  workoutPlanId?: string;
  date: Date;
  exercisesPerformed: ExercisePerformed[];
  notes?: string;
  completed: boolean;
}

export interface ExercisePerformed {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: Set[];
}

export interface Exercise {
  id: string;
  name: string;
  // Add other properties as needed
}

export interface Set {
  id?: string; // Make id optional as it might not be available when creating a new set
  reps: number;
  weight: number;
}
