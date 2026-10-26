import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { showService } from '../services/showService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaArrowLeft,
  FaTicketAlt,
  FaInfoCircle,
  FaShieldAlt,
  FaCheckCircle,
} from 'react-icons/fa';

const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShowAndSeats();
  }, [showId]);

  const fetchShowAndSeats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await showService.getShowById(showId);
      if (data?.show) {
        setShow(data.show);
      }
    } catch (err) {
      console.error('Error fetching show seat matrix:', err);
      setError('Unable to load seat layout. The show may no longer be available.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;

    if (selectedSeats.some((s) => s.seatNumber === seat.seatNumber)) {
      // Deselect
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber));
    } else {
      // Select (limit to max 8 tickets per transaction)
      if (selectedSeats.length >= 8) {
        alert('You can select a maximum of 8 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Pricing calculations
  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = selectedSeats.length > 0 ? selectedSeats.length * 28 : 0;
  const totalAmount = subtotal + convenienceFee;

  const handleProceedToSummary = () => {
    if (selectedSeats.length === 0) return;

    // Navigate to summary with state
    navigate('/booking-summary', {
      state: {
        showId: show._id,
        movie: show.movie,
        theater: show.theater,
        showDate: show.showDate,
        showTime: show.showTime,
        screenName: show.screenName,
        selectedSeats: selectedSeats.map((s) => s.seatNumber),
        seatDetails: selectedSeats.map((s) => ({
          seatNumber: s.seatNumber,
          tier: s.tier,
          price: s.price,
        })),
        subtotal,
        convenienceFee,
        totalAmount,
      },
    });
  };

  if (loading) {
    return <LoadingSpinner message="Generating cinema auditorium seat matrix..." />;
  }

  if (error || !show) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger bg-dark border-danger text-danger py-4">
          <h5>{error || 'Show Not Found'}</h5>
          <Link to="/movies" className="btn btn-outline-light btn-sm mt-3">
            <FaArrowLeft className="me-1" /> Return to Movies
          </Link>
        </div>
      </div>
    );
  }

  // Group seats by row for structured cinema display
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsByRow = rows.map((r) => ({
    rowLetter: r,
    tier: r <= 'B' ? 'Silver' : r <= 'F' ? 'Gold' : 'VIP',
    seats: show.seatMatrix.filter((s) => s.row === r),
  }));

  return (
    <div className="container py-4">
      {/* Top Header Bar */}
      <div
        className="p-3 rounded-4 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3"
        style={{
          backgroundColor: 'var(--imv-bg-card)',
          border: '1px solid var(--imv-border)',
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline-secondary btn-sm"
            title="Go Back"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h5 className="text-white fw-bold mb-0">{show.movie?.title}</h5>
            <div className="text-secondary small">
              {show.theater?.name} • {show.screenName} •{' '}
              <span className="text-danger fw-semibold">{show.showDate}</span> at{' '}
              <span className="text-white fw-bold">{show.showTime}</span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-dark border border-secondary text-secondary">
            {show.availableSeats} of {show.totalSeats} Available
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Visual Cinema Seating Auditorium */}
        <div className="col-lg-8">
          <div
            className="p-4 rounded-4 text-center overflow-auto"
            style={{
              backgroundColor: 'var(--imv-bg-card)',
              border: '1px solid var(--imv-border)',
            }}
          >
            {/* Cinema Screen Indicator */}
            <div className="theater-screen-container">
              <div className="cinema-screen-curved"></div>
              <div className="screen-label">SCREEN THIS WAY</div>
            </div>

            {/* Seat Matrix Rows */}
            <div className="d-inline-flex flex-column align-items-center gap-2 my-4">
              {seatsByRow.map((rowGroup) => {
                const isFirstOfTier =
                  rowGroup.rowLetter === 'A' ||
                  rowGroup.rowLetter === 'C' ||
                  rowGroup.rowLetter === 'G';

                return (
                  <React.Fragment key={rowGroup.rowLetter}>
                    {isFirstOfTier && (
                      <div className="w-100 text-start ps-3 pt-3 pb-1 border-top border-secondary border-opacity-50">
                        <span className="badge bg-dark border border-secondary text-secondary small fw-bold text-uppercase">
                          {rowGroup.tier} Tier (₹
                          {rowGroup.tier === 'Silver'
                            ? show.tierPricing?.silver
                            : rowGroup.tier === 'Gold'
                            ? show.tierPricing?.gold
                            : show.tierPricing?.vip}
                          )
                        </span>
                      </div>
                    )}

                    <div className="d-flex align-items-center gap-2">
                      {/* Row Label Left */}
                      <span
                        className="text-secondary fw-bold small text-center"
                        style={{ width: '20px' }}
                      >
                        {rowGroup.rowLetter}
                      </span>

                      {/* Row Seats */}
                      <div className="d-flex align-items-center">
                        {rowGroup.seats.map((seat) => {
                          const isSelected = selectedSeats.some(
                            (s) => s.seatNumber === seat.seatNumber
                          );

                          let seatClass = 'available-gold';
                          if (seat.tier === 'Silver') seatClass = 'available-silver';
                          if (seat.tier === 'VIP') seatClass = 'available-vip';
                          if (isSelected) seatClass = 'selected';
                          if (seat.isBooked) seatClass = 'booked';

                          return (
                            <button
                              key={seat.seatNumber}
                              disabled={seat.isBooked}
                              onClick={() => handleSeatClick(seat)}
                              className={`seat-btn ${seatClass}`}
                              title={`Seat ${seat.seatNumber} • ${seat.tier} • ₹${seat.price}`}
                            >
                              {seat.col}
                            </button>
                          );
                        })}
                      </div>

                      {/* Row Label Right */}
                      <span
                        className="text-secondary fw-bold small text-center"
                        style={{ width: '20px' }}
                      >
                        {rowGroup.rowLetter}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Seating Legend */}
            <div className="d-flex flex-wrap align-items-center justify-content-center gap-4 pt-4 mt-3 border-top border-secondary small">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="seat-btn available-silver"
                  style={{ width: '20px', height: '20px', cursor: 'default' }}
                ></div>
                <span className="text-secondary">Silver (₹{show.tierPricing?.silver})</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div
                  className="seat-btn available-gold"
                  style={{ width: '20px', height: '20px', cursor: 'default' }}
                ></div>
                <span className="text-secondary">Gold (₹{show.tierPricing?.gold})</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div
                  className="seat-btn available-vip"
                  style={{ width: '20px', height: '20px', cursor: 'default' }}
                ></div>
                <span className="text-secondary">VIP Recliner (₹{show.tierPricing?.vip})</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div
                  className="seat-btn selected"
                  style={{ width: '20px', height: '20px', cursor: 'default' }}
                ></div>
                <span className="text-white fw-bold">Selected</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div
                  className="seat-btn booked"
                  style={{ width: '20px', height: '20px', cursor: 'default' }}
                ></div>
                <span className="text-secondary">Already Booked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Selection & Order Breakdown */}
        <div className="col-lg-4">
          <div
            className="p-4 rounded-4 sticky-top"
            style={{
              top: '90px',
              backgroundColor: 'var(--imv-bg-card)',
              border: '1px solid var(--imv-border)',
            }}
          >
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <FaTicketAlt className="text-danger" /> Selection Summary
            </h5>

            {selectedSeats.length === 0 ? (
              <div className="text-center py-4 text-secondary small">
                <FaInfoCircle size={28} className="mb-2 opacity-50" />
                <p className="mb-0">Please click on seats in the auditorium to reserve them.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {/* Selected Seat Badges */}
                <div>
                  <div className="text-secondary small fw-bold mb-2">
                    SELECTED SEATS ({selectedSeats.length})
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedSeats.map((s) => (
                      <span
                        key={s.seatNumber}
                        className="badge bg-danger p-2 px-3 rounded-pill fw-bold"
                      >
                        {s.seatNumber} ({s.tier})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="p-3 rounded-3 bg-dark border border-secondary text-secondary small d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between">
                    <span>Base Ticket Price:</span>
                    <span className="text-white fw-semibold">₹{subtotal}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Convenience Fee (inc. GST):</span>
                    <span className="text-white fw-semibold">₹{convenienceFee}</span>
                  </div>
                  <hr className="border-secondary my-1" />
                  <div className="d-flex justify-content-between text-white fw-bold fs-6">
                    <span>Total Amount:</span>
                    <span className="text-danger fs-5">₹{totalAmount}</span>
                  </div>
                </div>

                <div className="alert alert-secondary bg-dark border-secondary text-secondary small p-2 mb-0 d-flex align-items-center gap-2">
                  <FaShieldAlt className="text-success" size={16} />
                  <span>Seats are verified in real-time to prevent double booking.</span>
                </div>

                <button
                  onClick={handleProceedToSummary}
                  className="btn btn-cinema w-100 py-3 fw-bold"
                >
                  Proceed to Checkout &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
