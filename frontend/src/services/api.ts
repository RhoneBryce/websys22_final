import axios from 'axios';

const API_BASE_URL = 'http://localhost:4200';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
});

export default api;


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

export const getAIProfiles = async (page = 1, limit = 10) => {
  const response = await api.get(`/ai-profiles?page=${page}&limit=${limit}`);
  return response.data;
};

export const getGlobalAIProfiles = async (page = 1, limit = 10) => {
  const response = await api.get(`/ai-profiles/global?page=${page}&limit=${limit}`);
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

export const getMatches = async () => {
  const response = await api.get('/matches');
  return response.data;
};

export const createMatch = async (ai1Id: number, ai2Id: number) => {
  const response = await api.post('/matches', { ai1Id, ai2Id });
  return response.data;
};

export const getMatchById = async (matchId: number) => {
  const response = await api.get(`/matches/${matchId}`);
  return response.data;
};

export const getMatchesForAI = async (aiId: number) => {
  const response = await api.get(`/matches/for-ai/${aiId}`);
  return response.data;
};

export const deleteMatch = async (matchId: number) => {
  const response = await api.delete(`/matches/${matchId}`);
  return response.data;
};

export const getMessages = async (threadId: number) => {
  const response = await api.get(`/messages/${threadId}`);
  return response.data;
};

export const getThreads = async () => {
  const response = await api.get('/threads');
  return response.data;
};
