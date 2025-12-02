import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Class } from '../../../classes/domain/entities/class.entity';
import { Course } from '../../../courses/domain/entities/course.entity';

@Entity('rooms')
export class Rooms {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  block: string;

  @Column()
  number: number;

  @Column()
  size: string;

  @Column({ nullable: true })
  courseId: number;

  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ nullable: true })
  classId: number;

  @ManyToOne(() => Class, { nullable: true })
  @JoinColumn({ name: 'classId' })
  class: Class;
}
