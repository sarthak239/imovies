import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { showService } from '../services/showService';
import { movieService } from '../services/movieService';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTicketAlt, FaArrowLeft } from 'react-icons/fa';

const ShowtimeSelectionPage = () => {
  const { id: movieId } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date Tabs
  const formatYMD = (d) => d.toISOString().split('T')[0];
  const dateTabs = [0, 1, 2, 3].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      ymd: formatYMD(d),
      label: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  const [selectedDate, setSelectedDate] = useState(dateTabs[0].ymd);

  useEffect(() => {
    fetchShows();
  }, [movieId, selectedDate]);

  const fetchShows = async () => {
    try {
      setLoading(true);
      setError('');

      if (movieId) {
        const movieData = await movieService.getMovieById(movieId);
        setMovie(movieData.movie);
      }

      const params = { showDate: selectedDate };
      if (movieId) params.movie = movieId;

      const data = await showService.getShows(params);
      setShows(data.shows || []);
    } catch (err) {
      console.error('Error fetching shows:', err);
      setError('Could not fetch showtimes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Top Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="text-white mb-1">
            Showtime <span style={{ color: 'var(--imv-primary)' }}>Schedule</span>
          </h1>
          <p className="text-secondary small mb-0">
            {movie ? `Viewing screening slots for ${movie.title}` : 'Browse all current cinema screenings'}
          </p>
        </div>
        {movieId && (
          <Link to={`/movies/${movieId}`} className="btn btn-cinema-outline btn-sm">
            <FaArrowLeft className="me-1" /> Movie Details
          </Link>
        )}
      </div>

      {/* Date Tabs */}
      <div
        className="p-3 rounded-4 mb-4 d-flex align-items-center gap-2 overflow-auto"
        style={{
          backgroundColor: 'var(--imv-bg-card)',
          border: '1px solid var(--imv-border)',
        }}
      >
        <span className="text-secondary small fw-bold me-2">Date:</span>
        {dateTabs.map((tab) => (
          <button
            key={tab.ymd}
            onClick={() => setSelectedDate(tab.ymd)}
            className={`btn text-nowrap rounded-3 px-3 py-2 transition-all d-flex flex-column align-items-center ${
              selectedDate === tab.ymd
                ? 'btn-danger text-white'
                : 'btn-dark text-secondary border-secondary'
            }`}
            style={{ minWidth: '90px' }}
          >
            <span className="fw-bold" style={{ fontSize: '0.85rem' }}>
              {tab.label}
            </span>
            <span style={{ fontSize: '0.72rem' }}>{tab.dateFormatted}</span>
          </button>
        ))}
      </div>

      {/* Shows Grid */}
      {loading ? (
        <LoadingSpinner message="Retrieving cinema schedules..." />
      ) : error ? (
        <div className="alert alert-danger bg-dark border-danger text-danger text-center py-4">
          {error}
        </div>
      ) : shows.length === 0 ? (
        <div className="text-center py-5 bg-dark rounded-4 border border-secondary text-secondary my-4">
          <h5>No screenings found for this date.</h5>
          <p className="small">Please pick another date from the tabs above.</p>
        </div>
      ) : (
        <div className="row g-4 row-cols-1 row-cols-md-2 row-cols-lg-3">
          {shows.map((show) => (
            <div key={show._id} className="col">
              <div
                className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  backgroundColor: 'var(--imv-bg-card)',
                  border: '1px solid var(--imv-border)',
                }}
              >
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="text-white fw-bold mb-0">{show.movie?.title}</h5>
                    <span className="badge bg-danger bg-opacity-25 text-danger border border-danger">
                      {show.screenName}
                    </span>
                  </div>

                  <div className="text-secondary small mb-3">
                    <FaMapMarkerAlt className="text-danger me-1" size={12} />
                    {show.theater?.name} ({show.theater?.city})
                  </div>

                  <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-dark border border-secondary mb-3">
                    <div className="text-center border-end border-secondary pe-3">
                      <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                        SHOWTIME
                      </div>
                      <div className="text-white fw-bold fs-5">{show.showTime}</div>
                    </div>
                    <div>
                      <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                        PRICING TIERS
                      </div>
                      <div className="text-white small">
                        Silver: ₹{show.tierPricing?.silver} | Gold: ₹{show.tierPricing?.gold}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between pt-2 border-top border-secondary">
                  <span className="text-success small fw-semibold">
                    {show.availableSeats} Seats Available
                  </span>
                  <button
                    onClick={() => navigate(`/shows/${show._id}/seats`)}
                    className="btn btn-cinema btn-sm px-3"
                  >
                    <FaTicketAlt size={12} className="me-1" /> Select Seats
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowtimeSelectionPage;
