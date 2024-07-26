'use client';

import React, { useState } from 'react';
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { Search } from 'lucide-react';
import {
  TextField,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { Exercise } from '@/types';

// Mock API function - replace with actual API call
const fetchExercises = async (): Promise<Exercise[]> => {
  // Simulated API call
  return [
    {
      id: '1',
      name: 'Push-ups',
      description: 'Classic upper body exercise',
      targetMuscleGroups: ['chest', 'triceps', 'shoulders'],
      videoURL: 'https://example.com/push-ups',
    },
    {
      id: '2',
      name: 'Squats',
      description: 'Lower body compound exercise',
      targetMuscleGroups: ['quads', 'hamstrings', 'glutes'],
      videoURL: 'https://example.com/squats',
    },
    {
      id: '3',
      name: 'Plank',
      description: 'Core strengthening exercise',
      targetMuscleGroups: ['core'],
      videoURL: 'https://example.com/plank',
    },
    {
      id: '4',
      name: 'Lunges',
      description: 'Lower body exercise focusing on quads and glutes',
      targetMuscleGroups: ['quads', 'glutes'],
      videoURL: 'https://example.com/lunges',
    },
    {
      id: '5',
      name: 'Burpees',
      description: 'Full body exercise combining strength and cardio',
      targetMuscleGroups: ['full body'],
      videoURL: 'https://example.com/burpees',
    },
    {
      id: '6',
      name: 'Bicep Curls',
      description: 'Isolated exercise targeting the biceps',
      targetMuscleGroups: ['biceps'],
      videoURL: 'https://example.com/bicep-curls',
    },
    {
      id: '7',
      name: 'Tricep Dips',
      description: 'Upper body exercise focusing on triceps',
      targetMuscleGroups: ['triceps'],
      videoURL: 'https://example.com/tricep-dips',
    },
    {
      id: '8',
      name: 'Pull-ups',
      description: 'Upper body exercise targeting the back and biceps',
      targetMuscleGroups: ['back', 'biceps'],
      videoURL: 'https://example.com/pull-ups',
    },
    {
      id: '9',
      name: 'Deadlifts',
      description: 'Compound exercise focusing on the entire posterior chain',
      targetMuscleGroups: ['hamstrings', 'glutes', 'lower back'],
      videoURL: 'https://example.com/deadlifts',
    },
    {
      id: '10',
      name: 'Bench Press',
      description: 'Chest exercise for upper body strength',
      targetMuscleGroups: ['chest', 'triceps', 'shoulders'],
      videoURL: 'https://example.com/bench-press',
    },
    {
      id: '11',
      name: 'Overhead Press',
      description: 'Shoulder exercise for upper body strength',
      targetMuscleGroups: ['shoulders', 'triceps'],
      videoURL: 'https://example.com/overhead-press',
    },
    {
      id: '12',
      name: 'Sit-ups',
      description: 'Core exercise focusing on the abdominal muscles',
      targetMuscleGroups: ['abs'],
      videoURL: 'https://example.com/sit-ups',
    },
    {
      id: '13',
      name: 'Mountain Climbers',
      description: 'Cardio exercise that engages the whole body',
      targetMuscleGroups: ['full body'],
      videoURL: 'https://example.com/mountain-climbers',
    },
    {
      id: '14',
      name: 'Leg Raises',
      description: 'Lower abdominal exercise',
      targetMuscleGroups: ['lower abs'],
      videoURL: 'https://example.com/leg-raises',
    },
    {
      id: '15',
      name: 'Russian Twists',
      description: 'Core exercise targeting the obliques',
      targetMuscleGroups: ['obliques'],
      videoURL: 'https://example.com/russian-twists',
    },
    {
      id: '16',
      name: 'Calf Raises',
      description: 'Lower body exercise targeting the calves',
      targetMuscleGroups: ['calves'],
      videoURL: 'https://example.com/calf-raises',
    },
    {
      id: '17',
      name: 'Glute Bridges',
      description: 'Lower body exercise focusing on the glutes',
      targetMuscleGroups: ['glutes'],
      videoURL: 'https://example.com/glute-bridges',
    },
    {
      id: '18',
      name: 'Dumbbell Rows',
      description: 'Upper body exercise focusing on the back',
      targetMuscleGroups: ['back', 'biceps'],
      videoURL: 'https://example.com/dumbbell-rows',
    },
    {
      id: '19',
      name: 'Skull Crushers',
      description: 'Isolated tricep exercise',
      targetMuscleGroups: ['triceps'],
      videoURL: 'https://example.com/skull-crushers',
    },
    {
      id: '20',
      name: 'Chest Flyes',
      description: 'Chest exercise using dumbbells',
      targetMuscleGroups: ['chest'],
      videoURL: 'https://example.com/chest-flyes',
    },
  ];
};

const ExerciseCard: React.FC<{ exercise: Exercise }> = ({ exercise }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="div">
            {exercise.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {exercise.description}
          </Typography>
        </CardContent>
        <CardActions>
          <IconButton onClick={handleClickOpen}>
            <InfoIcon />
          </IconButton>
        </CardActions>
      </Card>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{exercise.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>{exercise.description}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

const ExerciseList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    data: exercises,
    isLoading,
    error,
  } = useQuery<Exercise[], Error>({
    queryKey: ['exercises'],
    queryFn: fetchExercises,
  });

  const filteredExercises =
    exercises?.filter((exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) ?? [];

  if (isLoading) return <div>Loading exercises...</div>;
  if (error) return <div>Error loading exercises: {error.message}</div>;

  return (
    <div className="p-4">
      <div className="mb-4 relative">
        <TextField
          fullWidth
          label="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search className="mr-2" />,
          }}
        />
      </div>
      <Grid container spacing={4}>
        {filteredExercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </Grid>
    </div>
  );
};

const ExerciseManagement: React.FC = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Typography variant="h4" component="h1" gutterBottom>
        Exercise Management
      </Typography>
      <ExerciseList />
    </QueryClientProvider>
  );
};

export default ExerciseManagement;
