// api/src/config/typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../app/users/entities/user.entity';
import { WorkoutPlan } from '../app/workout-plans/entities/workout-plan.entity';
import { Exercise } from '../app/exercises/entities/exercise.entity';
import { WorkoutSession } from '../app/workout-sessions/entities/workout-session.entity';
import { ProgressRecord } from '../app/progress-records/entities/progress-record.entity';
import { ExercisePerformed } from '../app/workout-sessions/entities/exercise-performed.entity';
import { ExerciseInPlan } from '../app/workout-plans/entities/exercise-in-plan.entity';
import { Set } from '../app/workout-sessions/entities/set.entity';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';

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

const logger = new Logger('TypeOrmConfig');

export const getTypeOrmConfig = (): TypeOrmModuleOptions => {
  if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });
  }

  logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  logger.log(`USE_SUPABASE: ${process.env.USE_SUPABASE}`);

  if (process.env.NODE_ENV === 'test') {
    if (process.env.USE_SUPABASE === 'true') {
      logger.log('Using Supabase for testing');
      if (!process.env.SUPABASE_DB_URL) {
        throw new Error('SUPABASE_DB_URL is not set in .env.test');
      }
      const [, host] = process.env.SUPABASE_DB_URL.split('@');
      logger.log(`Connecting to: ${host}`);

      return {
        type: 'postgres',
        url: process.env.SUPABASE_DB_URL,
        entities: entities,
        synchronize: true, // Be cautious with this in a test environment
        ssl: {
          rejectUnauthorized: false,
        },
        logging: true,
        logger: 'advanced-console',
      };
    } else {
      logger.log('Using SQLite for testing');
      return {
        type: 'sqlite',
        database: ':memory:',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
      };
    }
  }

  if (
    process.env.USE_SUPABASE === 'true' &&
    process.env.NODE_ENV !== 'production' &&
    process.env.NODE_ENV !== 'prod'
  ) {
    if (!process.env.SUPABASE_DB_URL) {
      throw new Error('SUPABASE_DB_URL is not set');
    }
    logger.log('Using Supabase configuration');

    const [, host] = process.env.SUPABASE_DB_URL.split('@');
    logger.log(`Connecting to: ${host}`);

    return {
      type: 'postgres',
      logging: true,
      logger: 'advanced-console',
      url: process.env.SUPABASE_DB_URL,
      entities: entities,
      synchronize: false, // Set to false for Supabase
      ssl: {
        rejectUnauthorized: false, // Required for Supabase connections
      },
    };
  }

  // Default to local PostgreSQL for development if not using Supabase
  logger.log('Using local PostgreSQL configuration');
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
