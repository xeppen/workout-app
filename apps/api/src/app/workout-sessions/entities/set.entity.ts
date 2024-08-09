import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExercisePerformed } from './exercise-performed.entity';

@Entity('sets')
export class Set {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reps: number;

  @Column('decimal', { precision: 5, scale: 2 })
  weight: number;

  @Column({ nullable: true })
  restTime?: number;

  @Column()
  order: number; // Add this line

  @ManyToOne(
    () => ExercisePerformed,
    (exercisePerformed) => exercisePerformed.sets
  )
  exercisePerformed: ExercisePerformed;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
