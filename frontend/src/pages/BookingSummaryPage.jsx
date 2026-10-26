import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import {
  FaTicketAlt,
  FaShieldAlt,
  FaArrowLeft,
  FaCreditCard,
  FaMobileAlt,
  FaUniversity,
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
} from 'react-icons/fa';

const BookingSummaryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const state = location.state;

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('demo-user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8891');
  const [processing, setProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // If accessed directly without selection state
  if (!state || !state.selectedSeats || state.selectedSeats.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-secondary bg-dark border-secondary text-secondary py-5">
          <h4>No active booking session found</h4>
          <p className="small mb-3">Please select a movie and seats first.</p>
          <Link to="/movies" className="btn btn-cinema btn-sm">
            Browse Movies
          </Link>
        </div>
      </div>
    );
  }

  const {
    showId,
    movie,
    theater,
    showDate,
    showTime,
    screenName,
    selectedSeats,
    seatDetails,
    subtotal,
    convenienceFee,
    totalAmount,
  } = state;

  const handleConfirmAndPay = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      setProcessing(true);
      setErrorMessage('');

      const payload = {
        showId,
        selectedSeats,
        paymentMethod,
        paymentDetails: {
          simulatedMethod: paymentMethod,
          mockIdentifier: paymentMethod === 'UPI' ? upiId : cardNumber,
        },
      };

      const res = await bookingService.createBooking(payload);

      if (res?.success && res?.booking) {
        setBookingSuccess(res.booking);
      }
    } catch (err) {
      console.error('Booking confirmation failed:', err);
      const msg =
        err.response?.data?.message ||
        'Booking transaction could not be completed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Success Modal / Confirmation Card */}
      {bookingSuccess ? (
        <div className="row justify-content-center py-4">
          <div className="col-lg-7">
            <div
              className="p-4 p-md-5 rounded-4 text-center"
              style={{
                backgroundColor: 'var(--imv-bg-card)',
                border: '1px solid var(--imv-border)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
              }}
            >
              <div
                className="d-inline-flex p-3 rounded-circle text-success mb-3"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
              >
                <FaCheckCircle size={48} />
              </div>

              <h2 className="text-white fw-bold mb-1">Booking Confirmed!</h2>
              <p className="text-secondary small mb-4">
                Your cinema tickets have been reserved and issued.
              </p>

              {/* Digital Cinema Ticket Preview */}
              <div className="ticket-card text-start mb-4">
                <div className="ticket-notch-left"></div>
                <div className="ticket-notch-right"></div>

                <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary border-dashed">
                  <div>
                    <span className="badge bg-danger mb-1">CONFIRMED TICKET</span>
                    <h5 className="text-white fw-bold mb-0">{bookingSuccess.movieTitle}</h5>
                  </div>
                  <div className="text-end">
                    <span className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                      BOOKING REF
                    </span>
                    <div className="text-white fw-bold font-monospace">
                      {bookingSuccess.bookingReference}
                    </div>
                  </div>
                </div>

                <div className="row g-3 small text-secondary mb-3">
                  <div className="col-6">
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      THEATER
                    </div>
                    <div className="text-white fw-semibold">{bookingSuccess.theaterName}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      DATE & TIME
                    </div>
                    <div className="text-white fw-semibold">
                      {bookingSuccess.showDate} • {bookingSuccess.showTime}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      AUDITORIUM
                    </div>
                    <div className="text-white fw-semibold">{bookingSuccess.screenName}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      SEAT NUMBERS
                    </div>
                    <div className="text-danger fw-bold fs-6">
                      {bookingSuccess.seats.join(', ')}
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary border-dashed">
                  <div>
                    <span className="text-muted small">Total Paid: </span>
                    <span className="text-white fw-bold">₹{bookingSuccess.totalAmount}</span>
                  </div>
                  <span className="badge bg-success bg-opacity-25 text-success border border-success">
                    Paid via {bookingSuccess.paymentMethod} (Simulated)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <Link to="/my-bookings" className="btn btn-cinema px-4 py-2">
                  <FaTicketAlt className="me-2" /> View in My Bookings
                </Link>
                <Link to="/" className="btn btn-cinema-outline px-4 py-2">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex align-items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-outline-secondary btn-sm"
              title="Go Back"
            >
              <FaArrowLeft />
            </button>
            <h2 className="text-white mb-0 fw-bold">
              Review & <span style={{ color: 'var(--imv-primary)' }}>Pay</span>
            </h2>
          </div>

          {errorMessage && (
            <div className="alert alert-danger bg-dark border-danger text-danger mb-4">
              <strong>Booking Error:</strong> {errorMessage}
            </div>
          )}

          <div className="row g-4">
            {/* Left Column: Booking Order Details */}
            <div className="col-lg-7">
              <div
                className="p-4 rounded-4 mb-4"
                style={{
                  backgroundColor: 'var(--imv-bg-card)',
                  border: '1px solid var(--imv-border)',
                }}
              >
                <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                  <FaTicketAlt className="text-danger" /> Booking Order Summary
                </h5>

                <div className="d-flex gap-3 mb-4 pb-3 border-bottom border-secondary">
                  <img
                    src={movie?.posterUrl}
                    alt={movie?.title}
                    className="rounded-3 shadow"
                    style={{ width: '70px', height: '95px', objectFit: 'cover' }}
                  />
                  <div>
                    <h5 className="text-white fw-bold mb-1">{movie?.title}</h5>
                    <div className="text-secondary small mb-1">
                      <FaMapMarkerAlt className="text-danger me-1" size={11} />
                      {theater?.name} ({theater?.city})
                    </div>
                    <div className="text-secondary small d-flex align-items-center gap-2">
                      <span className="d-flex align-items-center gap-1">
                        <FaCalendarAlt size={11} /> {showDate}
                      </span>
                      <span>•</span>
                      <span className="d-flex align-items-center gap-1">
                        <FaClock size={11} /> {showTime}
                      </span>
                      <span>•</span>
                      <span className="badge bg-secondary">{screenName}</span>
                    </div>
                  </div>
                </div>

                {/* Selected Seats Table */}
                <div className="mb-4">
                  <div className="text-secondary small fw-bold text-uppercase mb-2">
                    Seats Reserved ({selectedSeats.length})
                  </div>
                  <div className="table-responsive">
                    <table className="table table-dark table-sm border-secondary mb-0">
                      <thead>
                        <tr className="text-secondary small">
                          <th>Seat</th>
                          <th>Category</th>
                          <th className="text-end">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seatDetails.map((seat) => (
                          <tr key={seat.seatNumber}>
                            <td className="fw-bold text-white">{seat.seatNumber}</td>
                            <td>
                              <span className="badge bg-dark border border-secondary text-secondary">
                                {seat.tier} Tier
                              </span>
                            </td>
                            <td className="text-end text-white">₹{seat.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="p-3 rounded-3 bg-dark border border-secondary d-flex flex-column gap-2 text-secondary small">
                  <div className="d-flex justify-content-between">
                    <span>Tickets Subtotal:</span>
                    <span className="text-white fw-semibold">₹{subtotal}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Convenience Charges (inc. GST):</span>
                    <span className="text-white fw-semibold">₹{convenienceFee}</span>
                  </div>
                  <hr className="border-secondary my-1" />
                  <div className="d-flex justify-content-between text-white fw-bold fs-6">
                    <span>Grand Total:</span>
                    <span className="text-danger fs-5">₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Simulated Payment Gateway */}
            <div className="col-lg-5">
              <div
                className="p-4 rounded-4"
                style={{
                  backgroundColor: 'var(--imv-bg-card)',
                  border: '1px solid var(--imv-border)',
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="text-white fw-bold mb-0">Simulated Payment</h5>
                  <span className="badge bg-success bg-opacity-25 text-success border border-success small">
                    Academic Sandbox
                  </span>
                </div>

                <div className="alert alert-warning bg-dark border-warning text-warning small p-2 mb-3">
                  <FaShieldAlt className="me-1" /> This is a college demonstration system. No real
                  banking charges or cards are processed.
                </div>

                {/* Payment Method Selector */}
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">
                    Select Simulated Payment Option:
                  </label>
                  <div className="d-flex flex-column gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`btn text-start p-3 rounded-3 d-flex align-items-center justify-content-between ${
                        paymentMethod === 'UPI'
                          ? 'btn-danger text-white'
                          : 'btn-dark text-secondary border-secondary'
                      }`}
                    >
                      <span className="d-flex align-items-center gap-2">
                        <FaMobileAlt size={16} /> Instant UPI (GPay / PhonePe)
                      </span>
                      <span className="small opacity-75">Demo ID</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Card')}
                      className={`btn text-start p-3 rounded-3 d-flex align-items-center justify-content-between ${
                        paymentMethod === 'Card'
                          ? 'btn-danger text-white'
                          : 'btn-dark text-secondary border-secondary'
                      }`}
                    >
                      <span className="d-flex align-items-center gap-2">
                        <FaCreditCard size={16} /> Credit / Debit Card
                      </span>
                      <span className="small opacity-75">Mock Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Net Banking')}
                      className={`btn text-start p-3 rounded-3 d-flex align-items-center justify-content-between ${
                        paymentMethod === 'Net Banking'
                          ? 'btn-danger text-white'
                          : 'btn-dark text-secondary border-secondary'
                      }`}
                    >
                      <span className="d-flex align-items-center gap-2">
                        <FaUniversity size={16} /> Net Banking
                      </span>
                      <span className="small opacity-75">HDFC / SBI / ICICI</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Mock Inputs based on selected method */}
                {paymentMethod === 'UPI' && (
                  <div className="mb-3">
                    <label className="form-label text-secondary small">Virtual UPI ID</label>
                    <input
                      type="text"
                      className="form-control form-control-cinema"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                )}

                {paymentMethod === 'Card' && (
                  <div className="mb-3">
                    <label className="form-label text-secondary small">Mock Card Number</label>
                    <input
                      type="text"
                      className="form-control form-control-cinema mb-2"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                    <div className="row g-2">
                      <div className="col-6">
                        <input
                          type="text"
                          className="form-control form-control-cinema"
                          defaultValue="12/28"
                        />
                      </div>
                      <div className="col-6">
                        <input
                          type="password"
                          className="form-control form-control-cinema"
                          defaultValue="999"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Authenticated user note */}
                <div className="text-secondary small mb-4">
                  Booking for: <strong className="text-white">{user?.name}</strong> ({user?.email})
                </div>

                <button
                  onClick={handleConfirmAndPay}
                  disabled={processing}
                  className="btn btn-cinema w-100 py-3 fw-bold"
                >
                  {processing ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                  ) : null}
                  {processing ? 'Processing Lock & Payment...' : `Pay ₹${totalAmount} & Confirm`}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingSummaryPage;
