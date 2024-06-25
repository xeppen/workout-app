import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ExercisePerformed } from './exercise-performed.entity';

@Entity()
export class Set {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => ExercisePerformed,
    (exercisePerformed) => exercisePerformed.sets
  )
  exercisePerformed: ExercisePerformed;

  @Column()
  reps: number;

  @Column()
  weight: number;

  @Column({ nullable: true })
  restTime: number; // in seconds
}
