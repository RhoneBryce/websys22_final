// src/routes/threads.ts
import { Router } from 'express';
import { supabase } from '../supabaseClient';
import { auth } from '../middleware/auth';

const router = Router();


router.use(auth);


router.post('/', async (req, res) => {
  try {
    const { matchId } = req.body;
    if (!matchId) return res.status(400).json({ message: 'matchId is required' });


    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const { data: existingThread, error: threadCheckError } = await supabase
      .from('threads')
      .select('id')
      .eq('match_id', matchId)
      .single();

    if (existingThread && !threadCheckError) {
      return res.status(200).json({ message: 'Thread already exists', threadId: existingThread.id });
    }


    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .insert([{ match_id: matchId }])
      .select()
      .single();

    if (threadError) {
      throw threadError;
    }

    return res.status(201).json({ message: 'Thread created', threadId: thread.id });
  } catch (err) {
    console.error('Create thread error:', err);
    return res.status(500).json({ message: 'Create thread failed', error: (err as any).message });
  }
});

export default router;
