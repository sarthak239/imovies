const Movie = require('../models/Movie');
const Show = require('../models/Show');

// @desc    Get all movies with filters & search
// @route   GET /api/movies
// @access  Public
const getAllMovies = async (req, res, next) => {
  try {
    const { search, genre, language, status, featured } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { cast: { $elemMatch: { $regex: search, $options: 'i' } } },
        { director: { $regex: search, $options: 'i' } },
      ];
    }

    if (genre && genre !== 'All') {
      query.genre = { $in: [new RegExp(`^${genre}$`, 'i')] };
    }

    if (language && language !== 'All') {
      query.language = { $in: [new RegExp(`^${language}$`, 'i')] };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    const movies = await Movie.find(query).sort({ releaseDate: -1, createdAt: -1 });

    return res.json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // Also get active show count
    const activeShowsCount = await Show.countDocuments({
      movie: movie._id,
      isActive: true,
    });

    return res.json({
      success: true,
      movie,
      activeShowsCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      description,
      genre,
      duration,
      language,
      rating,
      releaseDate,
      posterUrl,
      backdropUrl,
      trailerUrl,
      status,
      cast,
      director,
      censorRating,
      featured,
    } = req.body;

    const movie = await Movie.create({
      title,
      description,
      genre: Array.isArray(genre) ? genre : genre.split(',').map((g) => g.trim()),
      duration: Number(duration),
      language: Array.isArray(language) ? language : language.split(',').map((l) => l.trim()),
      rating: rating !== undefined ? Number(rating) : 8.0,
      releaseDate: releaseDate || new Date(),
      posterUrl,
      backdropUrl: backdropUrl || '',
      trailerUrl: trailerUrl || '',
      status: status || 'now_showing',
      cast: Array.isArray(cast) ? cast : cast ? cast.split(',').map((c) => c.trim()) : [],
      director: director || '',
      censorRating: censorRating || 'UA',
      featured: Boolean(featured),
    });

    return res.status(201).json({
      success: true,
      message: 'Movie added successfully',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    let movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    const updateData = { ...req.body };
    if (updateData.genre && typeof updateData.genre === 'string') {
      updateData.genre = updateData.genre.split(',').map((g) => g.trim());
    }
    if (updateData.language && typeof updateData.language === 'string') {
      updateData.language = updateData.language.split(',').map((l) => l.trim());
    }
    if (updateData.cast && typeof updateData.cast === 'string') {
      updateData.cast = updateData.cast.split(',').map((c) => c.trim());
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.json({
      success: true,
      message: 'Movie updated successfully',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // Delete associated shows
    await Show.deleteMany({ movie: movie._id });

    await movie.deleteOne();

    return res.json({
      success: true,
      message: 'Movie and associated shows deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
