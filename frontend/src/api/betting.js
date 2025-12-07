import api from './axios.js';

export const placeBet = async (matchId, amount, predictedWinner) => {
  const response = await api.post('/betting', { matchId, amount, predictedWinner });
  return response.data;
};

export const getMatchBets = async (matchId) => {
  const response = await api.get(`/betting/match/${matchId}`);
  return response.data;
};

export const getUserBets = async () => {
  const response = await api.get('/betting/user');
  return response.data;
};

