import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

describe('WorkoutSession (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  let exerciseId: string;
  let workoutSessionId: string;
  let logger: Logger;

  beforeAll(async () => {
    dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

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

  it('1. Create a user and an exercise', async () => {
    // Create a user
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      })
      .expect(201);

    userId = userResponse.body.id;

    // Create an exercise
    const exerciseResponse = await request(app.getHttpServer())
      .post('/exercises')
      .send({
        name: 'Bench Press',
        description: 'Chest exercise',
        targetMuscleGroups: ['chest', 'triceps'],
      })
      .expect(201);

    exerciseId = exerciseResponse.body.id;
  });

  it('2. Start an empty workout session', async () => {
    const response = await request(app.getHttpServer())
      .post('/workout-sessions')
      .send({
        userId: userId,
        date: new Date().toISOString(),
      })
      .expect(201);

    workoutSessionId = response.body.id;
    expect(response.body.userId).toBe(userId);
    expect(response.body.exercisesPerformed).toHaveLength(0);
  });

  it('3. Add an exercise to the workout session', async () => {
    const response = await request(app.getHttpServer())
      .post(`/workout-sessions/${workoutSessionId}/exercises`)
      .send({
        exerciseId: exerciseId,
        sets: [
          { reps: 10, weight: 100 },
          { reps: 8, weight: 110 },
        ],
      })
      .expect(200);

    expect(response.body.exercisesPerformed).toHaveLength(1);
    expect(response.body.exercisesPerformed[0].exerciseId).toBe(exerciseId);
    expect(response.body.exercisesPerformed[0].sets).toHaveLength(2);
  });

  it('4. Add another set to the exercise', async () => {
    const response = await request(app.getHttpServer())
      .post(
        `/workout-sessions/${workoutSessionId}/exercises/${exerciseId}/sets`
      )
      .send({ reps: 6, weight: 120 })
      .expect(200);

    expect(response.body.exercisesPerformed[0].sets).toHaveLength(3);
    expect(response.body.exercisesPerformed[0].sets[2].reps).toBe(6);
    expect(response.body.exercisesPerformed[0].sets[2].weight).toBe(120);
    expect(response.body.exercisesPerformed[0].sets[2].order).toBe(2);
  });

  it('5. Complete the workout session', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/workout-sessions/${workoutSessionId}`)
      .send({ completed: true })
      .expect(200);

    expect(response.body.completed).toBe(true);
  });

  it('6. Verify the completed workout session', async () => {
    const response = await request(app.getHttpServer())
      .get(`/workout-sessions/${workoutSessionId}`)
      .expect(200);

    console.log(JSON.stringify(response.body, null, 2));

    expect(response.body.completed).toBe(true);
    expect(response.body.exercisesPerformed).toHaveLength(1);
    expect(response.body.exercisesPerformed[0].sets).toHaveLength(3);

    // The order should now be consistent
    expect(response.body.exercisesPerformed[0].sets[0].reps).toBe(10);
    expect(response.body.exercisesPerformed[0].sets[0].weight).toBe(100);
    expect(response.body.exercisesPerformed[0].sets[0].order).toBe(0);

    expect(response.body.exercisesPerformed[0].sets[1].reps).toBe(8);
    expect(response.body.exercisesPerformed[0].sets[1].weight).toBe(110);
    expect(response.body.exercisesPerformed[0].sets[1].order).toBe(1);

    expect(response.body.exercisesPerformed[0].sets[2].reps).toBe(6);
    expect(response.body.exercisesPerformed[0].sets[2].weight).toBe(120);
    expect(response.body.exercisesPerformed[0].sets[2].order).toBe(2);
  });
});
