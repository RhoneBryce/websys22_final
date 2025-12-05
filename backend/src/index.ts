import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

// Session-based authentication implemented

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import passport from './passport';

import { AppDataSource } from './db';
import authRoutes from './routes/auth';
import aiProfileRoutes from './routes/aiProfiles';
import matchRoutes from './routes/matches';
import threadRoutes from'./routes/threads';
import messageRoutes from './routes/messages';
import groupRoutes from './routes/groups';

const app = express();
const PORT = process.env.PORT || 4200;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, 
    sameSite: 'lax'
  }
}));
app.use((passport as any).initialize());
app.use((passport as any).session());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'AI Platform API is running' });
});

app.use('/auth', authRoutes);
app.use('/ai-profiles', aiProfileRoutes);
app.use('/matches', matchRoutes);
app.use('/threads', threadRoutes);
app.use('/messages', messageRoutes);
app.use('/groups', groupRoutes);

AppDataSource.initialize().then(() => {
  console.log('Database connected');
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}).catch(error => console.log(error));
