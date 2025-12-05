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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const Match_1 = require("../entities/Match");
const AIProfile_1 = require("../entities/AIProfile");
const Thread_1 = require("../entities/Thread");
const Message_1 = require("../entities/Message");
const User_1 = require("../entities/User");
const auth_1 = require("../middleware/auth");
const faker_1 = require("@faker-js/faker");
const router = (0, express_1.Router)();
router.use(auth_1.auth);
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const matches = yield db_1.AppDataSource.manager.find(Match_1.Match, {
        where: { user: { id: userId } },
        relations: ['user', 'aiProfile']
    });
    res.json(matches);
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const user = yield db_1.AppDataSource.manager.findOne(User_1.User, { where: { id: userId } });
    if (!user)
        return res.status(404).json({ message: 'User not found' });
    // Generate AI profile using Faker
    const aiProfile = db_1.AppDataSource.manager.create(AIProfile_1.AIProfile, {
        name: faker_1.faker.person.fullName(),
        personality: faker_1.faker.helpers.arrayElement(['Friendly', 'Shy', 'Outgoing', 'Introverted', 'Adventurous']),
        description: faker_1.faker.lorem.sentence(),
        hobbies: faker_1.faker.helpers.arrayElement(['Reading', 'Sports', 'Music', 'Travel', 'Cooking']),
        model_type: faker_1.faker.helpers.arrayElement(['GPT', 'Claude', 'Gemini']),
        compatibility_tags: faker_1.faker.lorem.words(3),
        user: null // Generated AI profiles don't belong to a user
    });
    yield db_1.AppDataSource.manager.save(aiProfile);
    // Create match
    const match = db_1.AppDataSource.manager.create(Match_1.Match, { user, aiProfile });
    yield db_1.AppDataSource.manager.save(match);
    // Create thread
    const thread = db_1.AppDataSource.manager.create(Thread_1.Thread, { match });
    yield db_1.AppDataSource.manager.save(thread);
    // Generate fake message history
    const messages = [];
    for (let i = 0; i < faker_1.faker.number.int({ min: 5, max: 10 }); i++) {
        const isUserMessage = faker_1.faker.datatype.boolean();
        const message = db_1.AppDataSource.manager.create(Message_1.Message, {
            thread,
            user: isUserMessage ? user : null,
            aiProfile: isUserMessage ? null : aiProfile,
            message_text: faker_1.faker.lorem.sentence(),
            timestamp: faker_1.faker.date.recent({ days: 7 })
        });
        messages.push(message);
    }
    yield db_1.AppDataSource.manager.save(messages);
    res.status(201).json(match);
}));
exports.default = router;
