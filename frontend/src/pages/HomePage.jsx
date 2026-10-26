import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaSearch,
  FaTicketAlt,
  FaPlay,
  FaStar,
  FaShieldAlt,
  FaBolt,
  FaMobileAlt,
  FaUndo,
} from 'react-icons/fa';

const GENRES = ['All', 'Sci-Fi', 'Action', 'Drama', 'Adventure', 'Biography', 'Animation'];

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await movieService.getMovies();
      if (data?.movies) {
        setMovies(data.movies);
        // Set featured movie
        const featured = data.movies.find((m) => m.featured && m.status === 'now_showing') || data.movies[0];
        setFeaturedMovie(featured);
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Unable to connect to the backend server. Please verify the API is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const nowShowing = movies.filter((m) => {
    const isNow = m.status === 'now_showing';
    const matchesGenre =
      selectedGenre === 'All' ||
      (m.genre && m.genre.some((g) => g.toLowerCase() === selectedGenre.toLowerCase()));
    return isNow && matchesGenre;
  });

  const upcomingMovies = movies.filter((m) => m.status === 'upcoming');

  if (loading) {
    return <LoadingSpinner message="Curating cinema experience..." />;
  }

  return (
    <div className="container py-4">
      {/* Error alert if backend offline */}
      {error && (
        <div className="alert alert-danger bg-dark border-danger text-danger d-flex justify-content-between align-items-center mb-4">
          <span>{error}</span>
          <button onClick={fetchMovies} className="btn btn-outline-danger btn-sm">
            Retry Connection
          </button>
        </div>
      )}

      {/* Hero Showcase Banner */}
      {featuredMovie && (
        <section className="mb-5">
          <div
            className="hero-banner"
            style={{
              backgroundImage: `url(${featuredMovie.backdropUrl || featuredMovie.posterUrl})`,
            }}
          >
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-danger text-uppercase px-2 py-1 fw-bold">
                  Featured Release
                </span>
                <span className="badge bg-dark border border-secondary text-light">
                  {featuredMovie.censorRating || 'UA'}
                </span>
                <span className="badge bg-dark border border-secondary text-warning d-flex align-items-center gap-1">
                  <FaStar size={11} /> {featuredMovie.rating?.toFixed(1) || '8.5'}
                </span>
              </div>

              <h1 className="display-4 fw-black text-white mb-2">{featuredMovie.title}</h1>

              <p className="text-secondary mb-3 small d-flex flex-wrap gap-2">
                <span>{featuredMovie.duration} mins</span>
                <span>•</span>
                <span>{Array.isArray(featuredMovie.language) ? featuredMovie.language.join(', ') : featuredMovie.language}</span>
                <span>•</span>
                <span>{Array.isArray(featuredMovie.genre) ? featuredMovie.genre.join(', ') : featuredMovie.genre}</span>
              </p>

              <p
                className="text-light mb-4"
                style={{
                  lineHeight: '1.6',
                  maxHeight: '75px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {featuredMovie.description}
              </p>

              <div className="d-flex flex-wrap gap-3">
                <Link
                  to={`/movies/${featuredMovie._id}/theaters`}
                  className="btn btn-cinema btn-lg px-4"
                >
                  <FaTicketAlt size={16} /> Book Tickets Now
                </Link>
                {featuredMovie.trailerUrl && (
                  <a
                    href={featuredMovie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-cinema-outline btn-lg px-4"
                  >
                    <FaPlay size={13} /> Watch Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Interactive Search & Quick Filters Bar */}
      <section className="mb-5">
        <div
          className="p-4 rounded-4"
          style={{
            backgroundColor: 'var(--imv-bg-card)',
            border: '1px solid var(--imv-border)',
          }}
        >
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-lg-6">
              <form onSubmit={handleSearchSubmit} className="position-relative">
                <input
                  type="text"
                  className="form-control form-control-cinema ps-5"
                  placeholder="Search movies by title, actor, or director..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                  size={16}
                />
              </form>
            </div>

            {/* Quick Genre Pills */}
            <div className="col-lg-6">
              <div className="d-flex align-items-center gap-2 overflow-auto pb-1">
                <span className="text-secondary small fw-semibold me-1 d-none d-sm-inline">
                  Genre:
                </span>
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`btn btn-sm text-nowrap rounded-pill px-3 transition-all ${
                      selectedGenre === genre
                        ? 'btn-danger text-white'
                        : 'btn-dark text-secondary border-secondary'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Now Showing Section */}
      <section className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="text-white mb-1">
              Now <span style={{ color: 'var(--imv-primary)' }}>Showing</span>
            </h2>
            <p className="text-secondary small mb-0">
              Catch the latest blockbusters on the biggest multiplex screens
            </p>
          </div>
          <Link to="/movies" className="btn btn-cinema-outline btn-sm">
            Explore All Movies &rarr;
          </Link>
        </div>

        {nowShowing.length === 0 ? (
          <div className="text-center py-5 bg-dark rounded-4 border border-secondary text-secondary">
            <p className="mb-2">No movies found matching category "{selectedGenre}".</p>
            <button
              onClick={() => setSelectedGenre('All')}
              className="btn btn-sm btn-outline-danger"
            >
              Reset Category
            </button>
          </div>
        ) : (
          <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
            {nowShowing.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Movies Teaser Section */}
      {upcomingMovies.length > 0 && (
        <section className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="text-white mb-1">
                Upcoming <span style={{ color: 'var(--imv-accent-gold)' }}>Releases</span>
              </h2>
              <p className="text-secondary small mb-0">
                Get ready for cinematic spectacles hitting theaters soon
              </p>
            </div>
            <Link
              to="/movies?status=upcoming"
              className="btn btn-outline-warning btn-sm"
            >
              View Anticipated Movies &rarr;
            </Link>
          </div>

          <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
            {upcomingMovies.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why Choose iMovies Features Banner */}
      <section className="my-5 py-4">
        <div className="text-center mb-5">
          <h3 className="text-white fw-bold">The Modern Cinema Experience</h3>
          <p className="text-secondary small">
            Designed to make booking movie tickets fast, transparent, and enjoyable
          </p>
        </div>

        <div className="row g-4">
          <div className="col-md-3 col-sm-6">
            <div className="p-4 rounded-4 h-100 bg-dark border border-secondary text-center">
              <div
                className="d-inline-flex p-3 rounded-circle mb-3 text-danger"
                style={{ backgroundColor: 'rgba(229, 9, 20, 0.15)' }}
              >
                <FaBolt size={24} />
              </div>
              <h6 className="text-white fw-bold mb-2">Instant Seat Locking</h6>
              <p className="text-secondary small mb-0">
                Live interactive seat matrix with atomic seat locking ensures zero double-booking.
              </p>
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <div className="p-4 rounded-4 h-100 bg-dark border border-secondary text-center">
              <div
                className="d-inline-flex p-3 rounded-circle mb-3 text-warning"
                style={{ backgroundColor: 'rgba(255, 184, 0, 0.15)' }}
              >
                <FaShieldAlt size={24} />
              </div>
              <h6 className="text-white fw-bold mb-2">Transparent Pricing</h6>
              <p className="text-secondary small mb-0">
                Clear tier pricing for Silver, Gold, and VIP recliner seats with no hidden markups.
              </p>
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <div className="p-4 rounded-4 h-100 bg-dark border border-secondary text-center">
              <div
                className="d-inline-flex p-3 rounded-circle mb-3 text-info"
                style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)' }}
              >
                <FaMobileAlt size={24} />
              </div>
              <h6 className="text-white fw-bold mb-2">Instant M-Ticket</h6>
              <p className="text-secondary small mb-0">
                Receive digital boarding tickets with simulation QR codes directly in your account.
              </p>
            </div>
          </div>

          <div className="col-md-3 col-sm-6">
            <div className="p-4 rounded-4 h-100 bg-dark border border-secondary text-center">
              <div
                className="d-inline-flex p-3 rounded-circle mb-3 text-success"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
              >
                <FaUndo size={24} />
              </div>
              <h6 className="text-white fw-bold mb-2">Easy Cancellations</h6>
              <p className="text-secondary small mb-0">
                Cancel tickets anytime before showtime with one click and instant seat release.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
