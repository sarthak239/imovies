import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Film,
  Building2,
  Calendar,
  Ticket,
  DollarSign,
  TrendingUp,
  PlusCircle,
  Shield,
  Eye,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      if (data?.stats) {
        setStats(data.stats);
        setRecentBookings(data.recentBookings || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating platform metrics…" />;
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
              Executive Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Platform Analytics & Overview
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/addmovie"
            className="btn-prime text-xs py-2 px-3.5 rounded font-bold no-underline"
          >
            <PlusCircle size={14} /> Add Movie
          </Link>
          <Link
            to="/addshow"
            className="btn-prime-outline text-xs py-2 px-3.5 rounded font-bold no-underline"
          >
            <Calendar size={14} /> Schedule Show
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl border border-[#2c3e50] bg-[#1a242f]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4a6275]">
              Gross Revenue
            </span>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-500/15 text-emerald-400">
              <DollarSign size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white">
            ₹{(stats?.totalRevenue || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> Live Confirmed Sales
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[#2c3e50] bg-[#1a242f]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4a6275]">
              Tickets Sold
            </span>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#00a8e1]/15 text-[#00a8e1]">
              <Ticket size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white">
            {(stats?.totalTicketsSold || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-[#8ea3b0] mt-1">
            Across All Platform Venues
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[#2c3e50] bg-[#1a242f]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4a6275]">
              Active Catalog
            </span>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-500/15 text-purple-400">
              <Film size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white">
            {stats?.totalMovies || 0}
          </h3>
          <p className="text-[11px] text-[#8ea3b0] mt-1">
            {stats?.totalTheaters || 0} Registered Theatres
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[#2c3e50] bg-[#1a242f]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4a6275]">
              Scheduled Shows
            </span>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-yellow-500/15 text-yellow-400">
              <Calendar size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white">
            {stats?.totalShows || 0}
          </h3>
          <p className="text-[11px] text-[#8ea3b0] mt-1">
            Active Auditorium Slots
          </p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/addmovie"
          className="p-4 rounded-xl border border-[#2c3e50] bg-[#141d26] hover:border-[#00a8e1] transition-all no-underline block"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#00a8e1] bg-[#00a8e1]/10 mb-2">
            <Film size={16} />
          </div>
          <h4 className="text-sm font-bold text-white mb-0.5">+ Add New Movie</h4>
          <p className="text-[11px] text-[#8ea3b0]">Publish a title to the active catalog</p>
        </Link>

        <Link
          to="/addtheatre"
          className="p-4 rounded-xl border border-[#2c3e50] bg-[#141d26] hover:border-[#00a8e1] transition-all no-underline block"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-purple-400 bg-purple-500/10 mb-2">
            <Building2 size={16} />
          </div>
          <h4 className="text-sm font-bold text-white mb-0.5">+ Add Venue / Theatre</h4>
          <p className="text-[11px] text-[#8ea3b0]">Configure tier pricing and layout</p>
        </Link>

        <Link
          to="/addshow"
          className="p-4 rounded-xl border border-[#2c3e50] bg-[#141d26] hover:border-[#00a8e1] transition-all no-underline block"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-yellow-400 bg-yellow-500/10 mb-2">
            <Calendar size={16} />
          </div>
          <h4 className="text-sm font-bold text-white mb-0.5">+ Schedule Showtime</h4>
          <p className="text-[11px] text-[#8ea3b0]">Map movie, date, and auditorium</p>
        </Link>

        <Link
          to="/adminbookings"
          className="p-4 rounded-xl border border-[#2c3e50] bg-[#141d26] hover:border-[#00a8e1] transition-all no-underline block"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 bg-emerald-500/10 mb-2">
            <Ticket size={16} />
          </div>
          <h4 className="text-sm font-bold text-white mb-0.5">Moderate Bookings</h4>
          <p className="text-[11px] text-[#8ea3b0]">Review and cancel reservations</p>
        </Link>
      </div>

      {/* Recent Reservations Table */}
      <div className="p-6 rounded-xl border border-[#2c3e50] bg-[#1a242f]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title text-base font-bold text-white">
            Recent Platform Reservations
          </h3>
          <Link
            to="/adminbookings"
            className="text-xs font-bold text-[#00a8e1] hover:underline"
          >
            View All ({stats?.totalBookings || 0}) &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2c3e50] text-[#4a6275] uppercase tracking-wider text-[10px]">
                <th className="pb-3">Booking ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Movie & Venue</th>
                <th className="pb-3">Seats</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2c3e50]/50 text-[#8ea3b0]">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#4a6275]">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
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
                    <td className="py-3 text-[#00a8e1] font-bold">
                      {b.selectedSeats ? b.selectedSeats.join(', ') : 'Seats'}
                    </td>
                    <td className="py-3 text-white font-bold">
                      ₹{b.totalAmount}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          b.paymentStatus === 'Cancelled'
                            ? 'bg-red-500/15 border border-red-500/40 text-red-400'
                            : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                        }`}
                      >
                        {b.paymentStatus || 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
