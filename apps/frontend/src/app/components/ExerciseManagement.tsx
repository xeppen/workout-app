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
import { fetchExercises } from '@/app/api/client';

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
