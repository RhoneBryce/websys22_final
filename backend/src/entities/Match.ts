import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { AIProfile } from './AIProfile';
import { Thread } from './Thread';
import { User } from './User';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AIProfile)
  ai1: AIProfile;

  @ManyToOne(() => AIProfile)
  ai2: AIProfile;

  @ManyToOne(() => User, { nullable: true })
  user: User | null;

  @OneToMany(() => Thread, thread => thread.match)
  threads: Thread[];
}
