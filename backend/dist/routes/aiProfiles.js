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
const AIProfile_1 = require("../entities/AIProfile");
const User_1 = require("../entities/User");
const Match_1 = require("../entities/Match");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.auth);
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const aiProfiles = yield db_1.AppDataSource.manager.find(AIProfile_1.AIProfile, { where: { user: { id: userId } } });
    res.json(aiProfiles);
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const user = yield db_1.AppDataSource.manager.findOne(User_1.User, { where: { id: userId } });
    if (!user)
        return res.status(404).json({ message: 'User not found' });
    const aiProfile = db_1.AppDataSource.manager.create(AIProfile_1.AIProfile, Object.assign(Object.assign({}, req.body), { user }));
    yield db_1.AppDataSource.manager.save(aiProfile);
    res.status(201).json(aiProfile);
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const aiProfile = yield db_1.AppDataSource.manager.findOne(AIProfile_1.AIProfile, { where: { id: parseInt(req.params.id), user: { id: userId } } });
    if (!aiProfile)
        return res.status(404).json({ message: 'AI Profile not found' });
    Object.assign(aiProfile, req.body);
    yield db_1.AppDataSource.manager.save(aiProfile);
    res.json(aiProfile);
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const aiProfile = yield db_1.AppDataSource.manager.findOne(AIProfile_1.AIProfile, { where: { id: parseInt(req.params.id) } });
    if (!aiProfile)
        return res.status(404).json({ message: 'AI Profile not found' });
    // Delete associated matches
    yield db_1.AppDataSource.manager.delete(Match_1.Match, [
        { ai1: { id: aiProfile.id } },
        { ai2: { id: aiProfile.id } }
    ]);
    yield db_1.AppDataSource.manager.remove(aiProfile);
    res.json({ message: 'AI Profile deleted' });
}));
exports.default = router;
