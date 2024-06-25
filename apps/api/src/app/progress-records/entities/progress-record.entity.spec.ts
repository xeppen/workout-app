import { ProgressRecord } from './progress-record.entity';
import { User } from '../../users/entities/user.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';
import { getMetadataArgsStorage } from 'typeorm';

describe('ProgressRecord Entity', () => {
  it('should create an instance of ProgressRecord', () => {
    const progressRecord = new ProgressRecord();
    expect(progressRecord).toBeDefined();
  });

  it('should have correct properties and relationships', () => {
    const columnMetadata = getMetadataArgsStorage().columns.filter(
      (column) => column.target === ProgressRecord
    );
    const relationMetadata = getMetadataArgsStorage().relations.filter(
      (relation) => relation.target === ProgressRecord
    );

    const columnNames = columnMetadata.map((column) => column.propertyName);
    const relationNames = relationMetadata.map(
      (relation) => relation.propertyName
    );

    // Check if properties exist
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('date');
    expect(columnNames).toContain('weightLifted');
    expect(columnNames).toContain('reps');
    expect(columnNames).toContain('sets');

    // Check if relationships exist
    expect(relationNames).toContain('user');
    expect(relationNames).toContain('exercise');

    // Check if properties can be set
    const progressRecord = new ProgressRecord();
    progressRecord.id = '1';
    progressRecord.date = new Date();
    progressRecord.weightLifted = 100;
    progressRecord.reps = 10;
    progressRecord.sets = 3;

    expect(progressRecord.id).toBe('1');
    expect(progressRecord.date).toBeInstanceOf(Date);
    expect(progressRecord.weightLifted).toBe(100);
    expect(progressRecord.reps).toBe(10);
    expect(progressRecord.sets).toBe(3);
  });

  it('should have correct relationships', () => {
    const progressRecord = new ProgressRecord();
    const user = new User();
    const exercise = new Exercise();

    progressRecord.user = user;
    progressRecord.exercise = exercise;

    expect(progressRecord.user).toBe(user);
    expect(progressRecord.exercise).toBe(exercise);
  });
});
