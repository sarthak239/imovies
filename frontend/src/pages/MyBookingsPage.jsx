import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaTimesCircle,
  FaEye,
  FaPrint,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookingService.getMyBookings();
      if (data?.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Could not load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;

    try {
      setCancelling(true);
      const res = await bookingService.cancelBooking(cancelModalBooking._id);
      if (res?.success) {
        // Update local state
        setBookings(
          bookings.map((b) =>
            b._id === cancelModalBooking._id
              ? { ...b, bookingStatus: 'cancelled', paymentStatus: 'refunded' }
              : b
          )
        );
        setCancelModalBooking(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving your cinema tickets..." />;
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="text-white mb-1">
            My <span style={{ color: 'var(--imv-primary)' }}>Bookings</span>
          </h1>
          <p className="text-secondary small mb-0">
            View your ticket history, access digital boarding passes, or manage cancellations
          </p>
        </div>
        <Link to="/movies" className="btn btn-cinema btn-sm">
          + Book New Tickets
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger bg-dark border-danger text-danger mb-4">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-5 bg-dark rounded-4 border border-secondary text-secondary my-4">
          <FaTicketAlt size={48} className="mb-3 opacity-50 text-danger" />
          <h4>No Bookings Yet</h4>
          <p className="small mb-3">You haven't reserved any movie tickets so far.</p>
          <Link to="/movies" className="btn btn-cinema-outline btn-sm">
            Discover What's Showing
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {bookings.map((booking) => {
            const isCancelled = booking.bookingStatus === 'cancelled';

            return (
              <div
                key={booking._id}
                className="p-4 rounded-4"
                style={{
                  backgroundColor: 'var(--imv-bg-card)',
                  border: isCancelled
                    ? '1px solid #332222'
                    : '1px solid var(--imv-border)',
                  opacity: isCancelled ? 0.75 : 1,
                }}
              >
                <div className="row g-3 align-items-center">
                  {/* Poster Thumbnail */}
                  <div className="col-auto">
                    <img
                      src={booking.movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=200'}
                      alt={booking.movieTitle}
                      className="rounded-3 shadow"
                      style={{ width: '68px', height: '95px', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Main Details */}
                  <div className="col">
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <h5 className="text-white fw-bold mb-0">{booking.movieTitle}</h5>
                      <span
                        className={`badge ${
                          isCancelled ? 'bg-secondary' : 'bg-success'
                        } small`}
                      >
                        {isCancelled ? 'CANCELLED & REFUNDED' : 'CONFIRMED'}
                      </span>
                    </div>

                    <div className="text-secondary small mb-2 d-flex align-items-center gap-2 flex-wrap">
                      <span className="text-white fw-semibold">
                        <FaMapMarkerAlt className="text-danger me-1" size={11} />
                        {booking.theaterName}
                      </span>
                      <span>•</span>
                      <span>{booking.screenName}</span>
                    </div>

                    <div className="d-flex align-items-center gap-3 text-secondary small flex-wrap">
                      <span className="d-flex align-items-center gap-1 text-white">
                        <FaCalendarAlt className="text-danger" size={11} />
                        {booking.showDate}
                      </span>
                      <span>•</span>
                      <span className="d-flex align-items-center gap-1 text-white">
                        <FaClock className="text-danger" size={11} />
                        {booking.showTime}
                      </span>
                      <span>•</span>
                      <span>
                        Seats:{' '}
                        <strong className="text-danger">
                          {booking.seats.join(', ')}
                        </strong>{' '}
                        ({booking.ticketCount} {booking.ticketCount === 1 ? 'ticket' : 'tickets'})
                      </span>
                    </div>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="col-lg-3 col-md-4 text-md-end border-top border-md-top-0 pt-3 pt-md-0 border-secondary">
                    <div className="mb-2">
                      <span className="text-muted small">Total: </span>
                      <span className="fs-5 fw-bold text-white">₹{booking.totalAmount}</span>
                    </div>

                    <div className="d-flex gap-2 justify-content-md-end">
                      <button
                        onClick={() => setSelectedTicket(booking)}
                        className="btn btn-cinema-outline btn-sm d-flex align-items-center gap-1"
                      >
                        <FaEye size={12} /> View Ticket
                      </button>

                      {!isCancelled && (
                        <button
                          onClick={() => setCancelModalBooking(booking)}
                          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                        >
                          <FaTimesCircle size={12} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital Ticket Modal */}
      {selectedTicket && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-content-cinema p-4 position-relative">
              <button
                type="button"
                className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                onClick={() => setSelectedTicket(null)}
              ></button>

              <div className="ticket-card text-start my-2">
                <div className="ticket-notch-left"></div>
                <div className="ticket-notch-right"></div>

                <div className="text-center mb-3 pb-3 border-bottom border-secondary border-dashed">
                  <span className="badge bg-danger mb-2">CINEMA M-TICKET</span>
                  <h4 className="text-white fw-bold mb-1">{selectedTicket.movieTitle}</h4>
                  <div className="text-secondary small">
                    Reference: <span className="text-white font-monospace">{selectedTicket.bookingReference}</span>
                  </div>
                </div>

                <div className="row g-3 small text-secondary mb-3">
                  <div className="col-6">
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>CINEMA THEATER</div>
                    <div className="text-white fw-semibold">{selectedTicket.theaterName}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>AUDITORIUM</div>
                    <div className="text-white fw-semibold">{selectedTicket.screenName}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>DATE</div>
                    <div className="text-white fw-semibold">{selectedTicket.showDate}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>TIME</div>
                    <div className="text-white fw-semibold">{selectedTicket.showTime}</div>
                  </div>
                  <div className="col-12">
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>SEATS CONFIRMED</div>
                    <div className="text-danger fw-bold fs-5">
                      {selectedTicket.seats.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="p-3 bg-dark rounded-3 text-center border border-secondary my-3">
                  <div className="font-monospace text-muted small letter-spacing-2">
                    ||| | | |||| || | || ||||| | ||| |||| || |
                  </div>
                  <div className="text-secondary font-monospace" style={{ fontSize: '0.68rem' }}>
                    {selectedTicket.bookingReference} • VALID FOR ENTRY
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center text-secondary small pt-2 border-top border-secondary border-dashed">
                  <span>Paid: ₹{selectedTicket.totalAmount}</span>
                  <span className="text-success fw-semibold">
                    Status: {selectedTicket.bookingStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="d-flex gap-2 justify-content-center mt-3">
                <button onClick={handlePrint} className="btn btn-cinema btn-sm">
                  <FaPrint className="me-1" /> Print / Save Ticket
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="btn btn-outline-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-content-cinema p-4">
              <div className="d-flex align-items-center gap-3 text-warning mb-3">
                <FaExclamationTriangle size={28} />
                <h5 className="modal-title text-white mb-0">Confirm Ticket Cancellation</h5>
              </div>

              <p className="text-secondary small mb-3">
                Are you sure you want to cancel booking <strong>{cancelModalBooking.bookingReference}</strong> for <strong>{cancelModalBooking.movieTitle}</strong>?
              </p>

              <div className="p-3 bg-dark rounded-3 border border-secondary mb-4 text-secondary small">
                <div>Seats to be released: <strong className="text-danger">{cancelModalBooking.seats.join(', ')}</strong></div>
                <div>Refund amount: <strong className="text-success">₹{cancelModalBooking.totalAmount}</strong> (Simulated Refund)</div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setCancelModalBooking(null)}
                  disabled={cancelling}
                >
                  Keep Tickets
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
