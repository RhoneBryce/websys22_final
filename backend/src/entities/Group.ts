import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import type { GroupMember } from './GroupMember';
import type { Thread } from './Thread';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany('GroupMember', 'group')
  members: GroupMember[];

  @OneToMany('Thread', 'group')
  threads: Thread[];
}
