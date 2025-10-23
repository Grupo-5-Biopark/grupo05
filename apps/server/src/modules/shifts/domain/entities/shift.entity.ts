import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // "Morning", "Afternoon", "Night"
}
