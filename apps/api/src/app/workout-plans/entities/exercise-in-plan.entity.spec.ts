import { ExerciseInPlan } from './exercise-in-plan.entity';
import { WorkoutPlan } from '../../workout-plans/entities/workout-plan.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';
import { getMetadataArgsStorage } from 'typeorm';

describe('ExerciseInPlan Entity', () => {
  it('should create an instance of ExerciseInPlan', () => {
    const exerciseInPlan = new ExerciseInPlan();
    expect(exerciseInPlan).toBeDefined();
  });

  it('should have correct properties and relationships', () => {
    const columnMetadata = getMetadataArgsStorage().columns.filter(
      (column) => column.target === ExerciseInPlan
    );
    const relationMetadata = getMetadataArgsStorage().relations.filter(
      (relation) => relation.target === ExerciseInPlan
    );

    const columnNames = columnMetadata.map((column) => column.propertyName);
    const relationNames = relationMetadata.map(
      (relation) => relation.propertyName
    );

    // Check if properties exist
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('sets');
    expect(columnNames).toContain('reps');
    expect(columnNames).toContain('restTime');

    // Check if relationships exist
    expect(relationNames).toContain('workoutPlan');
    expect(relationNames).toContain('exercise');

    // Check if properties can be set
    const exerciseInPlan = new ExerciseInPlan();
    exerciseInPlan.id = '1';
    exerciseInPlan.sets = 3;
    exerciseInPlan.reps = 10;
    exerciseInPlan.restTime = 60;

    expect(exerciseInPlan.id).toBe('1');
    expect(exerciseInPlan.sets).toBe(3);
    expect(exerciseInPlan.reps).toBe(10);
    expect(exerciseInPlan.restTime).toBe(60);
  });

  it('should have correct relationships', () => {
    const exerciseInPlan = new ExerciseInPlan();
    const workoutPlan = new WorkoutPlan();
    const exercise = new Exercise();

    exerciseInPlan.workoutPlan = workoutPlan;
    exerciseInPlan.exercise = exercise;

    expect(exerciseInPlan.workoutPlan).toBe(workoutPlan);
    expect(exerciseInPlan.exercise).toBe(exercise);
  });
});
