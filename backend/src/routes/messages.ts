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
    relations: ['sender'],
    order: { timestamp: 'ASC' }
  });
  res.json(messages);
});

router.post('/:threadId', async (req, res) => {
  const { senderId, message_text } = req.body;
  const userId = (req as any).user.id;
  const thread = await AppDataSource.manager.findOne(Thread, { where: { id: parseInt(req.params.threadId) } });
  const sender = await AppDataSource.manager.findOne(AIProfile, { where: { id: senderId, user: { id: userId } } });
  if (!thread || !sender) return res.status(404).json({ message: 'Thread or AI Profile not found' });
  const message = AppDataSource.manager.create(Message, { thread, sender, message_text });
  await AppDataSource.manager.save(message);
  res.status(201).json(message);
});

export default router;
