// apps/api/src/app/workout-sessions/entities/workout-session.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WorkoutPlan } from '../../workout-plans/entities/workout-plan.entity';
import { ExercisePerformed } from './exercise-performed.entity';

@Entity('workout_sessions')
export class WorkoutSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.workoutSessions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @ManyToOne(() => WorkoutPlan, (workoutPlan) => workoutPlan.workoutSessions)
  @JoinColumn({ name: 'workout_plan_id' })
  workoutPlan: WorkoutPlan;

  @Column({ name: 'workout_plan_id', nullable: true })
  workoutPlanId: string;

  @Column()
  date: Date;

  @OneToMany(
    () => ExercisePerformed,
    (exercisePerformed) => exercisePerformed.workoutSession
  )
  exercisesPerformed: ExercisePerformed[];

  @Column({ nullable: true })
  notes?: string;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
