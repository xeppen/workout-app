// apps/frontend/src/app/workouts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { WorkoutSession } from '@/types/workout-session';

export default function Workouts() {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get('/api/workout-sessions');
      setWorkouts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setLoading(false);
    }
  };

  const startNewWorkout = async () => {
    try {
      const response = await axios.post('/api/workout-sessions', {
        date: new Date(),
        // Add other necessary fields
      });
      router.push(`/workouts/${response.data.id}`);
    } catch (error) {
      console.error('Error starting new workout:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Your Workouts</h1>
      <button
        onClick={startNewWorkout}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Start New Workout
      </button>
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-2">Previous Workouts</h2>
        {workouts.map((workout) => (
          <div key={workout.id} className="border p-4 mb-2">
            <p>Date: {new Date(workout.date).toLocaleDateString()}</p>
            <button
              onClick={() => router.push(`/workouts/${workout.id}`)}
              className="mt-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-1 px-2 rounded"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
