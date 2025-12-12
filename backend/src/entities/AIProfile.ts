import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Message } from './Message';
import { Match } from './Match';
import { User } from './User';

@Entity('ai_profiles')
export class AIProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  personality: string;

  @Column()
  description: string;

  @Column()
  hobbies: string;

  @Column()
  model_type: string;

  @Column({ nullable: true })
  compatibility_tags: string;

  // ❗ THIS FIXES ALL route errors
  @ManyToOne(() => User, user => user.aiProfiles, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @OneToMany(() => Message, message => message.aiProfile)
  messages: Message[];

  @OneToMany(() => Match, match => match.ai1)
  matches_as_ai1: Match[];

  @OneToMany(() => Match, match => match.ai2)
  matches_as_ai2: Match[];
}
