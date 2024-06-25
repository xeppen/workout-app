import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProgressRecord } from '../../progress-records/entities/progress-record.entity';
import { ExerciseInPlan } from './../../workout-plans/entities/exercise-in-plan.entity'; // Define ExerciseInPlan entity if needed
import { ExercisePerformed } from '../../workout-sessions/entities/exercise-performed.entity';

@Entity()
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('simple-array')
  targetMuscleGroups: string[];

  @Column({ nullable: true })
  videoURL: string;

  @OneToMany(() => ProgressRecord, (progressRecord) => progressRecord.exercise)
  progressRecords: ProgressRecord[];

  @OneToMany(
    () => ExerciseInPlan,
    (exerciseInPlan) => exerciseInPlan.exercise,
    { cascade: true }
  )
  exercisesInPlan: ExerciseInPlan[];

  @OneToMany(
    () => ExercisePerformed,
    (exercisePerformed) => exercisePerformed.exercise,
    { cascade: true }
  )
  exercisesPerformed: ExercisePerformed[];
}
