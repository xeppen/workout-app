import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../app/users/entities/user.entity';
import { WorkoutPlan } from '../app/workout-plans/entities/workout-plan.entity';
import { Exercise } from '../app/exercises/entities/exercise.entity';
import { WorkoutSession } from '../app/workout-sessions/entities/workout-session.entity';
import { ProgressRecord } from '../app/progress-records/entities/progress-record.entity';
import { ExercisePerformed } from '../app/workout-sessions/entities/exercise-performed.entity';
import { ExerciseInPlan } from '../app/workout-plans/entities/exercise-in-plan.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'your_username',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'workout_app',
  entities: [
    User,
    WorkoutPlan,
    Exercise,
    WorkoutSession,
    ProgressRecord,
    ExercisePerformed,
    ExerciseInPlan,
  ],
  synchronize: process.env.NODE_ENV !== 'production', // Be cautious with this in production
};
