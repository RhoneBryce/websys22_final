import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { UserContext } from '../context/UserContext';

interface AIProfile {
  id: number;
  name: string;
  personality: string;
  description: string;
  hobbies?: string;
  model_type?: string;
  compatibility_tags?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  compatibility_tags?: string;
}

interface Match {
  id: number;
  threadId: number;
  user: {
    id: number;
    username: string;
  };
  aiProfile: AIProfile;
}

const Matches: React.FC = () => {
  const { user } = useContext(UserContext);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      const response = await api.get('/matches');
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const getSimilarities = (userTags: string[], aiTags: string[]): string[] => {
    return userTags.filter(tag => aiTags.includes(tag));
  };

  if (!user) {
    return <div>Please log in to view matches.</div>;
  }

  return (
    <div>
      <h1>Matched Profiles</h1>
      {matches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <ul>
          {matches.map(match => {
            const userTags = user?.compatibility_tags?.split(',').map(t => t.trim().toLowerCase()) || [];
            const aiTags = match.aiProfile.compatibility_tags?.split(',').map(t => t.trim().toLowerCase()) || [];
            const similarities = getSimilarities(userTags, aiTags).slice(0, 3);
            return (
              <li key={match.id}>
                Match with {match.aiProfile.name}
                {similarities.length > 0 && (
                  <div>Similarities: {similarities.join(', ')}</div>
                )}
                <Link to={`/threads/${match.threadId}`}>View Conversation</Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Matches;
