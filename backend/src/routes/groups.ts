import { Router } from 'express';
import { AppDataSource } from '../db';
import { Group } from '../entities/Group';
import { GroupMember } from '../entities/GroupMember';
import { AIProfile } from '../entities/AIProfile';
import { auth } from '../middleware/auth';

const router = Router();

router.use(auth);

router.get('/', async (req, res) => {
  const groups = await AppDataSource.manager.find(Group, { relations: ['members', 'members.ai'] });
  res.json(groups);
});

router.post('/', async (req, res) => {
  const { name, description } = req.body;
  const group = AppDataSource.manager.create(Group, { name, description });
  await AppDataSource.manager.save(group);
  res.status(201).json(group);
});

router.post('/:id/members', async (req, res) => {
  const { aiId } = req.body;
  const userId = (req as any).user.id;
  const group = await AppDataSource.manager.findOne(Group, { where: { id: parseInt(req.params.id) } });
  const ai = await AppDataSource.manager.findOne(AIProfile, { where: { id: aiId, user: { id: userId } } });
  if (!group || !ai) return res.status(404).json({ message: 'Group or AI Profile not found' });
  const member = AppDataSource.manager.create(GroupMember, { group, ai });
  await AppDataSource.manager.save(member);
  res.status(201).json(member);
});

router.delete('/:id', async (req, res) => {
  const group = await AppDataSource.manager.findOne(Group, { where: { id: parseInt(req.params.id) } });
  if (!group) return res.status(404).json({ message: 'Group not found' });
  await AppDataSource.manager.remove(group);
  res.json({ message: 'Group deleted' });
});

export default router;
