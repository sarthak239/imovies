import api from './api';

export const favoriteService = {
  getFavorites: async () => {
    const res = await api.get('/favorite');
    return res.data;
  },

  toggleFavorite: async (data) => {
    const res = await api.post('/favorite', data);
    return res.data;
  },

  removeFavorite: async (movieId) => {
    const res = await api.delete(`/favorite/${movieId}`);
    return res.data;
  },
};
