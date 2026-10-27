import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Play, Ticket } from 'lucide-react';

const FALLBACK = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400&auto=format&fit=crop';

export default function MovieCard({ movie, showBookBtn = true }) {
  const [imgSrc, setImgSrc] = useState(movie?.posterUrl || FALLBACK);

  if (!movie) return null;

  const title     = movie.title || movie.movieName || 'Untitled';
  const genres    = movie.genre || movie.genres || [];
  const duration  = movie.duration;
  const rating    = movie.rating;
  const movieId   = movie._id;
  const isUpcoming = movie.status === 'upcoming';

  return (
    <div className="movie-card group">
      {/* Poster */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
        <img src={imgSrc} alt={title} onError={() => setImgSrc(FALLBACK)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          {isUpcoming
            ? <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: '#f5a623', color: '#1a1a1a' }}>UPCOMING</span>
            : <span className="badge-prime text-[10px]">NOW SHOWING</span>
          }
        </div>

        {/* Rating */}
        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
               style={{ background: 'rgba(15,23,30,0.85)', border: '1px solid #2c3e50' }}>
            <Star size={9} fill="#f5a623" color="#f5a623" />
            <span className="text-white">{Number(rating).toFixed(1)}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="card-overlay">
          {genres.slice(0, 2).map(g => (
            <span key={g} className="inline-block text-[10px] font-bold px-2 py-0.5 rounded mr-1 mb-1"
                  style={{ background: 'rgba(0,168,225,0.2)', border: '1px solid #00a8e1', color: '#00a8e1' }}>
              {g}
            </span>
          ))}
          {duration && (
            <div className="flex items-center gap-1 text-[11px] text-[#8ea3b0] mt-1">
              <Clock size={10} /> {duration} min
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <Link to={`/moviedetails/${movieId}`}
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded no-underline"
              style={{ background: '#00a8e1', color: '#fff' }}>
              <Play size={10} /> Details
            </Link>
            {!isUpcoming && showBookBtn && (
              <Link to={`/movieshows/${movieId}`}
                className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded no-underline"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}>
                <Ticket size={10} /> Book
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-2.5 py-2.5">
        <Link to={`/moviedetails/${movieId}`}
          className="block text-sm font-bold text-white hover:text-[#00a8e1] transition-colors no-underline truncate">
          {title}
        </Link>
        <p className="text-[11px] text-[#4a6275] mt-0.5 truncate">
          {genres.slice(0, 2).join(' · ')}
        </p>
      </div>
    </div>
  );
}
