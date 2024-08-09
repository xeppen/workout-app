import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutSessionsService } from './workout-sessions.service';
import { WorkoutSessionsController } from './workout-sessions.controller';
import { WorkoutSession } from './entities/workout-session.entity';
import { ExercisePerformed } from './entities/exercise-performed.entity';
import { Set } from './entities/set.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutSession, ExercisePerformed, Set, User]),
  ],
  controllers: [WorkoutSessionsController],
  providers: [WorkoutSessionsService],
  exports: [TypeOrmModule, WorkoutSessionsService],
})
export class WorkoutSessionsModule {}
