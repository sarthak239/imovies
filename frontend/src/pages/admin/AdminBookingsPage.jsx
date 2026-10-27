import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import {
  Ticket,
  Search,
  XCircle,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
} from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllBookings({
        search: search.trim(),
        status: statusFilter,
      });
      if (data?.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
      toast.error('Could not fetch bookings list');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Admin Action: Cancel this reservation and release seats?')) {
      return;
    }

    try {
      await bookingService.cancelBooking(id);
      toast.success('Reservation cancelled by admin');
      fetchBookings();
    } catch (err) {
      toast.error('Could not cancel booking');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Platform Reservations</h1>
          <p className="text-xs text-[#8ea3b0]">Monitor, search, and moderate customer ticket orders</p>
        </div>

        <button
          onClick={fetchBookings}
          className="btn-prime-outline text-xs px-3.5 py-2 rounded flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-[#2c3e50] bg-[#1a242f] flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a6275]" />
          <input
            type="text"
            className="input-prime pl-9 text-xs py-2"
            placeholder="Search ID, email, movie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-[#4a6275] font-bold uppercase tracking-wider">Status:</span>
          {['all', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                statusFilter === st
                  ? 'border-[#00a8e1] bg-[#00a8e1]/15 text-[#00a8e1]'
                  : 'border-[#2c3e50] bg-[#141d26] text-[#8ea3b0] hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="p-6 rounded-xl border border-[#2c3e50] bg-[#1a242f]">
        {loading ? (
          <div className="py-12 text-center">
            <LoadingSpinner message="Filtering reservations..." />
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center text-[#4a6275] text-xs">
            No reservations found matching the filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2c3e50] text-[#4a6275] uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Booking ID</th>
                  <th className="pb-3">Customer Email</th>
                  <th className="pb-3">Movie & Theatre</th>
                  <th className="pb-3">Slot</th>
                  <th className="pb-3">Seats</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2c3e50]/50 text-[#8ea3b0]">
                {bookings.map((b) => {
                  const isCancelled = b.paymentStatus === 'Cancelled';

                  return (
                    <tr key={b._id || b.bookingId} className="hover:bg-[#141d26]/60 transition-colors">
                      <td className="py-3 font-mono font-bold text-white">
                        {b.bookingId}
                      </td>
                      <td className="py-3 text-white">
                        {b.userEmail}
                      </td>
                      <td className="py-3">
                        <div className="text-white font-semibold">{b.movieName}</div>
                        <div className="text-[10px] text-[#4a6275]">{b.theatreName}</div>
                      </td>
                      <td className="py-3">
                        <div>{b.showDate}</div>
                        <div className="text-[10px] text-[#00a8e1]">{b.showTime}</div>
                      </td>
                      <td className="py-3 text-[#00a8e1] font-bold">
                        {b.selectedSeats ? b.selectedSeats.join(', ') : 'Seats'}
                      </td>
                      <td className="py-3 text-white font-bold">
                        ₹{b.totalAmount}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isCancelled
                              ? 'bg-red-500/15 border border-red-500/40 text-red-400'
                              : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                          }`}
                        >
                          {b.paymentStatus || 'Completed'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {!isCancelled && (
                          <button
                            onClick={() => handleCancelBooking(b._id || b.bookingId)}
                            className="text-xs text-red-400 hover:text-red-300 font-semibold p-1 hover:bg-red-500/10 rounded transition-colors"
                            title="Cancel Order & Release Seats"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
