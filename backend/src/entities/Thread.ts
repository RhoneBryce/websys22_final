// src/entities/Thread.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Match } from './Match';
import { Message } from './Message';

@Entity('threads')
export class Thread {
  @PrimaryGeneratedColumn()
  id: number;

  
  @ManyToOne(() => Match, (match) => match.threads, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @OneToMany(() => Message, (message) => message.thread, { cascade: true })
  messages?: Message[];
}
