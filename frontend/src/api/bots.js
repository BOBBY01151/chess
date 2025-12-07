import api from './axios.js';

export const getBots = async () => {
  const response = await api.get('/bots');
  return response.data;
};

