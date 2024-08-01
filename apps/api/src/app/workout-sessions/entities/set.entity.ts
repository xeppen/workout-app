import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(
    () => ExercisePerformed,
    (exercisePerformed) => exercisePerformed.sets
  )
  exercisePerformed: ExercisePerformed;
}
