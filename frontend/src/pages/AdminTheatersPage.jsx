import React, { useState, useEffect } from 'react';
import { theaterService } from '../services/theaterService';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';

const AdminTheatersPage = () => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTheater, setEditTheater] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    name: '',
    location: '',
    city: 'Bengaluru',
    address: '',
    facilities: 'Dolby Atmos, 4K Laser, Gourmet Dine-In, Valet Parking',
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchTheaters();
  }, []);

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      const data = await theaterService.getTheaters();
      setTheaters(data.theaters || []);
    } catch (err) {
      console.error('Error fetching admin theaters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditTheater(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (th) => {
    setEditTheater(th);
    setFormData({
      name: th.name,
      location: th.location,
      city: th.city,
      address: th.address,
      facilities: Array.isArray(th.facilities) ? th.facilities.join(', ') : th.facilities,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editTheater) {
        await theaterService.updateTheater(editTheater._id, formData);
      } else {
        await theaterService.createTheater(formData);
      }
      setModalOpen(false);
      fetchTheaters();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save theater.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await theaterService.deleteTheater(id);
      setDeleteConfirm(null);
      fetchTheaters();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete theater.');
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="text-white fw-bold mb-1">Manage Theaters</h2>
          <p className="text-secondary small mb-0">
            Configure multiplex cinema locations, screens, and premium amenities
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-cinema d-flex align-items-center gap-2">
          <FaPlus size={13} /> Add New Theater
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading theaters..." />
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
                  <th>Theater Name</th>
                  <th>Location & City</th>
                  <th>Address</th>
                  <th>Facilities</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {theaters.map((th) => (
                  <tr key={th._id}>
                    <td>
                      <div className="text-white fw-bold small d-flex align-items-center gap-2">
                        <FaBuilding className="text-danger" /> {th.name}
                      </div>
                    </td>
                    <td>
                      <div className="text-white small">{th.location}</div>
                      <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                        {th.city}
                      </div>
                    </td>
                    <td className="text-secondary small text-truncate" style={{ maxWidth: '220px' }}>
                      {th.address}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '250px' }}>
                        {th.facilities &&
                          th.facilities.slice(0, 3).map((f, idx) => (
                            <span key={idx} className="badge bg-dark border border-secondary text-secondary small">
                              {f}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          onClick={() => handleOpenEdit(th)}
                          className="btn btn-outline-secondary btn-sm"
                          title="Edit"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(th)}
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

      {/* Add / Edit Theater Modal */}
      {modalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-content-cinema p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-white fw-bold mb-0">
                  {editTheater ? 'Edit Theater Details' : 'Add New Theater'}
                </h4>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">
                    Theater Name *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-cinema"
                    placeholder="e.g. PVR INOX: Vega City Mall"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label text-secondary small fw-semibold">
                      City *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-cinema"
                      placeholder="Bengaluru"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-secondary small fw-semibold">
                      Area / Location *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-cinema"
                      placeholder="Bannerghatta Road"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">
                    Full Address *
                  </label>
                  <textarea
                    rows="2"
                    className="form-control form-control-cinema"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label text-secondary small fw-semibold">
                    Amenities & Facilities (Comma separated)
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-cinema"
                    value={formData.facilities}
                    onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  />
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
                    {submitting ? 'Saving...' : editTheater ? 'Update Theater' : 'Save Theater'}
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
              <h5 className="text-white fw-bold mb-3">Delete Theater Confirmation</h5>
              <p className="text-secondary small mb-3">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? All scheduled
                shows at this theater will also be removed.
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
                  Delete Theater
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTheatersPage;
