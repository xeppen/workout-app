import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

describe('Realistic WorkoutSession (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  let workoutSessionId: string;
  let logger: Logger;
  let exercises: { [key: string]: string } = {};

  beforeAll(async () => {
    dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    logger = new Logger('Realistic Workout E2E Test');
    logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    logger.log(`USE_SUPABASE: ${process.env.USE_SUPABASE}`);
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('1. Create a user and exercises', async () => {
    // Create a user
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      })
      .expect(201);

    userId = userResponse.body.id;

    // Create exercises
    const exerciseNames = ['Press', 'Bench Press', 'Chin-ups'];
    for (const name of exerciseNames) {
      const response = await request(app.getHttpServer())
        .post('/exercises')
        .send({
          name,
          description: `${name} exercise`,
          targetMuscleGroups: ['chest', 'shoulders', 'arms'],
        })
        .expect(201);

      exercises[name] = response.body.id;
    }
  });

  it('2. Start a new workout session', async () => {
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

  it('3. Add Press exercise with multiple sets', async () => {
    const sets = [
      { reps: 5, weight: 75 },
      { reps: 5, weight: 90 },
      { reps: 3, weight: 110 },
      { reps: 8, weight: 120 },
      { reps: 8, weight: 135 },
      { reps: 8, weight: 145 },
      { reps: 5, weight: 135 },
      { reps: 5, weight: 120 },
    ];

    const response = await request(app.getHttpServer())
      .post(`/workout-sessions/${workoutSessionId}/exercises`)
      .send({
        exerciseId: exercises['Press'],
        sets,
      })
      .expect(200);

    expect(response.body.exercisesPerformed).toHaveLength(1);
    expect(response.body.exercisesPerformed[0].exerciseId).toBe(
      exercises['Press']
    );
    expect(response.body.exercisesPerformed[0].sets).toHaveLength(sets.length);
  });

  it('4. Add Bench Press exercise with multiple sets', async () => {
    const sets = Array(5).fill({ reps: 10, weight: 165 });

    const response = await request(app.getHttpServer())
      .post(`/workout-sessions/${workoutSessionId}/exercises`)
      .send({
        exerciseId: exercises['Bench Press'],
        sets,
      })
      .expect(200);

    expect(response.body.exercisesPerformed).toHaveLength(2);
    expect(response.body.exercisesPerformed[1].exerciseId).toBe(
      exercises['Bench Press']
    );
    expect(response.body.exercisesPerformed[1].sets).toHaveLength(sets.length);
  });

  it('5. Add Chin-ups exercise with multiple sets', async () => {
    const sets = Array(5).fill({ reps: 10, weight: 0 }); // Assuming bodyweight for chin-ups

    const response = await request(app.getHttpServer())
      .post(`/workout-sessions/${workoutSessionId}/exercises`)
      .send({
        exerciseId: exercises['Chin-ups'],
        sets,
      })
      .expect(200);

    expect(response.body.exercisesPerformed).toHaveLength(3);
    expect(response.body.exercisesPerformed[2].exerciseId).toBe(
      exercises['Chin-ups']
    );
    expect(response.body.exercisesPerformed[2].sets).toHaveLength(sets.length);
  });

  it('6. Add notes to the workout session', async () => {
    const notes = 'Great workout! Feeling strong on the press today.';
    const response = await request(app.getHttpServer())
      .patch(`/workout-sessions/${workoutSessionId}`)
      .send({ notes })
      .expect(200);

    expect(response.body.notes).toBe(notes);
  });

  it('7. Complete the workout session', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/workout-sessions/${workoutSessionId}`)
      .send({ completed: true })
      .expect(200);

    expect(response.body.completed).toBe(true);
  });

  it('8. Verify the completed workout session', async () => {
    const response = await request(app.getHttpServer())
      .get(`/workout-sessions/${workoutSessionId}`)
      .expect(200);

    expect(response.body.completed).toBe(true);
    expect(response.body.exercisesPerformed).toHaveLength(3);
    expect(response.body.notes).toBe(
      'Great workout! Feeling strong on the press today.'
    );

    // Verify Press
    expect(response.body.exercisesPerformed[0].sets).toHaveLength(8);
    expect(response.body.exercisesPerformed[0].sets[0].reps).toBe(5);
    expect(response.body.exercisesPerformed[0].sets[0].weight).toBe(75);

    // Verify Bench Press
    expect(response.body.exercisesPerformed[1].sets).toHaveLength(5);
    expect(response.body.exercisesPerformed[1].sets[0].reps).toBe(10);
    expect(response.body.exercisesPerformed[1].sets[0].weight).toBe(165);

    // Verify Chin-ups
    expect(response.body.exercisesPerformed[2].sets).toHaveLength(5);
    expect(response.body.exercisesPerformed[2].sets[0].reps).toBe(10);
    expect(response.body.exercisesPerformed[2].sets[0].weight).toBe(0);
  });
});
