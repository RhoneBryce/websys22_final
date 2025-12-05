import { Router } from 'express';
import { AppDataSource } from '../db';
import { Message } from '../entities/Message';
import { Thread } from '../entities/Thread';
import { AIProfile } from '../entities/AIProfile';
import { auth } from '../middleware/auth';

const router = Router();

router.use(auth);

router.get('/:threadId', async (req, res) => {
  const messages = await AppDataSource.manager.find(Message, {
    where: { thread: { id: parseInt(req.params.threadId) } },
    relations: ['user', 'aiProfile', 'thread', 'thread.match', 'thread.match.ai1', 'thread.match.ai2'],
    order: { timestamp: 'ASC' }
  });
  res.json(messages);
});



router.post('/:threadId', async (req, res) => {
  const { message_text } = req.body;
  const userId = (req as any).user.id;
  const user = (req as any).user;
  const thread = await AppDataSource.manager.findOne(Thread, { where: { id: parseInt(req.params.threadId) } });
  if (!thread) return res.status(404).json({ message: 'Thread not found' });
  const message = AppDataSource.manager.create(Message, { thread, user, aiProfile: null, message_text });
  await AppDataSource.manager.save(message);
  res.status(201).json(message);
});

export default router;
