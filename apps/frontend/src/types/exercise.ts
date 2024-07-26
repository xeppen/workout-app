export interface Exercise {
  id: string;
  name: string;
  description: string;
  targetMuscleGroups: string[];
  videoURL: string | null;
}

// You can also define related types here, for example:
export interface ExerciseSet {
  exerciseId: number;
  reps: number;
  weight?: number;
  duration?: number; // for time-based exercises
}

export interface WorkoutExercise extends Exercise {
  sets: ExerciseSet[];
}
