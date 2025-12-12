import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AIProfile } from './AIProfile';
import { Thread } from './Thread';
import { User } from './User';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AIProfile)
  @JoinColumn({ name: 'ai1_id' })
  ai1: AIProfile;

  @ManyToOne(() => AIProfile)
  @JoinColumn({ name: 'ai2_id' })
  ai2: AIProfile;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @OneToMany(() => Thread, thread => thread.match)
  threads: Thread[];
}
