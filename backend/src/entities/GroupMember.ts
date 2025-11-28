import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Group } from './Group';
import { AIProfile } from './AIProfile';

@Entity()
export class GroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Group, group => group.members)
  group: Group;

  @ManyToOne(() => AIProfile)
  ai: AIProfile;
}
