import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ExercisePerformed } from './exercise-performed.entity';

@Entity()
export class Set {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reps: number;

  @Column('decimal', { precision: 5, scale: 2 })
  weight: number;

  @Column({ nullable: true })
  restTime?: number;

  @ManyToOne(
    () => ExercisePerformed,
    (exercisePerformed) => exercisePerformed.sets
  )
  exercisePerformed: ExercisePerformed;
}
