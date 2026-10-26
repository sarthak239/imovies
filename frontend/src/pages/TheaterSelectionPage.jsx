import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { theaterService } from '../services/theaterService';
import { movieService } from '../services/movieService';
import { showService } from '../services/showService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaArrowLeft,
  FaFilm,
  FaTag,
} from 'react-icons/fa';

const TheaterSelectionPage = () => {
  const { id: movieId } = useParams(); // If reached from movie details
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [theaters, setTheaters] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('All');
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Generate next 4 dates
  const formatYMD = (date) => date.toISOString().split('T')[0];
  const dateTabs = [0, 1, 2, 3].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      ymd: formatYMD(d),
      dayName: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  const [selectedDate, setSelectedDate] = useState(dateTabs[0].ymd);

  useEffect(() => {
    loadData();
  }, [movieId, selectedCity, selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Fetch movie if movieId present
      if (movieId) {
        const movieData = await movieService.getMovieById(movieId);
        setMovie(movieData.movie);
      }

      // 2. Fetch Theaters
      const theaterData = await theaterService.getTheaters({
        city: selectedCity !== 'All' ? selectedCity : undefined,
      });
      setTheaters(theaterData.theaters || []);
      setCities(theaterData.cities || ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad']);

      // 3. Fetch Shows for this date (and movie if selected)
      const showParams = {
        showDate: selectedDate,
        city: selectedCity !== 'All' ? selectedCity : undefined,
      };
      if (movieId) showParams.movie = movieId;

      const showData = await showService.getShows(showParams);
      setShows(showData.shows || []);
    } catch (err) {
      console.error('Error loading theaters or shows:', err);
      setError('Unable to load theaters or showtimes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group shows by theater
  const getShowsForTheater = (theaterId) => {
    return shows.filter(
      (s) => s.theater && (s.theater._id === theaterId || s.theater === theaterId)
    );
  };

  return (
    <div className="container py-4">
      {/* Top Breadcrumb & Movie Header if selecting for a movie */}
      {movie ? (
        <div
          className="p-4 rounded-4 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3"
          style={{
            backgroundColor: 'var(--imv-bg-card)',
            border: '1px solid var(--imv-border)',
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <Link to={`/movies/${movie._id}`} className="btn btn-outline-secondary btn-sm">
              <FaArrowLeft />
            </Link>
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="rounded-2"
              style={{ width: '48px', height: '65px', objectFit: 'cover' }}
            />
            <div>
              <h4 className="text-white mb-1 fw-bold">{movie.title}</h4>
              <div className="text-secondary small d-flex align-items-center gap-2">
                <span>{movie.duration} mins</span>
                <span>•</span>
                <span>{Array.isArray(movie.language) ? movie.language.join(', ') : movie.language}</span>
                <span>•</span>
                <span className="badge bg-secondary">{movie.censorRating || 'UA'}</span>
              </div>
            </div>
          </div>

          <Link to={`/movies/${movie._id}`} className="btn btn-cinema-outline btn-sm">
            View Movie Details
          </Link>
        </div>
      ) : (
        <div className="mb-4">
          <h1 className="text-white mb-2">
            Cinema <span style={{ color: 'var(--imv-primary)' }}>Theaters</span>
          </h1>
          <p className="text-secondary small mb-0">
            Browse state-of-the-art multiplexes and catch upcoming screenings
          </p>
        </div>
      )}

      {/* Date & City Selector Filter Bar */}
      <div
        className="p-3 rounded-4 mb-4"
        style={{
          backgroundColor: 'var(--imv-bg-card)',
          border: '1px solid var(--imv-border)',
        }}
      >
        <div className="row g-3 align-items-center">
          {/* Date Tabs */}
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-2 overflow-auto pb-1">
              <span className="text-secondary small fw-semibold me-2 d-none d-sm-inline">
                <FaCalendarAlt className="text-danger me-1" /> Date:
              </span>
              {dateTabs.map((tab) => (
                <button
                  key={tab.ymd}
                  onClick={() => setSelectedDate(tab.ymd)}
                  className={`btn text-nowrap rounded-3 px-3 py-2 transition-all d-flex flex-column align-items-center ${
                    selectedDate === tab.ymd
                      ? 'btn-danger text-white'
                      : 'btn-dark text-secondary border-secondary'
                  }`}
                  style={{ minWidth: '85px' }}
                >
                  <span className="fw-bold" style={{ fontSize: '0.85rem' }}>
                    {tab.dayName}
                  </span>
                  <span style={{ fontSize: '0.72rem' }}>{tab.dateFormatted}</span>
                </button>
              ))}
            </div>
          </div>

          {/* City Dropdown */}
          <div className="col-lg-4 text-lg-end">
            <div className="d-inline-flex align-items-center gap-2 w-100 justify-content-lg-end">
              <FaMapMarkerAlt className="text-danger" size={16} />
              <select
                className="form-select form-select-cinema w-auto"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="All">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Theaters List & Showtimes */}
      {loading ? (
        <LoadingSpinner message="Checking auditorium schedules..." />
      ) : error ? (
        <div className="alert alert-danger bg-dark border-danger text-danger text-center py-4">
          {error}
        </div>
      ) : theaters.length === 0 ? (
        <div className="text-center py-5 bg-dark rounded-4 border border-secondary text-secondary my-4">
          <h5>No Theaters Found</h5>
          <p className="small">Try switching the city or date filter.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {theaters.map((theater) => {
            const theaterShows = getShowsForTheater(theater._id);

            return (
              <div
                key={theater._id}
                className="p-4 rounded-4"
                style={{
                  backgroundColor: 'var(--imv-bg-card)',
                  border: '1px solid var(--imv-border)',
                }}
              >
                {/* Theater Header Info */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3 pb-3 border-bottom border-secondary">
                  <div>
                    <h5 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                      <FaFilm className="text-danger" size={16} /> {theater.name}
                    </h5>
                    <div className="text-secondary small d-flex align-items-center gap-2">
                      <FaMapMarkerAlt size={11} className="text-muted" />
                      <span>{theater.location}, {theater.city}</span>
                      <span>•</span>
                      <span className="text-truncate" style={{ maxWidth: '300px' }}>
                        {theater.address}
                      </span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="d-flex flex-wrap gap-1">
                    {theater.facilities &&
                      theater.facilities.slice(0, 3).map((f, idx) => (
                        <span key={idx} className="badge bg-dark border border-secondary text-light small">
                          {f}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Showtimes for this Theater */}
                <div>
                  <div className="text-secondary small fw-bold text-uppercase mb-2 d-flex align-items-center gap-1">
                    <FaClock size={12} /> Available Screening Times
                  </div>

                  {theaterShows.length === 0 ? (
                    <div className="text-muted small py-2 fst-italic">
                      No shows scheduled at this cinema for the selected date.
                    </div>
                  ) : (
                    <div className="d-flex flex-wrap gap-3">
                      {theaterShows.map((show) => (
                        <button
                          key={show._id}
                          onClick={() => navigate(`/shows/${show._id}/seats`)}
                          className="btn btn-outline-light text-start p-3 rounded-3 transition-all d-flex flex-column gap-1"
                          style={{
                            minWidth: '135px',
                            backgroundColor: '#11131c',
                            borderColor: 'var(--imv-border)',
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-white fs-6">{show.showTime}</span>
                            <span className="badge bg-danger bg-opacity-25 text-danger border border-danger small" style={{ fontSize: '0.65rem' }}>
                              {show.screenName}
                            </span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between text-secondary" style={{ fontSize: '0.72rem' }}>
                            <span>From ₹{show.tierPricing?.silver || 180}</span>
                            <span className="text-success fw-semibold">
                              {show.availableSeats} left
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TheaterSelectionPage;
