import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Thread } from './Thread';
import { AIProfile } from './AIProfile';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Thread)
  thread: Thread;

  @ManyToOne(() => AIProfile)
  sender: AIProfile;

  @Column()
  message_text: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
