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
  @JoinColumn({ name: 'workoutSessionId' })
  workoutSession: WorkoutSession;

  @Column()
  workoutSessionId: string;

  @ManyToOne(() => Exercise, (exercise) => exercise.exercisesPerformed)
  @JoinColumn({ name: 'exerciseId' })
  exercise: Exercise;

  @Column()
  exerciseId: string;

  @OneToMany(() => Set, (set) => set.exercisePerformed, { cascade: true })
  sets: Set[];

  @Column()
  order: number;
}
