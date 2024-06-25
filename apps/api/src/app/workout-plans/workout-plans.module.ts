import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutPlansService } from './workout-plans.service';
import { WorkoutPlansController } from './workout-plans.controller';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { ExerciseInPlan } from './entities/exercise-in-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutPlan, ExerciseInPlan])],
  controllers: [WorkoutPlansController],
  providers: [WorkoutPlansService],
})
export class WorkoutPlansModule {}
