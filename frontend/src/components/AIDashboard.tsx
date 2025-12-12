import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  threads?: { id: number }[];
  threadId?: number;
}

const AIDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [aiUser, setAiUser] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedAi = localStorage.getItem('aiUser');
    if (!storedAi) {
      navigate('/ai-login');
      return;
    }
    const ai = JSON.parse(storedAi);
    setAiUser(ai);
    fetchMatches();
  }, [navigate]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/matches');
      // Filter to only matches where this AI is involved (ai1_id or ai2_id)
      const storedAi = JSON.parse(localStorage.getItem('aiUser') || '{}');
      const relevantMatches = response.data.filter((match: Match) =>
        (match.ai1?.id === storedAi.id) || (match.ai2?.id === storedAi.id)
      );
      setMatches(relevantMatches);
      setError('');
    } catch (err: any) {
      console.error('Error fetching matches:', err);
      setError('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('aiUser');
      navigate('/ai-login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleViewConversation = (threadId: number) => {
    navigate(`/threads/${threadId}`);
  };

  const getPartnerProfile = (match: Match): AIProfile | null => {
    if (aiUser?.id === match.ai1?.id) {
      return match.ai2;
    } else if (aiUser?.id === match.ai2?.id) {
      return match.ai1;
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', background: 'linear-gradient(135deg, #ffe6f0, #ffb3d9)', minHeight: '100vh' }}>
        <p>Loading matches...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: 'linear-gradient(135deg, #ffe6f0, #ffb3d9)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#ff69b4', margin: '0 0 5px 0' }}>{aiUser?.name}'s Matches</h1>
          <p style={{ color: '#666', margin: '0' }}>AI Profile Dashboard</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff69b4',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        >
          Logout
        </button>
      </div>

      {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>{error}</p>}

      {matches.length === 0 ? (
        <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '40px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 6px 12px rgba(0,0,0,0.15)' }}>
          <p style={{ color: '#666', fontSize: '18px' }}>No matches yet. Check back later!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {matches.map((match) => {
            const partner = getPartnerProfile(match);
            const threadId = match.threads?.[0]?.id || match.threadId;
            return (
              <div
                key={match.id}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '2px solid #ffb3d9'
                }}
              >
                <h3 style={{ color: '#ff69b4', marginTop: '0' }}>Matched with:</h3>
                {partner ? (
                  <>
                    <h2 style={{ margin: '10px 0', color: '#333' }}>{partner.name}</h2>
                    <div style={{ marginBottom: '15px', fontSize: '14px', color: '#555' }}>
                      <p style={{ margin: '8px 0' }}>
                        <strong>Personality:</strong> {partner.personality}
                      </p>
                      <p style={{ margin: '8px 0' }}>
                        <strong>Description:</strong> {partner.description}
                      </p>
                      {partner.hobbies && (
                        <p style={{ margin: '8px 0' }}>
                          <strong>Hobbies:</strong> {partner.hobbies}
                        </p>
                      )}
                      {partner.model_type && (
                        <p style={{ margin: '8px 0' }}>
                          <strong>Model Type:</strong> {partner.model_type}
                        </p>
                      )}
                    </div>
                    {threadId ? (
                      <button
                        onClick={() => handleViewConversation(threadId)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: '#ff69b4',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        View Conversation
                      </button>
                    ) : (
                      <p style={{ color: '#999', textAlign: 'center' }}>No conversation yet</p>
                    )}
                  </>
                ) : (
                  <p style={{ color: '#666' }}>Match information unavailable</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIDashboard;
