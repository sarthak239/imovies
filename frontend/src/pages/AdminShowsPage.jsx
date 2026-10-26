import React, { useState, useEffect } from 'react';
import { showService } from '../services/showService';
import { movieService } from '../services/movieService';
import { theaterService } from '../services/theaterService';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaCalendarAlt, FaPlus, FaTrash, FaClock, FaTicketAlt, FaFilter } from 'react-icons/fa';

const AdminShowsPage = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [filterMovie, setFilterMovie] = useState('All');
  const [filterTheater, setFilterTheater] = useState('All');

  const initialForm = {
    movie: '',
    theater: '',
    screenName: 'Screen 1',
    showDate: new Date().toISOString().split('T')[0],
    showTime: '06:30 PM',
    silverPrice: 180,
    goldPrice: 260,
    vipPrice: 420,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchMetadataAndShows();
  }, [filterMovie, filterTheater]);

  const fetchMetadataAndShows = async () => {
    try {
      setLoading(true);

      const [movieData, theaterData, showData] = await Promise.all([
        movieService.getMovies(),
        theaterService.getTheaters(),
        showService.getShows({
          movie: filterMovie !== 'All' ? filterMovie : undefined,
          theater: filterTheater !== 'All' ? filterTheater : undefined,
        }),
      ]);

      setMovies(movieData.movies || []);
      setTheaters(theaterData.theaters || []);
      setShows(showData.shows || []);

      if (movieData.movies?.length > 0 && !formData.movie) {
        setFormData((prev) => ({ ...prev, movie: movieData.movies[0]._id }));
      }
      if (theaterData.theaters?.length > 0 && !formData.theater) {
        setFormData((prev) => ({ ...prev, theater: theaterData.theaters[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching admin show data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      movie: movies[0]?._id || '',
      theater: theaters[0]?._id || '',
      screenName: 'Screen 1',
      showDate: new Date().toISOString().split('T')[0],
      showTime: '06:30 PM',
      silverPrice: 180,
      goldPrice: 260,
      vipPrice: 420,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        movie: formData.movie,
        theater: formData.theater,
        screenName: formData.screenName,
        showDate: formData.showDate,
        showTime: formData.showTime,
        tierPricing: {
          silver: Number(formData.silverPrice),
          gold: Number(formData.goldPrice),
          vip: Number(formData.vipPrice),
        },
      };

      await showService.createShow(payload);
      setModalOpen(false);
      fetchMetadataAndShows();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule show.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await showService.deleteShow(id);
      setDeleteConfirm(null);
      fetchMetadataAndShows();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete show.');
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="text-white fw-bold mb-1">Manage Shows & Timings</h2>
          <p className="text-secondary small mb-0">
            Schedule screenings, define auditorium seat allocations and tier pricing
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-cinema d-flex align-items-center gap-2">
          <FaPlus size={13} /> Schedule New Show
        </button>
      </div>

      {/* Filter Bar */}
      <div
        className="p-3 rounded-4 mb-4"
        style={{
          backgroundColor: 'var(--imv-bg-card)',
          border: '1px solid var(--imv-border)',
        }}
      >
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <label className="form-label text-secondary small fw-semibold">Filter by Movie</label>
            <select
              className="form-select form-select-cinema"
              value={filterMovie}
              onChange={(e) => setFilterMovie(e.target.value)}
            >
              <option value="All">All Movies</option>
              {movies.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-5">
            <label className="form-label text-secondary small fw-semibold">Filter by Theater</label>
            <select
              className="form-select form-select-cinema"
              value={filterTheater}
              onChange={(e) => setFilterTheater(e.target.value)}
            >
              <option value="All">All Theaters</option>
              {theaters.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.city})
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2 text-md-end pt-md-4">
            <span className="text-secondary small">
              Showing <strong>{shows.length}</strong> shows
            </span>
          </div>
        </div>
      </div>

      {/* Shows Table */}
      {loading ? (
        <LoadingSpinner message="Loading shows..." />
      ) : (
        <div
          className="p-4 rounded-4"
          style={{
            backgroundColor: 'var(--imv-bg-card)',
            border: '1px solid var(--imv-border)',
          }}
        >
          <div className="table-responsive">
            <table className="table table-dark table-hover border-secondary mb-0 align-middle">
              <thead>
                <tr className="text-secondary small">
                  <th>Movie</th>
                  <th>Theater & Screen</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Pricing</th>
                  <th>Seats Remaining</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shows.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="text-white fw-bold small">{s.movie?.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {s.movie?.duration}m • {s.movie?.censorRating}
                      </div>
                    </td>
                    <td>
                      <div className="text-white small">{s.theater?.name}</div>
                      <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                        {s.screenName} • {s.theater?.city}
                      </div>
                    </td>
                    <td className="text-secondary small">{s.showDate}</td>
                    <td>
                      <span className="badge bg-danger bg-opacity-25 text-danger border border-danger fw-bold">
                        {s.showTime}
                      </span>
                    </td>
                    <td className="text-secondary small">
                      ₹{s.tierPricing?.silver} / ₹{s.tierPricing?.gold} / ₹{s.tierPricing?.vip}
                    </td>
                    <td>
                      <span className="badge bg-success bg-opacity-25 text-success border border-success">
                        {s.availableSeats} of {s.totalSeats} Available
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => setDeleteConfirm(s)}
                        className="btn btn-outline-danger btn-sm"
                        title="Delete Show"
                      >
                        <FaTrash size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Show Modal */}
      {modalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-content-cinema p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-white fw-bold mb-0">Schedule New Screening</h4>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">
                    Select Movie *
                  </label>
                  <select
                    className="form-select form-select-cinema"
                    value={formData.movie}
                    onChange={(e) => setFormData({ ...formData, movie: e.target.value })}
                    required
                  >
                    {movies.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">
                    Select Cinema Theater *
                  </label>
                  <select
                    className="form-select form-select-cinema"
                    value={formData.theater}
                    onChange={(e) => setFormData({ ...formData, theater: e.target.value })}
                    required
                  >
                    {theaters.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label text-secondary small fw-semibold">
                      Screen Name
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-cinema"
                      placeholder="Audi 1 (IMAX)"
                      value={formData.screenName}
                      onChange={(e) => setFormData({ ...formData, screenName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-secondary small fw-semibold">
                      Show Date *
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-cinema"
                      value={formData.showDate}
                      onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">
                    Showtime *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-cinema"
                    placeholder="e.g. 06:30 PM"
                    value={formData.showTime}
                    onChange={(e) => setFormData({ ...formData, showTime: e.target.value })}
                    required
                  />
                </div>

                <div className="row g-2 mb-4">
                  <div className="col-4">
                    <label className="form-label text-secondary small fw-semibold">
                      Silver Tier (₹)
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-cinema"
                      value={formData.silverPrice}
                      onChange={(e) => setFormData({ ...formData, silverPrice: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label text-secondary small fw-semibold">
                      Gold Tier (₹)
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-cinema"
                      value={formData.goldPrice}
                      onChange={(e) => setFormData({ ...formData, goldPrice: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label text-secondary small fw-semibold">
                      VIP Recliner (₹)
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-cinema"
                      value={formData.vipPrice}
                      onChange={(e) => setFormData({ ...formData, vipPrice: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema btn-sm" disabled={submitting}>
                    {submitting ? 'Generating Seats...' : 'Schedule & Generate Seats'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-content-cinema p-4">
              <h5 className="text-white fw-bold mb-3">Delete Show Confirmation</h5>
              <p className="text-secondary small mb-3">
                Are you sure you want to delete this show for{' '}
                <strong>{deleteConfirm.movie?.title}</strong> on{' '}
                <strong>
                  {deleteConfirm.showDate} at {deleteConfirm.showTime}
                </strong>
                ?
              </p>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(deleteConfirm._id)}
                >
                  Delete Show
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShowsPage;
