import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShieldAlt, FaLock, FaEnvelope, FaKey, FaArrowLeft } from 'react-icons/fa';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide administrator email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await login(email, password);

      if (data?.user?.role !== 'admin') {
        setError('Access denied: The provided account does not have administrator privileges.');
        return;
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@imovies.com');
    setPassword('Admin@123456');
    setError('');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-7">
          <div
            className="p-4 p-sm-5 rounded-4"
            style={{
              backgroundColor: 'var(--imv-bg-card)',
              border: '1px solid #4a3b1a',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            }}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-3 text-warning"
                style={{
                  backgroundColor: 'rgba(255, 184, 0, 0.15)',
                  border: '1px solid rgba(255, 184, 0, 0.3)',
                }}
              >
                <FaShieldAlt size={32} />
              </div>
              <h3 className="text-white fw-bold mb-1">Admin Portal</h3>
              <p className="text-secondary small">
                Sign in to manage movies, theaters, showtimes, and booking operations
              </p>
            </div>

            {error && (
              <div className="alert alert-danger bg-dark border-danger text-danger small py-2 mb-3">
                {error}
              </div>
            )}

            {/* Quick Demo Credentials Autofill */}
            <div className="p-3 rounded-3 bg-dark border border-warning border-opacity-50 mb-4 text-center">
              <div className="text-secondary small mb-2">College Evaluator Quick Credentials:</div>
              <button
                type="button"
                onClick={fillAdminCredentials}
                className="btn btn-outline-warning btn-sm d-inline-flex align-items-center gap-1"
              >
                <FaKey size={12} /> Auto-Fill Admin Credentials
              </button>
            </div>

            <form onSubmit={handleAdminLogin}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Administrator Email
                </label>
                <div className="position-relative">
                  <input
                    type="email"
                    className="form-control form-control-cinema ps-5"
                    placeholder="admin@imovies.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <FaEnvelope
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                    size={14}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">
                  Master Password
                </label>
                <div className="position-relative">
                  <input
                    type="password"
                    className="form-control form-control-cinema ps-5"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <FaLock
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                    size={14}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-warning w-100 py-2 fw-bold text-dark mb-3"
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                {loading ? 'Verifying Admin Key...' : 'Unlock Admin Console'}
              </button>
            </form>

            <div className="text-center pt-2 border-top border-secondary">
              <Link to="/" className="text-secondary small text-decoration-none d-inline-flex align-items-center gap-1">
                <FaArrowLeft size={11} /> Return to Public Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
