const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
      lowercase: true,
    },
    movieId: {
      type: String,
      required: [true, 'Movie ID is required'],
      trim: true,
    },
    movieName: {
      type: String,
      default: '',
    },
    posterUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

favoriteSchema.index({ userEmail: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);
