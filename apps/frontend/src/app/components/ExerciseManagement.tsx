import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Search, Info } from 'lucide-react';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/dialog';
import { Exercise } from '@/types';

// Mock API function - replace with actual API call
const fetchExercises = async () => {
  // Simulated API call
  return [
    { id: 1, name: 'Push-ups', description: 'Classic upper body exercise' },
    { id: 2, name: 'Squats', description: 'Lower body compound exercise' },
    { id: 3, name: 'Plank', description: 'Core strengthening exercise' },
  ];
};

const ExerciseCard = ({ exercise }: { exercise: Exercise }) => (
  <Card className="mb-4">
    <CardHeader>
      <CardTitle className="flex justify-between items-center">
        <span>{exercise.name}</span>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{exercise.name}</DialogTitle>
            </DialogHeader>
            <p>{exercise.description}</p>
          </DialogContent>
        </Dialog>
      </CardTitle>
    </CardHeader>
  </Card>
);

const ExerciseManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    data: exercises,
    isLoading,
    error,
  } = useQuery('exercises', fetchExercises);

  const filteredExercises = exercises?.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div>Loading exercises...</div>;
  if (error) return <div>Error loading exercises</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Exercise Management</h1>
      <div className="mb-4 relative">
        <Input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      {filteredExercises?.map((exercise) => (
        <ExerciseCard key={exercise.id} exercise={exercise} />
      ))}
    </div>
  );
};

export default ExerciseManagement;
