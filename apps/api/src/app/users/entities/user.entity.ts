import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { WorkoutPlan } from '../../workout-plans/entities/workout-plan.entity';
import { WorkoutSession } from '../../workout-sessions/entities/workout-session.entity';
import { ProgressRecord } from '../../progress-records/entities/progress-record.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => WorkoutPlan, (workoutPlan) => workoutPlan.user)
  workoutPlans: WorkoutPlan[];

  @OneToMany(() => WorkoutSession, (workoutSession) => workoutSession.user)
  workoutSessions: WorkoutSession[];

  @OneToMany(() => ProgressRecord, (progressRecord) => progressRecord.user)
  progressRecords: ProgressRecord[];
}
