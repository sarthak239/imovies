import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { favoriteService } from '../services/favoriteService';
import { reviewService } from '../services/reviewService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import {
  Star,
  Clock,
  Calendar,
  Languages,
  Ticket,
  Play,
  Heart,
  ArrowLeft,
  Users,
  MessageSquare,
  Send,
  X,
  Sparkles,
} from 'lucide-react';

export default function MovieDetailsPage() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  // Review Form state
  const [rating, setRating] = useState(10);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchData();
  }, [movieId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, rRes] = await Promise.all([
        movieService.getMovieById(movieId),
        reviewService.getMovieReviews(movieId).catch(() => ({ reviews: [] })),
      ]);
      if (mRes?.movie) {
        setMovie(mRes.movie);
      }
      if (rRes?.reviews) {
        setReviews(rRes.reviews);
      }
    } catch (err) {
      console.error('Error fetching movie details:', err);
      toast.error('Unable to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!movie) return;
    try {
      const res = await favoriteService.toggleFavorite({
        movieId: movie._id,
        movieName: movie.title || movie.movieName,
        posterUrl: movie.posterUrl,
      });
      setIsFavorite(res.isFavorite);
      toast.success(res.isFavorite ? 'Saved to Watchlist' : 'Removed from Watchlist');
    } catch (err) {
      toast.error('Watchlist update failed');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast.error('Please enter a review');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await reviewService.createReview({
        movieId,
        rating: Number(rating),
        reviewText: reviewText.trim(),
      });
      toast.success('Review posted successfully!');
      setReviewText('');
      // Reload reviews
      const rRes = await reviewService.getMovieReviews(movieId);
      setReviews(rRes.reviews || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading movie details…" />;
  }

  if (!movie) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Movie Not Found</h2>
        <Link to="/home" className="btn-prime text-sm px-4 py-2 rounded no-underline">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  const title = movie.title || movie.movieName;
  const genres = movie.genres || movie.genre || [];

  return (
    <div className="pb-24" style={{ background: '#0f171e' }}>
      {/* Massive Cinematic Backdrop Banner */}
      <section className="relative min-h-[460px] md:min-h-[560px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})`,
          }}
        />
        {/* Prime Video Dark Blue Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f171e] via-[#0f171e]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-[#0f171e]/40 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8ea3b0] hover:text-white transition-colors mb-6 no-underline"
          >
            <ArrowLeft size={14} /> Back to Catalog
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            {/* Poster Card */}
            <div className="w-40 sm:w-52 md:w-64 rounded-lg overflow-hidden border border-[#2c3e50] shadow-2xl flex-shrink-0"
                 style={{ aspectRatio: '2/3', background: '#1a242f' }}>
              <img
                src={movie.posterUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info details */}
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge-prime text-xs font-bold tracking-wider">
                  PRIME VIDEO EXCLUSIVE
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#1a242f] border border-[#2c3e50] text-[#8ea3b0]">
                  {movie.certification || 'UA 16+'}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-[#1a242f] px-2 py-0.5 rounded border border-[#2c3e50]">
                  <Star size={12} fill="#f5a623" color="#f5a623" />
                  {movie.rating ? Number(movie.rating).toFixed(1) : '8.5'} IMDb
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#8ea3b0] mb-4">
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-[#00a8e1]" /> {movie.duration}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Languages size={13} className="text-[#00a8e1]" /> {movie.language || 'English'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-[#00a8e1]" /> {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '2024'}
                </span>
              </div>

              {/* Genre Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {genres.map((g, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md border border-[#2c3e50] bg-[#1a242f]/80 text-[#8ea3b0]"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/movieshows/${movie._id}`}
                  className="btn-prime text-sm px-7 py-3 rounded-md font-bold shadow-lg shadow-[#00a8e1]/30 no-underline"
                >
                  <Ticket size={18} /> Book Tickets
                </Link>

                {movie.trailerUrl && (
                  <button
                    type="button"
                    onClick={() => setTrailerOpen(true)}
                    className="btn-prime-outline text-sm px-5 py-3 rounded-md font-semibold"
                  >
                    <Play size={16} /> Watch Trailer
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className="p-3 rounded-md border border-[#2c3e50] bg-[#1a242f] hover:border-[#00a8e1] text-white transition-colors"
                  title="Watchlist"
                >
                  <Heart size={18} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body: Synopsis, Cast, Reviews */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Synopsis & Cast */}
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis */}
            <div className="p-6 rounded-xl border border-[#2c3e50]" style={{ background: '#1a242f' }}>
              <h3 className="section-title text-lg font-bold text-white mb-3">
                Storyline & Synopsis
              </h3>
              <p className="text-sm md:text-base text-[#8ea3b0] leading-relaxed">
                {movie.description}
              </p>
            </div>

            {/* Cast List */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="p-6 rounded-xl border border-[#2c3e50]" style={{ background: '#1a242f' }}>
                <h3 className="section-title text-lg font-bold text-white mb-4">
                  Starring Cast
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {movie.cast.map((actor, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-[#2c3e50] bg-[#141d26] flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                           style={{ background: '#00a8e1' }}>
                        {actor[0]}
                      </div>
                      <span className="text-xs font-semibold text-white truncate">{actor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Reviews Section */}
            <div className="p-6 rounded-xl border border-[#2c3e50]" style={{ background: '#1a242f' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="section-title text-lg font-bold text-white">
                  Audience Reviews ({reviews.length})
                </h3>
                <span className="text-xs text-[#8ea3b0] flex items-center gap-1">
                  <MessageSquare size={13} /> Verified Cinephiles
                </span>
              </div>

              {/* Submit Review Form */}
              <form onSubmit={handleReviewSubmit} className="mb-8 p-4 rounded-lg bg-[#141d26] border border-[#2c3e50]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#00a8e1]" /> Write Your Review
                </h4>

                <div className="flex items-center gap-3 mb-3">
                  <label className="text-xs text-[#8ea3b0]">Your Rating:</label>
                  <select
                    className="input-prime py-1 px-2.5 text-xs w-auto"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        ★ {r} / 10
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  className="input-prime text-xs p-3 h-24 mb-3 resize-none"
                  placeholder="Share your thoughts on the performance, cinematography, and plot..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-prime text-xs py-2 px-4 rounded font-bold justify-center"
                >
                  <Send size={13} /> {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>

              {/* Review Cards List */}
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-xs text-[#8ea3b0] text-center py-4">
                    No reviews yet. Be the first to share your cinema experience!
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="p-4 rounded-lg bg-[#141d26] border border-[#2c3e50]/70"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white"
                               style={{ background: '#2c3e50' }}>
                            {(rev.username || rev.userEmail || 'U')[0].toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-white">
                            {rev.username || rev.userEmail}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                          <Star size={11} fill="#f5a623" color="#f5a623" /> {rev.rating} / 10
                        </span>
                      </div>
                      <p className="text-xs text-[#8ea3b0] leading-relaxed">
                        {rev.reviewText}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Booking Fast-Track Info */}
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-[#2c3e50] sticky top-20"
                 style={{ background: '#1a242f' }}>
              <h4 className="text-base font-bold text-white mb-4">Cinema Experience</h4>

              <div className="space-y-3 text-xs text-[#8ea3b0] mb-6">
                <div className="flex justify-between py-1.5 border-b border-[#2c3e50]">
                  <span>Projection Format</span>
                  <span className="text-white font-semibold">IMAX 4K Laser & 2D</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#2c3e50]">
                  <span>Audio System</span>
                  <span className="text-white font-semibold">Dolby Atmos 7.1</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#2c3e50]">
                  <span>Tier Options</span>
                  <span className="text-white font-semibold">Balcony, Middle, Lower</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#2c3e50]">
                  <span>Seat Lock TTL</span>
                  <span className="text-[#00a8e1] font-semibold">5 Minutes Guaranteed</span>
                </div>
              </div>

              <Link
                to={`/movieshows/${movie._id}`}
                className="btn-prime w-full py-3 rounded-md font-bold justify-center text-sm no-underline shadow-lg shadow-[#00a8e1]/30"
              >
                <Ticket size={16} /> Select Showtimes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {trailerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-[#141d26] rounded-xl overflow-hidden border border-[#2c3e50]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2c3e50]">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Play size={14} className="text-[#00a8e1]" /> {title} - Trailer
              </span>
              <button
                onClick={() => setTrailerOpen(false)}
                className="text-[#8ea3b0] hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={movie.trailerUrl}
                title="Trailer"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
