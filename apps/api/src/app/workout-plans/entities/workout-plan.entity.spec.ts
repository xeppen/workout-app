import { WorkoutPlan } from './workout-plan.entity';
import { User } from '../../users/entities/user.entity';
import { WorkoutSession } from '../../workout-sessions/entities/workout-session.entity';
import { ExerciseInPlan } from './exercise-in-plan.entity';
import { getMetadataArgsStorage } from 'typeorm';

describe('WorkoutPlan Entity', () => {
  it('should create an instance of WorkoutPlan', () => {
    const workoutPlan = new WorkoutPlan();
    expect(workoutPlan).toBeDefined();
  });

  it('should have correct properties and relationships', () => {
    const columnMetadata = getMetadataArgsStorage().columns.filter(
      (column) => column.target === WorkoutPlan
    );
    const relationMetadata = getMetadataArgsStorage().relations.filter(
      (relation) => relation.target === WorkoutPlan
    );

    const columnNames = columnMetadata.map((column) => column.propertyName);
    const relationNames = relationMetadata.map(
      (relation) => relation.propertyName
    );

    // Check if properties exist
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('name');
    expect(columnNames).toContain('description');

    // Check if relationships exist
    expect(relationNames).toContain('user');
    expect(relationNames).toContain('workoutSessions');
    expect(relationNames).toContain('exercises');

    // Check if properties can be set
    const workoutPlan = new WorkoutPlan();
    workoutPlan.id = '1';
    workoutPlan.name = 'Workout Plan Name';
    workoutPlan.description = 'Workout Plan Description';

    expect(workoutPlan.id).toBe('1');
    expect(workoutPlan.name).toBe('Workout Plan Name');
    expect(workoutPlan.description).toBe('Workout Plan Description');
  });

  it('should have correct relationships', () => {
    const workoutPlan = new WorkoutPlan();
    const user = new User();
    const workoutSession = new WorkoutSession();
    const exerciseInPlan = new ExerciseInPlan();

    workoutPlan.user = user;
    workoutPlan.workoutSessions = [workoutSession];
    workoutPlan.exercises = [exerciseInPlan];

    expect(workoutPlan.user).toBe(user);
    expect(workoutPlan.workoutSessions).toContain(workoutSession);
    expect(workoutPlan.exercises).toContain(exerciseInPlan);
  });
});
