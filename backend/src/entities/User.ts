import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AIProfile } from './AIProfile';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany('AIProfile', 'user')
  aiProfiles: AIProfile[];
}
