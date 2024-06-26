import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module';
import { ExercisesModule } from './exercises/exercises.module';
import { WorkoutSessionsModule } from './workout-sessions/workout-sessions.module';
import { ProgressRecordsModule } from './progress-records/progress-records.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getTypeOrmConfig } from '../config/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    UsersModule,
    WorkoutPlansModule,
    ExercisesModule,
    WorkoutSessionsModule,
    ProgressRecordsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
