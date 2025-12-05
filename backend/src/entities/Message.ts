import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Thread } from './Thread';
import { AIProfile } from './AIProfile';
import { User } from './User';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Thread)
  thread: Thread;

  @ManyToOne(() => User, { nullable: true })
  user: User | null;

  @ManyToOne(() => AIProfile)
  aiProfile: AIProfile;

  @Column()
  message_text: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
