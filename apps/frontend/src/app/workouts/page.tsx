// apps/frontend/src/app/workouts/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWorkoutSessions, apiClient } from '@/app/api/client';
import { WorkoutSession } from '@/types/workout-session';

export default function Workouts() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: workouts,
    isLoading,
    error,
  } = useQuery<WorkoutSession[], Error>({
    queryKey: ['workoutSessions'],
    queryFn: fetchWorkoutSessions,
  });

  const createWorkoutMutation = useMutation({
    mutationFn: (newWorkout: Partial<WorkoutSession>) =>
      apiClient.post('/workout-sessions', newWorkout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutSessions'] });
    },
  });

  const startNewWorkout = async () => {
    try {
      const response = await createWorkoutMutation.mutateAsync({
        date: new Date(),
      });
      router.push(`/workouts/active/${response.data.id}`);
    } catch (error) {
      console.error('Error starting new workout:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">Your Workouts</h1>
      <button
        onClick={startNewWorkout}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded mb-6"
      >
        Start New Workout
      </button>
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-2">Previous Workouts</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {workouts &&
            workouts.map((workout) => (
              <div key={workout.id} className="border p-4 rounded shadow">
                <p className="font-semibold">
                  Date: {new Date(workout.date).toLocaleDateString()}
                </p>
                <button
                  onClick={() => router.push(`/workouts/${workout.id}`)}
                  className="mt-2 w-full bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                >
                  View Details
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
