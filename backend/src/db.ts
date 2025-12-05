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
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'ai_platform',
  synchronize: true,
  logging: false,
  entities: [User, AIProfile, Match, Thread, Message, Group, GroupMember],
});
