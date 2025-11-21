import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { AIProfile } from './AIProfile';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AIProfile)
  ai1: AIProfile;

  @ManyToOne(() => AIProfile)
  ai2: AIProfile;
}
