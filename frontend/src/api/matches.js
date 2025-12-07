import api from './axios.js';

export const getMatch = async (matchId) => {
  const response = await api.get(`/matches/${matchId}`);
  return response.data;
};

export const getLiveMatches = async () => {
  const response = await api.get('/matches/live');
  return response.data;
};

export const getMatchHistory = async () => {
  const response = await api.get('/matches/history');
  return response.data;
};

