import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { WorkoutPlan } from './workout-plan.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';

@Entity()
export class ExerciseInPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WorkoutPlan, (workoutPlan) => workoutPlan.exercises)
  workoutPlan: WorkoutPlan;

  @ManyToOne(() => Exercise)
  exercise: Exercise;

  @Column()
  exerciseId: string;

  @Column()
  sets: number;

  @Column()
  reps: number;

  @Column()
  restTime: number;
}
