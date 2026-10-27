const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const IMAGE_POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
const IMAGE_BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

// In-Memory cache to optimize speed and stay within TMDB rate limits
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Language Code to Display Name Mapping
const LANGUAGE_MAP = {
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish',
  fr: 'French',
  ja: 'Japanese',
  ko: 'Korean',
  de: 'German',
  it: 'Italian',
  ta: 'Tamil',
  te: 'Telugu',
  zh: 'Mandarin',
};

// Standard TMDB Genre ID to Name Mapping
const GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

// Create configured axios client
const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 8000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json',
  },
  params: {
    api_key: TMDB_API_KEY,
  },
});

/**
 * Fetch with in-memory caching and graceful error handling with automatic retry
 */
const cachedGet = async (endpoint, params = {}, retries = 2) => {
  const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await tmdbClient.get(endpoint, { params });
      cache.set(cacheKey, { timestamp: Date.now(), data: res.data });
      return res.data;
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      console.warn(`[TMDB Service] Error fetching ${endpoint} (after ${retries + 1} attempts):`, err.message);
      if (cached) return cached.data; // Serve stale cache if available
      throw err;
    }
  }
};

/**
 * Convert TMDB raw movie item into iMovies schema format
 */
const normalizeMovie = (m) => {
  if (!m) return null;

  const id = String(m.id);
  const title = m.title || m.original_title || 'Untitled';
  const rawLanguage = m.original_language || 'en';
  const language = LANGUAGE_MAP[rawLanguage] || rawLanguage.toUpperCase();

  // Resolve genres
  let genres = [];
  if (Array.isArray(m.genres) && m.genres.length > 0) {
    genres = m.genres.map((g) => (typeof g === 'object' ? g.name : g));
  } else if (Array.isArray(m.genre_ids) && m.genre_ids.length > 0) {
    genres = m.genre_ids.map((gid) => GENRE_MAP[gid]).filter(Boolean);
  }
  if (genres.length === 0) genres = ['Drama', 'Action'];

  // Format Duration
  let duration = '2h 15m';
  if (m.runtime && typeof m.runtime === 'number' && m.runtime > 0) {
    const hrs = Math.floor(m.runtime / 60);
    const mins = m.runtime % 60;
    duration = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  }

  // Certification / Censor Rating
  let certification = 'UA 16+';
  if (m.release_dates && m.release_dates.results) {
    const usOrIn = m.release_dates.results.find(
      (r) => r.iso_3166_1 === 'IN' || r.iso_3166_1 === 'US'
    );
    if (usOrIn && usOrIn.release_dates && usOrIn.release_dates[0]?.certification) {
      const cert = usOrIn.release_dates[0].certification;
      if (cert) certification = cert;
    }
  }

  // Poster & Backdrop URLs
  const posterUrl = m.poster_path
    ? `${IMAGE_POSTER_BASE}${m.poster_path}`
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop';

  const backdropUrl = m.backdrop_path
    ? `${IMAGE_BACKDROP_BASE}${m.backdrop_path}`
    : posterUrl;

  // Trailer URL
  let trailerUrl = '';
  if (m.videos && Array.isArray(m.videos.results)) {
    const trailer =
      m.videos.results.find(
        (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
      ) || m.videos.results[0];
    if (trailer?.key) {
      trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
    }
  }

  // Cast members
  let cast = [];
  if (m.credits && Array.isArray(m.credits.cast)) {
    cast = m.credits.cast.slice(0, 8).map((c) => c.name);
  }

  // Director
  let director = '';
  if (m.credits && Array.isArray(m.credits.crew)) {
    const dir = m.credits.crew.find((c) => c.job === 'Director');
    if (dir) director = dir.name;
  }

  const rating =
    m.vote_average !== undefined
      ? Number(m.vote_average.toFixed(1))
      : 8.0;

  return {
    _id: id,
    tmdbId: m.id,
    movieName: title,
    title,
    description: m.overview || 'Live release currently screening across multiplexes.',
    genres,
    genre: genres,
    releaseDate: m.release_date ? new Date(m.release_date) : new Date(),
    language,
    duration,
    certification,
    censorRating: certification,
    posterUrl,
    backdropUrl,
    trailerUrl,
    rating,
    voteCount: m.vote_count || 100,
    cast,
    director,
    featured: (m.popularity && m.popularity > 40) || rating >= 7.8,
    status: 'now_showing',
  };
};

/**
 * Fetch Live Market Movies (Now Playing)
 */
const getNowPlaying = async (page = 1) => {
  const data = await cachedGet('/movie/now_playing', { page });
  const rawList = data.results || [];
  return rawList.map(normalizeMovie).filter(Boolean);
};

/**
 * Fetch Popular Movies
 */
const getPopular = async (page = 1) => {
  const data = await cachedGet('/movie/popular', { page });
  const rawList = data.results || [];
  return rawList.map(normalizeMovie).filter(Boolean);
};

/**
 * Fetch Top Rated Movies
 */
const getTopRated = async (page = 1) => {
  const data = await cachedGet('/movie/top_rated', { page });
  const rawList = data.results || [];
  return rawList.map(normalizeMovie).filter(Boolean);
};

/**
 * Fetch Upcoming Market Releases
 */
const getUpcoming = async (page = 1) => {
  const data = await cachedGet('/movie/upcoming', { page });
  const rawList = data.results || [];
  return rawList.map((m) => {
    const norm = normalizeMovie(m);
    if (norm) norm.status = 'upcoming';
    return norm;
  }).filter(Boolean);
};

/**
 * Search live movies via TMDB Search API
 */
const searchMovies = async (query, page = 1) => {
  if (!query || !query.trim()) return [];
  const data = await cachedGet('/search/movie', {
    query: query.trim(),
    page,
    include_adult: false,
  });
  const rawList = data.results || [];
  return rawList.map(normalizeMovie).filter(Boolean);
};

/**
 * Fetch Detailed Movie with Cast, Crew, Videos & Release Dates
 */
const getMovieDetails = async (tmdbId) => {
  if (!tmdbId) return null;
  const data = await cachedGet(`/movie/${tmdbId}`, {
    append_to_response: 'credits,videos,release_dates',
  });
  return normalizeMovie(data);
};

/**
 * Unified Live Market Catalog Getter with Filtering
 */
const getLiveCatalog = async ({ search, genre, language, status } = {}) => {
  let movies = [];

  if (search && search.trim()) {
    movies = await searchMovies(search.trim());
  } else {
    // Combine Now Playing + Popular + Upcoming for a rich market catalog
    try {
      const results = await Promise.allSettled([
        getNowPlaying(1),
        getPopular(1),
        getUpcoming(1),
      ]);

      // Deduplicate by ID
      const map = new Map();
      results.forEach((res) => {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          res.value.forEach((m) => {
            if (!map.has(m._id)) map.set(m._id, m);
          });
        }
      });
      movies = Array.from(map.values());
    } catch (err) {
      console.error('[TMDB Service] Error fetching live catalog:', err.message);
      // Fallback to now playing only
      movies = await getNowPlaying(1).catch(() => []);
    }
  }

  // In-memory filters matching UI query parameters
  if (genre && genre !== 'All') {
    movies = movies.filter((m) =>
      m.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }

  if (language && language !== 'All') {
    movies = movies.filter(
      (m) => m.language && m.language.toLowerCase() === language.toLowerCase()
    );
  }

  if (status && status !== 'all') {
    movies = movies.filter((m) => m.status === status);
  }

  return movies;
};

module.exports = {
  tmdbClient,
  getNowPlaying,
  getPopular,
  getTopRated,
  getUpcoming,
  searchMovies,
  getMovieDetails,
  getLiveCatalog,
  normalizeMovie,
  GENRE_MAP,
  LANGUAGE_MAP,
};
