import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import {
  Play,
  Ticket,
  ShieldCheck,
  Zap,
  Sparkles,
  Clock,
  Star,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  Film,
} from 'lucide-react';

export default function LandingPage() {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await movieService.getMovies();
        if (data?.movies) {
          const featured = data.movies.filter(m => m.featured || m.status === 'now_showing').slice(0, 5);
          setFeaturedMovies(featured.length > 0 ? featured : data.movies.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load featured movies', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Auto-advance hero carousel
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  const currentMovie = featuredMovies[activeSlide] || null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f171e' }}>
      {/* Prime Video Header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all backdrop-blur-md border-b border-[#1a242f]/80"
              style={{ background: 'rgba(15, 23, 30, 0.92)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded flex items-center justify-center shadow-lg"
                 style={{ background: 'linear-gradient(135deg, #00a8e1, #0067a3)' }}>
              <Clapperboard size={18} color="#fff" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              i<span style={{ color: '#00a8e1' }}>Movies</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded tracking-widest text-[#00a8e1] border border-[#00a8e1]/40 ml-1">
              PRIME
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-white px-4 py-2 rounded border border-[#2c3e50] hover:border-white transition-colors no-underline"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn-prime text-sm px-4 py-2 rounded no-underline font-bold"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner with Cinematic Prime Video Overlay */}
      <section className="relative pt-16 min-h-[580px] md:min-h-[660px] flex items-center overflow-hidden">
        {currentMovie && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
            style={{
              backgroundImage: `url(${currentMovie.backdropUrl || currentMovie.posterUrl})`,
            }}
          />
        )}
        {/* Prime Video Gradient Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f171e] via-[#0f171e]/85 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-transparent to-transparent z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge-prime text-xs font-bold tracking-wider">
                PRIME PREMIERE
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#1a242f] border border-[#2c3e50] text-[#8ea3b0]">
                {currentMovie?.certification || 'UA 16+'}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-[#1a242f] px-2 py-0.5 rounded border border-[#2c3e50]">
                <Star size={12} fill="#f5a623" color="#f5a623" />
                {currentMovie?.rating || '8.8'} IMDb
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4">
              {currentMovie?.title || currentMovie?.movieName || 'Cinematic Spectacle'}
            </h1>

            <p className="text-sm md:text-base text-[#8ea3b0] mb-6 line-clamp-3 leading-relaxed">
              {currentMovie?.description || 'Experience the biggest blockbusters in Dolby Atmos 4K Laser with instant zero-conflict seat reservation.'}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="btn-prime text-base px-6 py-3 rounded-md font-bold shadow-lg shadow-[#00a8e1]/30 no-underline flex items-center gap-2"
              >
                <Ticket size={18} /> Book Tickets Now
              </Link>
              <Link
                to="/login"
                className="btn-prime-outline text-base px-6 py-3 rounded-md font-semibold no-underline flex items-center gap-2"
              >
                <Play size={16} /> Explore Catalog
              </Link>
            </div>

            {/* Slider Dots */}
            {featuredMovies.length > 1 && (
              <div className="flex items-center gap-2 mt-8">
                {featuredMovies.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeSlide
                        ? 'w-8 bg-[#00a8e1]'
                        : 'w-2 bg-[#2c3e50] hover:bg-[#8ea3b0]'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value Pillars Showcase */}
      <section className="py-16 border-t border-[#1a242f]" style={{ background: '#121c24' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              Next-Gen Cinema Reservation
            </h2>
            <p className="text-sm text-[#8ea3b0]">
              Built with Amazon Prime Video standards for lightning-fast, conflict-free moviegoing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-[#2c3e50] bg-[#1a242f]/80 hover:border-[#00a8e1] transition-all">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-[#00a8e1] bg-[#00a8e1]/10">
                <Zap size={24} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Atomic Seat Locking</h3>
              <p className="text-xs text-[#8ea3b0] leading-relaxed">
                5-minute TTL locks guarantee no double-booking while you finalize your payment.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#2c3e50] bg-[#1a242f]/80 hover:border-[#00a8e1] transition-all">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-[#00a8e1] bg-[#00a8e1]/10">
                <Sparkles size={24} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Interactive 3-Tier Maps</h3>
              <p className="text-xs text-[#8ea3b0] leading-relaxed">
                Pick your perspective from Balcony Luxury, Middle Executive, or Lower Budget tiers.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#2c3e50] bg-[#1a242f]/80 hover:border-[#00a8e1] transition-all">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-[#00a8e1] bg-[#00a8e1]/10">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Instant Digital Boarding</h3>
              <p className="text-xs text-[#8ea3b0] leading-relaxed">
                Receive live M-Tickets with scannable QR and print-ready receipts instantly in your wallet.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#2c3e50] bg-[#1a242f]/80 hover:border-[#00a8e1] transition-all">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-[#00a8e1] bg-[#00a8e1]/10">
                <Clock size={24} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Instant Refund Shield</h3>
              <p className="text-xs text-[#8ea3b0] leading-relaxed">
                Seamless one-click cancellation with automated seat release before showtime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Catalog Preview */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title text-xl md:text-2xl font-black text-white">
              Trending Releases on iMovies
            </h2>
            <p className="text-xs text-[#8ea3b0] mt-1">
              Currently playing across premier Dolby Atmos and IMAX 4K auditoriums
            </p>
          </div>
          <Link
            to="/login"
            className="text-xs font-bold text-[#00a8e1] hover:underline flex items-center gap-1"
          >
            See All Movies <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {featuredMovies.map((movie) => (
            <div key={movie._id} className="movie-card group">
              <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
                <img
                  src={movie.posterUrl}
                  alt={movie.title || movie.movieName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="card-overlay flex flex-col justify-end">
                  <span className="badge-prime text-[10px] w-fit mb-1">
                    {movie.certification || 'UA 16+'}
                  </span>
                  <p className="text-xs font-bold text-white truncate">
                    {movie.title || movie.movieName}
                  </p>
                  <p className="text-[10px] text-[#8ea3b0]">
                    {(movie.genres || movie.genre || []).slice(0, 2).join(' • ')}
                  </p>
                  <Link
                    to="/login"
                    className="btn-prime text-xs py-1.5 px-3 rounded mt-2 justify-center no-underline"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
              <div className="p-2.5">
                <h4 className="text-xs font-bold text-white truncate">
                  {movie.title || movie.movieName}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-[#8ea3b0] mt-1">
                  <span>{movie.duration}</span>
                  <span className="flex items-center gap-0.5 text-yellow-400 font-bold">
                    <Star size={10} fill="#f5a623" color="#f5a623" /> {movie.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Prime Video CTA Banner */}
      <section className="py-16 border-t border-[#1a242f]" style={{ background: '#141e28' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 shadow-xl"
               style={{ background: 'linear-gradient(135deg, #00a8e1, #0067a3)' }}>
            <Film size={28} color="#fff" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            Ready to Experience Cinema in Prime Quality?
          </h2>
          <p className="text-sm md:text-base text-[#8ea3b0] mb-8 max-w-2xl mx-auto">
            Create your account today or sign in to browse showtimes, lock seats in real-time, and get digital boarding tickets.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="btn-prime text-base px-8 py-3 rounded-md font-bold no-underline"
            >
              Sign Up for iMovies
            </Link>
            <Link
              to="/login"
              className="btn-prime-outline text-base px-8 py-3 rounded-md font-semibold no-underline"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>

      {/* Prime Footer */}
      <footer className="py-8 border-t border-[#1a242f] text-center text-xs text-[#4a6275]"
              style={{ background: '#0a1118' }}>
        <p className="mb-2">© {new Date().getFullYear()} iMovies Prime Cinema. Designed with Amazon Prime Video Aesthetics.</p>
        <p>Built with React, Node.js, Express, and MongoDB.</p>
      </footer>
    </div>
  );
}
