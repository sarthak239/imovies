import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaStar,
  FaClock,
  FaCalendarAlt,
  FaLanguage,
  FaTicketAlt,
  FaPlay,
  FaArrowLeft,
  FaUserTie,
  FaUsers,
  FaFilm,
} from 'react-icons/fa';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [activeShowsCount, setActiveShowsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posterImg, setPosterImg] = useState('');

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await movieService.getMovieById(id);
      if (data?.movie) {
        setMovie(data.movie);
        setActiveShowsCount(data.activeShowsCount || 0);
        setPosterImg(data.movie.posterUrl || FALLBACK_POSTER);
      }
    } catch (err) {
      console.error('Error fetching movie details:', err);
      setError('Unable to load movie details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading movie details..." />;
  }

  if (error || !movie) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger bg-dark border-danger text-danger py-4">
          <h5>{error || 'Movie Not Found'}</h5>
          <Link to="/movies" className="btn btn-outline-light btn-sm mt-3">
            <FaArrowLeft className="me-1" /> Back to Movie Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isUpcoming = movie.status === 'upcoming';

  return (
    <div>
      {/* Movie Hero Header with Backdrop */}
      <div
        className="position-relative py-5"
        style={{
          background: `linear-gradient(to bottom, rgba(12, 13, 20, 0.75), rgba(12, 13, 20, 0.98)), url(${
            movie.backdropUrl || movie.posterUrl
          })`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '1px solid var(--imv-border)',
        }}
      >
        <div className="container py-4">
          <Link to="/movies" className="btn btn-outline-secondary btn-sm mb-4 d-inline-flex align-items-center gap-1">
            <FaArrowLeft size={11} /> Back to Movies
          </Link>

          <div className="row g-4 align-items-center">
            {/* Movie Poster */}
            <div className="col-md-4 col-lg-3">
              <div
                className="rounded-4 overflow-hidden shadow-lg border border-secondary position-relative"
                style={{ aspectRatio: '2/3', backgroundColor: '#141624' }}
              >
                <img
                  src={posterImg}
                  alt={movie.title}
                  className="w-100 h-100 object-fit-cover"
                  onError={() => setPosterImg(FALLBACK_POSTER)}
                />
                <span className="poster-badge">{movie.censorRating || 'UA'}</span>
              </div>
            </div>

            {/* Movie Info */}
            <div className="col-md-8 col-lg-9">
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span className="badge bg-danger fw-bold">
                  {isUpcoming ? 'Upcoming Release' : 'Now In Theaters'}
                </span>
                <span className="badge bg-dark border border-secondary text-warning d-flex align-items-center gap-1">
                  <FaStar size={11} /> {movie.rating ? movie.rating.toFixed(1) : '8.0'} / 10
                </span>
                <span className="badge bg-dark border border-secondary text-light">
                  {activeShowsCount} Active Shows Scheduled
                </span>
              </div>

              <h1 className="display-5 fw-bold text-white mb-3">{movie.title}</h1>

              <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small mb-4">
                <span className="d-flex align-items-center gap-1">
                  <FaClock className="text-danger" size={13} /> {movie.duration} Minutes
                </span>
                <span>•</span>
                <span className="d-flex align-items-center gap-1">
                  <FaLanguage className="text-danger" size={14} />{' '}
                  {Array.isArray(movie.language) ? movie.language.join(', ') : movie.language}
                </span>
                <span>•</span>
                <span className="d-flex align-items-center gap-1">
                  <FaCalendarAlt className="text-danger" size={12} />{' '}
                  {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* Genre Pills */}
              <div className="mb-4">
                {movie.genre &&
                  movie.genre.map((g, idx) => (
                    <span
                      key={idx}
                      className="badge bg-secondary bg-opacity-25 border border-secondary text-light me-2 py-2 px-3 rounded-pill"
                    >
                      {g}
                    </span>
                  ))}
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap gap-3">
                {!isUpcoming ? (
                  <Link
                    to={`/movies/${movie._id}/theaters`}
                    className="btn btn-cinema btn-lg px-4"
                  >
                    <FaTicketAlt size={16} /> Book Movie Tickets
                  </Link>
                ) : (
                  <button className="btn btn-secondary btn-lg px-4" disabled>
                    Advance Booking Coming Soon
                  </button>
                )}

                {movie.trailerUrl && (
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-cinema-outline btn-lg px-4"
                  >
                    <FaPlay size={13} /> Watch Official Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="container py-5">
        <div className="row g-5">
          {/* Left Column: Synopsis & Cast */}
          <div className="col-lg-8">
            {/* Synopsis */}
            <div
              className="p-4 rounded-4 mb-4"
              style={{
                backgroundColor: 'var(--imv-bg-card)',
                border: '1px solid var(--imv-border)',
              }}
            >
              <h4 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <FaFilm className="text-danger" size={18} /> About the Movie
              </h4>
              <p className="text-light" style={{ lineHeight: '1.8', fontSize: '1.02rem' }}>
                {movie.description}
              </p>
            </div>

            {/* Cast & Crew */}
            <div
              className="p-4 rounded-4"
              style={{
                backgroundColor: 'var(--imv-bg-card)',
                border: '1px solid var(--imv-border)',
              }}
            >
              <h4 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                <FaUsers className="text-danger" size={20} /> Cast & Crew
              </h4>

              {movie.director && (
                <div className="mb-4">
                  <div className="text-secondary small fw-bold text-uppercase mb-2 d-flex align-items-center gap-1">
                    <FaUserTie size={12} /> Director
                  </div>
                  <div className="d-inline-flex align-items-center gap-2 p-2 px-3 rounded-pill bg-dark border border-secondary text-white fw-semibold">
                    {movie.director}
                  </div>
                </div>
              )}

              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <div className="text-secondary small fw-bold text-uppercase mb-2">
                    Starring Cast
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {movie.cast.map((actor, idx) => (
                      <span
                        key={idx}
                        className="p-2 px-3 rounded-pill bg-dark border border-secondary text-light small fw-medium"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Cinema Booking Fast-Track */}
          <div className="col-lg-4">
            <div
              className="p-4 rounded-4 sticky-top"
              style={{
                top: '90px',
                backgroundColor: 'var(--imv-bg-card)',
                border: '1px solid var(--imv-border)',
              }}
            >
              <h5 className="text-white fw-bold mb-3">Ticket Information</h5>
              <div className="d-flex flex-column gap-3 mb-4 text-secondary small">
                <div className="d-flex justify-content-between border-bottom border-secondary pb-2">
                  <span>Auditorium Formats:</span>
                  <span className="text-white fw-semibold">IMAX 3D, Dolby Atmos 4K</span>
                </div>
                <div className="d-flex justify-content-between border-bottom border-secondary pb-2">
                  <span>Available Tiers:</span>
                  <span className="text-white fw-semibold">Silver, Gold, VIP Recliners</span>
                </div>
                <div className="d-flex justify-content-between border-bottom border-secondary pb-2">
                  <span>Estimated Ticket Price:</span>
                  <span className="text-white fw-semibold">₹180 - ₹450</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Cancellation Policy:</span>
                  <span className="text-success fw-semibold">100% Refundable</span>
                </div>
              </div>

              {!isUpcoming ? (
                <Link
                  to={`/movies/${movie._id}/theaters`}
                  className="btn btn-cinema w-100 py-3 fw-bold"
                >
                  <FaTicketAlt size={16} /> Select Theater & Showtime
                </Link>
              ) : (
                <button className="btn btn-secondary w-100 py-3 disabled opacity-75">
                  Notification Set for Release
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
