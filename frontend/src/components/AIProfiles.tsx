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

const AIProfiles: React.FC = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<AIProfile[]>([]);
  const [form, setForm] = useState({ name: '', personality: '', description: '', hobbies: '', model_type: '', compatibility_tags: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await api.get('/ai-profiles');
      setProfiles(response.data);
      setError('');
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      if (error.response?.status === 401) {
        setError('You are not authenticated. Please log in.');
        navigate('/login');
      } else {
        setError('Failed to fetch profiles.');
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    console.log('handleSubmit called with form:', form);
    try {
      if (editingId) {
        await api.put(`/ai-profiles/${editingId}`, form);
      } else {
        await api.post('/ai-profiles', form);
      }
      setForm({ name: '', personality: '', description: '', hobbies: '', model_type: '', compatibility_tags: '' });
      setEditingId(null);
      fetchProfiles();
      setError('');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      console.log('Error response:', error.response);
      if (error.response?.status === 401) {
        setError('You are not authenticated. Please log in.');
        navigate('/login');
      } else {
        setError('Failed to save profile.');
      }
    }
  };

  const handleEdit = (profile: AIProfile) => {
    setForm({
      name: profile.name,
      personality: profile.personality,
      description: profile.description,
      hobbies: profile.hobbies || '',
      model_type: profile.model_type || '',
      compatibility_tags: profile.compatibility_tags || '',
    });
    setEditingId(profile.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/ai-profiles/${id}`);
      fetchProfiles();
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      if (error.response?.status === 401) {
        setError('You are not authenticated. Please log in.');
      } else {
        setError('Failed to delete profile.');
      }
    }
  };

  return (
    <div>
      <h1>AI Profiles</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="text" placeholder="Personality" value={form.personality} onChange={(e) => setForm({ ...form, personality: e.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input type="text" placeholder="Hobbies" value={form.hobbies} onChange={(e) => setForm({ ...form, hobbies: e.target.value })} />
        <input type="text" placeholder="Model Type" value={form.model_type} onChange={(e) => setForm({ ...form, model_type: e.target.value })} />
        <input type="text" placeholder="Compatibility Tags" value={form.compatibility_tags} onChange={(e) => setForm({ ...form, compatibility_tags: e.target.value })} />
        <button type="button" onClick={() => { console.log('Create button clicked'); handleSubmit(); }}>{editingId ? 'Update' : 'Create'}</button>
        {editingId && <button onClick={() => { setEditingId(null); setForm({ name: '', personality: '', description: '', hobbies: '', model_type: '', compatibility_tags: '' }); }}>Cancel</button>}
      </form>
      <ul>
        {profiles.map(profile => (
          <li key={profile.id}>
            <h3>{profile.name}</h3>
            <p>{profile.description}</p>
            <button onClick={() => handleEdit(profile)}>Edit</button>
            <button onClick={() => handleDelete(profile.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AIProfiles;
