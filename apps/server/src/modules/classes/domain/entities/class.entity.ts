import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseId: number;

  @Column()
  shiftId: number;

  @Column()
  year: number;

  @Column()
  semester: number;

  @Column()
  currentStudents: number;
}
