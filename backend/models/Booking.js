const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true,
    },
    movieTitle: {
      type: String,
      required: true,
    },
    theaterName: {
      type: String,
      required: true,
    },
    theaterCity: {
      type: String,
      default: '',
    },
    screenName: {
      type: String,
      default: 'Audi 1',
    },
    showDate: {
      type: String,
      required: true,
    },
    showTime: {
      type: String,
      required: true,
    },
    seats: {
      type: [String],
      required: true,
      validate: [val => val.length > 0, 'Booking must include at least one seat'],
    },
    seatDetails: [
      {
        seatNumber: String,
        tier: String,
        price: Number,
      },
    ],
    ticketCount: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    convenienceFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['completed', 'failed', 'refunded', 'pending'],
      default: 'completed',
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Card', 'Net Banking', 'Cash / Counter'],
      default: 'UPI',
    },
    paymentId: {
      type: String,
      default: '',
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
