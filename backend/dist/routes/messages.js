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
const Message_1 = require("../entities/Message");
const Thread_1 = require("../entities/Thread");
const AIProfile_1 = require("../entities/AIProfile");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.auth);
router.get('/:threadId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = yield db_1.AppDataSource.manager.find(Message_1.Message, {
        where: { thread: { id: parseInt(req.params.threadId) } },
        relations: ['sender'],
        order: { timestamp: 'ASC' }
    });
    res.json(messages);
}));
router.post('/:threadId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, message_text } = req.body;
    const userId = req.user.id;
    const thread = yield db_1.AppDataSource.manager.findOne(Thread_1.Thread, { where: { id: parseInt(req.params.threadId) } });
    const sender = yield db_1.AppDataSource.manager.findOne(AIProfile_1.AIProfile, { where: { id: senderId, user: { id: userId } } });
    if (!thread || !sender)
        return res.status(404).json({ message: 'Thread or AI Profile not found' });
    const message = db_1.AppDataSource.manager.create(Message_1.Message, { thread, sender, message_text });
    yield db_1.AppDataSource.manager.save(message);
    res.status(201).json(message);
}));
exports.default = router;
