import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { AIProfile } from './entities/AIProfile';
import { Match } from './entities/Match';
import { Thread } from './entities/Thread';
import { Message } from './entities/Message';
import { Group } from './entities/Group';
import { GroupMember } from './entities/GroupMember';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: false,
  entities: [User, AIProfile, Match, Thread, Message, Group, GroupMember],
});
