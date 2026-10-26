const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    row: {
      type: String,
      required: true,
      trim: true,
    },
    col: {
      type: Number,
      required: true,
    },
    tier: {
      type: String,
      enum: ['Silver', 'Gold', 'VIP'],
      default: 'Gold',
    },
    price: {
      type: Number,
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    bookingReference: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Please associate show with a movie'],
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: [true, 'Please associate show with a theater'],
    },
    screenName: {
      type: String,
      required: [true, 'Please provide screen name'],
      default: 'Audi 1',
    },
    showDate: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Please provide show date (YYYY-MM-DD)'],
    },
    showTime: {
      type: String, // Format: e.g. "10:30 AM"
      required: [true, 'Please provide show time'],
    },
    tierPricing: {
      silver: { type: Number, default: 180 },
      gold: { type: Number, default: 250 },
      vip: { type: Number, default: 420 },
    },
    seatMatrix: [seatSchema],
    totalSeats: {
      type: Number,
      default: 60,
    },
    availableSeats: {
      type: Number,
      default: 60,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying shows by movie, theater, and date
showSchema.index({ movie: 1, theater: 1, showDate: 1 });
showSchema.index({ showDate: 1, movie: 1 });

module.exports = mongoose.model('Show', showSchema);
