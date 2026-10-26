import api from './api';

export const theaterService = {
  getTheaters: async (params = {}) => {
    const response = await api.get('/theaters', { params });
    return response.data;
  },

  getTheaterById: async (id) => {
    const response = await api.get(`/theaters/${id}`);
    return response.data;
  },

  createTheater: async (theaterData) => {
    const response = await api.post('/theaters', theaterData);
    return response.data;
  },

  updateTheater: async (id, theaterData) => {
    const response = await api.put(`/theaters/${id}`, theaterData);
    return response.data;
  },

  deleteTheater: async (id) => {
    const response = await api.delete(`/theaters/${id}`);
    return response.data;
  },
};
