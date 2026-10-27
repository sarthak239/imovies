const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    adminEmail: {
      type: String,
      required: [true, 'Admin email is required'],
      trim: true,
      lowercase: true,
    },
    showId: {
      type: String,
      required: [true, 'Show ID is required'],
      unique: true,
      trim: true,
    },
    movieId: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Movie ID is required'],
      ref: 'Movie',
    },
    movieName: {
      type: String,
      trim: true,
    },
    theatreName: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Theatre',
    },
    showDate: {
      type: Date,
      required: [true, 'Show date is required'],
    },
    showTime: {
      type: String,
      required: [true, 'Show time is required'],
      trim: true,
    },
    tierPricing: {
      balcony: { type: Number, default: 280 },
      middle: { type: Number, default: 200 },
      lower: { type: Number, default: 140 },
    },
    tickets: {
      type: mongoose.Schema.Types.Mixed, // Object mapping seatNumber -> { seatNumber, tier, price, status, lockedBy, lockExpiresAt }
      required: [true, 'Tickets matrix is required'],
      default: {},
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

showSchema.index({ movieId: 1, theatreName: 1, showDate: 1 });

module.exports = mongoose.models.Show || mongoose.model('Show', showSchema);
