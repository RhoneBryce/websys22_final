import { Router } from 'express';
import { AppDataSource } from '../db';
import { Match } from '../entities/Match';
import { AIProfile } from '../entities/AIProfile';
import { auth } from '../middleware/auth';

const router = Router();

router.use(auth);

router.get('/', async (req, res) => {
  const userId = (req as any).user.id;
  const matches = await AppDataSource.manager.find(Match, {
    where: { ai1: { user: { id: userId } } },
    relations: ['ai1', 'ai2']
  });
  res.json(matches);
});

router.post('/', async (req, res) => {
  const { ai1Id, ai2Id } = req.body;
  const userId = (req as any).user.id;
  const ai1 = await AppDataSource.manager.findOne(AIProfile, { where: { id: ai1Id, user: { id: userId } } });
  const ai2 = await AppDataSource.manager.findOne(AIProfile, { where: { id: ai2Id, user: { id: userId } } });
  if (!ai1 || !ai2) return res.status(404).json({ message: 'AI Profile not found' });
  const match = AppDataSource.manager.create(Match, { ai1, ai2 });
  await AppDataSource.manager.save(match);
  res.status(201).json(match);
});

router.get('/:aiId', async (req, res) => {
  const { aiId } = req.params;
  const userId = (req as any).user.id;
  const aiProfile = await AppDataSource.manager.findOne(AIProfile, { where: { id: parseInt(aiId), user: { id: userId } } });
  if (!aiProfile) return res.status(404).json({ message: 'AI Profile not found' });

  const allProfiles = await AppDataSource.manager.find(AIProfile, { where: { user: { id: userId } } });
  const otherProfiles = allProfiles.filter(p => p.id !== aiProfile.id);

  const tags1 = aiProfile.compatibility_tags ? aiProfile.compatibility_tags.split(',').map(t => t.trim()) : [];
  const compatible = otherProfiles.map(p => {
    const tags2 = p.compatibility_tags ? p.compatibility_tags.split(',').map(t => t.trim()) : [];
    const shared = tags1.filter(t => tags2.includes(t)).length;
    return { profile: p, shared };
  }).sort((a, b) => b.shared - a.shared).slice(0, 5);

  const matches = [];
  for (const comp of compatible) {
    let match = await AppDataSource.manager.findOne(Match, {
      where: [
        { ai1: { id: aiProfile.id }, ai2: { id: comp.profile.id } },
        { ai1: { id: comp.profile.id }, ai2: { id: aiProfile.id } }
      ]
    });
    if (!match) {
      match = AppDataSource.manager.create(Match, { ai1: aiProfile, ai2: comp.profile });
      await AppDataSource.manager.save(match);
    }
    matches.push({ match, sharedTags: comp.shared });
  }

  res.json(matches);
});

export default router;
