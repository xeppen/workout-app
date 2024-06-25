import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WorkoutSession } from '../../workout-sessions/entities/workout-session.entity';
import { ExerciseInPlan } from './exercise-in-plan.entity';

@Entity()
export class WorkoutPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User, (user) => user.workoutPlans)
  user: User;

  @OneToMany(
    () => WorkoutSession,
    (workoutSession) => workoutSession.workoutPlan
  )
  workoutSessions: WorkoutSession[];

  @OneToMany(
    () => ExerciseInPlan,
    (exerciseInPlan) => exerciseInPlan.workoutPlan,
    { cascade: true }
  )
  exercises: ExerciseInPlan[];
}
