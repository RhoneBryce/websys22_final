"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./entities/User");
const AIProfile_1 = require("./entities/AIProfile");
const Match_1 = require("./entities/Match");
const Thread_1 = require("./entities/Thread");
const Message_1 = require("./entities/Message");
const Group_1 = require("./entities/Group");
const GroupMember_1 = require("./entities/GroupMember");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: false,
    entities: [User_1.User, AIProfile_1.AIProfile, Match_1.Match, Thread_1.Thread, Message_1.Message, Group_1.Group, GroupMember_1.GroupMember],
});
