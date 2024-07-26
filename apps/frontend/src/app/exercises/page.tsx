// src/app/exercises/page.tsx
'use client';

import ExerciseManagement from '../components/ExerciseManagement';

export default function ExercisesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Exercise Management</h1>
      <ExerciseManagement />
    </div>
  );
}
