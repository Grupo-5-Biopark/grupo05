import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  private password: string;

  @Column()
  role: string;

  setPassword(hashedPassword: string): void {
    this.password = hashedPassword;
  }

  getPassword(): string {
    return this.password;
  }
}
