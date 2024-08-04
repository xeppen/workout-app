import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

describe('WorkoutPlan (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  let workoutPlanId: string;
  let exerciseId1: string;
  let exerciseId2: string;
  let logger: Logger;

  beforeAll(async () => {
    dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    logger = new Logger('E2E Test');
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Create a user and exercises', async () => {
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

    // Create exercises
    const exerciseResponse1 = await request(app.getHttpServer())
      .post('/exercises')
      .send({
        name: 'Squat',
        description: 'Lower body exercise',
        targetMuscleGroups: ['quadriceps', 'hamstrings', 'glutes'],
      })
      .expect(201);

    exerciseId1 = exerciseResponse1.body.id;

    const exerciseResponse2 = await request(app.getHttpServer())
      .post('/exercises')
      .send({
        name: 'Bench Press',
        description: 'Upper body exercise',
        targetMuscleGroups: ['chest', 'triceps', 'shoulders'],
      })
      .expect(201);

    exerciseId2 = exerciseResponse2.body.id;
  });

  it('2. Create a workout plan', async () => {
    const createWorkoutPlanDto = {
      name: 'Starting Strength',
      description: 'Beginner strength training program',
      userId: userId,
      workouts: [
        {
          name: 'Workout A',
          exercises: [
            {
              exerciseId: exerciseId1,
              sets: 3,
              reps: 5,
              weight: 100,
            },
            {
              exerciseId: exerciseId2,
              sets: 3,
              reps: 5,
              weight: 80,
            },
          ],
        },
        {
          name: 'Workout B',
          exercises: [
            {
              exerciseId: exerciseId1,
              sets: 3,
              reps: 5,
              weight: 100,
            },
            {
              exerciseId: exerciseId2,
              sets: 3,
              reps: 5,
              weight: 80,
            },
          ],
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .post('/workout-plans')
      .send(createWorkoutPlanDto)
      .expect(201);

    workoutPlanId = response.body.id;
    expect(response.body.name).toBe('Starting Strength');
    expect(response.body.workouts).toHaveLength(2);
  });

  it('3. Get a specific workout plan', async () => {
    const response = await request(app.getHttpServer())
      .get(`/workout-plans/${workoutPlanId}`)
      .expect(200);

    expect(response.body.id).toBe(workoutPlanId);
    expect(response.body.name).toBe('Starting Strength');
  });

  it('4. Update a workout plan', async () => {
    const updateWorkoutPlanDto = {
      name: 'Modified Starting Strength',
      description: 'Customized beginner strength training program',
    };

    const response = await request(app.getHttpServer())
      .patch(`/workout-plans/${workoutPlanId}`)
      .send(updateWorkoutPlanDto)
      .expect(200);

    expect(response.body.name).toBe('Modified Starting Strength');
    expect(response.body.description).toBe(
      'Customized beginner strength training program'
    );
  });

  it('5. Create a workout session from a workout plan', async () => {
    const response = await request(app.getHttpServer())
      .post(`/workout-plans/${workoutPlanId}/sessions`)
      .send({ userId: userId })
      .expect(201);

    expect(response.body.userId).toBe(userId);
    expect(response.body.workoutPlanId).toBe(workoutPlanId);
    expect(response.body.exercises).toHaveLength(2);
  });

  it('6. Progress a workout plan', async () => {
    const progressDto = {
      progressionType: 'linear',
      incrementWeight: 5,
    };

    const response = await request(app.getHttpServer())
      .post(`/workout-plans/${workoutPlanId}/progress`)
      .send(progressDto)
      .expect(200);

    expect(response.body.workouts[0].exercises[0].weight).toBe(105);
    expect(response.body.workouts[0].exercises[1].weight).toBe(85);
  });

  it('7. Clone a workout plan', async () => {
    const response = await request(app.getHttpServer())
      .post(`/workout-plans/${workoutPlanId}/clone`)
      .send({ name: 'Cloned Starting Strength' })
      .expect(201);

    expect(response.body.name).toBe('Cloned Starting Strength');
    expect(response.body.workouts).toHaveLength(2);
    expect(response.body.id).not.toBe(workoutPlanId);
  });

  it('8. Get workout plan statistics', async () => {
    const response = await request(app.getHttpServer())
      .get(`/workout-plans/${workoutPlanId}/statistics`)
      .expect(200);

    expect(response.body).toHaveProperty('totalSessions');
    expect(response.body).toHaveProperty('averageWeightProgress');
    expect(response.body).toHaveProperty('mostUsedExercise');
  });

  it('9. Delete a workout plan', async () => {
    await request(app.getHttpServer())
      .delete(`/workout-plans/${workoutPlanId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/workout-plans/${workoutPlanId}`)
      .expect(404);
  });
});
