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
const Thread_1 = require("../entities/Thread");
const Match_1 = require("../entities/Match");
const Group_1 = require("../entities/Group");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.auth);
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const threads = yield db_1.AppDataSource.manager.find(Thread_1.Thread, { relations: ['match', 'group'] });
    res.json(threads);
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { matchId, groupId } = req.body;
    let thread;
    if (matchId) {
        const match = yield db_1.AppDataSource.manager.findOne(Match_1.Match, { where: { id: matchId } });
        if (!match)
            return res.status(404).json({ message: 'Match not found' });
        thread = db_1.AppDataSource.manager.create(Thread_1.Thread, { match });
    }
    else if (groupId) {
        const group = yield db_1.AppDataSource.manager.findOne(Group_1.Group, { where: { id: groupId } });
        if (!group)
            return res.status(404).json({ message: 'Group not found' });
        thread = db_1.AppDataSource.manager.create(Thread_1.Thread, { group });
    }
    else {
        return res.status(400).json({ message: 'matchId or groupId required' });
    }
    yield db_1.AppDataSource.manager.save(thread);
    res.status(201).json(thread);
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const thread = yield db_1.AppDataSource.manager.findOne(Thread_1.Thread, { where: { id: parseInt(req.params.id) } });
    if (!thread)
        return res.status(404).json({ message: 'Thread not found' });
    yield db_1.AppDataSource.manager.remove(thread);
    res.json({ message: 'Thread deleted' });
}));
exports.default = router;
