import { ExercisePerformed } from './exercise-performed.entity';
import { WorkoutSession } from '../../workout-sessions/entities/workout-session.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';
import { Set } from './set.entity';
import { getMetadataArgsStorage } from 'typeorm';

describe('ExercisePerformed Entity', () => {
  it('should create an instance of ExercisePerformed', () => {
    const exercisePerformed = new ExercisePerformed();
    expect(exercisePerformed).toBeDefined();
  });

  it('should have correct properties and relationships', () => {
    const columnMetadata = getMetadataArgsStorage().columns.filter(
      (column) => column.target === ExercisePerformed
    );
    const relationMetadata = getMetadataArgsStorage().relations.filter(
      (relation) => relation.target === ExercisePerformed
    );

    const columnNames = columnMetadata.map((column) => column.propertyName);
    const relationNames = relationMetadata.map(
      (relation) => relation.propertyName
    );

    // Check if properties exist
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('workoutSessionId');
    expect(columnNames).toContain('exerciseId');

    // Check if relationships exist
    expect(relationNames).toContain('workoutSession');
    expect(relationNames).toContain('exercise');
    expect(relationNames).toContain('sets');

    // Check if properties can be set
    const exercisePerformed = new ExercisePerformed();
    exercisePerformed.id = '1';
    exercisePerformed.workoutSessionId = 'workout-session-uuid';
    exercisePerformed.exerciseId = 'exercise-uuid';

    expect(exercisePerformed.id).toBe('1');
    expect(exercisePerformed.workoutSessionId).toBe('workout-session-uuid');
    expect(exercisePerformed.exerciseId).toBe('exercise-uuid');
  });

  it('should have correct relationships', () => {
    const exercisePerformed = new ExercisePerformed();
    const workoutSession = new WorkoutSession();
    const exercise = new Exercise();
    const set = new Set();

    exercisePerformed.workoutSession = workoutSession;
    exercisePerformed.exercise = exercise;
    exercisePerformed.sets = [set];

    expect(exercisePerformed.workoutSession).toBe(workoutSession);
    expect(exercisePerformed.exercise).toBe(exercise);
    expect(exercisePerformed.sets).toContain(set);
  });
});
