import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import {
  FaUserCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaShieldAlt,
  FaCrown,
  FaTicketAlt,
  FaSave,
  FaCheck,
  FaLock,
} from 'react-icons/fa';

const UserProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [stats, setStats] = useState({ totalBookings: 0, totalTickets: 0 });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const data = await bookingService.getMyBookings();
      if (data?.bookings) {
        const confirmed = data.bookings.filter((b) => b.bookingStatus === 'confirmed');
        const tickets = confirmed.reduce((acc, b) => acc + (b.ticketCount || 0), 0);
        setStats({ totalBookings: confirmed.length, totalTickets: tickets });
      }
    } catch (err) {
      console.warn('Could not load user booking stats');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword && newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const payload = { name, phone };
      if (newPassword) payload.password = newPassword;

      await updateProfile(payload);
      setSuccessMsg('Profile updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row g-4 justify-content-center">
        {/* Left Column: Membership Card & Quick Stats */}
        <div className="col-lg-4">
          {/* Membership Card */}
          <div
            className="p-4 rounded-4 mb-4 text-center position-relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1b1c2b, #12131e)',
              border: '1px solid var(--imv-border)',
            }}
          >
            <div
              className="d-inline-flex p-3 rounded-circle text-danger mb-3"
              style={{ backgroundColor: 'rgba(229, 9, 20, 0.15)' }}
            >
              <FaUserCircle size={64} />
            </div>

            <h4 className="text-white fw-bold mb-1">{user?.name}</h4>
            <p className="text-secondary small mb-3">{user?.email}</p>

            <div className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill bg-dark border border-warning text-warning small fw-bold mb-4">
              <FaCrown size={12} />
              <span>{user?.role === 'admin' ? 'Administrator VIP' : 'iMovies Gold Member'}</span>
            </div>

            <div className="row g-2 pt-3 border-top border-secondary text-secondary small">
              <div className="col-6 border-end border-secondary">
                <div className="text-white fw-bold fs-5">{stats.totalBookings}</div>
                <div>Completed Bookings</div>
              </div>
              <div className="col-6">
                <div className="text-white fw-bold fs-5">{stats.totalTickets}</div>
                <div>Tickets Reserved</div>
              </div>
            </div>
          </div>

          {/* Account Security Info */}
          <div
            className="p-4 rounded-4"
            style={{
              backgroundColor: 'var(--imv-bg-card)',
              border: '1px solid var(--imv-border)',
            }}
          >
            <h6 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <FaShieldAlt className="text-success" /> Privacy & Authorization
            </h6>
            <div className="text-secondary small d-flex flex-column gap-2">
              <div>Role: <strong className="text-white text-capitalize">{user?.role}</strong></div>
              <div>Password Storage: <span className="text-success fw-semibold">Bcrypt Hashed</span></div>
              <div>Session Token: <span className="text-success fw-semibold">JWT Active</span></div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                Your personal details are securely managed according to Skill Wallet specifications.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile & Password Form */}
        <div className="col-lg-7">
          <div
            className="p-4 p-md-5 rounded-4"
            style={{
              backgroundColor: 'var(--imv-bg-card)',
              border: '1px solid var(--imv-border)',
            }}
          >
            <h3 className="text-white fw-bold mb-2">Edit Account Profile</h3>
            <p className="text-secondary small mb-4">
              Keep your contact information up-to-date to receive digital cinema tickets
            </p>

            {successMsg && (
              <div className="alert alert-success bg-dark border-success text-success small mb-3 d-flex align-items-center gap-2">
                <FaCheck /> {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="alert alert-danger bg-dark border-danger text-danger small mb-3">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdate}>
              <div className="row g-3 mb-4">
                <div className="col-12">
                  <label className="form-label text-secondary small fw-semibold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-cinema"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-semibold">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-cinema disabled opacity-75"
                    value={user?.email || ''}
                    disabled
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-semibold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="form-control form-control-cinema"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <h5 className="text-white fw-bold mb-3 pt-3 border-top border-secondary">
                Security & Password Update
              </h5>
              <p className="text-secondary small mb-3">
                Leave password fields empty if you do not wish to change your current password.
              </p>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-semibold">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-cinema"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-semibold">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-cinema"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-cinema px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
              >
                {loading ? <span className="spinner-border spinner-border-sm" /> : <FaSave />}
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
