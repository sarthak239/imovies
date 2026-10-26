import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaClock, FaTicketAlt, FaInfoCircle } from 'react-icons/fa';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop';

const MovieCard = ({ movie }) => {
  const [imgSrc, setImgSrc] = useState(movie.posterUrl || FALLBACK_POSTER);

  const isUpcoming = movie.status === 'upcoming';

  return (
    <div className="movie-card">
      <div className="poster-wrapper">
        <img
          src={imgSrc}
          alt={movie.title}
          className="movie-poster"
          loading="lazy"
          onError={() => setImgSrc(FALLBACK_POSTER)}
        />
        {movie.censorRating && (
          <span className="poster-badge">{movie.censorRating}</span>
        )}
        <span className="poster-rating">
          <FaStar size={11} />
          {movie.rating ? movie.rating.toFixed(1) : '8.0'}
        </span>
      </div>

      <div className="movie-info">
        <h5 className="movie-title" title={movie.title}>
          {movie.title}
        </h5>

        <div className="d-flex align-items-center gap-2 text-secondary small mb-2">
          <span className="d-flex align-items-center gap-1">
            <FaClock size={11} /> {movie.duration}m
          </span>
          <span>•</span>
          <span className="text-truncate">
            {Array.isArray(movie.language) ? movie.language.join(', ') : movie.language}
          </span>
        </div>

        <div className="mb-3" style={{ minHeight: '26px' }}>
          {movie.genre &&
            movie.genre.slice(0, 3).map((g, idx) => (
              <span key={idx} className="genre-tag">
                {g}
              </span>
            ))}
        </div>

        <div className="mt-auto d-flex gap-2">
          <Link
            to={`/movies/${movie._id}`}
            className="btn btn-cinema-outline btn-sm flex-grow-1 justify-content-center"
            style={{ fontSize: '0.85rem', padding: '8px 12px' }}
          >
            <FaInfoCircle size={13} /> Details
          </Link>
          {!isUpcoming ? (
            <Link
              to={`/movies/${movie._id}/theaters`}
              className="btn btn-cinema btn-sm flex-grow-1 justify-content-center"
              style={{ fontSize: '0.85rem', padding: '8px 12px' }}
            >
              <FaTicketAlt size={12} /> Book
            </Link>
          ) : (
            <span
              className="btn btn-secondary btn-sm flex-grow-1 justify-content-center disabled opacity-50"
              style={{ fontSize: '0.85rem', padding: '8px 12px' }}
            >
              Soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
