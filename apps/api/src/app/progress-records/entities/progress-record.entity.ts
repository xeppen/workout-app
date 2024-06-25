import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';

@Entity()
export class ProgressRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.progressRecords)
  user: User;

  @ManyToOne(() => Exercise, (exercise) => exercise.progressRecords)
  exercise: Exercise;

  @Column()
  date: Date;

  @Column()
  weightLifted: number;

  @Column()
  reps: number;

  @Column()
  sets: number;
}
