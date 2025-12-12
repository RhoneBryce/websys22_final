import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import aiProfileRoutes from './routes/aiProfiles';
import matchRoutes from './routes/matches';
import threadRoutes from'./routes/threads';
import messageRoutes from './routes/messages';

const app = express();
const PORT = process.env.PORT || 4200;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'AI Platform API is running with Supabase' });
});

app.use('/auth', authRoutes);
app.use('/ai-profiles', aiProfileRoutes);
app.use('/matches', matchRoutes);
app.use('/threads', threadRoutes);
app.use('/messages', messageRoutes);

// Start server directly (Supabase handles database connection)
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Connected to Supabase database');
});
