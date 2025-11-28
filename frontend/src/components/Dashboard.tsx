import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { getAIProfiles, createAIProfile, updateAIProfile, deleteAIProfile, logout, getMatchesForAI } from '../services/api';

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
  match: {
    id: number;
    ai1: AIProfile;
    ai2: AIProfile;
  };
  sharedTags: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [aiProfiles, setAiProfiles] = useState<AIProfile[]>([]);
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

  useEffect(() => {
    if (user === null) {
      navigate('/login');
      return;
    }
    fetchAIProfiles();
  }, [user, navigate]);

  const fetchAIProfiles = async () => {
    try {
      const data = await getAIProfiles();
      setAiProfiles(data);
    } catch (error) {
      console.error('Error fetching AI profiles:', error);
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
      fetchAIProfiles();
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
        fetchAIProfiles();
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

  return (
    <div style={{ padding: '20px', background: 'linear-gradient(135deg, #ffe6f0, #ffb3d9)', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#ff69b4', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#ff69b4', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>Logout</button>
      </div>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#ff69b4' }}>Profile</h2>
          <p>Welcome, {user?.name || 'User'}!</p>
          <p>Manage your profile here.</p>
          {/* Placeholder for profile details */}
        </div>
        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#ff69b4' }}>Matches</h2>
          <p>Your AI matches: {Object.keys(matchedProfiles).length}</p>
          <button style={{ padding: '10px 20px', backgroundColor: '#ff69b4', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer' }}>View Matches</button>
        </div>
        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#ff69b4' }}>Messages</h2>
          <p>Recent conversations.</p>
          <button style={{ padding: '10px 20px', backgroundColor: '#ff69b4', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer' }}>View Messages</button>
          {/* Placeholder for messages */}
        </div>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <h2>AI Profiles Overview</h2>
        <p>Number of AI profiles: {aiProfiles.length}</p>
        <button onClick={() => setShowCreateForm(true)} style={{ padding: '10px 20px', backgroundColor: '#ff69b4', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer' }}>Create AI</button>
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
        {aiProfiles.length === 0 ? (
          <p>No AI profiles yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {aiProfiles.map((profile) => (
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
                          const otherProfile = matched.match.ai1.id === profile.id ? matched.match.ai2 : matched.match.ai1;
                          return (
                            <li key={matched.match.id} style={{ border: '1px solid #eee', padding: '5px', marginBottom: '5px' }}>
                              {otherProfile && (
                                <>
                                  <strong>{otherProfile.name}</strong>
                                  <p><strong>Personality:</strong> {otherProfile.personality}</p>
                                  <p><strong>Description:</strong> {otherProfile.description}</p>
                                  {otherProfile.hobbies && <p><strong>Hobbies:</strong> {otherProfile.hobbies}</p>}
                                  {otherProfile.model_type && <p><strong>Model Type:</strong> {otherProfile.model_type}</p>}
                                  {otherProfile.compatibility_tags && <p><strong>Compatibility Tags:</strong> {otherProfile.compatibility_tags}</p>}
                                  <p>Shared Tags: {matched.sharedTags}</p>
                                  <a href={`/threads/${matched.match.id}`} style={{ color: 'blue', textDecoration: 'underline' }}>View Conversation</a>
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;
