const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: [true, 'Booking ID is required'],
      unique: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
      lowercase: true,
    },
    showId: {
      type: String,
      required: [true, 'Show ID is required'],
      trim: true,
    },
    movieName: {
      type: String,
      default: '',
    },
    theatreName: {
      type: String,
      default: '',
    },
    showDate: {
      type: mongoose.Schema.Types.Mixed,
      default: '',
    },
    showTime: {
      type: String,
      default: '',
    },
    selectedSeats: {
      type: [String],
      required: [true, 'At least one seat is required'],
    },
    seatDetails: [
      {
        seatNumber: String,
        tier: String,
        price: Number,
      },
    ],
    subtotal: {
      type: Number,
      default: 0,
    },
    convenienceFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled', 'Refunded'],
      default: 'Completed',
    },
    paymentMethod: {
      type: String,
      default: 'Prime Pay / UPI',
    },
    paymentId: {
      type: String,
      default: '',
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ userEmail: 1, createdAt: -1 });

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
