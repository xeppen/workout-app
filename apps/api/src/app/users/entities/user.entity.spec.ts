import { User } from './user.entity';
import { WorkoutPlan } from '../../workout-plans/entities/workout-plan.entity';
import { WorkoutSession } from '../../workout-sessions/entities/workout-session.entity';
import { ProgressRecord } from '../../progress-records/entities/progress-record.entity';
import { getMetadataArgsStorage } from 'typeorm';

describe('User Entity', () => {
  it('should create an instance of User', () => {
    const user = new User();
    expect(user).toBeDefined();
  });

  it('should have correct properties and relationships', () => {
    const columnMetadata = getMetadataArgsStorage().columns.filter(
      (column) => column.target === User
    );
    const relationMetadata = getMetadataArgsStorage().relations.filter(
      (relation) => relation.target === User
    );

    const columnNames = columnMetadata.map((column) => column.propertyName);
    const relationNames = relationMetadata.map(
      (relation) => relation.propertyName
    );

    // Check if properties exist
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('email');
    expect(columnNames).toContain('password');
    expect(columnNames).toContain('name');

    // Check if relationships exist
    expect(relationNames).toContain('workoutPlans');
    expect(relationNames).toContain('workoutSessions');
    expect(relationNames).toContain('progressRecords');

    // Check if properties can be set
    const user = new User();
    user.id = '1';
    user.email = 'test@example.com';
    user.password = 'password';
    user.name = 'Test User';

    expect(user.id).toBe('1');
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBe('password');
    expect(user.name).toBe('Test User');
  });

  it('should have correct relationships', () => {
    const user = new User();
    const workoutPlan = new WorkoutPlan();
    const workoutSession = new WorkoutSession();
    const progressRecord = new ProgressRecord();

    user.workoutPlans = [workoutPlan];
    user.workoutSessions = [workoutSession];
    user.progressRecords = [progressRecord];

    expect(user.workoutPlans).toContain(workoutPlan);
    expect(user.workoutSessions).toContain(workoutSession);
    expect(user.progressRecords).toContain(progressRecord);
  });
});
