const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    movieName: {
      type: String,
      required: [true, 'Movie name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    genres: {
      type: [String],
      required: [true, 'At least one genre is required'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
    },
    duration: {
      type: mongoose.Schema.Types.Mixed, // String (e.g. "2h 46m") or Number (minutes)
      required: [true, 'Duration is required'],
    },
    certification: {
      type: String,
      default: 'UA 16+',
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster URL is required'],
    },
    backdropUrl: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 8.5,
    },
    cast: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.index({ movieName: 'text', description: 'text' });

module.exports = mongoose.models.Movie || mongoose.model('Movie', movieSchema);
