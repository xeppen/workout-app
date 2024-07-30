import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module';
import { ExercisesModule } from './exercises/exercises.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkoutSessionsModule } from './workout-sessions/workout-sessions.module';
import { ProgressRecordsModule } from './progress-records/progress-records.module';
import { ConfigModule } from '@nestjs/config';
import { getTypeOrmConfig } from '../config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: getTypeOrmConfig,
    }),
    ExercisesModule,
    UsersModule,
    WorkoutPlansModule,
    WorkoutSessionsModule,
    ProgressRecordsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
