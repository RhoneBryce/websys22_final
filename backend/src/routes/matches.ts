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

  const compatible = otherProfiles.map(p => {
    let matches = 0;
    if (aiProfile.personality.toLowerCase() === p.personality.toLowerCase()) matches++;
    if (aiProfile.description.toLowerCase() === p.description.toLowerCase()) matches++;
    if ((aiProfile.hobbies || '').toLowerCase() === (p.hobbies || '').toLowerCase()) matches++;
    if ((aiProfile.model_type || '').toLowerCase() === (p.model_type || '').toLowerCase()) matches++;
    if ((aiProfile.compatibility_tags || '').toLowerCase() === (p.compatibility_tags || '').toLowerCase()) matches++;
    return { profile: p, shared: matches };
  }).filter(c => c.shared >= 2).sort((a, b) => b.shared - a.shared).slice(0, 5);

  const matches = [];
  for (const comp of compatible) {
    let match = await AppDataSource.manager.findOne(Match, {
      where: [
        { ai1: { id: aiProfile.id }, ai2: { id: comp.profile.id } },
        { ai1: { id: comp.profile.id }, ai2: { id: aiProfile.id } }
      ],
      relations: ['ai1', 'ai2']
    });
    if (!match) {
      match = AppDataSource.manager.create(Match, { ai1: aiProfile, ai2: comp.profile });
      await AppDataSource.manager.save(match);
      // Reload the match with relations
      match = await AppDataSource.manager.findOne(Match, { where: { id: match.id }, relations: ['ai1', 'ai2'] });
    }
    matches.push({ match, sharedTags: comp.shared });
  }

  res.json(matches);
});

export default router;
