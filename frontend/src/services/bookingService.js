import api from './api';

export const bookingService = {
  lockSeats: async (data) => {
    const res = await api.post('/bookings/lock', data);
    return res.data;
  },

  unlockSeats: async (data) => {
    const res = await api.post('/bookings/unlock', data);
    return res.data;
  },

  createBooking: async (bookingData) => {
    const res = await api.post('/bookings', bookingData);
    return res.data;
  },

  getMyBookings: async () => {
    const res = await api.get('/bookings/my-bookings');
    return res.data;
  },

  getAllBookings: async (params = {}) => {
    const res = await api.get('/bookings', { params });
    return res.data;
  },

  getBookingById: async (id) => {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  cancelBooking: async (id) => {
    const res = await api.put(`/bookings/${id}/cancel`);
    return res.data;
  },
};
