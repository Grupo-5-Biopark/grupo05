import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from '../../../courses/domain/entities/course.entity';
import { Shift } from '../../../shifts/domain/entities/shift.entity';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseId: number;

  @ManyToOne(() => Course, (course) => course.classes)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  shiftId: number;

  @ManyToOne(() => Shift, (shift) => shift.classes)
  @JoinColumn({ name: 'shiftId' })
  shift: Shift;

  @Column()
  year: number;

  @Column()
  semester: number;

  @Column()
  currentStudents: number;
}
