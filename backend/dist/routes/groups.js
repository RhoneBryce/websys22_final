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
const Group_1 = require("../entities/Group");
const GroupMember_1 = require("../entities/GroupMember");
const AIProfile_1 = require("../entities/AIProfile");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.auth);
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groups = yield db_1.AppDataSource.manager.find(Group_1.Group, { relations: ['members', 'members.ai'] });
    res.json(groups);
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description } = req.body;
    const group = db_1.AppDataSource.manager.create(Group_1.Group, { name, description });
    yield db_1.AppDataSource.manager.save(group);
    res.status(201).json(group);
}));
router.post('/:id/members', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { aiId } = req.body;
    const userId = req.user.id;
    const group = yield db_1.AppDataSource.manager.findOne(Group_1.Group, { where: { id: parseInt(req.params.id) } });
    const ai = yield db_1.AppDataSource.manager.findOne(AIProfile_1.AIProfile, { where: { id: aiId, user: { id: userId } } });
    if (!group || !ai)
        return res.status(404).json({ message: 'Group or AI Profile not found' });
    const member = db_1.AppDataSource.manager.create(GroupMember_1.GroupMember, { group, ai });
    yield db_1.AppDataSource.manager.save(member);
    res.status(201).json(member);
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const group = yield db_1.AppDataSource.manager.findOne(Group_1.Group, { where: { id: parseInt(req.params.id) } });
    if (!group)
        return res.status(404).json({ message: 'Group not found' });
    yield db_1.AppDataSource.manager.remove(group);
    res.json({ message: 'Group deleted' });
}));
exports.default = router;
