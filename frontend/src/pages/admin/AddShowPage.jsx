import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { movieService } from '../../services/movieService';
import { theatreService } from '../../services/theatreService';
import { showService } from '../../services/showService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Calendar, ArrowLeft, Clock, Film, Building2, CheckCircle2 } from 'lucide-react';

export default function AddShowPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [formData, setFormData] = useState({
    movieId: '',
    theatreName: '',
    showDate: new Date().toISOString().split('T')[0],
    showTime: '05:30 PM',
    balconyPrice: 320,
    middlePrice: 240,
    lowerPrice: 160,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingOptions(true);
        const [mRes, tRes] = await Promise.all([
          movieService.getMovies(),
          theatreService.getTheatres(),
        ]);
        if (mRes?.movies) {
          setMovies(mRes.movies);
          if (mRes.movies.length > 0) {
            setFormData((prev) => ({ ...prev, movieId: mRes.movies[0]._id }));
          }
        }
        const tList = tRes?.theatres || tRes?.theaters || [];
        if (tList.length > 0) {
          setTheatres(tList);
          setFormData((prev) => ({
            ...prev,
            theatreName: tList[0].theatreName || tList[0].name,
            balconyPrice: tList[0].balconySeatPrice || 320,
            middlePrice: tList[0].middleSeatPrice || 240,
            lowerPrice: tList[0].lowerSeatPrice || 160,
          }));
        }
      } catch (err) {
        console.error('Error loading options:', err);
      } finally {
        setLoadingOptions(false);
      }
    };
    loadData();
  }, []);

  const handleTheatreChange = (tName) => {
    const selected = theatres.find((t) => (t.theatreName || t.name) === tName);
    setFormData((prev) => ({
      ...prev,
      theatreName: tName,
      balconyPrice: selected?.balconySeatPrice || prev.balconyPrice,
      middlePrice: selected?.middleSeatPrice || prev.middlePrice,
      lowerPrice: selected?.lowerSeatPrice || prev.lowerPrice,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.movieId || !formData.theatreName || !formData.showDate || !formData.showTime) {
      toast.error('All show fields are required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        adminEmail: user?.email || 'admin@imovies.com',
        movieId: formData.movieId,
        theatreName: formData.theatreName,
        showDate: formData.showDate,
        showTime: formData.showTime,
        tierPricing: {
          balcony: Number(formData.balconyPrice),
          middle: Number(formData.middlePrice),
          lower: Number(formData.lowerPrice),
        },
      };

      await showService.createShow(payload);
      toast.success('Showtime scheduled successfully!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule show');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-md border border-[#2c3e50] bg-[#1a242f] text-white hover:border-[#00a8e1] transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">Schedule New Showtime</h1>
          <p className="text-xs text-[#8ea3b0]">Map movies to auditoriums with date and time</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="p-6 rounded-xl border border-[#2c3e50] bg-[#1a242f] space-y-5">
          {/* Movie Select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5 flex items-center gap-1.5">
              <Film size={14} className="text-[#00a8e1]" /> Select Movie *
            </label>
            <select
              className="input-prime text-sm py-2.5"
              value={formData.movieId}
              onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
              required
            >
              {movies.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title || m.movieName} ({m.duration} • {m.certification})
                </option>
              ))}
            </select>
          </div>

          {/* Theatre Select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5 flex items-center gap-1.5">
              <Building2 size={14} className="text-[#00a8e1]" /> Select Theatre Venue *
            </label>
            <select
              className="input-prime text-sm py-2.5"
              value={formData.theatreName}
              onChange={(e) => handleTheatreChange(e.target.value)}
              required
            >
              {theatres.map((t) => (
                <option key={t._id} value={t.theatreName || t.name}>
                  {t.theatreName || t.name} — {t.location}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-[#00a8e1]" /> Show Date *
              </label>
              <input
                type="date"
                className="input-prime text-sm"
                value={formData.showDate}
                onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-1.5 flex items-center gap-1.5">
                <Clock size={14} className="text-[#00a8e1]" /> Show Time *
              </label>
              <select
                className="input-prime text-sm py-2.5"
                value={formData.showTime}
                onChange={(e) => setFormData({ ...formData, showTime: e.target.value })}
                required
              >
                {['10:30 AM', '01:45 PM', '05:15 PM', '08:30 PM', '11:00 PM'].map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tier Prices Override */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8ea3b0] mb-2">
              Auditorium Tier Pricing for This Slot (₹)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] text-[#4a6275] block">Balcony</span>
                <input
                  type="number"
                  className="input-prime text-xs py-1.5 mt-1"
                  value={formData.balconyPrice}
                  onChange={(e) => setFormData({ ...formData, balconyPrice: e.target.value })}
                />
              </div>
              <div>
                <span className="text-[11px] text-[#4a6275] block">Middle</span>
                <input
                  type="number"
                  className="input-prime text-xs py-1.5 mt-1"
                  value={formData.middlePrice}
                  onChange={(e) => setFormData({ ...formData, middlePrice: e.target.value })}
                />
              </div>
              <div>
                <span className="text-[11px] text-[#4a6275] block">Lower</span>
                <input
                  type="number"
                  className="input-prime text-xs py-1.5 mt-1"
                  value={formData.lowerPrice}
                  onChange={(e) => setFormData({ ...formData, lowerPrice: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#2c3e50] flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="btn-prime py-2.5 px-6 rounded font-bold text-sm shadow-lg shadow-[#00a8e1]/30"
            >
              {submitting ? 'Scheduling...' : 'Save & Schedule Show'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
