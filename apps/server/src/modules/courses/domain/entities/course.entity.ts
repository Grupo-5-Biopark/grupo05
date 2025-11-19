import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Class } from '../../../classes/domain/entities/class.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  knowledgeArea: string;

  @Column()
  vacancies: number;

  @Column()
  periodQuantities: number;

  @Column()
  openingYear: number;

  @OneToMany(() => Class, (classEntity) => classEntity.course)
  classes: Class[];
}
