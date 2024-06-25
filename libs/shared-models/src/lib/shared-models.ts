// libs/shared-models/src/lib/shared-models.ts

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  userId: string;
  exercises: ExerciseInPlan[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseInPlan {
  exerciseId: string;
  sets: number;
  reps: number;
  restTime: number; // in seconds
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  targetMuscleGroups: string[];
  videoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutPlanId: string;
  date: Date;
  exercises: ExercisePerformed[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExercisePerformed {
  exerciseId: string;
  sets: Set[];
}

export interface Set {
  reps: number;
  weight: number;
  restTime?: number; // in seconds
}

export interface ProgressRecord {
  id: string;
  userId: string;
  exerciseId: string;
  date: Date;
  weightLifted: number;
  reps: number;
  sets: number;
  createdAt: Date;
  updatedAt: Date;
}
