import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('calculation_parameters')
export class CalculationParameters {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  dropoutPercentage: number; // up to two decimals

  @Column({ type: 'int', default: 10 })
  studentsPerSmallRoom: number;

  @Column({ type: 'int', default: 20 })
  studentsPerMediumRoom: number;

  @Column({ type: 'int', default: 30 })
  studentsPerBigRoom: number;
}
