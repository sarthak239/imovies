import React, { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaStar,
  FaFilm,
  FaClock,
  FaCheck,
  FaTimes,
} from 'react-icons/fa';

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMovie, setEditMovie] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialFormState = {
    title: '',
    description: '',
    genre: 'Action, Sci-Fi',
    duration: 150,
    language: 'English, Hindi',
    rating: 8.5,
    releaseDate: new Date().toISOString().split('T')[0],
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    status: 'now_showing',
    cast: 'Timothée Chalamet, Zendaya',
    director: 'Denis Villeneuve',
    censorRating: 'UA',
    featured: false,
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await movieService.getMovies();
      setMovies(data.movies || []);
    } catch (err) {
      console.error('Error fetching admin movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditMovie(null);
    setFormData(initialFormState);
    setModalOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setEditMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
      duration: movie.duration,
      language: Array.isArray(movie.language) ? movie.language.join(', ') : movie.language,
      rating: movie.rating,
      releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl || '',
      trailerUrl: movie.trailerUrl || '',
      status: movie.status,
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast,
      director: movie.director || '',
      censorRating: movie.censorRating || 'UA',
      featured: Boolean(movie.featured),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editMovie) {
        await movieService.updateMovie(editMovie._id, formData);
      } else {
        await movieService.createMovie(formData);
      }
      setModalOpen(false);
      fetchMovies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save movie.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await movieService.deleteMovie(id);
      setDeleteConfirm(null);
      fetchMovies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete movie.');
    }
  };

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="text-white fw-bold mb-1">Manage Movies</h2>
          <p className="text-secondary small mb-0">
            Add new titles, edit synopses and metadata, or manage screening catalogs
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-cinema d-flex align-items-center gap-2">
          <FaPlus size={13} /> Add New Movie
        </button>
      </div>

      {/* Search Input */}
      <div
        className="p-3 rounded-4 mb-4"
        style={{
          backgroundColor: 'var(--imv-bg-card)',
          border: '1px solid var(--imv-border)',
        }}
      >
        <div className="position-relative" style={{ maxWidth: '400px' }}>
          <input
            type="text"
            className="form-control form-control-cinema ps-5"
            placeholder="Search movie title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FaSearch
            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
            size={14}
          />
        </div>
      </div>

      {/* Movies Table */}
      {loading ? (
        <LoadingSpinner message="Loading catalog..." />
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
                  <th>Poster</th>
                  <th>Title & Info</th>
                  <th>Duration</th>
                  <th>Genres</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        className="rounded-2 shadow-sm"
                        style={{ width: '42px', height: '58px', objectFit: 'cover' }}
                      />
                    </td>
                    <td>
                      <div className="text-white fw-bold small">{m.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {m.director ? `Dir: ${m.director}` : ''} • {m.censorRating || 'UA'}
                      </div>
                    </td>
                    <td className="text-secondary small">{m.duration} mins</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '180px' }}>
                        {m.genre &&
                          m.genre.slice(0, 2).map((g, idx) => (
                            <span key={idx} className="badge bg-dark border border-secondary text-secondary small">
                              {g}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td>
                      <span className="text-warning fw-bold small d-flex align-items-center gap-1">
                        <FaStar size={11} /> {m.rating?.toFixed(1) || '8.0'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          m.status === 'now_showing'
                            ? 'bg-success bg-opacity-25 text-success border border-success'
                            : 'bg-warning bg-opacity-25 text-warning border border-warning'
                        } small`}
                      >
                        {m.status === 'now_showing' ? 'Now Showing' : 'Upcoming'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="btn btn-outline-secondary btn-sm"
                          title="Edit"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(m)}
                          className="btn btn-outline-danger btn-sm"
                          title="Delete"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content modal-content-cinema p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-white fw-bold mb-0">
                  {editMovie ? 'Edit Movie Details' : 'Add New Movie Title'}
                </h4>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-8">
                    <label className="form-label text-secondary small fw-semibold">
                      Movie Title *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-cinema"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">Status *</label>
                    <select
                      className="form-select form-select-cinema"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="now_showing">Now Showing</option>
                      <option value="upcoming">Upcoming</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label text-secondary small fw-semibold">
                      Synopsis / Description *
                    </label>
                    <textarea
                      rows="3"
                      className="form-control form-control-cinema"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">
                      Duration (Minutes) *
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-cinema"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">
                      Genres (Comma separated) *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-cinema"
                      placeholder="e.g. Sci-Fi, Adventure"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">
                      Languages (Comma separated) *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-cinema"
                      placeholder="e.g. English, Hindi"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">
                      Rating (0-10)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control form-control-cinema"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">
                      Censor Rating
                    </label>
                    <select
                      className="form-select form-select-cinema"
                      value={formData.censorRating}
                      onChange={(e) => setFormData({ ...formData, censorRating: e.target.value })}
                    >
                      <option value="U">U (Universal)</option>
                      <option value="UA">UA (Parental Guidance)</option>
                      <option value="A">A (Adult 18+)</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-secondary small fw-semibold">
                      Release Date
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-cinema"
                      value={formData.releaseDate}
                      onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">
                      Poster Image URL *
                    </label>
                    <input
                      type="url"
                      className="form-control form-control-cinema"
                      placeholder="https://..."
                      value={formData.posterUrl}
                      onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">
                      Backdrop Image URL
                    </label>
                    <input
                      type="url"
                      className="form-control form-control-cinema"
                      placeholder="https://..."
                      value={formData.backdropUrl}
                      onChange={(e) => setFormData({ ...formData, backdropUrl: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">
                      Director
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-cinema"
                      value={formData.director}
                      onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">
                      Starring Cast (Comma separated)
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-cinema"
                      value={formData.cast}
                      onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <div className="form-check form-switch pt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="featuredCheck"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      />
                      <label className="form-check-label text-secondary small" htmlFor="featuredCheck">
                        Mark as Featured Hero Movie (Displayed on Home Banner)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 pt-3 border-top border-secondary">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-cinema btn-sm px-4"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : editMovie ? 'Update Movie' : 'Save Movie'}
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
              <h5 className="text-white fw-bold mb-3">Delete Movie Confirmation</h5>
              <p className="text-secondary small mb-3">
                Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This action
                will also remove all associated auditorium shows scheduled for this movie.
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
                  Delete Movie
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMoviesPage;
