const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide movie title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide movie description'],
    },
    genre: {
      type: [String],
      required: [true, 'Please provide at least one genre'],
    },
    duration: {
      type: Number, // In minutes
      required: [true, 'Please provide duration in minutes'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    language: {
      type: [String],
      required: [true, 'Please provide at least one language'],
    },
    rating: {
      type: Number,
      default: 8.0,
      min: [0, 'Rating cannot be less than 0'],
      max: [10, 'Rating cannot exceed 10'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Please provide release date'],
    },
    posterUrl: {
      type: String,
      required: [true, 'Please provide movie poster URL'],
    },
    backdropUrl: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['now_showing', 'upcoming'],
      default: 'now_showing',
    },
    cast: {
      type: [String],
      default: [],
    },
    director: {
      type: String,
      default: '',
    },
    censorRating: {
      type: String,
      enum: ['U', 'UA', 'A', 'S'],
      default: 'UA',
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    language_override: 'searchLanguageOverride',
  }
);

// Text index for fast search
movieSchema.index(
  { title: 'text', description: 'text' },
  { language_override: 'searchLanguageOverride' }
);

module.exports = mongoose.model('Movie', movieSchema);
