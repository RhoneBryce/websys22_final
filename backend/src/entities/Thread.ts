import { Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Match } from './Match';
import { Group } from './Group';
import type { Message } from './Message';

@Entity()
export class Thread {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Match, { nullable: true })
  match: Match;

  @ManyToOne(() => Group, { nullable: true })
  group: Group;

  @OneToMany('Message', 'thread')
  messages: Message[];
}
