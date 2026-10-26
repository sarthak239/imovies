import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaTicketAlt,
  FaSearch,
  FaTimesCircle,
  FaEye,
  FaCheckCircle,
  FaFilter,
} from 'react-icons/fa';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [status]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (status !== 'all') params.status = status;
      const data = await adminService.getAllBookings(params);
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Error fetching admin bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking and release seats?')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      await bookingService.cancelBooking(bookingId);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.bookingReference.toLowerCase().includes(q) ||
      b.movieTitle.toLowerCase().includes(q) ||
      (b.user?.name && b.user.name.toLowerCase().includes(q)) ||
      (b.user?.email && b.user.email.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="text-white fw-bold mb-1">Manage Customer Bookings</h2>
          <p className="text-secondary small mb-0">
            Monitor real-time reservations, inspect ticket details, and process cancellations
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="p-3 rounded-4 mb-4"
        style={{
          backgroundColor: 'var(--imv-bg-card)',
          border: '1px solid var(--imv-border)',
        }}
      >
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="position-relative">
              <input
                type="text"
                className="form-control form-control-cinema ps-5"
                placeholder="Search by reference, movie, customer name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FaSearch
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                size={14}
              />
            </div>
          </div>

          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2">
              <span className="text-secondary small fw-semibold">Status:</span>
              <select
                className="form-select form-select-cinema"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All Bookings</option>
                <option value="confirmed">Confirmed Only</option>
                <option value="cancelled">Cancelled Only</option>
              </select>
            </div>
          </div>

          <div className="col-md-2 text-md-end">
            <span className="text-secondary small">
              Found <strong>{filtered.length}</strong> records
            </span>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <LoadingSpinner message="Querying platform bookings..." />
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
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Movie & Show</th>
                  <th>Theater</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <span className="font-monospace text-white fw-bold small">
                        {b.bookingReference}
                      </span>
                    </td>
                    <td>
                      <div className="text-white small fw-semibold">{b.user?.name || 'Customer'}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {b.user?.email}
                      </div>
                    </td>
                    <td>
                      <div className="text-white small fw-bold">{b.movieTitle}</div>
                      <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                        {b.showDate} • {b.showTime}
                      </div>
                    </td>
                    <td className="text-secondary small">{b.theaterName}</td>
                    <td>
                      <span className="badge bg-danger bg-opacity-25 text-danger border border-danger">
                        {b.seats.join(', ')}
                      </span>
                    </td>
                    <td className="text-white fw-bold small">₹{b.totalAmount}</td>
                    <td>
                      <span
                        className={`badge ${
                          b.bookingStatus === 'confirmed' ? 'bg-success' : 'bg-secondary'
                        }`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {b.bookingStatus?.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="btn btn-outline-secondary btn-sm"
                          title="View Details"
                        >
                          <FaEye size={12} />
                        </button>
                        {b.bookingStatus === 'confirmed' && (
                          <button
                            onClick={() => handleAdminCancel(b._id)}
                            disabled={cancellingId === b._id}
                            className="btn btn-outline-danger btn-sm"
                            title="Cancel Booking & Release Seats"
                          >
                            <FaTimesCircle size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-content-cinema p-4">
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary">
                <h5 className="text-white fw-bold mb-0">Booking Record Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedBooking(null)}
                ></button>
              </div>

              <div className="d-flex flex-column gap-2 text-secondary small mb-4">
                <div>Reference ID: <strong className="text-white font-monospace">{selectedBooking.bookingReference}</strong></div>
                <div>Customer Name: <strong className="text-white">{selectedBooking.user?.name}</strong></div>
                <div>Customer Email: <strong className="text-white">{selectedBooking.user?.email}</strong></div>
                <div>Movie: <strong className="text-white">{selectedBooking.movieTitle}</strong></div>
                <div>Theater: <strong className="text-white">{selectedBooking.theaterName}</strong> ({selectedBooking.theaterCity})</div>
                <div>Auditorium: <strong className="text-white">{selectedBooking.screenName}</strong></div>
                <div>Date & Time: <strong className="text-white">{selectedBooking.showDate} at {selectedBooking.showTime}</strong></div>
                <div>Seats Reserved: <strong className="text-danger">{selectedBooking.seats.join(', ')}</strong></div>
                <div>Subtotal: <strong className="text-white">₹{selectedBooking.subtotal}</strong></div>
                <div>Convenience Fee: <strong className="text-white">₹{selectedBooking.convenienceFee}</strong></div>
                <div>Grand Total: <strong className="text-white fs-6">₹{selectedBooking.totalAmount}</strong></div>
                <div>Payment Method: <span className="badge bg-secondary">{selectedBooking.paymentMethod}</span></div>
                <div>Payment ID: <span className="font-monospace text-muted">{selectedBooking.paymentId}</span></div>
                <div>Status: <span className={`badge ${selectedBooking.bookingStatus === 'confirmed' ? 'bg-success' : 'bg-secondary'}`}>{selectedBooking.bookingStatus.toUpperCase()}</span></div>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-cinema-outline btn-sm"
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
