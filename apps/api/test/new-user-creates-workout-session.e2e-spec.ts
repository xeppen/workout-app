import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Exercise } from '../src/app/exercises/entities/exercise.entity';
import { use } from 'passport';

describe('WorkoutApp E2E Tests', () => {
  let app: INestApplication;
  let logger: Logger;
  let testUser: { id: string; email: string; password: string };
  let authToken: string;
  let workoutSessionId: string;
  let exercises: Exercise[];

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

    // Create a test user
    testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'testPassword123',
      id: '',
    };

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);
    testUser.id = registerResponse.body.user.id;
    logger.log(`Test user created with ID: ${testUser.id}`);

    // Login and get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    authToken = loginResponse.body.session.access_token;
    console.log('Auth Token:', authToken);

    try {
      const userInfoResponse = await request(app.getHttpServer())
        .get('/auth/me') // Ensure you have this endpoint in your AuthController
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      logger.log('User info:', userInfoResponse.body);
    } catch (error) {
      logger.error('Failed to get user info:', error);
    }
  }, 30000);

  afterAll(async () => {
    if (app) {
      if (authToken && testUser.id) {
        try {
          // Fetch all workout sessions for the user
          const sessionsResponse = await request(app.getHttpServer())
            .get('/workout-sessions/mine')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

          // Delete each workout session
          for (const session of sessionsResponse.body) {
            await request(app.getHttpServer())
              .delete(`/workout-sessions/${session.id}`)
              .set('Authorization', `Bearer ${authToken}`)
              .expect(200);
            console.log(`Deleted workout session: ${session.id}`);
          }

          // Delete the user
          await request(app.getHttpServer())
            .delete(`/users/${testUser.id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

          console.log(`Test user ${testUser.id} deleted`);
        } catch (error) {
          console.error('Error during cleanup:', error.message);
        }
      }

      await app.close();
    }
  });

  it('should fetch exercises', async () => {
    const exercisesResponse = await request(app.getHttpServer())
      .get('/exercises')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    exercises = exercisesResponse.body;
    console.log(`Fetched ${exercises.length} exercises`);
    expect(exercises.length).toBeGreaterThan(0);
  });

  it('should create a workout session', async () => {
    const createSessionResponse = await request(app.getHttpServer())
      .post('/workout-sessions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        userId: testUser.id,
        date: new Date().toISOString(),
      })
      .expect(201);

    workoutSessionId = createSessionResponse.body.id;
    console.log(`Created workout session with ID: ${workoutSessionId}`);
    expect(workoutSessionId).toBeDefined();
  });

  it('should add exercises to the workout session', async () => {
    for (const exercise of exercises.slice(0, 5)) {
      const addExerciseResponse = await request(app.getHttpServer())
        .post(`/workout-sessions/${workoutSessionId}/exercises`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          exerciseId: exercise.id,
          sets: [
            { reps: 10, weight: 50 },
            { reps: 8, weight: 60 },
            { reps: 6, weight: 70 },
          ],
        })
        .expect(200);

      console.log(`Added exercise ${exercise.id} to workout session`);
      console.log(
        'Response body:',
        JSON.stringify(addExerciseResponse.body, null, 2)
      );

      // Check if the response contains the expected exercise
      expect(addExerciseResponse.body).toHaveProperty('exercisesPerformed');
      const addedExercise = addExerciseResponse.body.exercisesPerformed.find(
        (ep) => ep.exerciseId === exercise.id
      );
      expect(addedExercise).toBeDefined();
      expect(addedExercise.sets).toHaveLength(3);
      expect(addedExercise.sets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ reps: 10, weight: 50 }),
          expect.objectContaining({ reps: 8, weight: 60 }),
          expect.objectContaining({ reps: 6, weight: 70 }),
        ])
      );
    }
  });

  it('should verify the created workout session', async () => {
    const response = await request(app.getHttpServer())
      .get(`/workout-sessions/${workoutSessionId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', workoutSessionId);
    expect(response.body).toHaveProperty('userId',§testUser.id);
    expect(response.body).toHaveProperty('exercisesPerformed');
    expect(response.body.exercisesPerformed).toHaveLength(5);

    response.body.exercisesPerformed.forEach((exercise) => {
      expect(exercise).toHaveProperty('sets');
      expect(exercise.sets).toHaveLength(3);
    });
  });
});
