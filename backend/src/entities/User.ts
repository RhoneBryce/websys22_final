import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AIProfile } from './AIProfile';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  compatibility_tags: string;

  @OneToMany('AIProfile', 'user')
  aiProfiles: AIProfile[];
}
