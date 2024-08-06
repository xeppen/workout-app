import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { WorkoutSession } from '../../workout-sessions/entities/workout-session.entity';
import { Set } from './set.entity';

@Entity()
export class ExercisePerformed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  exerciseId: string;

  @ManyToOne(
    () => WorkoutSession,
    (workoutSession) => workoutSession.exercisesPerformed
  )
  workoutSession: WorkoutSession;

  @OneToMany(() => Set, (set) => set.exercisePerformed)
  sets: Set[];

  @Column()
  order: number;
}
