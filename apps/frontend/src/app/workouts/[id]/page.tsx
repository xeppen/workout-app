// apps/frontend/src/app/workouts/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { WorkoutSession, ExercisePerformed } from '@/types/workout-session';

export default function WorkoutSessionPage() {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id'); // Get the 'id' parameter from the URL

  useEffect(() => {
    if (id) {
      fetchWorkoutSession();
    }
  }, [id]);

  const fetchWorkoutSession = async () => {
    try {
      const response = await axios.get(`/api/workout-sessions/${id}`);
      setSession(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workout session:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Workout session not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Workout Session</h1>
      <p>Date: {new Date(session.date).toLocaleDateString()}</p>
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-2">Exercises</h2>
        {session.exercisesPerformed.map((exercise: ExercisePerformed) => (
          <div key={exercise.id} className="border p-4 mb-2">
            <p>Exercise: {exercise.name}</p>
            <p>Sets: {exercise.sets}</p>
            <p>Reps: {exercise.reps}</p>
            <p>Weight: {exercise.weight} lbs</p>
          </div>
        ))}
      </div>
    </div>
  );
}
