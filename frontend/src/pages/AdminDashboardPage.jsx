import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaFilm,
  FaBuilding,
  FaCalendarAlt,
  FaTicketAlt,
  FaRupeeSign,
  FaUsers,
  FaPlus,
  FaArrowRight,
} from 'react-icons/fa';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getDashboardStats();
      if (data?.stats) {
        setStats(data.stats);
        setRecentBookings(data.recentBookings || []);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
      setError('Unable to fetch administrative metrics from server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading administrative metrics..." />;
  }

  return (
    <div>
      {/* Top Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="text-white fw-bold mb-1">Administrative Overview</h2>
          <p className="text-secondary small mb-0">
            Real-time key performance indicators and cinema operations summary
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/admin/movies" className="btn btn-cinema btn-sm d-flex align-items-center gap-1">
            <FaPlus size={11} /> Manage Movies
          </Link>
          <Link to="/admin/shows" className="btn btn-cinema-outline btn-sm d-flex align-items-center gap-1">
            <FaPlus size={11} /> Schedule Show
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger bg-dark border-danger text-danger mb-4">
          {error}
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="row g-4 mb-5">
        {/* Total Movies */}
        <div className="col-xl-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-card-glow" style={{ backgroundColor: '#e50914' }}></div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Movies Active</span>
              <div className="p-2 rounded-3 bg-dark text-danger border border-secondary">
                <FaFilm size={18} />
              </div>
            </div>
            <div className="display-6 fw-bold text-white mb-1">{stats?.totalMovies || 0}</div>
            <div className="text-muted small">Now Showing & Upcoming</div>
          </div>
        </div>

        {/* Total Theaters */}
        <div className="col-xl-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-card-glow" style={{ backgroundColor: '#38bdf8' }}></div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Multiplex Theaters</span>
              <div className="p-2 rounded-3 bg-dark text-info border border-secondary">
                <FaBuilding size={18} />
              </div>
            </div>
            <div className="display-6 fw-bold text-white mb-1">{stats?.totalTheaters || 0}</div>
            <div className="text-muted small">Major Metro Locations</div>
          </div>
        </div>

        {/* Total Shows */}
        <div className="col-xl-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-card-glow" style={{ backgroundColor: '#ffb800' }}></div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Scheduled Shows</span>
              <div className="p-2 rounded-3 bg-dark text-warning border border-secondary">
                <FaCalendarAlt size={18} />
              </div>
            </div>
            <div className="display-6 fw-bold text-white mb-1">{stats?.totalShows || 0}</div>
            <div className="text-muted small">Auditorium Screenings</div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="col-xl-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-card-glow" style={{ backgroundColor: '#10b981' }}></div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-bold text-uppercase">Total Box Office</span>
              <div className="p-2 rounded-3 bg-dark text-success border border-secondary">
                <FaRupeeSign size={18} />
              </div>
            </div>
            <div className="display-6 fw-bold text-white mb-1">₹{stats?.totalRevenue || 0}</div>
            <div className="text-success small fw-semibold">
              {stats?.totalTicketsSold || 0} Tickets Booked
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div
        className="p-4 rounded-4"
        style={{
          backgroundColor: 'var(--imv-bg-card)',
          border: '1px solid var(--imv-border)',
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="text-white fw-bold mb-1">Recent Booking Transactions</h5>
            <p className="text-secondary small mb-0">
              Latest ticket reservations across cinema auditoriums
            </p>
          </div>
          <Link to="/admin/bookings" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            View All <FaArrowRight size={11} />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-4 text-secondary small">No bookings recorded yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover border-secondary mb-0 align-middle">
              <thead>
                <tr className="text-secondary small">
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Movie</th>
                  <th>Theater</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
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
                    <td className="text-white small fw-bold">{b.movieTitle}</td>
                    <td className="text-secondary small">{b.theaterName}</td>
                    <td>
                      <span className="badge bg-danger bg-opacity-25 text-danger border border-danger">
                        {b.seats?.join(', ')}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
