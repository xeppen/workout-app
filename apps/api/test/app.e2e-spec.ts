import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

describe('WorkoutApp (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  let exerciseId: string;
  let workoutPlanId: string;
  let logger: Logger;

  beforeAll(async () => {
    dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    logger = new Logger('E2E Test');
    logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    logger.log(`USE_SUPABASE: ${process.env.USE_SUPABASE}`);
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/ (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/api');

    if (response.status !== 200) {
      console.log('Response body:', response.body);
      console.log('Response status:', response.status);
    }

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Hello API' });
  });

  it('1. User Registration and Profile Creation', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      })
      .expect(201);

    userId = response.body.id;
    expect(response.body.name).toBe('John Doe');
    expect(response.body.email).toBe('john@example.com');
  });

  it('2. Creating and Managing a Workout Plan', async () => {
    // First, create an exercise
    const exerciseResponse = await request(app.getHttpServer())
      .post('/exercises')
      .send({
        name: 'Bench Press',
        description: 'Chest exercise',
        targetMuscleGroups: ['chest', 'triceps'],
      })
      .expect(201);

    exerciseId = exerciseResponse.body.id;

    // Now create a workout plan
    const createResponse = await request(app.getHttpServer())
      .post('/workout-plans')
      .send({
        name: 'Strength Training',
        description: 'Full body workout',
        userId: userId,
        exercises: [
          {
            exerciseId: exerciseId,
            sets: 3,
            reps: 10,
            restTime: 60,
          },
        ],
      })
      .expect(201);

    workoutPlanId = createResponse.body.id;

    // Verify the workout plan was created correctly
    const getResponse = await request(app.getHttpServer())
      .get(`/workout-plans/${workoutPlanId}`)
      .expect(200);

    expect(getResponse.body.name).toBe('Strength Training');
    expect(getResponse.body.exercises).toHaveLength(1);
    expect(getResponse.body.exercises[0].exerciseId).toBe(exerciseId);
  });

  it('3. Recording a Workout Session', async () => {
    const response = await request(app.getHttpServer())
      .post('/workout-sessions')
      .send({
        userId: userId,
        workoutPlanId: workoutPlanId,
        date: new Date().toISOString(),
        exercisesPerformed: [
          {
            exerciseId: exerciseId,
            sets: [
              { reps: 10, weight: 100, order: 0 },
              { reps: 8, weight: 110, order: 1 },
              { reps: 6, weight: 120, order: 2 },
            ],
          },
        ],
      })
      .expect(201);

    expect(response.body.userId).toBe(userId);
    expect(response.body.workoutPlanId).toBe(workoutPlanId);
    expect(response.body.exercisesPerformed).toBeDefined();
    expect(response.body.exercisesPerformed).toHaveLength(1);
    expect(response.body.exercisesPerformed[0].sets).toHaveLength(3);
    expect(response.body.exercisesPerformed[0].sets[0].order).toBe(0);
    expect(response.body.exercisesPerformed[0].sets[1].order).toBe(1);
    expect(response.body.exercisesPerformed[0].sets[2].order).toBe(2);
  });

  it('4. Tracking Progress Over Time', async () => {
    await request(app.getHttpServer())
      .post('/progress-records')
      .send({
        userId: userId,
        exerciseId: exerciseId,
        date: new Date().toISOString(),
        weightLifted: 120,
        reps: 6,
        sets: 3,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/progress-records?userId=${userId}&exerciseId=${exerciseId}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].weightLifted).toBe(120);
  });

  it('5. Modifying an Existing Workout Plan', async () => {
    logger.log(`Starting test: Modifying an Existing Workout Plan`);
    logger.log(`Workout Plan ID: ${workoutPlanId}`);

    // First, ensure the workout plan exists
    logger.log(`Fetching workout plan with ID: ${workoutPlanId}`);
    const getResponse = await request(app.getHttpServer())
      .get(`/workout-plans/${workoutPlanId}`)
      .expect(200);

    logger.log(`Fetch response: ${JSON.stringify(getResponse.body)}`);
    expect(getResponse.body).toBeDefined();
    expect(getResponse.body.id).toBe(workoutPlanId);

    // Now update the workout plan
    logger.log(`Updating workout plan with ID: ${workoutPlanId}`);
    const updateData = {
      name: 'Updated Strength Training',
      exercises: [
        {
          exerciseId: exerciseId,
          sets: 4,
          reps: 8,
          restTime: 90,
        },
      ],
    };
    logger.log(`Update data: ${JSON.stringify(updateData)}`);

    try {
      const updateResponse = await request(app.getHttpServer())
        .patch(`/workout-plans/${workoutPlanId}`)
        .send(updateData);

      logger.log(`Update status: ${updateResponse.status}`);
      logger.log(`Update response: ${JSON.stringify(updateResponse.body)}`);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe('Updated Strength Training');
      expect(updateResponse.body.exercises).toHaveLength(1);
      expect(updateResponse.body.exercises[0].sets).toBe(4);
      expect(updateResponse.body.exercises[0].reps).toBe(8);
    } catch (error) {
      logger.error(`Error during update: ${error.message}`);
      logger.error(`Error response: ${JSON.stringify(error.response?.body)}`);
      throw error;
    }
  });
});
