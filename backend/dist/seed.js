"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const User_1 = require("./entities/User");
const AIProfile_1 = require("./entities/AIProfile");
const Match_1 = require("./entities/Match");
const Thread_1 = require("./entities/Thread");
const Message_1 = require("./entities/Message");
const bcrypt_1 = __importDefault(require("bcrypt"));
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.AppDataSource.initialize();
        // Create default matcher account
        const hashedPassword = yield bcrypt_1.default.hash('password123', 10);
        const user = new User_1.User();
        user.name = 'Matcher';
        user.email = 'matcher@example.com';
        user.password = hashedPassword;
        yield db_1.AppDataSource.manager.save(user);
        // Create 5 sample AI profiles
        const aiProfilesData = [
            {
                name: 'Alex',
                personality: 'Friendly and outgoing',
                description: 'Loves adventure and meeting new people',
                hobbies: 'Hiking, reading, traveling',
                model_type: 'GPT-4',
                compatibility_tags: 'adventurous, intellectual, social'
            },
            {
                name: 'Jordan',
                personality: 'Calm and thoughtful',
                description: 'Enjoys deep conversations and quiet evenings',
                hobbies: 'Philosophy, chess, cooking',
                model_type: 'GPT-3.5',
                compatibility_tags: 'intellectual, calm, creative'
            },
            {
                name: 'Taylor',
                personality: 'Energetic and fun-loving',
                description: 'Always up for a good time and new experiences',
                hobbies: 'Dancing, music, sports',
                model_type: 'GPT-4',
                compatibility_tags: 'energetic, fun, athletic'
            },
            {
                name: 'Morgan',
                personality: 'Creative and artistic',
                description: 'Expresses emotions through art and music',
                hobbies: 'Painting, singing, writing',
                model_type: 'GPT-3.5',
                compatibility_tags: 'creative, artistic, emotional'
            },
            {
                name: 'Casey',
                personality: 'Ambitious and driven',
                description: 'Focused on career and personal growth',
                hobbies: 'Networking, fitness, learning',
                model_type: 'GPT-4',
                compatibility_tags: 'ambitious, driven, motivated'
            }
        ];
        const aiProfiles = [];
        for (const data of aiProfilesData) {
            const aiProfile = new AIProfile_1.AIProfile();
            aiProfile.name = data.name;
            aiProfile.personality = data.personality;
            aiProfile.description = data.description;
            aiProfile.hobbies = data.hobbies;
            aiProfile.model_type = data.model_type;
            aiProfile.compatibility_tags = data.compatibility_tags;
            aiProfile.user = null; // Generated AI profiles don't belong to a user
            yield db_1.AppDataSource.manager.save(aiProfile);
            aiProfiles.push(aiProfile);
        }
        // Create 3 matches
        const matchesData = [
            { user, aiProfile: aiProfiles[0] }, // User and Alex
            { user, aiProfile: aiProfiles[1] }, // User and Jordan
            { user, aiProfile: aiProfiles[2] } // User and Taylor
        ];
        const matches = [];
        for (const data of matchesData) {
            const match = new Match_1.Match();
            match.user = data.user;
            match.aiProfile = data.aiProfile;
            yield db_1.AppDataSource.manager.save(match);
            matches.push(match);
        }
        // Create threads and messages for each match
        const messagesData = [
            [
                { isUser: true, text: 'Hi! Nice to meet you.' },
                { isUser: false, text: 'Hello! I\'m excited to chat.' },
                { isUser: true, text: 'What do you like to do?' },
                { isUser: false, text: 'I love chatting and learning new things!' }
            ],
            [
                { isUser: false, text: 'Hey there! How are you?' },
                { isUser: true, text: 'I\'m good, thanks! You?' },
                { isUser: false, text: 'Great! Let\'s talk about hobbies.' },
                { isUser: true, text: 'Sounds fun!' }
            ],
            [
                { isUser: true, text: 'Hello!' },
                { isUser: false, text: 'Hi! Nice to meet you.' },
                { isUser: true, text: 'What are your interests?' },
                { isUser: false, text: 'I enjoy conversations and helping people.' }
            ]
        ];
        for (let i = 0; i < matches.length; i++) {
            const thread = new Thread_1.Thread();
            thread.match = matches[i];
            yield db_1.AppDataSource.manager.save(thread);
            for (const msgData of messagesData[i]) {
                const message = new Message_1.Message();
                message.thread = thread;
                if (msgData.isUser) {
                    message.user = user;
                    message.aiProfile = null;
                }
                else {
                    message.user = null;
                    message.aiProfile = matches[i].aiProfile;
                }
                message.message_text = msgData.text;
                message.timestamp = new Date();
                yield db_1.AppDataSource.manager.save(message);
            }
        }
        console.log('Seeding completed successfully!');
        yield db_1.AppDataSource.destroy();
    });
}
seed().catch(console.error);
