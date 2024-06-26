import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutPlansModule } from './workout-plans.module';
import { UsersModule } from '../users/users.module';
import { ExercisesModule } from '../exercises/exercises.module';
import { WorkoutSessionsModule } from '../workout-sessions/workout-sessions.module';
import { ProgressRecordsModule } from '../progress-records/progress-records.module';
import { Exercise } from '../exercises/entities/exercise.entity';
import { ExercisePerformed } from '../workout-sessions/entities/exercise-performed.entity';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { ExerciseInPlan } from './entities/exercise-in-plan.entity';
import { User } from '../users/entities/user.entity';
import { ProgressRecord } from '../progress-records/entities/progress-record.entity';
import { WorkoutSession } from '../workout-sessions/entities/workout-session.entity';
import { Set } from '../workout-sessions/entities/set.entity';
import { NotFoundException } from '@nestjs/common';

describe('WorkoutPlans Integration', () => {
  let app: INestApplication;
  let createdUserId: string;
  let createdExerciseId: string;
  let createdWorkoutPlanId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            Exercise,
            ExercisePerformed,
            WorkoutPlan,
            ExerciseInPlan,
            User,
            ProgressRecord,
            WorkoutSession,
            Set,
          ],
          synchronize: true,
        }),
        WorkoutPlansModule,
        UsersModule,
        ExercisesModule,
        WorkoutSessionsModule,
        ProgressRecordsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('should create a user', async () => {
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    console.log('User created:', userResponse.body);
    createdUserId = userResponse.body.id;
  });

  it('should create an exercise', async () => {
    const exerciseResponse = await request(app.getHttpServer())
      .post('/exercises')
      .send({
        name: 'Test Exercise',
        description: 'Test description',
        targetMuscleGroups: ['chest'],
      })
      .expect(201);

    console.log('Exercise created:', exerciseResponse.body);
    createdExerciseId = exerciseResponse.body.id;
  });

  it('should create a workout plan', async () => {
    // Create a user with a unique email
    const uniqueEmail = `test${Date.now()}@example.com`;
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Test User', email: uniqueEmail, password: 'password123' })
      .expect(201);

    console.log('User created:', userResponse.body);
    const userId = userResponse.body.id;

    // Create an exercise
    const exerciseResponse = await request(app.getHttpServer())
      .post('/exercises')
      .send({
        name: 'Test Exercise',
        description: 'Test description',
        targetMuscleGroups: ['chest'],
      })
      .expect(201);

    console.log('Exercise created:', exerciseResponse.body);
    const exerciseId = exerciseResponse.body.id;

    // Create a workout plan
    const workoutPlan = {
      name: 'Test Workout Plan',
      description: 'This is a test workout plan',
      userId: userId,
      exercises: [
        {
          exerciseId: exerciseId,
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

    console.log('Workout Plan created:', response.body);
    createdWorkoutPlanId = response.body.id;

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(workoutPlan.name);
    expect(response.body.description).toBe(workoutPlan.description);
    expect(response.body.userId).toBe(workoutPlan.userId);
    expect(response.body.exercises).toHaveLength(1);
    expect(response.body.exercises[0].exerciseId).toBe(
      workoutPlan.exercises[0].exerciseId
    );
  });

  it('should return an array of workout plans', async () => {
    const response = await request(app.getHttpServer())
      .get('/workout-plans')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should return a workout plan by id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/workout-plans/${createdWorkoutPlanId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe(createdWorkoutPlanId);
  });

  it('should throw NotFoundException if workout plan is not found', async () => {
    await request(app.getHttpServer())
      .get('/workout-plans/non-existent-id')
      .expect(404);
  });

  // Add more tests for update and remove methods
});
