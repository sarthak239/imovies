import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaFilm, FaLock, FaEnvelope, FaUserCheck, FaShieldAlt } from 'react-icons/fa';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCustomer = () => {
    setEmail('rahul@gmail.com');
    setPassword('User@123456');
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
              border: '1px solid var(--imv-border)',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 mb-3"
                style={{
                  background: 'linear-gradient(135deg, #e50914, #b20710)',
                  boxShadow: '0 0 15px rgba(229, 9, 20, 0.5)',
                }}
              >
                <FaFilm color="#fff" size={24} />
              </div>
              <h2 className="text-white fw-bold mb-1">Welcome Back</h2>
              <p className="text-secondary small">
                Sign in to your iMovies account to reserve your cinema tickets
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger bg-dark border-danger text-danger small py-2">
                {error}
              </div>
            )}

            {/* Quick Demo Credentials Autofill */}
            <div className="p-3 rounded-3 bg-dark border border-secondary mb-4 text-center">
              <div className="text-secondary small mb-2">College Evaluator Quick Test:</div>
              <button
                type="button"
                onClick={fillDemoCustomer}
                className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
              >
                <FaUserCheck size={13} /> Auto-Fill Demo User (Rahul)
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Email Address
                </label>
                <div className="position-relative">
                  <input
                    type="email"
                    className="form-control form-control-cinema ps-5"
                    placeholder="name@example.com"
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
                  Password
                </label>
                <div className="position-relative">
                  <input
                    type="password"
                    className="form-control form-control-cinema ps-5"
                    placeholder="Enter password"
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
                className="btn btn-cinema w-100 py-2 fw-bold mb-3"
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                ) : null}
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center text-secondary small pt-2 border-top border-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-danger fw-semibold text-decoration-none">
                Register here
              </Link>
            </div>

            <div className="text-center mt-3">
              <Link
                to="/admin/login"
                className="text-warning small text-decoration-none d-inline-flex align-items-center gap-1"
              >
                <FaShieldAlt size={12} /> Go to Administrator Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
