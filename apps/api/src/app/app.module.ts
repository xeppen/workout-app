import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users.controller';
import { UsersModule } from './users.module';
import { UsersModule } from './users/users.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module';
import { ExercisesModule } from './exercises/exercises.module';
import { WorkoutSessionsModule } from './workout-sessions/workout-sessions.module';
import { ProgressRecordsModule } from './progress-records/progress-records.module';

@Module({
  imports: [
    UsersModule,
    WorkoutPlansModule,
    ExercisesModule,
    WorkoutSessionsModule,
    ProgressRecordsModule,
  ],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {}
