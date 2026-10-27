import api from './api';
export const theatreService = {
  getTheatres:    (params = {}) => api.get('/theaters',     { params }).then(r => r.data),
  getTheatreById: (id)          => api.get(`/theaters/${id}`).then(r => r.data),
  createTheatre:  (data)        => api.post('/theaters',    data).then(r => r.data),
  updateTheatre:  (id, data)    => api.put(`/theaters/${id}`, data).then(r => r.data),
  deleteTheatre:  (id)          => api.delete(`/theaters/${id}`).then(r => r.data),
};
