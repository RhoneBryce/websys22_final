import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMatchById } from '../services/api';
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

interface Thread {
  id: number;
  messages?: any[];
}

interface Match {
  id: number;
  ai1: AIProfile;
  ai2: AIProfile;
  threads?: Thread[];
}

const MatchDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(false);

  const handleViewConversation = async () => {
    if (!match) return;

    try {
      let threadId: number;

      if (match.threads && match.threads.length > 0) {
        // Thread already exists
        threadId = match.threads[0].id;
      } else {
        // Create a new thread
        const response = await api.post('/threads', { match_id: match.id });
        threadId = response.data.id;

        // Update the match state with the new thread
        setMatch(prev => prev ? { ...prev, threads: [{ id: threadId }] } : null);
      }

      // Navigate to the thread
      navigate(`/threads/${threadId}`);
    } catch (error) {
      console.error('Error creating or accessing thread:', error);
    }
  };

  useEffect(() => {
    if (location.state?.id) {
      // Always fetch the match to get threads
      setLoading(true);
      getMatchById(location.state.id)
        .then(setMatch)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [location.state]);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading match details...</div>;
  }

  if (!match || !match.ai1 || !match.ai2) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>No match data available. Please go back to the dashboard and try again.</div>;
  }

  return (
    <div style={{ padding: '20px', background: 'linear-gradient(135deg, #ffe6f0, #ffb3d9)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', backgroundColor: '#ff69b4', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer' }}>Back to Dashboard</button>
      </div>
      <h1 style={{ color: '#ff69b4', textAlign: 'center', marginBottom: '30px' }}>Match Details</h1>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '20px' }}>
        {/* AI Profile 1 */}
        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.9)', padding: '30px', borderRadius: '15px', boxShadow: '0 6px 12px rgba(0,0,0,0.15)' }}>
          <h2 style={{ color: '#ff69b4', textAlign: 'center' }}>{match.ai1?.name}</h2>
          <p><strong>Personality:</strong> {match.ai1.personality}</p>
          <p><strong>Description:</strong> {match.ai1.description}</p>
          {match.ai1.hobbies && <p><strong>Hobbies:</strong> {match.ai1.hobbies}</p>}
          {match.ai1.model_type && <p><strong>Model Type:</strong> {match.ai1.model_type}</p>}
          {match.ai1.compatibility_tags && <p><strong>Compatibility Tags:</strong> {match.ai1.compatibility_tags}</p>}
        </div>

        {/* Center Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ff69b4' }}>❤️</div>
          <div style={{ fontSize: '18px', color: '#666' }}>Matched!</div>
          <button onClick={handleViewConversation} style={{ padding: '10px 20px', backgroundColor: '#ff69b4', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer' }}>View Conversation</button>
        </div>

        {/* AI Profile 2 */}
        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.9)', padding: '30px', borderRadius: '15px', boxShadow: '0 6px 12px rgba(0,0,0,0.15)' }}>
          <h2 style={{ color: '#ff69b4', textAlign: 'center' }}>{match.ai2?.name}</h2>
          <p><strong>Personality:</strong> {match.ai2.personality}</p>
          <p><strong>Description:</strong> {match.ai2.description}</p>
          {match.ai2.hobbies && <p><strong>Hobbies:</strong> {match.ai2.hobbies}</p>}
          {match.ai2.model_type && <p><strong>Model Type:</strong> {match.ai2.model_type}</p>}
          {match.ai2.compatibility_tags && <p><strong>Compatibility Tags:</strong> {match.ai2.compatibility_tags}</p>}
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
