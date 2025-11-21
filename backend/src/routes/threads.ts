import { Router } from 'express';
import { AppDataSource } from '../db';
import { Thread } from '../entities/Thread';
import { Match } from '../entities/Match';
import { Group } from '../entities/Group';
import { auth } from '../middleware/auth';

const router = Router();

router.use(auth);

router.get('/', async (req, res) => {
  const threads = await AppDataSource.manager.find(Thread, { relations: ['match', 'group'] });
  res.json(threads);
});

router.post('/', async (req, res) => {
  const { matchId, groupId } = req.body;
  let thread;
  if (matchId) {
    const match = await AppDataSource.manager.findOne(Match, { where: { id: matchId } });
    if (!match) return res.status(404).json({ message: 'Match not found' });
    thread = AppDataSource.manager.create(Thread, { match });
  } else if (groupId) {
    const group = await AppDataSource.manager.findOne(Group, { where: { id: groupId } });
    if (!group) return res.status(404).json({ message: 'Group not found' });
    thread = AppDataSource.manager.create(Thread, { group });
  } else {
    return res.status(400).json({ message: 'matchId or groupId required' });
  }
  await AppDataSource.manager.save(thread);
  res.status(201).json(thread);
});

router.delete('/:id', async (req, res) => {
  const thread = await AppDataSource.manager.findOne(Thread, { where: { id: parseInt(req.params.id) } });
  if (!thread) return res.status(404).json({ message: 'Thread not found' });
  await AppDataSource.manager.remove(thread);
  res.json({ message: 'Thread deleted' });
});

export default router;
