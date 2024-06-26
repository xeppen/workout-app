import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { WorkoutPlan } from './workout-plan.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';

@Entity()
export class ExerciseInPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  exerciseId: string;

  @ManyToOne(() => Exercise)
  exercise: Exercise;

  @ManyToOne(() => WorkoutPlan, (workoutPlan) => workoutPlan.exercises)
  workoutPlan: WorkoutPlan;

  @Column()
  sets: number;

  @Column()
  reps: number;

  @Column()
  restTime: number;
}
