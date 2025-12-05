import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class AIProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  personality: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  hobbies: string;

  @Column({ nullable: true })
  model_type: string;

  @Column({ nullable: true })
  compatibility_tags: string;

  @ManyToOne('User', { nullable: true })
  user: User | null;
}
