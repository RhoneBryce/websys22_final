import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { AIProfile } from './entities/AIProfile';
import { Match } from './entities/Match';
import { Thread } from './entities/Thread';
import { Message } from './entities/Message';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres:[YOUR-PASSWORD]@db.svzubbbbtfuchhqrcfqe.supabase.co:5432/postgres',
  synchronize: false,
  logging: false,
  entities: [User, AIProfile, Match, Thread, Message],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
