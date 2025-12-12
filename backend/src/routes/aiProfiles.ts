
import { Router } from 'express';
import { supabase } from '../supabaseClient';

const router = Router();



router.get('/', async (req, res) => {
  try {
  
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { data: aiProfiles, error, count } = await supabase
      .from('ai_profiles')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      data: aiProfiles || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (err) {
    console.error('Get AIProfiles error:', err);
    res.status(500).json({ message: 'Failed to fetch AI profiles', error: (err as any).message });
  }
});



router.post('/', async (req, res) => {
  try {
    
    const payload: any = { ...req.body };
    if (!payload.password && payload.name && typeof payload.name === 'string') {
      const firstName = payload.name.trim().split(/\s+/)[0] || '';
      payload.password = firstName;
    }

    const { data, error } = await supabase
      .from('ai_profiles')
      .insert([payload])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Create AIProfile error:', err);
    res.status(500).json({ message: 'Failed to create AI profile', error: (err as any).message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    
    const { data, error } = await supabase
      .from('ai_profiles')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: 'AI Profile not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('Update AIProfile error:', err);
    res.status(500).json({ message: 'Failed to update AI profile', error: (err as any).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    
    const { error: matchError } = await supabase
      .from('matches')
      .delete()
      .or(`ai1_id.eq.${req.params.id},ai2_id.eq.${req.params.id}`);

    if (matchError) {
      throw matchError;
    }

    
    const { error: profileError } = await supabase
      .from('ai_profiles')
      .delete()
      .eq('id', req.params.id);

    if (profileError) {
      throw profileError;
    }

    res.json({ message: 'AI Profile deleted' });
  } catch (err) {
    console.error('Delete AIProfile error:', err);
    res.status(500).json({ message: 'Failed to delete AI profile', error: (err as any).message });
  }
});

export default router;
