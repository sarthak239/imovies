import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoriteService } from '../services/favoriteService';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { Heart, Trash2, ArrowLeft, Film } from 'lucide-react';

export default function WatchlistPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const data = await favoriteService.getFavorites();
      if (data?.favorites) {
        setFavorites(data.favorites);
      }
    } catch (err) {
      console.error('Failed to load watchlist:', err);
      toast.error('Could not load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (movieId) => {
    try {
      await favoriteService.removeFavorite(movieId);
      toast.info('Removed from Watchlist');
      setFavorites(favorites.filter(f => f.movieId !== movieId && f._id !== movieId));
    } catch (err) {
      toast.error('Could not remove movie');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Opening your Watchlist…" />;
  }

  return (
    <div className="pb-24" style={{ background: '#0f171e' }}>
      {/* Header */}
      <div className="border-b border-[#1a242f]" style={{ background: '#141d26' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-prime text-[10px]">SAVED FOR LATER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Heart size={24} className="text-red-500 fill-red-500" /> My Watchlist ({favorites.length})
            </h1>
            <p className="text-xs text-[#8ea3b0] mt-1">
              Movies you want to catch on the big screen
            </p>
          </div>

          <Link to="/home" className="btn-prime-outline text-xs px-4 py-2 rounded font-bold no-underline">
            Browse More
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        {favorites.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-[#2c3e50]" style={{ background: '#1a242f' }}>
            <Film size={40} className="mx-auto text-[#4a6275] mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Your Watchlist is Empty</h3>
            <p className="text-xs text-[#8ea3b0] mb-6">
              Click the heart icon on any movie to save it here for quick access and showtime booking.
            </p>
            <Link to="/home" className="btn-prime text-xs px-6 py-2.5 rounded font-bold no-underline">
              Explore Trending Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {favorites.map((fav) => {
              const movie = fav.movie || {
                _id: fav.movieId,
                title: fav.movieName,
                movieName: fav.movieName,
                posterUrl: fav.posterUrl,
              };

              return (
                <div key={fav._id} className="relative group">
                  <MovieCard movie={movie} />
                  <button
                    onClick={() => handleRemove(fav.movieId || fav._id)}
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/75 hover:bg-red-500 text-white transition-colors"
                    title="Remove from Watchlist"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
