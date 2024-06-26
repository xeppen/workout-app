import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../app/users/entities/user.entity';
import { WorkoutPlan } from '../app/workout-plans/entities/workout-plan.entity';
import { Exercise } from '../app/exercises/entities/exercise.entity';
import { WorkoutSession } from '../app/workout-sessions/entities/workout-session.entity';
import { ProgressRecord } from '../app/progress-records/entities/progress-record.entity';
import { ExercisePerformed } from '../app/workout-sessions/entities/exercise-performed.entity';
import { ExerciseInPlan } from '../app/workout-plans/entities/exercise-in-plan.entity';
import { Set } from '../app/workout-sessions/entities/set.entity';

const entities = [
  User,
  WorkoutPlan,
  Exercise,
  WorkoutSession,
  ProgressRecord,
  ExercisePerformed,
  ExerciseInPlan,
  Set,
];

export const getTypeOrmConfig = (): TypeOrmModuleOptions => {
  if (process.env.NODE_ENV === 'test') {
    return {
      type: 'sqlite',
      database: ':memory:',
      entities: entities,
      synchronize: true,
      logging: false,
    };
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'your_username',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'workout_app',
    entities: entities,
    synchronize: process.env.NODE_ENV !== 'production',
  };
};
