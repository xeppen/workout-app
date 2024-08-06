import 'reflect-metadata';
import { validate } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { plainToInstance } from 'class-transformer';
import { CreateWorkoutSessionDto } from './create-workout-session.dto';
import {
  ExercisePerformedDto,
  UpdateWorkoutSessionDto,
} from './update-workout-session.dto';
import { AddExerciseDto } from './add-exercise.dto';

describe('CreateWorkoutSessionDto', () => {
  it('should validate successfully with valid data', async () => {
    const dto = new CreateWorkoutSessionDto();
    dto.userId = '123e4567-e89b-12d3-a456-426614174000';
    dto.workoutPlanId = '123e4567-e89b-12d3-a456-426614174001';
    dto.date = new Date().toISOString();
    dto.exercisesPerformed = [
      {
        exerciseId: '123e4567-e89b-12d3-a456-426614174002',
        sets: [{ reps: 10, weight: 100, order: 0 }],
      },
    ];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when required fields are missing', async () => {
    const dto = new CreateWorkoutSessionDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation with invalid data types', async () => {
    const dto = plainToInstance(CreateWorkoutSessionDto, {
      userId: 'invalid-uuid',
      workoutPlanId: 'invalid-uuid',
      date: 'invalid-date',
      exercisesPerformed: [
        {
          exerciseId: 'invalid-uuid',
          sets: [{ reps: 'invalid', weight: 'invalid', order: 'invalid' }],
        },
      ],
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'userId')).toBe(true);
    expect(errors.some((error) => error.property === 'workoutPlanId')).toBe(
      true
    );
    expect(errors.some((error) => error.property === 'date')).toBe(true);
    expect(
      errors.some((error) => error.property === 'exercisesPerformed')
    ).toBe(true);
  });
});

describe('UpdateWorkoutSessionDto', () => {
  it('should validate successfully with valid data', async () => {
    const dto = plainToInstance(UpdateWorkoutSessionDto, {
      notes: 'Updated notes',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate successfully with no data', async () => {
    const dto = new UpdateWorkoutSessionDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid data type for notes', async () => {
    const dto = plainToInstance(UpdateWorkoutSessionDto, {
      notes: 123,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'notes')).toBe(true);
    expect(errors[0].constraints).toHaveProperty('isString');
  });
});

describe('AddExerciseDto', () => {
  it('should validate successfully with valid data', async () => {
    const dto = new AddExerciseDto();
    dto.exerciseId = '123e4567-e89b-12d3-a456-426614174000';
    dto.sets = [
      {
        reps: 10,
        weight: 100,
      },
    ];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when required fields are missing', async () => {
    const dto = new AddExerciseDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation with invalid data types', async () => {
    const dto = plainToInstance(AddExerciseDto, {
      exerciseId: 'invalid-uuid',
      sets: [
        {
          reps: 'invalid',
          weight: 'invalid',
        },
      ],
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'exerciseId')).toBe(true);
    expect(errors.some((error) => error.property === 'sets')).toBe(true);
  });

  it('should fail validation with missing nested objects', async () => {
    const dto = plainToInstance(AddExerciseDto, {
      exerciseId: '123e4567-e89b-12d3-a456-426614174000',
      sets: [{}],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'sets')).toBe(true);
  });
});

describe('ExercisePerformedDto', () => {
  it('should validate successfully with valid data', async () => {
    const dto = plainToInstance(ExercisePerformedDto, {
      exerciseId: '123e4567-e89b-12d3-a456-426614174000',
      sets: [
        {
          reps: 10,
          weight: 100,
        },
      ],
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when required fields are missing', async () => {
    const dto = plainToInstance(ExercisePerformedDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'exerciseId')).toBe(true);
    expect(errors.some((error) => error.property === 'sets')).toBe(true);
  });

  it('should fail validation with invalid data types in sets', async () => {
    const dto = plainToInstance(ExercisePerformedDto, {
      exerciseId: '123e4567-e89b-12d3-a456-426614174000',
      sets: [
        {
          reps: 'invalid',
          weight: 'invalid',
        },
      ],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const setsErrors = errors.find((error) => error.property === 'sets');
    expect(setsErrors).toBeDefined();
    expect(
      setsErrors.children[0].children.some((child) => child.property === 'reps')
    ).toBe(true);
    expect(
      setsErrors.children[0].children.some(
        (child) => child.property === 'weight'
      )
    ).toBe(true);
  });

  it('should fail validation with missing fields in sets', async () => {
    const dto = plainToInstance(ExercisePerformedDto, {
      exerciseId: '123e4567-e89b-12d3-a456-426614174000',
      sets: [{}],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const setsErrors = errors.find((error) => error.property === 'sets');
    expect(setsErrors).toBeDefined();
    expect(
      setsErrors.children[0].children.some((child) => child.property === 'reps')
    ).toBe(true);
    expect(
      setsErrors.children[0].children.some(
        (child) => child.property === 'weight'
      )
    ).toBe(true);
  });

  it('should fail validation with empty sets array', async () => {
    const dto = plainToInstance(ExercisePerformedDto, {
      exerciseId: '123e4567-e89b-12d3-a456-426614174000',
      sets: [],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'sets')).toBe(true);
  });
});
