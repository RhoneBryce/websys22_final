
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Thread } from './Thread';
import { AIProfile } from './AIProfile';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  
  @ManyToOne(() => Thread, (thread) => thread.messages, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thread_id' })
  thread: Thread;

  
  @ManyToOne(() => AIProfile, (ai) => ai.messages, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sender_ai_id' })
  aiProfile?: AIProfile | null;

  
  @Column('text')
  message_text: string;

  
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
