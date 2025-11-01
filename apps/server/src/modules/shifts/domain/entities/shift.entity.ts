import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Class } from '../../../classes/domain/entities/class.entity';

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // "Morning", "Afternoon", "Night"

  @OneToMany(() => Class, (classEntity) => classEntity.shift)
  classes: Class[];
}
