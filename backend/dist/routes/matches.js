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
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.auth);
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const matches = yield db_1.AppDataSource.manager.find(Match_1.Match, {
        where: { ai1: { user: { id: userId } } },
        relations: ['ai1', 'ai2']
    });
    res.json(matches);
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ai1Id, ai2Id } = req.body;
    const userId = req.user.id;
    const ai1 = yield db_1.AppDataSource.manager.findOne(AIProfile_1.AIProfile, { where: { id: ai1Id, user: { id: userId } } });
    const ai2 = yield db_1.AppDataSource.manager.findOne(AIProfile_1.AIProfile, { where: { id: ai2Id, user: { id: userId } } });
    if (!ai1 || !ai2)
        return res.status(404).json({ message: 'AI Profile not found' });
    const match = db_1.AppDataSource.manager.create(Match_1.Match, { ai1, ai2 });
    yield db_1.AppDataSource.manager.save(match);
    res.status(201).json(match);
}));
router.get('/:aiId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { aiId } = req.params;
    const userId = req.user.id;
    const aiProfile = yield db_1.AppDataSource.manager.findOne(AIProfile_1.AIProfile, { where: { id: parseInt(aiId), user: { id: userId } } });
    if (!aiProfile)
        return res.status(404).json({ message: 'AI Profile not found' });
    const allProfiles = yield db_1.AppDataSource.manager.find(AIProfile_1.AIProfile, { where: { user: { id: userId } } });
    const otherProfiles = allProfiles.filter(p => p.id !== aiProfile.id);
    const tags1 = aiProfile.compatibility_tags ? aiProfile.compatibility_tags.split(',').map(t => t.trim()) : [];
    const compatible = otherProfiles.map(p => {
        const tags2 = p.compatibility_tags ? p.compatibility_tags.split(',').map(t => t.trim()) : [];
        const shared = tags1.filter(t => tags2.includes(t)).length;
        return { profile: p, shared };
    }).sort((a, b) => b.shared - a.shared).slice(0, 5);
    const matches = [];
    for (const comp of compatible) {
        let match = yield db_1.AppDataSource.manager.findOne(Match_1.Match, {
            where: [
                { ai1: { id: aiProfile.id }, ai2: { id: comp.profile.id } },
                { ai1: { id: comp.profile.id }, ai2: { id: aiProfile.id } }
            ]
        });
        if (!match) {
            match = db_1.AppDataSource.manager.create(Match_1.Match, { ai1: aiProfile, ai2: comp.profile });
            yield db_1.AppDataSource.manager.save(match);
        }
        matches.push({ match, sharedTags: comp.shared });
    }
    res.json(matches);
}));
exports.default = router;
