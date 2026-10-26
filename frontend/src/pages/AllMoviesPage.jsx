import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieService } from '../services/movieService';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaSearch, FaFilter, FaRedoAlt } from 'react-icons/fa';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'Biography', 'Animation', 'Crime', 'Thriller'];
const LANGUAGES = ['All', 'English', 'Hindi', 'Tamil', 'Telugu'];
const STATUS_OPTIONS = [
  { label: 'All Status', value: 'all' },
  { label: 'Now Showing', value: 'now_showing' },
  { label: 'Upcoming', value: 'upcoming' },
];

const AllMoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter States initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'All');
  const [language, setLanguage] = useState(searchParams.get('language') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    fetchFilteredMovies();
  }, [searchParams]);

  const fetchFilteredMovies = async () => {
    try {
      setLoading(true);
      setError('');
      const queryParams = {};

      const currentSearch = searchParams.get('search');
      const currentGenre = searchParams.get('genre');
      const currentLang = searchParams.get('language');
      const currentStatus = searchParams.get('status');

      if (currentSearch) queryParams.search = currentSearch;
      if (currentGenre && currentGenre !== 'All') queryParams.genre = currentGenre;
      if (currentLang && currentLang !== 'All') queryParams.language = currentLang;
      if (currentStatus && currentStatus !== 'all') queryParams.status = currentStatus;

      const data = await movieService.getMovies(queryParams);
      if (data?.movies) {
        setMovies(data.movies);
      }
    } catch (err) {
      console.error('Error fetching filtered movies:', err);
      setError('Failed to load movies. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (newParams) => {
    const updated = {
      search,
      genre,
      language,
      status,
      ...newParams,
    };

    const cleanParams = {};
    if (updated.search) cleanParams.search = updated.search;
    if (updated.genre && updated.genre !== 'All') cleanParams.genre = updated.genre;
    if (updated.language && updated.language !== 'All') cleanParams.language = updated.language;
    if (updated.status && updated.status !== 'all') cleanParams.status = updated.status;

    setSearchParams(cleanParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters({ search: search.trim() });
  };

  const resetAllFilters = () => {
    setSearch('');
    setGenre('All');
    setLanguage('All');
    setStatus('all');
    setSearchParams({});
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-white mb-2">
          Discover <span style={{ color: 'var(--imv-primary)' }}>Movies</span>
        </h1>
        <p className="text-secondary small mb-0">
          Filter through blockbuster releases, explore genres, and book premier seats
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="p-4 rounded-4 mb-4"
        style={{
          backgroundColor: 'var(--imv-bg-card)',
          border: '1px solid var(--imv-border)',
        }}
      >
        <form onSubmit={handleSearchSubmit} className="row g-3">
          {/* Search Input */}
          <div className="col-lg-4 col-md-6">
            <label className="form-label text-secondary small fw-semibold">
              Search by Title, Cast, or Crew
            </label>
            <div className="position-relative">
              <input
                type="text"
                className="form-control form-control-cinema ps-5"
                placeholder="e.g. Dune, Nolan, Christopher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FaSearch
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                size={14}
              />
            </div>
          </div>

          {/* Genre Dropdown */}
          <div className="col-lg-3 col-md-6 col-6">
            <label className="form-label text-secondary small fw-semibold">Genre</label>
            <select
              className="form-select form-select-cinema"
              value={genre}
              onChange={(e) => {
                setGenre(e.target.value);
                applyFilters({ genre: e.target.value });
              }}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Language Dropdown */}
          <div className="col-lg-3 col-md-6 col-6">
            <label className="form-label text-secondary small fw-semibold">Language</label>
            <select
              className="form-select form-select-cinema"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                applyFilters({ language: e.target.value });
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs / Dropdown */}
          <div className="col-lg-2 col-md-6">
            <label className="form-label text-secondary small fw-semibold">Status</label>
            <select
              className="form-select form-select-cinema"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                applyFilters({ status: e.target.value });
              }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Active Filter Tags */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3 pt-3 border-top border-secondary">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="text-secondary small fw-semibold d-flex align-items-center gap-1">
              <FaFilter size={11} /> Filters:
            </span>
            {genre !== 'All' && (
              <span className="badge bg-danger rounded-pill px-3 py-1">Genre: {genre}</span>
            )}
            {language !== 'All' && (
              <span className="badge bg-danger rounded-pill px-3 py-1">Language: {language}</span>
            )}
            {status !== 'all' && (
              <span className="badge bg-danger rounded-pill px-3 py-1">
                Status: {status === 'now_showing' ? 'Now Showing' : 'Upcoming'}
              </span>
            )}
            {search && (
              <span className="badge bg-danger rounded-pill px-3 py-1">Search: "{search}"</span>
            )}
            {genre === 'All' && language === 'All' && status === 'all' && !search && (
              <span className="text-muted small">Showing all available titles</span>
            )}
          </div>

          <button
            onClick={resetAllFilters}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
          >
            <FaRedoAlt size={11} /> Reset Filters
          </button>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <LoadingSpinner message="Searching movie catalog..." />
      ) : error ? (
        <div className="alert alert-danger bg-dark border-danger text-danger text-center py-4">
          {error}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-5 bg-dark rounded-4 border border-secondary text-secondary my-4">
          <h4>No movies found</h4>
          <p className="small mb-3">Try adjusting your search criteria or resetting filters.</p>
          <button onClick={resetAllFilters} className="btn btn-cinema-outline btn-sm">
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="d-flex align-items-center justify-content-between mb-3 text-secondary small">
            <span>
              Showing <strong>{movies.length}</strong> movies
            </span>
          </div>
          <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
            {movies.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AllMoviesPage;
