import api from './api';

export const movieService = {
  getMovies: (params = {}) => api.get('/movies', { params }).then((r) => r.data),
  getMovieById: (id) => api.get(`/movies/${id}`).then((r) => r.data),
  getNowPlaying: (page = 1) => api.get('/movies/tmdb/now-playing', { params: { page } }).then((r) => r.data),
  getPopular: (page = 1) => api.get('/movies/tmdb/popular', { params: { page } }).then((r) => r.data),
  getTopRated: (page = 1) => api.get('/movies/tmdb/top-rated', { params: { page } }).then((r) => r.data),
  getUpcoming: (page = 1) => api.get('/movies/tmdb/upcoming', { params: { page } }).then((r) => r.data),
  createMovie: (data) => api.post('/movies', data).then((r) => r.data),
  updateMovie: (id, data) => api.put(`/movies/${id}`, data).then((r) => r.data),
  deleteMovie: (id) => api.delete(`/movies/${id}`).then((r) => r.data),
};
