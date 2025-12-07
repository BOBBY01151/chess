import api from './axios.js';

export const createTournament = async (tournamentData) => {
  const response = await api.post('/tournaments', tournamentData);
  return response.data;
};

export const joinTournament = async (tournamentId) => {
  const response = await api.post(`/tournaments/${tournamentId}/join`);
  return response.data;
};

export const startTournament = async (tournamentId) => {
  const response = await api.post(`/tournaments/${tournamentId}/start`);
  return response.data;
};

export const getTournament = async (tournamentId) => {
  const response = await api.get(`/tournaments/${tournamentId}`);
  return response.data;
};

export const getUpcomingTournaments = async () => {
  const response = await api.get('/tournaments/upcoming');
  return response.data;
};

export const getOngoingTournaments = async () => {
  const response = await api.get('/tournaments/ongoing');
  return response.data;
};

export const getTournamentMatches = async (tournamentId) => {
  const response = await api.get(`/tournaments/${tournamentId}/matches`);
  return response.data;
};

