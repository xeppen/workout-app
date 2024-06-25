import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ExerciseInPlan } from './exercise-in-plan.entity';
import { WorkoutSession } from '../../workout-sessions/entities/workout-session.entity';

@Entity()
export class WorkoutPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.workoutPlans)
  user: User;

  @OneToMany(
    () => ExerciseInPlan,
    (exerciseInPlan) => exerciseInPlan.workoutPlan,
    { cascade: true }
  )
  exercises: ExerciseInPlan[];

  @OneToMany(
    () => WorkoutSession,
    (workoutSession) => workoutSession.workoutPlan
  )
  workoutSessions: WorkoutSession[];
}
