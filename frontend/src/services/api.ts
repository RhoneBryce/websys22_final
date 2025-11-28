import axios from 'axios';

const API_BASE_URL = 'http://localhost:4200';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // For session cookies
});

export default api;

// Auth endpoints
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

// AI Profiles endpoints
export const getAIProfiles = async () => {
  const response = await api.get('/ai-profiles');
  return response.data;
};

export const createAIProfile = async (data: any) => {
  const response = await api.post('/ai-profiles', data);
  return response.data;
};

export const updateAIProfile = async (id: number, data: any) => {
  const response = await api.put(`/ai-profiles/${id}`, data);
  return response.data;
};

export const deleteAIProfile = async (id: number) => {
  const response = await api.delete(`/ai-profiles/${id}`);
  return response.data;
};

// Matches endpoints
export const getMatches = async () => {
  const response = await api.get('/matches');
  return response.data;
};

export const createMatch = async (ai1Id: number, ai2Id: number) => {
  const response = await api.post('/matches', { ai1Id, ai2Id });
  return response.data;
};

// New function for matching based on compatibility
export const getMatchesForAI = async (aiId: number) => {
  const response = await api.get(`/matches/${aiId}`);
  return response.data;
};
