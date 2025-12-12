// src/routes/matches.ts
import { Router } from 'express';
import { supabase } from '../supabaseClient';
import { faker } from '@faker-js/faker';

const router = Router();



router.get('/', async (req, res) => {
  try {
    
    const { data: matches, error } = await supabase
      .from('matches')
      .select('id, ai1_id, ai2_id, threads(id, match_id)');

    if (error) {
      throw error;
    }

    const allAiIds = new Set<number>();
    (matches || []).forEach(m => {
      allAiIds.add(m.ai1_id);
      allAiIds.add(m.ai2_id);
    });

    const { data: aiProfiles } = await supabase
      .from('ai_profiles')
      .select('*')
      .in('id', Array.from(allAiIds));

    const aiProfileMap = new Map(aiProfiles?.map(p => [p.id, p]) || []);

    const formattedMatches = (matches || []).map(match => ({
      id: match.id,
      threadId: match.threads?.[0]?.id ?? null,
      threads: match.threads,
      ai1: aiProfileMap.get(match.ai1_id),
      ai2: aiProfileMap.get(match.ai2_id)
    }));

    res.json(formattedMatches);
  } catch (err) {
    console.error('Get matches error:', err);
    res.status(500).json({ message: 'Failed to get matches', error: (err as any).message });
  }
});


router.get('/for-ai/:aiId', async (req, res) => {
  try {
    const aiId = parseInt(req.params.aiId, 10);
    if (isNaN(aiId)) return res.status(400).json({ message: 'Invalid aiId' });


    const { data: matches, error } = await supabase
      .from('matches')
      .select('id, ai1_id, ai2_id, threads(id, match_id)')
      .or(`ai1_id.eq.${aiId},ai2_id.eq.${aiId}`);

    if (error) {
      throw error;
    }


    const allIds = new Set<number>();
    (matches || []).forEach(m => {
      allIds.add(m.ai1_id);
      allIds.add(m.ai2_id);
    });

    const { data: aiProfiles } = await supabase
      .from('ai_profiles')
      .select('*')
      .in('id', Array.from(allIds));

    const profileMap = new Map(aiProfiles?.map(p => [p.id, p]) || []);

    const result = (matches || []).map(m => {
      const partner = m.ai1_id === aiId ? profileMap.get(m.ai2_id) : profileMap.get(m.ai1_id);
      return {
        matchId: m.id,
        partner,
        ai1: profileMap.get(m.ai1_id),
        ai2: profileMap.get(m.ai2_id),
        threadId: m.threads?.[0]?.id ?? null
      };
    });

    return res.json(result);
  } catch (err) {
    console.error('Get matches for ai error:', err);
    return res.status(500).json({ message: 'Failed to fetch matches', error: (err as any).message });
  }
});


router.get('/ai/:aiId', async (req, res) => {
  try {
    const aiId = parseInt(req.params.aiId, 10);
    if (isNaN(aiId)) return res.status(400).json({ message: 'Invalid aiId' });

  
    const { data: aiProfile, error: profileError } = await supabase
      .from('ai_profiles')
      .select('*')
      .eq('id', aiId)
      .single();

    if (profileError || !aiProfile) {
      return res.status(404).json({ message: 'AI Profile not found' });
    }

    const { data: allAIProfiles, error: profilesError } = await supabase
      .from('ai_profiles')
      .select('*')
      .neq('id', aiId);

    if (profilesError) {
      throw profilesError;
    }

    const targetTags = aiProfile.compatibility_tags ? aiProfile.compatibility_tags.split(',').map(t => t.trim()) : [];

    const matches = (allAIProfiles || []).map(other => {
      const otherTags = other.compatibility_tags ? other.compatibility_tags.split(',').map(t => t.trim()) : [];
      const sharedTags = targetTags.filter(tag => otherTags.includes(tag)).length;
      return {
        match: {
          tempId: Date.now() + Math.random(),
          ai1: aiProfile,
          ai2: other
        },
        sharedTags
      };
    }).filter(m => m.sharedTags > 0).sort((a, b) => b.sharedTags - a.sharedTags);

    res.json(matches);
  } catch (err) {
    console.error('AI compatibility error:', err);
    res.status(500).json({ message: 'Failed to compute compatibility', error: (err as any).message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid match ID' });

  
    const { data: match, error } = await supabase
      .from('matches')
      .select('id, ai1_id, ai2_id, threads(id, match_id)')
      .eq('id', id)
      .single();

    if (error || !match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    
    const { data: aiProfiles } = await supabase
      .from('ai_profiles')
      .select('*')
      .in('id', [match.ai1_id, match.ai2_id]);

    const profileMap = new Map(aiProfiles?.map(p => [p.id, p]) || []);

  
    let threads = match.threads || [];
    if (!match.threads || match.threads.length === 0) {
      const { data: newThread, error: threadError } = await supabase
        .from('threads')
        .insert([{ match_id: id }])
        .select()
        .single();

      if (threadError) {
        console.error('Error creating thread:', threadError);
      } else if (newThread) {
        threads = [newThread];
      }
    }

  
    const matchData = {
      id: match.id,
      ai1: profileMap.get(match.ai1_id),
      ai2: profileMap.get(match.ai2_id),
      threads: threads
    };

    res.json(matchData);
  } catch (err) {
    console.error('Get match error:', err);
    res.status(500).json({ message: 'Failed to get match', error: (err as any).message });
  }
});


router.post('/', async (req, res) => {
  try {
    const { ai1Id, ai2Id } = req.body;
  
   

    if (!ai1Id || !ai2Id) {
      return res.status(400).json({ message: 'ai1Id and ai2Id required' });
    }

    
    if (ai1Id === ai2Id) {
      return res.status(400).json({ message: 'Cannot match an AI profile with itself' });
    }

  
    const { data: ai1, error: ai1Error } = await supabase
      .from('ai_profiles')
      .select('*')
      .eq('id', ai1Id)
      .single();

    const { data: ai2, error: ai2Error } = await supabase
      .from('ai_profiles')
      .select('*')
      .eq('id', ai2Id)
      .single();

    if (ai1Error || !ai1) {
      return res.status(404).json({ message: 'AI profile 1 not found' });
    }
    if (ai2Error || !ai2) {
      return res.status(404).json({ message: 'AI profile 2 not found' });
    }

  
    const { data: existingMatch, error: matchError } = await supabase
      .from('matches')
      .select(`
        id,
        ai1_id,
        ai2_id,
        threads (
          id,
          match_id
        )
      `)
      .or(`and(ai1_id.eq.${ai1Id},ai2_id.eq.${ai2Id}),and(ai1_id.eq.${ai2Id},ai2_id.eq.${ai1Id})`)
      .single();

    if (existingMatch && !matchError) {
    
      if (!existingMatch.threads || existingMatch.threads.length === 0) {
        await supabase
          .from('threads')
          .insert([{ match_id: existingMatch.id }]);
      }
      return res.status(200).json(existingMatch);
    }

    const { data: newMatch, error: createError } = await supabase
      .from('matches')
      .insert([{
        ai1_id: ai1Id,
        ai2_id: ai2Id
   
      }])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

 
    const { data: newThread, error: threadError } = await supabase
      .from('threads')
      .insert([{ match_id: newMatch.id }])
      .select()
      .single();

    if (threadError) {
      console.error('Error creating thread:', threadError);
    }

    
    const conversationStarters = [
      `Hi there! I'm ${ai1.name}. ${ai1.personality}. Nice to meet you!`,
      `Hey! I'm ${ai1.name}. How are you doing today?`
    ];

    const conversationResponses = [
      `Nice to meet you too! I'm ${ai2.name}, and I'm ${ai2.personality}. How about you?`,
      `Hey ${ai1.name}! I'm ${ai2.name}. ${ai2.personality}. Glad to meet you!`
    ];

 
    await supabase
      .from('messages')
      .insert([
        {
          thread_id: newThread.id,
          sender_ai_id: ai1Id,
          message_text: conversationStarters[Math.floor(Math.random() * conversationStarters.length)],
          created_at: new Date().toISOString()
        },
        {
          thread_id: newThread.id,
          sender_ai_id: ai2Id,
          message_text: conversationResponses[Math.floor(Math.random() * conversationResponses.length)],
          created_at: new Date().toISOString()
        }
      ]);

    res.status(201).json({
      id: newMatch.id,
      ai1,
      ai2,
      threads: [newThread]
    });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ message: 'Failed to create match', error: (error as any).message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid match ID' });

    
    const { data: threads, error: threadsError } = await supabase
      .from('threads')
      .select('id')
      .eq('match_id', id);

    if (threadsError) {
      throw threadsError;
    }

 
    if (threads && threads.length > 0) {
      const threadIds = threads.map(t => t.id);
      await supabase
        .from('messages')
        .delete()
        .in('thread_id', threadIds);

      await supabase
        .from('threads')
        .delete()
        .eq('match_id', id);
    }


    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    res.json({ message: 'Match deleted successfully' });
  } catch (err) {
    console.error('Delete match error:', err);
    res.status(500).json({ message: 'Failed to delete match', error: (err as any).message });
  }
});

export default router;
