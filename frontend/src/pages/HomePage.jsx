import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { favoriteService } from '../services/favoriteService';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import {
  Play,
  Ticket,
  Heart,
  Star,
  Search,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'Biography', 'Animation', 'Crime'];
const LANGUAGES = ['All', 'English', 'Hindi'];

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [trailerModal, setTrailerModal] = useState(null); // url or null
  const [inWatchlist, setInWatchlist] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMovies(searchQuery);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchMovies = async (query = '') => {
    try {
      if (!movies.length) setLoading(true);
      const params = {};
      if (query && query.trim()) params.search = query.trim();
      const data = await movieService.getMovies(params);
      if (data?.movies) {
        setMovies(data.movies);
        if (!featuredMovie || !query.trim()) {
          const feat = data.movies.find(m => m.featured && m.status === 'now_showing') || data.movies[0];
          setFeaturedMovie(feat);
        }
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      toast.error('Unable to fetch live movies.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWatchlist = async (movie) => {
    if (!movie) return;
    try {
      const res = await favoriteService.toggleFavorite({
        movieId: movie._id,
        movieName: movie.title || movie.movieName,
        posterUrl: movie.posterUrl,
      });
      setInWatchlist(res.isFavorite);
      toast.success(res.isFavorite ? `Added "${movie.title || movie.movieName}" to Watchlist` : 'Removed from Watchlist');
    } catch (err) {
      toast.error('Could not update watchlist');
    }
  };

  const scrollRow = (id, direction) => {
    const el = document.getElementById(id);
    if (el) {
      const scrollAmount = direction === 'left' ? -480 : 480;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Filtered movies based on user search, genre, and language
  const filteredMovies = movies.filter((m) => {
    const title = (m.title || m.movieName || '').toLowerCase();
    const desc = (m.description || '').toLowerCase();
    const cast = (m.cast || []).join(' ').toLowerCase();
    const matchesSearch = !searchQuery.trim() ||
      title.includes(searchQuery.toLowerCase()) ||
      desc.includes(searchQuery.toLowerCase()) ||
      cast.includes(searchQuery.toLowerCase());

    const mGenres = m.genres || m.genre || [];
    const matchesGenre = selectedGenre === 'All' ||
      mGenres.some(g => g.toLowerCase() === selectedGenre.toLowerCase());

    const matchesLanguage = selectedLanguage === 'All' ||
      (m.language && m.language.toLowerCase().includes(selectedLanguage.toLowerCase()));

    return matchesSearch && matchesGenre && matchesLanguage;
  });

  // Categorised rows for Amazon Prime Video layout
  const trendingNow = filteredMovies.filter(m => m.status === 'now_showing');
  const topRated = [...filteredMovies].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const actionThrillers = filteredMovies.filter(m => {
    const g = (m.genres || m.genre || []).map(x => x.toLowerCase());
    return g.includes('action') || g.includes('thriller') || g.includes('crime');
  });
  const sciFiFantasy = filteredMovies.filter(m => {
    const g = (m.genres || m.genre || []).map(x => x.toLowerCase());
    return g.includes('sci-fi') || g.includes('adventure') || g.includes('animation');
  });
  const dramas = filteredMovies.filter(m => {
    const g = (m.genres || m.genre || []).map(x => x.toLowerCase());
    return g.includes('drama') || g.includes('biography') || g.includes('history');
  });

  if (loading) {
    return <LoadingSpinner message="Curating Prime Cinema catalog…" />;
  }

  return (
    <div className="pb-20" style={{ background: '#0f171e' }}>
      {/* Prime Hero Billboard Carousel */}
      {featuredMovie && !searchQuery && (
        <section className="relative min-h-[500px] md:min-h-[620px] flex items-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url(${featuredMovie.backdropUrl || featuredMovie.posterUrl})`,
            }}
          />
          {/* Prime Video horizontal gradient fade */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f171e] via-[#0f171e]/85 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-transparent to-transparent z-10" />

          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-prime text-xs font-bold tracking-wider">
                  FEATURED ON PRIME
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#1a242f] border border-[#2c3e50] text-[#8ea3b0]">
                  {featuredMovie.certification || 'UA 16+'}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-[#1a242f] px-2 py-0.5 rounded border border-[#2c3e50]">
                  <Star size={12} fill="#f5a623" color="#f5a623" />
                  {featuredMovie.rating || '8.8'} IMDb
                </span>
                <span className="text-xs text-[#8ea3b0] flex items-center gap-1">
                  <Clock size={12} /> {featuredMovie.duration}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4">
                {featuredMovie.title || featuredMovie.movieName}
              </h1>

              <p className="text-sm md:text-base text-[#8ea3b0] mb-6 line-clamp-3 leading-relaxed">
                {featuredMovie.description}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/movieshows/${featuredMovie._id}`}
                  className="btn-prime text-sm px-6 py-2.5 rounded-md font-bold shadow-lg shadow-[#00a8e1]/30 no-underline"
                >
                  <Ticket size={17} /> Book Tickets
                </Link>

                <button
                  type="button"
                  onClick={() => setTrailerModal(featuredMovie.trailerUrl)}
                  className="btn-prime-outline text-sm px-5 py-2.5 rounded-md font-semibold"
                >
                  <Play size={15} /> Watch Trailer
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleWatchlist(featuredMovie)}
                  className="p-2.5 rounded-md border border-[#2c3e50] bg-[#1a242f] hover:border-[#00a8e1] text-white transition-colors"
                  title="Watchlist"
                >
                  <Heart size={18} className={inWatchlist ? 'fill-red-500 text-red-500' : ''} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search & Filters Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="p-4 rounded-xl border border-[#2c3e50] flex flex-col md:flex-row items-center justify-between gap-4"
             style={{ background: '#1a242f' }}>
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a6275]" />
            <input
              type="text"
              className="input-prime pl-10 text-sm py-2"
              placeholder="Search by title, actor, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a6275] hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Language Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4a6275] whitespace-nowrap">
              Language:
            </span>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${
                  selectedLanguage === lang
                    ? 'border-[#00a8e1] bg-[#00a8e1]/15 text-[#00a8e1]'
                    : 'border-[#2c3e50] text-[#8ea3b0] hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Genre Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`genre-pill ${selectedGenre === genre ? 'active' : ''}`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Movie Row Section Helper */}
      {filteredMovies.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-base text-[#8ea3b0]">
            No movies found matching your search and filter criteria.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedGenre('All'); setSelectedLanguage('All'); }}
            className="btn-prime text-xs mt-4 py-2 px-4 rounded"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10 mt-4">
          {/* Row 1: Trending Now on iMovies */}
          {trendingNow.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Trending Now on iMovies</h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => scrollRow('row-trending', 'left')}
                    className="p-1.5 rounded-full border border-[#2c3e50] bg-[#1a242f] text-white hover:border-[#00a8e1] transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => scrollRow('row-trending', 'right')}
                    className="p-1.5 rounded-full border border-[#2c3e50] bg-[#1a242f] text-white hover:border-[#00a8e1] transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div id="row-trending" className="carousel-track">
                {trendingNow.map((movie) => (
                  <div key={movie._id} className="w-[180px] sm:w-[210px]">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Row 2: Top Rated Blockbusters */}
          {topRated.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Top Rated Blockbusters</h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => scrollRow('row-toprated', 'left')}
                    className="p-1.5 rounded-full border border-[#2c3e50] bg-[#1a242f] text-white hover:border-[#00a8e1] transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => scrollRow('row-toprated', 'right')}
                    className="p-1.5 rounded-full border border-[#2c3e50] bg-[#1a242f] text-white hover:border-[#00a8e1] transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div id="row-toprated" className="carousel-track">
                {topRated.map((movie) => (
                  <div key={movie._id} className="w-[180px] sm:w-[210px]">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Row 3: Action & Thrillers */}
          {actionThrillers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Action & Thrillers</h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => scrollRow('row-action', 'left')}
                    className="p-1.5 rounded-full border border-[#2c3e50] bg-[#1a242f] text-white hover:border-[#00a8e1] transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => scrollRow('row-action', 'right')}
                    className="p-1.5 rounded-full border border-[#2c3e50] bg-[#1a242f] text-white hover:border-[#00a8e1] transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div id="row-action" className="carousel-track">
                {actionThrillers.map((movie) => (
                  <div key={movie._id} className="w-[180px] sm:w-[210px]">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Row 4: Sci-Fi & Spectacles */}
          {sciFiFantasy.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Sci-Fi & Adventures</h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => scrollRow('row-scifi', 'left')}
                    className="p-1.5 rounded-full border border-[#2c3e50] bg-[#1a242f] text-white hover:border-[#00a8e1] transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => scrollRow('row-scifi', 'right')}
                    className="p-1.5 rounded-full border border-[#2c3e50] bg-[#1a242f] text-white hover:border-[#00a8e1] transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div id="row-scifi" className="carousel-track">
                {sciFiFantasy.map((movie) => (
                  <div key={movie._id} className="w-[180px] sm:w-[210px]">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Row 5: Dramas */}
          {dramas.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title">Critically Acclaimed Dramas</h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => scrollRow('row-drama', 'left')}
                    className="p-1.5 rounded-full border border-[#2c3e50] bg-[#1a242f] text-white hover:border-[#00a8e1] transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => scrollRow('row-drama', 'right')}
                    className="p-1.5 rounded-full border border-[#2c3e50] bg-[#1a242f] text-white hover:border-[#00a8e1] transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div id="row-drama" className="carousel-track">
                {dramas.map((movie) => (
                  <div key={movie._id} className="w-[180px] sm:w-[210px]">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trailer Modal */}
      {trailerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-[#141d26] rounded-xl overflow-hidden border border-[#2c3e50]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2c3e50]">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Play size={14} className="text-[#00a8e1]" /> Official Trailer
              </span>
              <button
                onClick={() => setTrailerModal(null)}
                className="text-[#8ea3b0] hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={trailerModal}
                title="Movie Trailer"
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
