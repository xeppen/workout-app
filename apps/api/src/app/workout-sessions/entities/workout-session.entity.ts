// apps/api/src/app/workout-sessions/entities/workout-session.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WorkoutPlan } from '../../workout-plans/entities/workout-plan.entity';
import { ExercisePerformed } from './exercise-performed.entity';

@Entity()
export class WorkoutSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.workoutSessions)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => WorkoutPlan, (workoutPlan) => workoutPlan.workoutSessions)
  workoutPlan: WorkoutPlan;

  @Column()
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
}
