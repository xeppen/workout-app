import 'reflect-metadata';
import { validate } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { plainToInstance } from 'class-transformer';
import { CreateWorkoutSessionDto } from './create-workout-session.dto';
import { UpdateWorkoutSessionDto } from './update-workout-session.dto';

describe('CreateWorkoutSessionDto', () => {
  it('should validate successfully with valid data', async () => {
    const dto = plainToInstance(CreateWorkoutSessionDto, {
      userId: uuidv4(),
      workoutPlanId: uuidv4(),
      date: new Date().toISOString(),
      notes: 'Valid notes',
      exercisesPerformed: [
        {
          exerciseId: uuidv4(),
          sets: [
            { reps: 10, weight: 100 },
            { reps: 8, weight: 110 },
          ],
        },
      ],
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when required fields are missing', async () => {
    const dto = plainToInstance(CreateWorkoutSessionDto, {});

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'userId')).toBe(true);
    expect(errors.some((error) => error.property === 'date')).toBe(true);
  });

  it('should fail validation with invalid data types', async () => {
    const dto = plainToInstance(CreateWorkoutSessionDto, {
      userId: 'not-a-uuid',
      workoutPlanId: 'not-a-uuid',
      date: 'not-a-date',
      notes: 123,
      exercisesPerformed: 'not an array',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'userId')).toBe(true);
    expect(errors.some((error) => error.property === 'workoutPlanId')).toBe(
      true
    );
    expect(errors.some((error) => error.property === 'date')).toBe(true);
    expect(errors.some((error) => error.property === 'notes')).toBe(true);
    expect(
      errors.some((error) => error.property === 'exercisesPerformed')
    ).toBe(true);
  });

  it('should fail validation with invalid exercisesPerformed data', async () => {
    const dto = plainToInstance(CreateWorkoutSessionDto, {
      userId: uuidv4(),
      workoutPlanId: uuidv4(),
      date: new Date().toISOString(),
      exercisesPerformed: [
        {
          exerciseId: 'not-a-uuid',
          sets: [{ reps: 'not a number', weight: 'not a number' }],
        },
      ],
    });

    const errors = await validate(dto);
    console.log(JSON.stringify(errors, null, 2)); // Log the error structure

    expect(errors.length).toBeGreaterThan(0);

    const exercisesPerformedError = errors.find(
      (error) => error.property === 'exercisesPerformed'
    );
    expect(exercisesPerformedError).toBeDefined();

    const exercisePerformedErrors =
      exercisesPerformedError?.children[0]?.children;
    const exerciseIdError = exercisePerformedErrors?.find(
      (error) => error.property === 'exerciseId'
    );
    expect(exerciseIdError).toBeDefined();

    const setsError = exercisePerformedErrors?.find(
      (error) => error.property === 'sets'
    );
    expect(setsError).toBeDefined();

    const setErrors = setsError?.children[0]?.children;
    const repsError = setErrors?.find((error) => error.property === 'reps');
    const weightError = setErrors?.find((error) => error.property === 'weight');
    expect(repsError).toBeDefined();
    expect(weightError).toBeDefined();
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
