import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface AIProfile {
  id: number;
  name: string;
  personality: string;
  description: string;
  hobbies?: string;
  model_type?: string;
  compatibility_tags?: string;
}

interface Match {
  id: number;
  ai1: AIProfile;
  ai2: AIProfile;
}

const Matches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [profiles, setProfiles] = useState<AIProfile[]>([]);
  const [ai1Id, setAi1Id] = useState('');
  const [ai2Id, setAi2Id] = useState('');

  useEffect(() => {
    fetchMatches();
    fetchProfiles();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await api.get('/matches');
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const response = await api.get('/ai-profiles');
      setProfiles(response.data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/matches', { ai1Id: parseInt(ai1Id), ai2Id: parseInt(ai2Id) });
      setAi1Id('');
      setAi2Id('');
      fetchMatches();
    } catch (error) {
      console.error('Error creating match:', error);
    }
  };

  return (
    <div>
      <h1>Matches</h1>
      <form onSubmit={handleCreateMatch}>
        <select value={ai1Id} onChange={(e) => setAi1Id(e.target.value)} required>
          <option value="">Select AI 1</option>
          {profiles.map(profile => (
            <option key={profile.id} value={profile.id}>{profile.name}</option>
          ))}
        </select>
        <select value={ai2Id} onChange={(e) => setAi2Id(e.target.value)} required>
          <option value="">Select AI 2</option>
          {profiles.map(profile => (
            <option key={profile.id} value={profile.id}>{profile.name}</option>
          ))}
        </select>
        <button type="submit">Create Match</button>
      </form>
      <ul>
        {matches.map(match => (
          <li key={match.id}>
            {match.ai1.name} - {match.ai2.name}
            <a href={`/threads/${match.id}`}>View Conversation</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Matches;
