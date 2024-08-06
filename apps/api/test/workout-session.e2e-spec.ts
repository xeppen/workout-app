import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

describe('WorkoutSession (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  let exerciseId1: string;
  let exerciseId2: string;
  let workoutSessionId: string;
  let logger: Logger;
  let setId: string;

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

    // Create two exercises
    const exerciseResponse1 = await request(app.getHttpServer())
      .post('/exercises')
      .send({
        name: 'Bench Press',
        description: 'Chest exercise',
        targetMuscleGroups: ['chest', 'triceps'],
      })
      .expect(201);

    exerciseId1 = exerciseResponse1.body.id;

    const exerciseResponse2 = await request(app.getHttpServer())
      .post('/exercises')
      .send({
        name: 'Squats',
        description: 'Leg exercise',
        targetMuscleGroups: ['quadriceps', 'hamstrings', 'glutes'],
      })
      .expect(201);

    exerciseId2 = exerciseResponse2.body.id;
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

  it('3. Add multiple exercises to the workout session', async () => {
    const response1 = await request(app.getHttpServer())
      .post(`/workout-sessions/${workoutSessionId}/exercises`)
      .send({
        exerciseId: exerciseId1,
        sets: [
          { reps: 10, weight: 100 },
          { reps: 8, weight: 110 },
        ],
      })
      .expect(200);
    expect(response1.body.exercisesPerformed).toHaveLength(1);
    expect(response1.body.exercisesPerformed[0].exerciseId).toBe(exerciseId1);
    expect(response1.body.exercisesPerformed[0].sets).toHaveLength(2);

    const response2 = await request(app.getHttpServer())
      .post(`/workout-sessions/${workoutSessionId}/exercises`)
      .send({
        exerciseId: exerciseId2,
        sets: [
          { reps: 12, weight: 150 },
          { reps: 10, weight: 160 },
        ],
      })
      .expect(200);

    const exercisePerformed1 = response2.body.exercisesPerformed.find(
      (ep) => ep.exerciseId === exerciseId1
    );
    const exercisePerformed2 = response2.body.exercisesPerformed.find(
      (ep) => ep.exerciseId === exerciseId2
    );

    expect(response2.body.exercisesPerformed).toHaveLength(2);
    expect(exercisePerformed1).toBeDefined();
    expect(exercisePerformed2).toBeDefined();
    expect(exercisePerformed1.sets).toHaveLength(2);
    expect(exercisePerformed2.sets).toHaveLength(2);
  });

  it('4. Add another set to the exercise', async () => {
    const response = await request(app.getHttpServer())
      .post(
        `/workout-sessions/${workoutSessionId}/exercises/${exerciseId1}/sets`
      )
      .send({ reps: 6, weight: 120 })
      .expect(200);

    const exercisePerformed = response.body.exercisesPerformed.find(
      (ep) => ep.exerciseId === exerciseId1
    );
    expect(exercisePerformed.sets).toHaveLength(3);
    expect(exercisePerformed.sets[2].reps).toBe(6);
    expect(exercisePerformed.sets[2].weight).toBe(120);
    expect(exercisePerformed.sets[2].order).toBe(2);

    setId = exercisePerformed.sets[2].id;
    expect(setId).toBeDefined();
  });

  it('5a. Partially modify an existing set', async () => {
    // First, update only the reps
    let response = await request(app.getHttpServer())
      .patch(
        `/workout-sessions/${workoutSessionId}/exercises/${exerciseId1}/sets/${setId}`
      )
      .send({ reps: 8 })
      .expect(200);

    let exercisePerformed = response.body.exercisesPerformed.find(
      (ep) => ep.exerciseId === exerciseId1
    );
    let updatedSet = exercisePerformed.sets.find((s) => s.id === setId);
    expect(updatedSet.reps).toBe(8);
    expect(updatedSet.weight).toBe(120); // Weight should remain unchanged

    // Then, update only the weight
    response = await request(app.getHttpServer())
      .patch(
        `/workout-sessions/${workoutSessionId}/exercises/${exerciseId1}/sets/${setId}`
      )
      .send({ weight: 130 })
      .expect(200);

    exercisePerformed = response.body.exercisesPerformed.find(
      (ep) => ep.exerciseId === exerciseId1
    );
    updatedSet = exercisePerformed.sets.find((s) => s.id === setId);
    expect(updatedSet.reps).toBe(8); // Reps should remain unchanged
    expect(updatedSet.weight).toBe(130);
  });

  it('6. Remove an exercise from the session', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/workout-sessions/${workoutSessionId}/exercises/${exerciseId2}`)
      .expect(200);

    expect(response.body.exercisesPerformed).toHaveLength(1);
    expect(response.body.exercisesPerformed[0].exerciseId).toBe(exerciseId1);
  });

  it('7. Add notes to the workout session', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/workout-sessions/${workoutSessionId}`)
      .send({ notes: 'Great chest day, feeling stronger!' })
      .expect(200);

    expect(response.body.notes).toBe('Great chest day, feeling stronger!');
  });

  it('8. Complete the workout session', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/workout-sessions/${workoutSessionId}`)
      .send({ completed: true })
      .expect(200);

    expect(response.body.completed).toBe(true);
  });

  it('9. Verify the completed workout session', async () => {
    const response = await request(app.getHttpServer())
      .get(`/workout-sessions/${workoutSessionId}`)
      .expect(200);

    expect(response.body.completed).toBe(true);
    expect(response.body.exercisesPerformed).toHaveLength(1);
    expect(response.body.exercisesPerformed[0].sets).toHaveLength(3);
    expect(response.body.notes).toBe('Great chest day, feeling stronger!');

    // Verify the sets
    expect(response.body.exercisesPerformed[0].sets[0].reps).toBe(10);
    expect(response.body.exercisesPerformed[0].sets[0].weight).toBe(100);
    expect(response.body.exercisesPerformed[0].sets[0].order).toBe(0);

    expect(response.body.exercisesPerformed[0].sets[1].reps).toBe(8);
    expect(response.body.exercisesPerformed[0].sets[1].weight).toBe(110);
    expect(response.body.exercisesPerformed[0].sets[1].order).toBe(1);

    expect(response.body.exercisesPerformed[0].sets[2].reps).toBe(8);
    expect(response.body.exercisesPerformed[0].sets[2].weight).toBe(130);
    expect(response.body.exercisesPerformed[0].sets[2].order).toBe(2);
  });
});
