/// <reference path="../types/passport.d.ts" />
import { Router } from 'express';
import passport from '../passport';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../db';
import { User } from '../entities/User';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('Registration attempt:', { name, email });
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const trimmedEmail = email.trim().toLowerCase();
    const existingUser = await AppDataSource.manager.findOne(User, { where: { email: trimmedEmail } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = AppDataSource.manager.create(User, { name, email: trimmedEmail, password: hashedPassword });
    console.log('Saving user to database...');
    await AppDataSource.manager.save(user);
    console.log('User registered successfully:', user.id);
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: (error as any).message });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err: any, user: User, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Invalid credentials' });
    }
    (req as any).logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      res.json({ message: 'Logged in', user: { id: user.id, name: user.name, email: user.email } });
    });
  })(req, res, next);
});

router.post('/logout', (req, res) => {
  (req as any).logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    (req as any).session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not destroy session' });
      }
      res.json({ message: 'Logged out' });
    });
  });
});

router.get('/status', (req, res) => {
  if (!(req as any).user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const user = (req as any).user as User;
  res.json({ id: user.id, name: user.name, email: user.email });
});

export default router;

export const auth = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};
