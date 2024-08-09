import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkoutPlan } from '../../workout-plans/entities/workout-plan.entity';
import { WorkoutSession } from '../../workout-sessions/entities/workout-session.entity';
import { ProgressRecord } from '../../progress-records/entities/progress-record.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @OneToMany(() => WorkoutPlan, (workoutPlan) => workoutPlan.user)
  workoutPlans: WorkoutPlan[];

  @OneToMany(() => WorkoutSession, (workoutSession) => workoutSession.user)
  workoutSessions: WorkoutSession[];

  @OneToMany(() => ProgressRecord, (progressRecord) => progressRecord.user)
  progressRecords: ProgressRecord[];

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
