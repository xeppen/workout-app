import { Exercise } from './exercise.entity';
import { ProgressRecord } from '../../progress-records/entities/progress-record.entity';
import { ExerciseInPlan } from '../../workout-plans/entities/exercise-in-plan.entity';
import { ExercisePerformed } from '../../workout-sessions/entities/exercise-performed.entity';
import { getMetadataArgsStorage } from 'typeorm';

describe('Exercise Entity', () => {
  it('should create an instance of Exercise', () => {
    const exercise = new Exercise();
    expect(exercise).toBeDefined();
  });

  it('should have correct properties and relationships', () => {
    const columnMetadata = getMetadataArgsStorage().columns.filter(
      (column) => column.target === Exercise
    );
    const relationMetadata = getMetadataArgsStorage().relations.filter(
      (relation) => relation.target === Exercise
    );

    const columnNames = columnMetadata.map((column) => column.propertyName);
    const relationNames = relationMetadata.map(
      (relation) => relation.propertyName
    );

    // Check if properties exist
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('name');
    expect(columnNames).toContain('description');
    expect(columnNames).toContain('targetMuscleGroups');
    expect(columnNames).toContain('videoURL');

    // Check if relationships exist
    expect(relationNames).toContain('progressRecords');
    expect(relationNames).toContain('exercisesInPlan');
    expect(relationNames).toContain('exercisesPerformed');

    // Check if properties can be set
    const exercise = new Exercise();
    exercise.id = '1';
    exercise.name = 'Exercise Name';
    exercise.description = 'Exercise Description';
    exercise.targetMuscleGroups = ['chest', 'arms'];
    exercise.videoURL = 'http://example.com/video';

    expect(exercise.id).toBe('1');
    expect(exercise.name).toBe('Exercise Name');
    expect(exercise.description).toBe('Exercise Description');
    expect(exercise.targetMuscleGroups).toEqual(['chest', 'arms']);
    expect(exercise.videoURL).toBe('http://example.com/video');
  });

  it('should have correct relationships', () => {
    const exercise = new Exercise();
    const progressRecord = new ProgressRecord();
    const exerciseInPlan = new ExerciseInPlan();
    const exercisePerformed = new ExercisePerformed();

    exercise.progressRecords = [progressRecord];
    exercise.exercisesInPlan = [exerciseInPlan];
    exercise.exercisesPerformed = [exercisePerformed];

    expect(exercise.progressRecords).toContain(progressRecord);
    expect(exercise.exercisesInPlan).toContain(exerciseInPlan);
    expect(exercise.exercisesPerformed).toContain(exercisePerformed);
  });
});
