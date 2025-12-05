import { Router } from 'express';
import { AppDataSource } from '../db';
import { Match } from '../entities/Match';
import { AIProfile } from '../entities/AIProfile';
import { Thread } from '../entities/Thread';
import { Message } from '../entities/Message';
import { User } from '../entities/User';
import { auth } from '../middleware/auth';
import { faker } from '@faker-js/faker';
import { Not } from 'typeorm';

const router = Router();

router.use(auth);

router.get('/', async (req, res) => {
  const userId = (req as any).user.id;
  const user = (req as any).user;
  const matches = await AppDataSource.manager.find(Match, {
    where: [
      { ai1: { user: { id: userId } } },
      { ai2: { user: { id: userId } } },
      { user: { id: userId } }
    ],
    relations: ['ai1', 'ai2', 'threads']
  });
  const formattedMatches = matches.map(match => {
    const aiProfile = match.ai1.user?.id === userId ? match.ai2 : match.ai1;
    return {
      id: match.id,
      threadId: match.threads[0]?.id,
      user: { id: user.id, username: user.name },
      aiProfile,
      ai1: match.ai1,
      ai2: match.ai2
    };
  });
  res.json(formattedMatches);
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    // If id is not a number, treat it as aiId for compatibility matching
    const aiId = id;
    const aiProfile = await AppDataSource.manager.findOne(AIProfile, { where: { id: aiId } });
    if (!aiProfile) return res.status(404).json({ message: 'AI Profile not found' });

    const allAIProfiles = await AppDataSource.manager.find(AIProfile, { where: { id: Not(aiId) } });

    const targetTags = aiProfile.compatibility_tags ? aiProfile.compatibility_tags.split(',').map(tag => tag.trim()) : [];

    const matches = allAIProfiles.map(other => {
      const otherTags = other.compatibility_tags ? other.compatibility_tags.split(',').map(tag => tag.trim()) : [];
      const sharedTags = targetTags.filter(tag => otherTags.includes(tag)).length;
      return {
        match: {
          id: Date.now() + Math.random(), // fake id
          ai1: aiProfile,
          ai2: other
        },
        sharedTags
      };
    }).filter(m => m.sharedTags > 0).sort((a, b) => b.sharedTags - a.sharedTags);

    res.json(matches);
  } else {
    // If id is a number, treat it as matchId
    const match = await AppDataSource.manager.findOne(Match, {
      where: { id },
      relations: ['ai1', 'ai2', 'threads']
    });
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json(match);
  }
});

router.post('/', async (req, res) => {
  try {
    const { ai1Id, ai2Id } = req.body;
    const userId = (req as any).user.id;
    const user = (req as any).user;

    console.log('Creating match with ai1Id:', ai1Id, 'ai2Id:', ai2Id, 'userId:', userId);

    const ai1 = await AppDataSource.manager.findOne(AIProfile, { where: { id: ai1Id } });
    if (!ai1) {
      console.error('AI profile 1 not found:', ai1Id);
      return res.status(404).json({ message: 'AI profile 1 not found' });
    }

    const ai2 = await AppDataSource.manager.findOne(AIProfile, { where: { id: ai2Id } });
    if (!ai2) {
      console.error('AI profile 2 not found:', ai2Id);
      return res.status(404).json({ message: 'AI profile 2 not found' });
    }

    // Check if match already exists
    const existingMatch = await AppDataSource.manager.findOne(Match, {
      where: [
        { ai1: { id: ai1Id }, ai2: { id: ai2Id } },
        { ai1: { id: ai2Id }, ai2: { id: ai1Id } }
      ]
    });
    if (existingMatch) {
      console.log('Match already exists');
      return res.status(409).json({ message: 'Match already exists' });
    }

    // Create match
    const match = AppDataSource.manager.create(Match, { ai1, ai2, user });
    const savedMatch = await AppDataSource.manager.save(match);
    console.log('Match created:', savedMatch.id);

    // Create thread
    const thread = AppDataSource.manager.create(Thread, { match: savedMatch });
    const savedThread = await AppDataSource.manager.save(thread);
    console.log('Thread created:', savedThread.id);

    // Generate fake message history
    const messages = [];
    for (let i = 0; i < faker.number.int({ min: 5, max: 10 }); i++) {
      const isAi1Message = faker.datatype.boolean();
      const message = AppDataSource.manager.create(Message, {
        thread: savedThread,
        user: null,
        aiProfile: isAi1Message ? ai1 : ai2,
        message_text: faker.lorem.sentence(),
        timestamp: faker.date.recent({ days: 7 })
      });
      messages.push(message);
    }
    await AppDataSource.manager.save(messages);
    console.log('Messages created:', messages.length);

    res.status(201).json(savedMatch);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ message: 'Failed to create match', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid match ID' });
  }

  const match = await AppDataSource.manager.findOne(Match, {
    where: { id },
    relations: ['threads', 'threads.messages']
  });
  if (!match) {
    return res.status(404).json({ message: 'Match not found' });
  }

  // Delete associated messages and threads
  if (match.threads) {
    for (const thread of match.threads) {
      if (thread.messages) {
        await AppDataSource.manager.delete(Message, { thread: { id: thread.id } });
      }
      await AppDataSource.manager.delete(Thread, { id: thread.id });
    }
  }

  await AppDataSource.manager.delete(Match, { id });
  res.json({ message: 'Match deleted successfully' });
});

export default router;
