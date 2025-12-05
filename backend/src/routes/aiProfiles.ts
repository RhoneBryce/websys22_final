import { Router } from 'express';
import { AppDataSource } from '../db';
import { AIProfile } from '../entities/AIProfile';
import { User } from '../entities/User';
import { Match } from '../entities/Match';
import { auth } from '../middleware/auth';

const router = Router();

router.use(auth);

router.get('/', async (req, res) => {
  const userId = (req as any).user.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const [aiProfiles, total] = await AppDataSource.manager.findAndCount(AIProfile, {
    where: { user: { id: userId } },
    skip: offset,
    take: limit
  });

  res.json({
    data: aiProfiles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

router.get('/global', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const [aiProfiles, total] = await AppDataSource.manager.findAndCount(AIProfile, {
    where: { user: null },
    skip: offset,
    take: limit
  });

  res.json({
    data: aiProfiles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

router.post('/', async (req, res) => {
  const userId = (req as any).user.id;
  const user = await AppDataSource.manager.findOne(User, { where: { id: userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const aiProfile = AppDataSource.manager.create(AIProfile, { ...req.body, user });
  await AppDataSource.manager.save(aiProfile);
  res.status(201).json(aiProfile);
});

router.put('/:id', async (req, res) => {
  const userId = (req as any).user.id;
  const aiProfile = await AppDataSource.manager.findOne(AIProfile, { where: { id: parseInt(req.params.id), user: { id: userId } } });
  if (!aiProfile) return res.status(404).json({ message: 'AI Profile not found' });
  Object.assign(aiProfile, req.body);
  await AppDataSource.manager.save(aiProfile);
  res.json(aiProfile);
});

router.delete('/:id', async (req, res) => {
  const aiProfile = await AppDataSource.manager.findOne(AIProfile, { where: { id: parseInt(req.params.id) } });
  if (!aiProfile) return res.status(404).json({ message: 'AI Profile not found' });
  // Delete associated matches
  await AppDataSource.manager.delete(Match, [
    { ai1: { id: aiProfile.id } },
    { ai2: { id: aiProfile.id } }
  ]);
  await AppDataSource.manager.remove(aiProfile);
  res.json({ message: 'AI Profile deleted' });
});

export default router;
