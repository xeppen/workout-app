import { WorkoutSession } from './workout-session.entity';
import { User } from '../../users/entities/user.entity';
import { WorkoutPlan } from '../../workout-plans/entities/workout-plan.entity';
import { ExercisePerformed } from './exercise-performed.entity';
import { getMetadataArgsStorage } from 'typeorm';

describe('WorkoutSession Entity', () => {
  it('should create an instance of WorkoutSession', () => {
    const workoutSession = new WorkoutSession();
    expect(workoutSession).toBeDefined();
  });

  it('should have correct properties', () => {
    const metadata = getMetadataArgsStorage().columns.filter(
      (column) => column.target === WorkoutSession
    );

    const propertyNames = metadata.map((column) => column.propertyName);

    expect(propertyNames).toContain('id');
    expect(propertyNames).toContain('date');
    expect(propertyNames).toContain('notes');

    const workoutSession = new WorkoutSession();
    workoutSession.id = '1';
    workoutSession.date = new Date();
    workoutSession.notes = 'Test notes';

    expect(workoutSession.id).toBe('1');
    expect(workoutSession.date).toBeInstanceOf(Date);
    expect(workoutSession.notes).toBe('Test notes');
  });

  it('should have correct relationships', () => {
    const metadata = getMetadataArgsStorage().relations.filter(
      (relation) => relation.target === WorkoutSession
    );

    const relationNames = metadata.map((relation) => relation.propertyName);

    expect(relationNames).toContain('user');
    expect(relationNames).toContain('workoutPlan');
    expect(relationNames).toContain('exercisesPerformed');

    const workoutSession = new WorkoutSession();
    const user = new User();
    const workoutPlan = new WorkoutPlan();
    const exercisePerformed = new ExercisePerformed();

    workoutSession.user = user;
    workoutSession.workoutPlan = workoutPlan;
    workoutSession.exercisesPerformed = [exercisePerformed];

    expect(workoutSession.user).toBe(user);
    expect(workoutSession.workoutPlan).toBe(workoutPlan);
    expect(workoutSession.exercisesPerformed).toContain(exercisePerformed);
  });
});
