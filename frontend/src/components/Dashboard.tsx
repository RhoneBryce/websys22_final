import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { getAIProfiles, getGlobalAIProfiles, createAIProfile, updateAIProfile, deleteAIProfile, getMatchesForAI, createMatch, getMatches, deleteMatch } from '../services/api';

interface AIProfile {
  id: number;
  name: string;
  personality: string;
  description: string;
  hobbies?: string;
  model_type?: string;
  compatibility_tags?: string;
}

interface MatchedProfile {
  matchId: number;
  partner: AIProfile;
  ai1: AIProfile;
  ai2: AIProfile;
  threadId: number | null;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, logout } = useContext(UserContext);
  const [aiProfiles, setAiProfiles] = useState<AIProfile[]>([]);
  const [globalAIProfiles, setGlobalAIProfiles] = useState<AIProfile[]>([]);
  const [aiProfilesPagination, setAiProfilesPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [globalAIProfilesPagination, setGlobalAIProfilesPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AIProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    personality: '',
    description: '',
    hobbies: '',
    model_type: '',
    compatibility_tags: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [matchedProfiles, setMatchedProfiles] = useState<{ [key: number]: MatchedProfile[] }>({});
  const [showMatches, setShowMatches] = useState<{ [key: number]: boolean }>({});
  const [loadingMatches, setLoadingMatches] = useState<{ [key: number]: boolean }>({});
  const [matchErrors, setMatchErrors] = useState<{ [key: number]: string | null }>({});
  const [proposedMatch, setProposedMatch] = useState<{ ai1: AIProfile | null; ai2: AIProfile | null; synergy: number | null }>({ ai1: null, ai2: null, synergy: null });
  const [matchMessage, setMatchMessage] = useState<string | null>(null);
  const [createdMatches, setCreatedMatches] = useState<{ id: number; ai1: AIProfile; ai2: AIProfile }[]>([]);

  useEffect(() => {
    if (!loading && user === null) {
      navigate('/login');
      return;
    }
    if (!loading && user) {
      fetchAIProfiles(aiProfilesPagination.page);
      fetchGlobalAIProfiles(globalAIProfilesPagination.page);
      fetchCreatedMatches();
    }
  }, [user, loading]);

  const fetchAIProfiles = async (page: number = 1) => {
    try {
      const response = await getAIProfiles(page, aiProfilesPagination.limit);
      setAiProfiles(response.data);
      setAiProfilesPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching AI profiles:', error);
    }
  };

  const fetchGlobalAIProfiles = async (page = 1) => {
    try {
      const response = await getGlobalAIProfiles(page);
      setGlobalAIProfiles(response.data);
      setGlobalAIProfilesPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching global AI profiles:', error);
    }
  };





  const fetchCreatedMatches = async () => {
    try {
      const data = await getMatches();
      // Filter out self-matches (ai1 === ai2) and format
      const formattedMatches = data
        .filter((match: any) => !(match.ai1 && match.ai2 && match.ai1.id === match.ai2.id))
        .map((match: any) => ({
          id: match.id,
          ai1: match.ai1,
          ai2: match.ai2
        }));
      setCreatedMatches(formattedMatches);
    } catch (error) {
      console.error('Error fetching created matches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProfile) {
        await updateAIProfile(editingProfile.id, formData);
        setEditingProfile(null);
      } else {
        await createAIProfile(formData);
        setShowCreateForm(false);
      }
      setFormData({
        name: '',
        personality: '',
        description: '',
        hobbies: '',
        model_type: '',
        compatibility_tags: ''
      });
      fetchAIProfiles(aiProfilesPagination.page);
    } catch (error) {
      console.error('Error saving AI profile:', error);
    }
  };

  const handleEdit = (profile: AIProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      personality: profile.personality,
      description: profile.description,
      hobbies: profile.hobbies || '',
      model_type: profile.model_type || '',
      compatibility_tags: profile.compatibility_tags || ''
    });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this AI profile?')) {
      try {
        await deleteAIProfile(id);
        fetchAIProfiles(aiProfilesPagination.page);
        fetchGlobalAIProfiles(globalAIProfilesPagination.page);
      } catch (error) {
        console.error('Error deleting AI profile:', error);
      }
    }
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingProfile(null);
    setFormData({
      name: '',
      personality: '',
      description: '',
      hobbies: '',
      model_type: '',
      compatibility_tags: ''
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleMatch = async (profileId: number) => {
    const isShowing = showMatches[profileId];
    if (isShowing) {
      // Hide matches
      setShowMatches(prev => ({ ...prev, [profileId]: false }));
    } else {
      // Show matches
      setLoadingMatches(prev => ({ ...prev, [profileId]: true }));
      setMatchErrors(prev => ({ ...prev, [profileId]: null }));
      try {
        const matches = await getMatchesForAI(profileId);
        setMatchedProfiles(prev => ({ ...prev, [profileId]: matches }));
        setShowMatches(prev => ({ ...prev, [profileId]: true }));
      } catch (error) {
        console.error('Error fetching matches:', error);
        setMatchErrors(prev => ({ ...prev, [profileId]: 'Failed to fetch matches' }));
      } finally {
        setLoadingMatches(prev => ({ ...prev, [profileId]: false }));
      }
    }
  };

  const generateRandomMatch = () => {
    const allProfiles = [...aiProfiles, ...globalAIProfiles];
    if (allProfiles.length < 2) {
      setMatchMessage('At least two AI profiles are needed for matching');
      return;
    }
    const randomAI1 = allProfiles[Math.floor(Math.random() * allProfiles.length)];
    let randomAI2 = allProfiles[Math.floor(Math.random() * allProfiles.length)];
    // Ensure they are different
    while (randomAI2.id === randomAI1.id) {
      randomAI2 = allProfiles[Math.floor(Math.random() * allProfiles.length)];
    }
    const synergy = calculateSynergy(randomAI1, randomAI2);
    setProposedMatch({ ai1: randomAI1, ai2: randomAI2, synergy });
    setMatchMessage(null);
  };

  const calculateSynergy = (ai1: AIProfile, ai2: AIProfile): number => {
    const tags1 = ai1.compatibility_tags?.split(',').map(t => t.trim().toLowerCase()) || [];
    const tags2 = ai2.compatibility_tags?.split(',').map(t => t.trim().toLowerCase()) || [];
    const allTags = new Set([...tags1, ...tags2]);
    const sharedTags = tags1.filter(tag => tags2.includes(tag)).length;
    return allTags.size > 0 ? Math.round((sharedTags / allTags.size) * 100) : 0;
  };

  const handleAcceptMatch = async () => {
    if (!proposedMatch.ai1 || !proposedMatch.ai2) return;
    try {
      const createdMatch = await createMatch(proposedMatch.ai1.id, proposedMatch.ai2.id);
      setMatchMessage('Match created successfully!');
      setCreatedMatches(prev => [...prev, { id: createdMatch.id, ai1: proposedMatch.ai1!, ai2: proposedMatch.ai2! }]);
      setProposedMatch({ ai1: null, ai2: null, synergy: null });
    } catch (error: any) {
      console.error('Error creating match:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create match';
      setMatchMessage(`Failed to create match: ${errorMessage}`);
    }
  };

  const handleRejectMatch = () => {
    generateRandomMatch();
  };

  const handleUnmatch = async (matchId: number) => {
    if (window.confirm('Are you sure you want to unmatch this pair? This will delete the match from the database.')) {
      try {
        await deleteMatch(matchId);
        fetchCreatedMatches();
      } catch (error) {
        console.error('Error unmatching:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px', background: 'linear-gradient(135deg, #ffe6f0, #ffb3d9)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#ff69b4', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#ff69b4', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>Logout</button>
      </div>

      {/* Matchmaking Section */}
      <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '30px', borderRadius: '15px', boxShadow: '0 6px 12px rgba(0,0,0,0.15)', marginBottom: '30px' }}>
        <h2 style={{ color: '#ff69b4', textAlign: 'center', marginBottom: '20px' }}>AI Matchmaking</h2>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button onClick={generateRandomMatch} style={{ padding: '12px 24px', backgroundColor: '#ff69b4', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>Generate Match</button>
        </div>
        {matchMessage && <p style={{ textAlign: 'center', color: matchMessage.includes('Failed') ? 'red' : 'green', fontWeight: 'bold' }}>{matchMessage}</p>}
        {proposedMatch.ai1 && proposedMatch.ai2 && (
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '20px' }}>
            {/* AI Profile 1 */}
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ color: '#ff69b4' }}>{proposedMatch.ai1.name}</h3>
              <p><strong>Personality:</strong> {proposedMatch.ai1.personality}</p>
              <p><strong>Description:</strong> {proposedMatch.ai1.description}</p>
              {proposedMatch.ai1.hobbies && <p><strong>Hobbies:</strong> {proposedMatch.ai1.hobbies}</p>}
              {proposedMatch.ai1.model_type && <p><strong>Model Type:</strong> {proposedMatch.ai1.model_type}</p>}
              {proposedMatch.ai1.compatibility_tags && <p><strong>Tags:</strong> {proposedMatch.ai1.compatibility_tags}</p>}
            </div>

            {/* Center Synergy and Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ff69b4' }}>{proposedMatch.synergy}%</div>
              <div style={{ fontSize: '18px', color: '#666' }}>Predicted Synergy</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleAcceptMatch} style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', transition: 'background-color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}>Accept</button>
                <button onClick={handleRejectMatch} style={{ padding: '12px 24px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', transition: 'background-color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}>Reject</button>
              </div>
            </div>

            {/* AI Profile 2 */}
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ color: '#ff69b4' }}>{proposedMatch.ai2.name}</h3>
              <p><strong>Personality:</strong> {proposedMatch.ai2.personality}</p>
              <p><strong>Description:</strong> {proposedMatch.ai2.description}</p>
              {proposedMatch.ai2.hobbies && <p><strong>Hobbies:</strong> {proposedMatch.ai2.hobbies}</p>}
              {proposedMatch.ai2.model_type && <p><strong>Model Type:</strong> {proposedMatch.ai2.model_type}</p>}
              {proposedMatch.ai2.compatibility_tags && <p><strong>Tags:</strong> {proposedMatch.ai2.compatibility_tags}</p>}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#ff69b4' }}>Profile</h2>
          <p>Welcome, {user?.name || 'User'}!</p>
          <p>Manage your profile here.</p>
          {/* Placeholder for profile details */}
        </div>
      </div>

      {/* Created Matches Box */}
      {createdMatches.length > 0 && (
        <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '30px', borderRadius: '15px', boxShadow: '0 6px 12px rgba(0,0,0,0.15)', marginBottom: '30px' }}>
          <h2 style={{ color: '#ff69b4', textAlign: 'center', marginBottom: '20px' }}>Your Created Matches</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            {createdMatches.map((match) => (
              <div key={match.id} style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', minWidth: '300px', textAlign: 'center' }}>
                <h3 style={{ color: '#ff69b4' }}>{match.ai1.name} & {match.ai2.name}</h3>
                <p><strong>{match.ai1.name}:</strong> {match.ai1.personality}</p>
                <p><strong>{match.ai2.name}:</strong> {match.ai2.personality}</p>
          <button
            onClick={() => navigate('/match-details', { state: { id: match.id } })}
            style={{ padding: '10px 20px', backgroundColor: '#ff69b4', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', marginTop: '10px' }}
          >
            View
          </button>
          <button
            onClick={() => handleUnmatch(match.id)}
            style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', marginTop: '10px', marginLeft: '10px' }}
          >
            Unmatch
          </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ marginBottom: '20px' }}>
        <h2>AI Profiles Overview</h2>
        <p>Number of AI profiles: {aiProfilesPagination.total || aiProfiles.length}</p>
        <button onClick={() => setShowCreateForm(true)} style={{ padding: '10px 20px', backgroundColor: '#ff69b4', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer' }}>Create AI</button>

        <div style={{ marginTop: '10px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>
            <button onClick={() => fetchAIProfiles(Math.max(1, aiProfilesPagination.page - 1))} disabled={aiProfilesPagination.page === 1} style={{ marginRight: '8px' }}>← Previous</button>
            <span>Page {aiProfilesPagination.page} of {aiProfilesPagination.totalPages || 1}</span>
            <button onClick={() => fetchAIProfiles(Math.min(Math.max(1, aiProfilesPagination.totalPages || 1), aiProfilesPagination.page + 1))} disabled={aiProfilesPagination.page === (aiProfilesPagination.totalPages || 1)} style={{ marginLeft: '8px' }}>Next →</button>
          </div>

          <div>
            <button onClick={() => fetchGlobalAIProfiles(Math.max(1, globalAIProfilesPagination.page - 1))} disabled={globalAIProfilesPagination.page === 1} style={{ marginRight: '8px' }}>← Prev Global</button>
            <span>Page {globalAIProfilesPagination.page} of {globalAIProfilesPagination.totalPages || 1}</span>
            <button onClick={() => fetchGlobalAIProfiles(Math.min(Math.max(1, globalAIProfilesPagination.totalPages || 1), globalAIProfilesPagination.page + 1))} disabled={globalAIProfilesPagination.page === (globalAIProfilesPagination.totalPages || 1)} style={{ marginLeft: '8px' }}>Next →</button>
          </div>
        </div>
      </div>

      {(showCreateForm || editingProfile) && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h3>{editingProfile ? 'Edit AI Profile' : 'Create New AI Profile'}</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Personality:</label>
            <input
              type="text"
              value={formData.personality}
              onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Hobbies:</label>
            <input
              type="text"
              value={formData.hobbies}
              onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
            />
          </div>
          <div>
            <label>Model Type:</label>
            <input
              type="text"
              value={formData.model_type}
              onChange={(e) => setFormData({ ...formData, model_type: e.target.value })}
            />
          </div>
          <div>
            <label>Compatibility Tags:</label>
            <input
              type="text"
              value={formData.compatibility_tags}
              onChange={(e) => setFormData({ ...formData, compatibility_tags: e.target.value })}
            />
          </div>
          <button type="submit">{editingProfile ? 'Update' : 'Create'}</button>
          <button type="button" onClick={resetForm}>Cancel</button>
        </form>
      )}

      <div>
        <h3 style={{ color: '#ff69b4' }}>Existing AI Profiles</h3>
        {[...aiProfiles, ...globalAIProfiles].length === 0 ? (
          <p>No AI profiles yet.</p>
        ) : (
          <>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[...aiProfiles, ...globalAIProfiles].map((profile) => (
                <li key={profile.id} style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: '20px', marginBottom: '10px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                  <h4>{profile.name}</h4>
                  <p><strong>Personality.</strong> {profile.personality}</p>
                  <p><strong>Description:</strong> {profile.description}</p>
                  {profile.hobbies && <p><strong>Hobbies:</strong> {profile.hobbies}</p>}
                  {profile.model_type && <p><strong>Model Type:</strong> {profile.model_type}</p>}
                  {profile.compatibility_tags && <p><strong>Tags:</strong> {profile.compatibility_tags}</p>}
                  <button onClick={() => handleEdit(profile)}>Edit</button>
                  <button onClick={() => handleDelete(profile.id)}>Delete</button>
                  <button onClick={() => handleMatch(profile.id)} disabled={loadingMatches[profile.id]}>
                    {loadingMatches[profile.id] ? 'Matching...' : 'Match'}
                  </button>
                  {matchErrors[profile.id] && <p style={{ color: 'red' }}>{matchErrors[profile.id]}</p>}
                  {showMatches[profile.id] && (
                    <div style={{ marginTop: '10px' }}>
                      <h5>Matched Profiles:</h5>
                      {matchedProfiles[profile.id] && matchedProfiles[profile.id].length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {matchedProfiles[profile.id].map((matched) => {
                            const otherProfile = matched.partner;
                            return (
                              <li key={matched.matchId} style={{ border: '1px solid #eee', padding: '5px', marginBottom: '5px' }}>
                                {otherProfile && (
                                  <>
                                    <strong>{otherProfile.name}</strong>
                                    <p><strong>Personality:</strong> {otherProfile.personality}</p>
                                    <p><strong>Description:</strong> {otherProfile.description}</p>
                                    {otherProfile.hobbies && <p><strong>Hobbies:</strong> {otherProfile.hobbies}</p>}
                                    {otherProfile.model_type && <p><strong>Model Type:</strong> {otherProfile.model_type}</p>}
                                    {otherProfile.compatibility_tags && <p><strong>Compatibility Tags:</strong> {otherProfile.compatibility_tags}</p>}
                                  </>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p>No matches found.</p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>


    </div>
  );
};

export default Dashboard;
