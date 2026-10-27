import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { showService } from '../services/showService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Shield,
  Film,
} from 'lucide-react';

export default function MovieShowsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);

  // Generate 5 day dates
  const today = new Date();
  const dateTabs = [0, 1, 2, 3, 4].map((offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return {
      offset,
      dayName: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      isoString: d.toISOString().split('T')[0],
    };
  });

  useEffect(() => {
    fetchData();
  }, [movieId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, sRes] = await Promise.all([
        movieService.getMovieById(movieId),
        showService.getShows({ movieId }),
      ]);
      if (mRes?.movie) setMovie(mRes.movie);
      if (sRes?.shows) setShows(sRes.shows);
    } catch (err) {
      console.error('Error fetching showtimes:', err);
      toast.error('Could not load showtimes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Locating cinema showtimes…" />;
  }

  if (!movie) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Movie Not Found</h2>
        <Link to="/home" className="btn-prime text-sm px-4 py-2 rounded no-underline">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  const selectedDate = dateTabs[selectedDateIdx];

  // Group shows by Theatre
  const showsForDate = shows.filter((s) => {
    if (!s.showDate) return true;
    const sDate = new Date(s.showDate).toISOString().split('T')[0];
    return sDate === selectedDate.isoString;
  });

  const displayShows = showsForDate.length > 0 ? showsForDate : shows;

  const theatreGroups = {};
  displayShows.forEach((s) => {
    const tName = s.theatreName || s.theatre?.theatreName || 'PVR Prime Multiplex';
    if (!theatreGroups[tName]) {
      theatreGroups[tName] = {
        theatreName: tName,
        theatreId: s.theatreId || s.theatre?._id,
        location: s.theatre?.location || s.location || 'Central Boulevard',
        facilities: s.theatre?.facilities || ['Dolby Atmos', '4K Laser Projection', 'Luxury Recliners'],
        shows: [],
      };
    }
    theatreGroups[tName].shows.push(s);
  });

  const theatresList = Object.values(theatreGroups);

  return (
    <div className="pb-24" style={{ background: '#0f171e' }}>
      {/* Movie Synopsis Header Banner */}
      <div className="border-b border-[#1a242f]" style={{ background: '#141d26' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <Link
            to={`/moviedetails/${movieId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8ea3b0] hover:text-white transition-colors mb-3 no-underline"
          >
            <ArrowLeft size={14} /> Back to Movie Overview
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge-prime text-[10px]">SELECT SHOWTIME</span>
                <span className="text-xs text-[#8ea3b0]">
                  {movie.certification || 'UA 16+'} • {movie.duration} • {movie.language || 'English'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {movie.title || movie.movieName}
              </h1>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#8ea3b0]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Filling Fast
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Date Picker Bar */}
      <div className="sticky top-14 z-30 border-b border-[#1a242f] backdrop-blur-md"
           style={{ background: 'rgba(15, 23, 30, 0.95)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {dateTabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDateIdx(idx)}
                className={`flex flex-col items-center justify-center min-w-[72px] sm:min-w-[84px] py-2 px-3 rounded-lg border transition-all ${
                  selectedDateIdx === idx
                    ? 'border-[#00a8e1] bg-[#00a8e1]/15 text-[#00a8e1]'
                    : 'border-[#2c3e50] bg-[#1a242f] text-[#8ea3b0] hover:text-white hover:border-[#00a8e1]/50'
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider">{tab.dayName}</span>
                <span className="text-base font-black text-white">{tab.dateNum}</span>
                <span className="text-[10px] text-[#4a6275] uppercase">{tab.monthName}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Venues & Showtimes List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {theatresList.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-[#2c3e50]" style={{ background: '#1a242f' }}>
            <Film size={36} className="mx-auto text-[#4a6275] mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Shows Scheduled on this Date</h3>
            <p className="text-xs text-[#8ea3b0] mb-4">Please try choosing another day from the calendar above.</p>
            <button
              onClick={() => setSelectedDateIdx(0)}
              className="btn-prime text-xs py-2 px-4 rounded"
            >
              Reset to Today
            </button>
          </div>
        ) : (
          theatresList.map((theatre, tIdx) => (
            <div
              key={tIdx}
              className="p-6 rounded-xl border border-[#2c3e50] transition-all hover:border-[#00a8e1]/50"
              style={{ background: '#1a242f' }}
            >
              {/* Theatre Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#2c3e50]">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    {theatre.theatreName}
                  </h3>
                  <p className="text-xs text-[#8ea3b0] flex items-center gap-1 mt-1">
                    <MapPin size={13} className="text-[#00a8e1]" /> {theatre.location}
                  </p>
                </div>

                {/* Facilities Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {(theatre.facilities || []).map((fac, fIdx) => (
                    <span
                      key={fIdx}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#141d26] border border-[#2c3e50] text-[#8ea3b0]"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Showtimes Chips */}
              <div className="flex flex-wrap gap-3">
                {theatre.shows.map((show) => {
                  const available = show.availableSeats ?? 50;
                  const isFillingFast = available < 20;

                  return (
                    <button
                      key={show._id || show.showId}
                      onClick={() => navigate(`/seatslug/${show._id || show.showId}`)}
                      className="group relative p-3 rounded-lg border border-[#2c3e50] bg-[#141d26] hover:border-[#00a8e1] hover:bg-[#00a8e1]/10 transition-all text-left flex flex-col min-w-[120px]"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-black text-white group-hover:text-[#00a8e1] transition-colors">
                          {show.showTime}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isFillingFast ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                        />
                      </div>

                      <span className="text-[10px] text-[#4a6275] font-semibold">
                        {isFillingFast ? `${available} seats left` : 'Available'}
                      </span>

                      <div className="text-[10px] text-[#8ea3b0] mt-1 pt-1 border-t border-[#2c3e50]/40 flex justify-between">
                        <span>Balcony: ₹{show.tierPricing?.balcony || 280}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
