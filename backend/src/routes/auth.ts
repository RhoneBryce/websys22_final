// src/routes/auth.ts
import { Router } from 'express';
import { supabase } from '../supabaseClient';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: String(password),
      options: {
        data: {
          name: name
        }
        
      }
    });

    if (error) {
      console.error('Supabase registration error:', error);
      return res.status(400).json({ message: error.message });
    }

    
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          name: name,
          email: trimmedEmail,
          password: password 
        });

      if (profileError) {
        console.error('User profile creation error:', profileError);
        
      }
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: data.user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: (error as any).message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(),
      password: String(password)
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      message: 'Logged in successfully',
      user: {
        id: data.user.id,
        name: profile?.name || data.user.user_metadata?.name,
        email: data.user.email,
        type: 'user'
      },
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});


router.post('/ai-login', async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: 'Name and password are required' });
    }

    
    const { data: aiProfile, error } = await supabase
      .from('ai_profiles')
      .select('*')
      .eq('name', name) 
      .single();

    if (error || !aiProfile) {
      return res.status(401).json({ message: 'Invalid AI login' });
    }

    
    if (aiProfile.password !== password) {
      return res.status(401).json({ message: 'Invalid AI login' });
    }

    res.json({
      message: 'AI logged in successfully',
      user: {
        id: aiProfile.id,
        name: aiProfile.name,
        type: 'ai'
      }
    });
  } catch (error) {
    console.error('AI login error:', error);
    res.status(500).json({ message: 'AI login failed' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

router.get('/status', async (req, res) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    res.json({
      id: session.user.id,
      name: profile?.name || session.user.user_metadata?.name,
      email: session.user.email,
      type: 'user'
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ message: 'Status check failed' });
  }
});

export default router;
