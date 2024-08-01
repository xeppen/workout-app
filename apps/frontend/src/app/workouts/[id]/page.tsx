'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Exercise,
  WorkoutSession,
  ExercisePerformed,
  Set,
} from '@/types/workout-session';

export default function ActiveWorkout({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchWorkoutSession();
    fetchExercises();
  }, []);

  const fetchWorkoutSession = async () => {
    try {
      const response = await axios.get<WorkoutSession>(
        `/api/workout-sessions/${params.id}`
      );
      setSession(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workout session:', error);
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      const response = await axios.get<Exercise[]>('/api/exercises');
      setExercises(response.data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const updateWorkoutSession = async (updateData: Partial<WorkoutSession>) => {
    try {
      const response = await axios.patch<WorkoutSession>(
        `/api/workout-sessions/${params.id}`,
        updateData
      );
      setSession(response.data);
    } catch (error) {
      console.error('Error updating workout session:', error);
    }
  };

  const addExerciseToSession = async (exerciseId: string) => {
    if (!session) return;

    const newExercise: ExercisePerformed = {
      id: Date.now().toString(), // Temporary ID, will be replaced by the backend
      exerciseId,
      exercise: exercises.find((e) => e.id === exerciseId) || {
        id: exerciseId,
        name: 'Unknown Exercise',
      },
      sets: [],
    };

    const updatedExercisesPerformed = [
      ...session.exercisesPerformed,
      newExercise,
    ];

    await updateWorkoutSession({
      exercisesPerformed: updatedExercisesPerformed,
    });
    setShowExerciseModal(false);
  };

  const addSetToExercise = async (
    exercisePerformedId: string,
    reps: number,
    weight: number
  ) => {
    if (!session) return;

    const updatedExercisesPerformed = session.exercisesPerformed.map((ep) => {
      if (ep.id === exercisePerformedId) {
        return {
          ...ep,
          sets: [...ep.sets, { reps, weight }],
        };
      }
      return ep;
    });

    await updateWorkoutSession({
      exercisesPerformed: updatedExercisesPerformed,
    });
  };

  const endWorkout = async () => {
    try {
      await updateWorkoutSession({ completed: true });
      router.push('/workouts');
    } catch (error) {
      console.error('Error ending workout:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Workout session not found</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">Active Workout</h1>
      <p className="mb-4">
        Date: {new Date(session.date).toLocaleDateString()}
      </p>

      <button
        onClick={() => setShowExerciseModal(true)}
        className="mb-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Exercise
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Exercises</h2>
        {session.exercisesPerformed.map(
          (exercisePerformed: ExercisePerformed) => (
            <div key={exercisePerformed.id} className="mb-4 p-4 border rounded">
              <h3 className="text-xl font-semibold mb-2">
                {exercisePerformed.exercise.name}
              </h3>
              <div className="mb-2">
                <h4 className="font-semibold">Sets:</h4>
                {exercisePerformed.sets.map((set: Set, index: number) => (
                  <p key={index}>
                    Set {index + 1}: {set.reps} reps @ {set.weight} kg
                  </p>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  addSetToExercise(
                    exercisePerformed.id,
                    Number(formData.get('reps')),
                    Number(formData.get('weight'))
                  );
                  (e.target as HTMLFormElement).reset();
                }}
                className="flex flex-wrap gap-2"
              >
                <input
                  type="number"
                  name="reps"
                  placeholder="Reps"
                  required
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  name="weight"
                  placeholder="Weight (kg)"
                  required
                  className="p-2 border rounded"
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Set
                </button>
              </form>
            </div>
          )
        )}
      </div>

      <button
        onClick={endWorkout}
        className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-4 rounded"
      >
        End Workout
      </button>

      {showExerciseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Add Exercise</h3>
            <select
              className="w-full p-2 border rounded mb-4"
              onChange={(e) => addExerciseToSession(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Select an exercise
              </option>
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowExerciseModal(false)}
              className="mt-3 w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
