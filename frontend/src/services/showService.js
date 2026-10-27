import api from './api';
export const showService = {
  getShows:    (params = {}) => api.get('/shows',     { params }).then(r => r.data),
  getShowById: (id)          => api.get(`/shows/${id}`).then(r => r.data),
  createShow:  (data)        => api.post('/shows',    data).then(r => r.data),
  updateShow:  (id, data)    => api.put(`/shows/${id}`, data).then(r => r.data),
  deleteShow:  (id)          => api.delete(`/shows/${id}`).then(r => r.data),
};
