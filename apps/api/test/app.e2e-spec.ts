import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';

describe('WorkoutApp (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  let exerciseId: string;
  let workoutPlanId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ message: 'Hello API' });
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
    // Create an exercise first
    const exerciseResponse = await request(app.getHttpServer())
      .post('/exercises')
      .send({
        name: 'Bench Press',
        description: 'Chest exercise',
        targetMuscleGroups: ['chest', 'triceps'],
      })
      .expect(201);

    exerciseId = exerciseResponse.body.id;

    const response = await request(app.getHttpServer())
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

    workoutPlanId = response.body.id;
    expect(response.body.name).toBe('Strength Training');
    expect(response.body.exercises).toHaveLength(1);
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
              { reps: 10, weight: 100 },
              { reps: 8, weight: 110 },
              { reps: 6, weight: 120 },
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
    const response = await request(app.getHttpServer())
      .patch(`/workout-plans/${workoutPlanId}`)
      .send({
        name: 'Updated Strength Training',
        exercises: [
          {
            exerciseId: exerciseId,
            sets: 4,
            reps: 8,
            restTime: 90,
          },
        ],
      })
      .expect(200);

    expect(response.body.name).toBe('Updated Strength Training');
    expect(response.body.exercises).toHaveLength(1);
    expect(response.body.exercises[0].sets).toBe(4);
    expect(response.body.exercises[0].reps).toBe(8);
  });
});
