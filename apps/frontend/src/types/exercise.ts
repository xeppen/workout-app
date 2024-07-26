export interface Exercise {
  id: number;
  name: string;
  description: string;
  // Add more properties as needed, for example:
  // muscleGroup: string;
  // difficulty: 'beginner' | 'intermediate' | 'advanced';
  // equipment: string[];
  // instructions: string[];
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
