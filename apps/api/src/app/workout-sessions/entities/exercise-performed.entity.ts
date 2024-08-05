import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { WorkoutSession } from '../../workout-sessions/entities/workout-session.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';
import { Set } from './set.entity';

@Entity()
export class ExercisePerformed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WorkoutSession, (session) => session.exercisesPerformed)
  workoutSession: WorkoutSession;

  @ManyToOne(() => Exercise)
  @JoinColumn()
  exercise: Exercise;

  @OneToMany(() => Set, (set) => set.exercisePerformed, { cascade: true })
  sets: Set[];

  @Column()
  order: number;
}
