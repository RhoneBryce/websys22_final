import { Router } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../db';
import { User } from '../entities/User';

const router = Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = AppDataSource.manager.create(User, { name, email, password: hashedPassword });
  await AppDataSource.manager.save(user);
  res.status(201).json({ message: 'User registered' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await AppDataSource.manager.findOne(User, { where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  (req.session as any).userId = user.id;
  res.json({ message: 'Logged in' });
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

export default router;
