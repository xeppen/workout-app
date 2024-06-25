import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutPlansService } from './workout-plans.service';
import { WorkoutPlansController } from './workout-plans.controller';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { ExerciseInPlan } from './entities/exercise-in-plan.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { User } from '../users/entities/user.entity';
import { ProgressRecord } from '../progress-records/entities/progress-record.entity';
import { ExercisePerformed } from '../workout-sessions/entities/exercise-performed.entity';
import { WorkoutSession } from '../workout-sessions/entities/workout-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkoutPlan,
      ExerciseInPlan,
      Exercise,
      User,
      ProgressRecord,
      ExercisePerformed,
      WorkoutSession,
    ]),
  ],
  controllers: [WorkoutPlansController],
  providers: [WorkoutPlansService],
})
export class WorkoutPlansModule {}
