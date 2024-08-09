import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkoutSession } from '../../workout-sessions/entities/workout-session.entity';
import { Set } from './set.entity';

@Entity('exercise_performed')
export class ExercisePerformed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  exerciseId: string;

  @Column({ name: 'workout_session_id' })
  workoutSessionId: string;

  @ManyToOne(
    () => WorkoutSession,
    (workoutSession) => workoutSession.exercisesPerformed
  )
  @JoinColumn({ name: 'workout_session_id' })
  workoutSession: WorkoutSession;

  @OneToMany(() => Set, (set) => set.exercisePerformed)
  sets: Set[];

  @Column()
  order: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
