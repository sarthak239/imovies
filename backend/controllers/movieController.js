const Movie = require('../models/movieModel');
const store = require('../config/store');
const tmdbService = require('../services/tmdbService');

// @desc    Get all movies (Live TMDB Market + Catalog)
// @route   GET /api/movie or /api/movies
// @access  Public
const getAllMovies = async (req, res, next) => {
  try {
    const { search, genre, language, status, featured, category } = req.query;

    let liveMovies = [];

    // 1. Fetch real-time market movies from TMDB API
    try {
      if (search && search.trim()) {
        liveMovies = await tmdbService.searchMovies(search.trim());
      } else if (category === 'popular') {
        liveMovies = await tmdbService.getPopular(1);
      } else if (category === 'top_rated') {
        liveMovies = await tmdbService.getTopRated(1);
      } else if (category === 'upcoming') {
        liveMovies = await tmdbService.getUpcoming(1);
      } else {
        liveMovies = await tmdbService.getLiveCatalog({
          search,
          genre,
          language,
          status,
        });
      }
    } catch (tmdbErr) {
      console.warn('[Movie Controller] TMDB API request failed, falling back to local database:', tmdbErr.message);
      liveMovies = [];
    }

    // 2. Fetch custom/admin created movies from database
    let dbMovies = [];
    try {
      let query = {};
      if (search) {
        query.$or = [
          { movieName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { cast: { $elemMatch: { $regex: search, $options: 'i' } } },
        ];
      }
      if (genre && genre !== 'All') {
        query.$or = [
          { genres: { $in: [new RegExp(`^${genre}$`, 'i')] } },
          { genre: { $in: [new RegExp(`^${genre}$`, 'i')] } },
        ];
      }
      if (language && language !== 'All') {
        query.language = new RegExp(`^${language}$`, 'i');
      }
      if (status && status !== 'all') {
        query.status = status;
      }

      dbMovies = await Movie.find(query).sort({ releaseDate: -1, createdAt: -1 });
    } catch (dbErr) {
      dbMovies = store.movies || [];
    }

    const normalizedDbMovies = dbMovies.map((m) => {
      const obj = m.toObject ? m.toObject() : { ...m };
      obj.title = obj.movieName || obj.title;
      obj.movieName = obj.title;
      obj.genre = obj.genres || obj.genre || [];
      obj.genres = obj.genre;
      return obj;
    });

    // 3. Merge live market movies and local database movies (avoiding duplicate titles)
    const combinedMap = new Map();

    // Priority: Live TMDB market movies first
    liveMovies.forEach((m) => {
      combinedMap.set(String(m._id), m);
      if (m.title) combinedMap.set(m.title.toLowerCase(), m);
    });

    // Merge in DB movies (if title not already present)
    normalizedDbMovies.forEach((m) => {
      const key = (m.movieName || m.title || '').toLowerCase();
      if (!combinedMap.has(key) && !combinedMap.has(String(m._id))) {
        combinedMap.set(String(m._id), m);
      }
    });

    let mergedMovies = Array.from(new Set(Array.from(combinedMap.values())));

    // Apply filtering if TMDB didn't catch it
    if (genre && genre !== 'All') {
      mergedMovies = mergedMovies.filter((m) => {
        const gList = m.genres || m.genre || [];
        return gList.some((g) => g.toLowerCase() === genre.toLowerCase());
      });
    }

    if (language && language !== 'All') {
      mergedMovies = mergedMovies.filter((m) => {
        return m.language && m.language.toLowerCase() === language.toLowerCase();
      });
    }

    if (status && status !== 'all') {
      mergedMovies = mergedMovies.filter((m) => m.status === status);
    }

    // Cache merged movies in store.movies for fast lookup by shows and bookings
    mergedMovies.forEach((m) => {
      const exists = store.movies.find((x) => String(x._id) === String(m._id));
      if (!exists) {
        store.movies.push(m);
      }
    });

    return res.json({
      success: true,
      count: mergedMovies.length,
      source: liveMovies.length > 0 ? 'tmdb_live_market' : 'local_database',
      movies: mergedMovies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID (Live TMDB lookup supported)
// @route   GET /api/movie/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let movie = null;

    // 1. Try local MongoDB first if it's an ObjectId
    try {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        movie = await Movie.findById(id);
      }
    } catch (e) {}

    // 2. Try in-memory store
    if (!movie) {
      movie = store.movies.find((m) => String(m._id) === String(id) || String(m.tmdbId) === String(id));
    }

    // 3. Query TMDB live API directly for details
    if (!movie) {
      try {
        movie = await tmdbService.getMovieDetails(id);
        if (movie) {
          // Cache in store
          store.movies.push(movie);
        }
      } catch (tmdbErr) {
        console.warn(`[Movie Controller] TMDB details fetch failed for ${id}:`, tmdbErr.message);
      }
    }

    // 4. Try searching title in TMDB as last fallback
    if (!movie && isNaN(id)) {
      movie = store.movies.find((m) => m.movieName === id || m.title === id);
    }

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in live market or local catalog',
      });
    }

    const obj = movie.toObject ? movie.toObject() : { ...movie };
    obj.title = obj.movieName || obj.title;
    obj.movieName = obj.title;
    obj.genre = obj.genres || obj.genre || [];
    obj.genres = obj.genre;

    return res.json({
      success: true,
      movie: obj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Live Now Playing Market Endpoint
// @route   GET /api/movie/tmdb/now-playing
// @access  Public
const getNowPlayingLive = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const movies = await tmdbService.getNowPlaying(page);
    return res.json({ success: true, count: movies.length, movies });
  } catch (error) {
    next(error);
  }
};

// @desc    Live Popular Market Endpoint
// @route   GET /api/movie/tmdb/popular
// @access  Public
const getPopularLive = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const movies = await tmdbService.getPopular(page);
    return res.json({ success: true, count: movies.length, movies });
  } catch (error) {
    next(error);
  }
};

// @desc    Live Top Rated Market Endpoint
// @route   GET /api/movie/tmdb/top-rated
// @access  Public
const getTopRatedLive = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const movies = await tmdbService.getTopRated(page);
    return res.json({ success: true, count: movies.length, movies });
  } catch (error) {
    next(error);
  }
};

// @desc    Live Upcoming Market Endpoint
// @route   GET /api/movie/tmdb/upcoming
// @access  Public
const getUpcomingLive = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const movies = await tmdbService.getUpcoming(page);
    return res.json({ success: true, count: movies.length, movies });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new movie (Admin)
// @route   POST /api/movie
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    const {
      movieName,
      title,
      description,
      genres,
      genre,
      releaseDate,
      language,
      duration,
      certification,
      censorRating,
      posterUrl,
      backdropUrl,
      trailerUrl,
      cast,
      rating,
      featured,
    } = req.body;

    const name = (movieName || title || '').trim();
    if (!name || !description || !posterUrl) {
      return res.status(400).json({
        success: false,
        message: 'Movie name, description, and poster URL are required',
      });
    }

    const gArr = Array.isArray(genres)
      ? genres
      : Array.isArray(genre)
      ? genre
      : typeof genres === 'string'
      ? genres.split(',').map((s) => s.trim())
      : ['Action'];

    const castArr = Array.isArray(cast)
      ? cast
      : typeof cast === 'string'
      ? cast.split(',').map((s) => s.trim())
      : [];

    let movie = null;
    try {
      movie = await Movie.create({
        movieName: name,
        description,
        genres: gArr,
        releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
        language: language || 'English',
        duration: duration || '2h 15m',
        certification: certification || censorRating || 'UA 16+',
        posterUrl,
        backdropUrl: backdropUrl || posterUrl,
        trailerUrl: trailerUrl || '',
        cast: castArr,
        rating: rating !== undefined ? Number(rating) : 8.5,
        featured: Boolean(featured),
      });
    } catch (e) {
      movie = {
        _id: 'mov_' + Date.now(),
        movieName: name,
        title: name,
        description,
        genres: gArr,
        genre: gArr,
        releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
        language: language || 'English',
        duration: duration || '2h 15m',
        certification: certification || censorRating || 'UA 16+',
        censorRating: certification || censorRating || 'UA 16+',
        posterUrl,
        backdropUrl: backdropUrl || posterUrl,
        trailerUrl: trailerUrl || '',
        cast: castArr,
        rating: rating !== undefined ? Number(rating) : 8.5,
        featured: Boolean(featured),
        status: 'now_showing',
        createdAt: new Date(),
      };
      store.movies.unshift(movie);
    }

    return res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie
// @route   PUT /api/movie/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    let movie = null;
    try {
      movie = await Movie.findByIdAndUpdate(id, req.body, { new: true });
    } catch (e) {
      const idx = store.movies.findIndex((m) => m._id === id);
      if (idx !== -1) {
        store.movies[idx] = { ...store.movies[idx], ...req.body };
        movie = store.movies[idx];
      }
    }

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    return res.json({ success: true, message: 'Movie updated', movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie
// @route   DELETE /api/movie/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      await Movie.findByIdAndDelete(id);
    } catch (e) {
      store.movies = store.movies.filter((m) => m._id !== id);
    }

    return res.json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  getNowPlayingLive,
  getPopularLive,
  getTopRatedLive,
  getUpcomingLive,
  createMovie,
  updateMovie,
  deleteMovie,
};
