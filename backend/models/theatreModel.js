const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    theatreName: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    balconySeatPrice: {
      type: Number,
      required: [true, 'Balcony seat price is required'],
      default: 280,
    },
    middleSeatPrice: {
      type: Number,
      required: [true, 'Middle seat price is required'],
      default: 200,
    },
    lowerSeatPrice: {
      type: Number,
      required: [true, 'Lower seat price is required'],
      default: 140,
    },
    balconySeats: {
      type: Object, // { rows: 2, cols: 8, total: 16 }
      required: [true, 'Balcony seats layout is required'],
      default: { rows: 2, cols: 10, total: 20 },
    },
    middleSeats: {
      type: Object, // { rows: 3, cols: 10, total: 30 }
      required: [true, 'Middle seats layout is required'],
      default: { rows: 3, cols: 10, total: 30 },
    },
    lowerSeats: {
      type: Object, // { rows: 2, cols: 10, total: 20 }
      required: [true, 'Lower seats layout is required'],
      default: { rows: 2, cols: 10, total: 20 },
    },
    facilities: {
      type: [String],
      default: ['Dolby Atmos', '4K Laser Projection', 'Gourmet Snacks', 'Recliner Comfort'],
    },
  },
  {
    timestamps: true,
  }
);

theatreSchema.index({ theatreName: 1, location: 1 });

module.exports = mongoose.models.Theatre || mongoose.model('Theatre', theatreSchema);
