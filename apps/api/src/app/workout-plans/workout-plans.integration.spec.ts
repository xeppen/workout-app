import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutPlansModule } from './workout-plans.module';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { ExerciseInPlan } from './entities/exercise-in-plan.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { User } from '../users/entities/user.entity';
import { ProgressRecord } from '../progress-records/entities/progress-record.entity';

describe('WorkoutPlans Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            WorkoutPlan,
            ExerciseInPlan,
            Exercise,
            User,
            ProgressRecord,
          ],
          synchronize: true,
        }),
        WorkoutPlansModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a workout plan', async () => {
    const workoutPlan = {
      name: 'Test Workout Plan',
      description: 'This is a test workout plan',
      userId: '1', // Assuming a user with id 1 exists
      exercises: [
        {
          exerciseId: '1', // Assuming an exercise with id 1 exists
          sets: 3,
          reps: 10,
          restTime: 60,
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .post('/workout-plans')
      .send(workoutPlan)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(workoutPlan.name);
    expect(response.body.description).toBe(workoutPlan.description);
    expect(response.body.userId).toBe(workoutPlan.userId);
    expect(response.body.exercises).toHaveLength(1);
    expect(response.body.exercises[0].exerciseId).toBe(
      workoutPlan.exercises[0].exerciseId
    );
  });

  it('should get all workout plans', async () => {
    const response = await request(app.getHttpServer())
      .get('/workout-plans')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // Add more tests for other CRUD operations
});
