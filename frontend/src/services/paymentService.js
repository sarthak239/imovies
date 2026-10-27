import api from './api';

/**
 * Dynamically loads the official Razorpay Checkout v1 script
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const paymentService = {
  createOrder: async (data) => {
    const res = await api.post('/payment/create-order', data);
    return res.data;
  },

  verifyPayment: async (data) => {
    const res = await api.post('/payment/verify', data);
    return res.data;
  },

  cancelPayment: async (data) => {
    const res = await api.post('/payment/cancel', data);
    return res.data;
  },

  loadScript: loadRazorpayScript,
};

export default paymentService;
