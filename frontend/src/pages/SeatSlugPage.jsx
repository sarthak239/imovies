import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { showService } from '../services/showService';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Ticket,
  Clock,
  ShieldCheck,
  CreditCard,
  QrCode,
  CheckCircle2,
  Lock,
  AlertTriangle,
  X,
  Sparkles,
} from 'lucide-react';

export default function SeatSlugPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]); // array of seat objects
  const [loading, setLoading] = useState(true);

  // Seat Lock & TTL Countdown State
  const [isLocked, setIsLocked] = useState(false);
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const timerRef = useRef(null);

  // Payment Checkout Modal
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Prime Pay / UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    fetchShow();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showId]);

  const fetchShow = async () => {
    try {
      setLoading(true);
      const data = await showService.getShowById(showId);
      if (data?.show) {
        setShow(data.show);
      }
    } catch (err) {
      console.error('Failed to load show:', err);
      toast.error('Unable to load seating map for this show');
    } finally {
      setLoading(false);
    }
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (!isLocked || !lockExpiresAt) return;

    const tick = () => {
      const now = Date.now();
      const exp = new Date(lockExpiresAt).getTime();
      const diff = Math.max(0, Math.floor((exp - now) / 1000));
      setTimeLeftSeconds(diff);

      if (diff <= 0) {
        clearInterval(timerRef.current);
        handleLockTimeout();
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);

    return () => clearInterval(timerRef.current);
  }, [isLocked, lockExpiresAt]);

  const handleLockTimeout = () => {
    setIsLocked(false);
    setLockExpiresAt(null);
    setCheckoutModalOpen(false);
    toast.error('Seat reservation lock expired. Please re-select your seats.');
    fetchShow();
  };

  const handleSeatClick = (seat) => {
    if (seat.status === 'booked') return;
    if (seat.status === 'locked' && seat.lockedBy !== user?.email && !isLocked) {
      toast.info(`Seat ${seat.seatNumber} is temporarily locked by another user`);
      return;
    }

    if (selectedSeats.some((s) => s.seatNumber === seat.seatNumber)) {
      // Deselect
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber));
    } else {
      // Select (limit to max 8 tickets per transaction)
      if (selectedSeats.length >= 8) {
        toast.warning('Maximum 8 seats per booking allowed');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Pricing calculations
  const subtotal = selectedSeats.reduce((sum, s) => sum + (s.price || 200), 0);
  const convenienceFee = selectedSeats.length > 0 ? selectedSeats.length * 28 : 0;
  const totalAmount = subtotal + convenienceFee;

  // Real-Time Seat Locking with 5-minute TTL
  const handleLockAndProceed = async () => {
    if (selectedSeats.length === 0) {
      toast.warning('Please select at least one seat');
      return;
    }

    try {
      const seatNumbers = selectedSeats.map((s) => s.seatNumber);
      const res = await bookingService.lockSeats({
        showId: show._id || show.showId,
        selectedSeats: seatNumbers,
        userEmail: user?.email,
      });

      if (res.success) {
        setIsLocked(true);
        setLockExpiresAt(res.lockExpiresAt);
        setCheckoutModalOpen(true);
        toast.info(res.message || 'Seats locked for 5 minutes. Complete checkout to confirm.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not lock selected seats. They may have just been reserved.');
      fetchShow();
    }
  };

  // Razorpay Gateway Trigger Function
  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true);

      // Step 1: Script Injection Check
      const isLoaded = await paymentService.loadScript();
      if (!isLoaded) {
        toast.error('Unable to load Razorpay payment gateway. Please check your internet connection.');
        setIsProcessingPayment(false);
        return;
      }

      // Step 2: Request order_id from /api/payment/create-order
      const orderData = await paymentService.createOrder({
        amount: totalAmount,
        showId: show._id || show.showId,
        selectedSeats: selectedSeats.map((s) => s.seatNumber),
        userEmail: user?.email,
      });

      if (!orderData?.success || !orderData?.order_id) {
        throw new Error(orderData?.message || 'Failed to initialize Razorpay order');
      }

      // Step 3: Configure window.Razorpay options
      const options = {
        key: orderData.key_id || orderData.keyId,
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: 'iMovies Ticket Booking',
        description: `${show.movieName || 'Movie Feature'} (${selectedSeats.map((s) => s.seatNumber).join(', ')})`,
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=200&auto=format&fit=crop',
        order_id: orderData.order_id || orderData.orderId,
        handler: async function (response) {
          try {
            setIsProcessingPayment(true);
            // Step 4: Post signature and order payload to /api/payment/verify
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingDetails: {
                showId: show._id || show.showId,
                selectedSeats: selectedSeats.map((s) => s.seatNumber),
                userEmail: user?.email,
                movieName: show.movieName || show.movie?.title,
                theatreName: show.theatreName,
                showDate: show.showDate,
                showTime: show.showTime,
                subtotal,
                convenienceFee,
                totalAmount,
              },
            });

            if (verifyRes.success) {
              toast.success('Payment verified successfully! Your digital tickets are ready.');
              setIsLocked(false);
              setCheckoutModalOpen(false);
              navigate('/bookings');
            } else {
              toast.error(verifyRes.message || 'Payment signature verification failed.');
              fetchShow();
            }
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            toast.error(verifyErr.response?.data?.message || 'Payment verification failed. Releasing seats.');
            fetchShow();
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.name || user?.username || 'iMovies Cinephile',
          email: user?.email || 'user@imovies.com',
          contact: '9999999999',
        },
        notes: {
          showId: String(show._id || show.showId),
          seats: selectedSeats.map((s) => s.seatNumber).join(', '),
          theatre: show.theatreName,
        },
        theme: {
          color: '#E50914',
        },
        modal: {
          ondismiss: async function () {
            // Step 5: On modal dismiss / payment failure, notify user and release locked seats
            try {
              await paymentService.cancelPayment({
                showId: show._id || show.showId,
                selectedSeats: selectedSeats.map((s) => s.seatNumber),
                userEmail: user?.email,
              });
            } catch (e) {}
            setIsLocked(false);
            setLockExpiresAt(null);
            setCheckoutModalOpen(false);
            toast.info('Payment window closed. Locked seats have been released.');
            fetchShow();
          },
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay using UPI',
                instruments: [{ method: 'upi' }],
              },
              cards: {
                name: 'Credit / Debit Cards',
                instruments: [{ method: 'card' }],
              },
              netbanking: {
                name: 'NetBanking & Wallets',
                instruments: [{ method: 'netbanking' }, { method: 'wallet' }],
              },
            },
            sequence: ['block.upi', 'block.cards', 'block.netbanking'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response) {
        console.error('Razorpay payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description || 'Transaction declined'}`);
        try {
          await paymentService.cancelPayment({
            showId: show._id || show.showId,
            selectedSeats: selectedSeats.map((s) => s.seatNumber),
            userEmail: user?.email,
          });
        } catch (e) {}
        setIsLocked(false);
        setLockExpiresAt(null);
        setCheckoutModalOpen(false);
        fetchShow();
      });

      rzp.open();
    } catch (err) {
      console.error('Razorpay initialization error:', err);
      toast.error(err.response?.data?.message || err.message || 'Payment initiation failed.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancelLock = async () => {
    try {
      await paymentService.cancelPayment({
        showId: show._id || show.showId,
        selectedSeats: selectedSeats.map((s) => s.seatNumber),
        userEmail: user?.email,
      });
    } catch (e) {}

    setIsLocked(false);
    setLockExpiresAt(null);
    setCheckoutModalOpen(false);
    toast.info('Seat lock released');
  };

  if (loading) {
    return <LoadingSpinner message="Generating real-time auditorium matrix…" />;
  }

  if (!show) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Show Not Available</h2>
        <Link to="/home" className="btn-prime text-sm px-4 py-2 rounded no-underline">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  // Format countdown minutes and seconds
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const tickets = show.tickets || {};

  // Group into Tiers: Balcony (Rows A, B), Middle (Rows C, D, E), Lower (Rows F, G)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  return (
    <div className="pb-24" style={{ background: '#0f171e' }}>
      {/* Top Header Bar */}
      <div className="border-b border-[#1a242f]" style={{ background: '#141d26' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-md border border-[#2c3e50] bg-[#1a242f] text-white hover:border-[#00a8e1] transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-lg font-black text-white">
                {show.movieName || show.movie?.title}
              </h2>
              <p className="text-xs text-[#8ea3b0]">
                {show.theatreName} • <span className="text-[#00a8e1] font-semibold">{show.showTime}</span>
              </p>
            </div>
          </div>

          {/* Active Lock Countdown Alert */}
          {isLocked && (
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold animate-pulse">
              <Clock size={16} />
              <span>Seat Lock Expires in: {timeFormatted}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Curved Screen & Interactive Tier Map */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-xl border border-[#2c3e50] text-center overflow-x-auto"
                 style={{ background: '#1a242f' }}>

              {/* Curved Cinema Screen */}
              <div className="mb-8">
                <div className="cinema-screen" />
                <div className="cinema-screen-label">CURVED SCREEN • ALL EYES THIS WAY</div>
              </div>

              {/* Rows Container */}
              <div className="inline-flex flex-col items-center gap-2.5 my-2">
                {rows.map((rowLetter) => {
                  const isBalcony = rowLetter <= 'B';
                  const isMiddle = rowLetter >= 'C' && rowLetter <= 'E';
                  const isLower = rowLetter >= 'F';

                  const isFirstOfTier = rowLetter === 'A' || rowLetter === 'C' || rowLetter === 'F';
                  const tierLabel = isBalcony
                    ? `BALCONY TIER (₹${show.tierPricing?.balcony || 280})`
                    : isMiddle
                    ? `MIDDLE TIER (₹${show.tierPricing?.middle || 200})`
                    : `LOWER TIER (₹${show.tierPricing?.lower || 140})`;

                  return (
                    <React.Fragment key={rowLetter}>
                      {isFirstOfTier && (
                        <div className="w-full text-left pt-4 pb-1">
                          <span className="badge-prime text-[10px] font-bold tracking-wider">
                            {tierLabel}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {/* Row Letter Left */}
                        <span className="w-5 text-center text-xs font-bold text-[#4a6275]">
                          {rowLetter}
                        </span>

                        {/* 10 Seats per row */}
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((col) => {
                            const seatNumber = `${rowLetter}${col}`;
                            const seatData = tickets[seatNumber] || {
                              seatNumber,
                              tier: isBalcony ? 'Balcony' : isMiddle ? 'Middle' : 'Lower',
                              price: isBalcony ? show.tierPricing?.balcony || 280 : isMiddle ? show.tierPricing?.middle || 200 : show.tierPricing?.lower || 140,
                              status: 'available',
                            };

                            const isSelected = selectedSeats.some((s) => s.seatNumber === seatNumber);
                            const isBooked = seatData.status === 'booked';
                            const isSeatLocked = seatData.status === 'locked' && !isSelected;

                            let seatClass = 'seat-available-middle';
                            if (isBalcony) seatClass = 'seat-available-balcony';
                            if (isLower) seatClass = 'seat-available-lower';
                            if (isSelected) seatClass = 'seat-selected';
                            if (isSeatLocked) seatClass = 'seat-locked';
                            if (isBooked) seatClass = 'seat-booked';

                            return (
                              <button
                                key={seatNumber}
                                disabled={isBooked || isSeatLocked}
                                onClick={() => handleSeatClick(seatData)}
                                className={`seat-btn ${seatClass}`}
                                title={`Seat ${seatNumber} • ${seatData.tier} • ₹${seatData.price}`}
                              >
                                {isSeatLocked ? <Lock size={10} /> : col}
                              </button>
                            );
                          })}
                        </div>

                        {/* Row Letter Right */}
                        <span className="w-5 text-center text-xs font-bold text-[#4a6275]">
                          {rowLetter}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Seating Map Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-8 mt-6 border-t border-[#2c3e50] text-xs text-[#8ea3b0]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded seat-available-balcony" />
                  <span>Balcony (₹{show.tierPricing?.balcony || 280})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded seat-available-middle" />
                  <span>Middle (₹{show.tierPricing?.middle || 200})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded seat-available-lower" />
                  <span>Lower (₹{show.tierPricing?.lower || 140})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded seat-selected" />
                  <span className="text-white font-bold">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded seat-locked" />
                  <span>Locked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded seat-booked" />
                  <span>Booked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Selection & Order Summary */}
          <div>
            <div className="p-6 rounded-xl border border-[#2c3e50] sticky top-20"
                 style={{ background: '#1a242f' }}>
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Ticket size={18} className="text-[#00a8e1]" /> Order Breakdown
              </h3>

              {selectedSeats.length === 0 ? (
                <div className="py-8 text-center text-[#4a6275]">
                  <p className="text-xs">Click on seats in the map to select tickets.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected Seat Badges */}
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[#4a6275] mb-2">
                      Selected Seats ({selectedSeats.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSeats.map((s) => (
                        <span
                          key={s.seatNumber}
                          className="text-xs font-bold px-2.5 py-1 rounded-md text-white flex items-center gap-1"
                          style={{ background: '#00a8e1' }}
                        >
                          {s.seatNumber} ({s.tier})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="p-4 rounded-lg bg-[#141d26] border border-[#2c3e50] space-y-2 text-xs text-[#8ea3b0]">
                    <div className="flex justify-between">
                      <span>Base Ticket Amount</span>
                      <span className="text-white font-semibold">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Convenience Fee (incl. GST)</span>
                      <span className="text-white font-semibold">₹{convenienceFee}</span>
                    </div>
                    <div className="pt-2 border-t border-[#2c3e50] flex justify-between text-sm font-bold text-white">
                      <span>Total Payable</span>
                      <span className="text-base text-[#00a8e1]">₹{totalAmount}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#141d26] border border-[#2c3e50] flex items-center gap-2 text-[11px] text-[#8ea3b0]">
                    <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
                    <span>Real-time atomic locking prevents double booking conflicts.</span>
                  </div>

                  <button
                    onClick={handleLockAndProceed}
                    className="btn-prime w-full py-3 rounded-md font-bold justify-center text-sm shadow-lg shadow-[#00a8e1]/30"
                  >
                    Lock Seats & Proceed to Pay &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout / Razorpay Payment Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#1a242f] rounded-xl overflow-hidden border border-[#2c3e50] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#2c3e50] mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <CreditCard size={18} className="text-[#00a8e1]" /> Razorpay Checkout
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    TEST MODE
                  </span>
                </div>
                <p className="text-xs text-[#8ea3b0] mt-0.5">
                  Seats reserved for <span className="text-amber-400 font-bold">{timeFormatted}</span>
                </p>
              </div>
              <button
                onClick={handleCancelLock}
                className="text-[#8ea3b0] hover:text-white p-1"
                title="Cancel Lock & Exit"
              >
                <X size={18} />
              </button>
            </div>

            {/* Ticket Snapshot */}
            <div className="p-4 rounded-lg bg-[#141d26] border border-[#2c3e50] mb-4 text-xs">
              <div className="flex justify-between font-bold text-white mb-1">
                <span>{show.movieName || show.movie?.title}</span>
                <span className="text-emerald-400 font-extrabold text-sm">₹{totalAmount}</span>
              </div>
              <p className="text-[#8ea3b0]">
                {show.theatreName} • {show.showTime} • Seats: <span className="text-white font-semibold">{selectedSeats.map(s => s.seatNumber).join(', ')}</span>
              </p>
            </div>

            {/* Supported Payment Channels */}
            <div className="mb-5 space-y-2.5">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8ea3b0]">
                Supported Payment Options
              </span>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="p-3 rounded-lg border border-[#2c3e50] bg-[#141d26] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-semibold text-white">Instant UPI & QR</span>
                  </div>
                  <span className="text-[11px] text-[#8ea3b0]">GPay, PhonePe, Paytm, BHIM</span>
                </div>

                <div className="p-3 rounded-lg border border-[#2c3e50] bg-[#141d26] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span className="font-semibold text-white">Credit & Debit Cards</span>
                  </div>
                  <span className="text-[11px] text-[#8ea3b0]">Visa, MasterCard, RuPay</span>
                </div>

                <div className="p-3 rounded-lg border border-[#2c3e50] bg-[#141d26] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    <span className="font-semibold text-white">NetBanking & Wallets</span>
                  </div>
                  <span className="text-[11px] text-[#8ea3b0]">Top 50+ Banks & Wallets</span>
                </div>
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="p-3 rounded-lg bg-[#0e1620] border border-[#1e2d3d] flex items-center gap-2 text-[11px] text-[#8ea3b0] mb-5">
              <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
              <span>256-bit SSL encrypted transaction powered by official Razorpay SDK.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancelLock}
                className="btn-prime-outline flex-1 py-3 rounded-lg font-semibold text-xs justify-center hover:bg-slate-800"
              >
                Release Seats
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handlePayment}
                className="flex-1 py-3 px-4 rounded-lg font-bold text-xs text-white justify-center shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                style={{
                  backgroundColor: '#E50914',
                  boxShadow: '0 4px 14px rgba(229, 9, 20, 0.4)',
                }}
              >
                <Lock size={14} />
                {isProcessingPayment ? 'Initializing...' : `Pay ₹${totalAmount} with Razorpay`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
