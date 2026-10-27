import api from './api';

export const reviewService = {
  getMovieReviews: async (movieId) => {
    const res = await api.get(`/review/${movieId}`);
    return res.data;
  },

  createReview: async (reviewData) => {
    const res = await api.post('/review', reviewData);
    return res.data;
  },

  deleteReview: async (id) => {
    const res = await api.delete(`/review/${id}`);
    return res.data;
  },
};
