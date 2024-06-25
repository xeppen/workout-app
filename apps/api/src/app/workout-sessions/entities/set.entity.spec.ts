import { Set } from './set.entity';
import { ExercisePerformed } from './exercise-performed.entity';
import { getMetadataArgsStorage } from 'typeorm';

describe('Set Entity', () => {
  it('should create an instance of Set', () => {
    const set = new Set();
    expect(set).toBeDefined();
  });

  it('should have correct properties and relationships', () => {
    const columnMetadata = getMetadataArgsStorage().columns.filter(
      (column) => column.target === Set
    );
    const relationMetadata = getMetadataArgsStorage().relations.filter(
      (relation) => relation.target === Set
    );

    const columnNames = columnMetadata.map((column) => column.propertyName);
    const relationNames = relationMetadata.map(
      (relation) => relation.propertyName
    );

    // Check if properties exist
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('reps');
    expect(columnNames).toContain('weight');
    expect(columnNames).toContain('restTime');

    // Check if relationships exist
    expect(relationNames).toContain('exercisePerformed');

    // Check if properties can be set
    const set = new Set();
    set.id = '1';
    set.reps = 10;
    set.weight = 75.5;
    set.restTime = 60;

    expect(set.id).toBe('1');
    expect(set.reps).toBe(10);
    expect(set.weight).toBe(75.5);
    expect(set.restTime).toBe(60);
  });

  it('should have correct relationships', () => {
    const set = new Set();
    const exercisePerformed = new ExercisePerformed();

    set.exercisePerformed = exercisePerformed;

    expect(set.exercisePerformed).toBe(exercisePerformed);
  });
});
