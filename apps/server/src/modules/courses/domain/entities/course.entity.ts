import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  knowledgeArea: string;

  @Column()
  announcement: number;

  @Column({ default: 'active' })
  status: string;
}
