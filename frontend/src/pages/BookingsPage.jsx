import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import {
  Ticket,
  Printer,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  ArrowLeft,
  XCircle,
  CheckCircle2,
  Film,
} from 'lucide-react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getMyBookings();
      if (data?.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
      toast.error('Could not load your ticket history');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking and release your seats?')) {
      return;
    }

    try {
      const res = await bookingService.cancelBooking(bookingId);
      toast.success(res.message || 'Booking cancelled and seats released');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel booking');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving your digital tickets…" />;
  }

  return (
    <div className="pb-24" style={{ background: '#0f171e' }}>
      {/* Header */}
      <div className="border-b border-[#1a242f]" style={{ background: '#141d26' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-prime text-[10px]">DIGITAL WALLET</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              My Tickets & History
            </h1>
            <p className="text-xs text-[#8ea3b0] mt-1">
              Your confirmed reservations and digital admission boarding passes
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="btn-prime-outline text-xs px-4 py-2 rounded flex items-center gap-1.5 font-bold"
            >
              <Printer size={14} /> Print Tickets
            </button>
            <Link
              to="/home"
              className="btn-prime text-xs px-4 py-2 rounded flex items-center gap-1.5 font-bold no-underline"
            >
              <Film size={14} /> Book More
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        {bookings.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-[#2c3e50]" style={{ background: '#1a242f' }}>
            <Ticket size={40} className="mx-auto text-[#4a6275] mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Reservations Found</h3>
            <p className="text-xs text-[#8ea3b0] mb-6">
              You haven't reserved any movie tickets yet. Explore today's cinema showtimes!
            </p>
            <Link to="/home" className="btn-prime text-xs px-6 py-2.5 rounded font-bold no-underline">
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => {
              const isCancelled = b.paymentStatus === 'Cancelled';

              return (
                <div
                  key={b._id || b.bookingId}
                  className="ticket-card p-6 border border-[#2c3e50] shadow-xl relative transition-all hover:border-[#00a8e1]/50"
                  style={{ background: '#1a242f' }}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#2c3e50]">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold tracking-widest text-[#00a8e1]">
                          ID: {b.bookingId}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isCancelled
                              ? 'bg-red-500/15 border border-red-500/40 text-red-400'
                              : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                          }`}
                        >
                          {b.paymentStatus || 'Completed'}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white">{b.movieName}</h3>
                      <p className="text-xs text-[#8ea3b0] flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-[#00a8e1]" /> {b.theatreName}
                      </p>
                    </div>

                    {/* QR Code Graphic Representation */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded bg-white p-1.5 flex items-center justify-center flex-shrink-0 shadow">
                        <QrCode size={52} className="text-[#0f171e]" />
                      </div>
                    </div>
                  </div>

                  {/* Middle Ticket Attributes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-[#2c3e50] text-xs">
                    <div>
                      <span className="text-[#4a6275] block uppercase text-[10px] font-bold">Show Date</span>
                      <span className="text-white font-semibold flex items-center gap-1 mt-0.5">
                        <Calendar size={12} className="text-[#00a8e1]" /> {b.showDate}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#4a6275] block uppercase text-[10px] font-bold">Show Time</span>
                      <span className="text-white font-semibold flex items-center gap-1 mt-0.5">
                        <Clock size={12} className="text-[#00a8e1]" /> {b.showTime}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#4a6275] block uppercase text-[10px] font-bold">Reserved Seats</span>
                      <span className="text-white font-bold text-sm text-[#00a8e1]">
                        {b.selectedSeats ? b.selectedSeats.join(', ') : 'Seats'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#4a6275] block uppercase text-[10px] font-bold">Total Paid</span>
                      <span className="text-white font-bold text-sm">
                        ₹{b.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] text-[#4a6275]">
                      Payment via: {b.paymentMethod || 'Prime Pay / UPI'} • Valid for entry at auditorium gate
                    </span>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelBooking(b._id || b.bookingId)}
                        className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors flex items-center gap-1"
                      >
                        <XCircle size={14} /> Cancel Reservation
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
