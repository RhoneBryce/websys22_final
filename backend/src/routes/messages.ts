// src/routes/messages.ts
import { Router } from 'express';
import { supabase } from '../supabaseClient';

const router = Router();


router.get('/:threadId', async (req, res) => {
  try {
    const threadId = parseInt(req.params.threadId, 10);
    if (isNaN(threadId)) return res.status(400).json({ message: 'Invalid threadId' });


    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .select('id, match_id, matches(id, ai1_id, ai2_id)')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    
    const match = (thread as any).matches?.[0];
    if (!match) {
      return res.status(404).json({ message: 'Match not found for thread' });
    }

  
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, thread_id, sender_ai_id, message_text, created_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    
    const { data: aiProfiles, error: aiError } = await supabase
      .from('ai_profiles')
      .select('id, name, personality, description, hobbies, model_type, compatibility_tags')
      .in('id', [match.ai1_id, match.ai2_id]);

    const aiProfileMap = new Map(aiProfiles?.map(p => [p.id, p]) || []);

 
    const formattedMessages = (messages || []).map((msg: any) => ({
      id: msg.id,
      thread_id: msg.thread_id,
      sender_ai_id: msg.sender_ai_id,
      message_text: msg.message_text,
      timestamp: msg.created_at,
      aiProfile: aiProfileMap.get(msg.sender_ai_id) || null,
      thread: {
        id: thread.id,
        match: {
          id: match.id,
          ai1: aiProfileMap.get(match.ai1_id),
          ai2: aiProfileMap.get(match.ai2_id)
        }
      }
    }));

    res.json(formattedMessages);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Failed to fetch messages', error: (err as any).message });
  }
});


router.post('/:threadId', async (req, res) => {
  try {
    const threadId = parseInt(req.params.threadId, 10);
    if (isNaN(threadId)) return res.status(400).json({ message: 'Invalid threadId' });

    const { message_text } = req.body;
    if (!message_text) return res.status(400).json({ message: 'message_text is required' });

   
  
    return res.status(403).json({ message: 'Posting messages as a human is not supported by current DB schema' });
  } catch (err) {
    console.error('Post message error:', err);
    res.status(500).json({ message: 'Failed to post message', error: (err as any).message });
  }
});

export default router;
