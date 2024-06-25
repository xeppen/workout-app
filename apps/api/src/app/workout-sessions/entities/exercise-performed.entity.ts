import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { WorkoutSession } from '../../workout-sessions/entities/workout-session.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';
import { Set } from './set.entity'; // Define Set entity if needed

@Entity()
export class ExercisePerformed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WorkoutSession, (workoutSession) => workoutSession.exercises)
  workoutSession: WorkoutSession;

  @ManyToOne(() => Exercise, (exercise) => exercise.exercisesPerformed)
  exercise: Exercise;

  @OneToMany(() => Set, (set) => set.exercisePerformed, { cascade: true })
  sets: Set[];
}
