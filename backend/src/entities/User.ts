
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AIProfile } from './AIProfile';
import { Match } from './Match';
import { Message } from './Message';

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

  @OneToMany(() => AIProfile, aiProfile => aiProfile.user)
  aiProfiles: AIProfile[];

 
  @OneToMany(() => Match, match => match.user)
  matches: Match[];

  
}
