import 'reflect-metadata';
import { validate } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { plainToInstance } from 'class-transformer';
import { CreateWorkoutPlanDto } from './create-workout-plan.dto';
import { ExerciseInPlanDto } from './execise-in-plan.dto';
import { UpdateWorkoutPlanDto } from './update-workout-plan.dto';

describe('CreateWorkoutPlanDto', () => {
  it('should validate successfully with valid data', async () => {
    const exerciseInPlanDto = {
      exerciseId: 'valid-uuid',
      sets: 3,
      reps: 10,
      restTime: 60,
    };

    const dto = plainToInstance(CreateWorkoutPlanDto, {
      name: 'Valid Name',
      description: 'Valid Description',
      userId: uuidv4(),
      exercises: [exerciseInPlanDto],
    });

    const errors = await validate(dto);
    if (errors.length > 0) {
      console.log('Validation errors:', JSON.stringify(errors, null, 2));
    }
    expect(errors.length).toBe(0);
  });

  it('should fail validation when required fields are missing', async () => {
    const dto = plainToInstance(CreateWorkoutPlanDto, {});

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'name')).toBe(true);
    expect(errors.some((error) => error.property === 'description')).toBe(true);
    expect(errors.some((error) => error.property === 'userId')).toBe(true);
    expect(errors.some((error) => error.property === 'exercises')).toBe(true);
  });

  it('should fail validation with invalid data types', async () => {
    const dto = plainToInstance(CreateWorkoutPlanDto, {
      name: 123,
      description: 456,
      userId: 789,
      exercises: 'not an array',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'name')).toBe(true);
    expect(errors.some((error) => error.property === 'description')).toBe(true);
    expect(errors.some((error) => error.property === 'userId')).toBe(true);
    expect(errors.some((error) => error.property === 'exercises')).toBe(true);
  });
});

describe('ExerciseInPlanDto', () => {
  it('should validate successfully with valid data', async () => {
    const dto = plainToInstance(ExerciseInPlanDto, {
      exerciseId: 'valid-uuid',
      sets: 3,
      reps: 10,
      restTime: 60,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when required fields are missing', async () => {
    const dto = plainToInstance(ExerciseInPlanDto, {});

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('exerciseId');
    expect(errors[1].property).toBe('sets');
    expect(errors[2].property).toBe('reps');
    expect(errors[3].property).toBe('restTime');
  });

  it('should fail validation with invalid data types', async () => {
    const dto = plainToInstance(ExerciseInPlanDto, {
      exerciseId: 23,
      sets: 'not a number',
      reps: 'not a number',
      restTime: 'not a number',
    });

    const errors = await validate(dto);
    if (errors.length > 0) {
      console.log('Validation errors:', JSON.stringify(errors, null, 2));
    }
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'exerciseId')).toBe(true);
    expect(errors.some((error) => error.property === 'sets')).toBe(true);
    expect(errors.some((error) => error.property === 'reps')).toBe(true);
    expect(errors.some((error) => error.property === 'restTime')).toBe(true);
  });
});

describe('UpdateWorkoutPlanDto', () => {
  it('should validate successfully with valid optional data', async () => {
    const exerciseInPlanDto = new ExerciseInPlanDto();
    exerciseInPlanDto.exerciseId = uuidv4();
    exerciseInPlanDto.sets = 3;
    exerciseInPlanDto.reps = 10;
    exerciseInPlanDto.restTime = 60;

    const dto = plainToInstance(CreateWorkoutPlanDto, {
      name: 'Updated Name',
      description: 'Updated Description',
      exercises: [exerciseInPlanDto],
      userId: uuidv4(),
    });

    const errors = await validate(dto);
    if (errors.length > 0) {
      console.log('Validation errors:', JSON.stringify(errors, null, 2));
    }
    expect(errors.length).toBe(0);
  });

  it('should validate successfully with no data', async () => {
    const dto = new UpdateWorkoutPlanDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid data types', async () => {
    const dto = plainToInstance(UpdateWorkoutPlanDto, {
      name: 123,
      description: 456,
      exercises: 'not an array',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'name')).toBe(true);
    expect(errors.some((error) => error.property === 'description')).toBe(true);
    expect(errors.some((error) => error.property === 'exercises')).toBe(true);
  });
});
