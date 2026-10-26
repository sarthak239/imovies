import api from './api';

export const showService = {
  getShows: async (params = {}) => {
    const response = await api.get('/shows', { params });
    return response.data;
  },

  getShowById: async (id) => {
    const response = await api.get(`/shows/${id}`);
    return response.data;
  },

  createShow: async (showData) => {
    const response = await api.post('/shows', showData);
    return response.data;
  },

  updateShow: async (id, showData) => {
    const response = await api.put(`/shows/${id}`, showData);
    return response.data;
  },

  deleteShow: async (id) => {
    const response = await api.delete(`/shows/${id}`);
    return response.data;
  },
};
