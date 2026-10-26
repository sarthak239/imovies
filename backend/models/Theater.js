const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  screenType: {
    type: String,
    enum: ['Standard 2D', 'IMAX 3D', '4DX', 'Dolby Cinema', 'ScreenX'],
    default: 'Standard 2D',
  },
  totalSeats: {
    type: Number,
    default: 60,
  },
});

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide theater name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide theater location / area'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide city name'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide complete address'],
      trim: true,
    },
    facilities: {
      type: [String],
      default: ['Dolby Atmos', '4K Projection', 'Food & Beverages', 'Parking', 'Wheelchair Access'],
    },
    screens: [screenSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

theaterSchema.index({ city: 1, name: 1 });

module.exports = mongoose.model('Theater', theaterSchema);
