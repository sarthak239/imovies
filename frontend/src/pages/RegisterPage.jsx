import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaFilm, FaLock, FaEnvelope, FaUser, FaPhoneAlt } from 'react-icons/fa';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword } = formData;

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register({ name, email, phone, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
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
              <h2 className="text-white fw-bold mb-1">Create Account</h2>
              <p className="text-secondary small">
                Join iMovies to unlock seamless cinema booking and instant digital tickets
              </p>
            </div>

            {error && (
              <div className="alert alert-danger bg-dark border-danger text-danger small py-2 mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Full Name *
                </label>
                <div className="position-relative">
                  <input
                    type="text"
                    name="name"
                    className="form-control form-control-cinema ps-5"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <FaUser
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                    size={13}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Email Address *
                </label>
                <div className="position-relative">
                  <input
                    type="email"
                    name="email"
                    className="form-control form-control-cinema ps-5"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <FaEnvelope
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                    size={13}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Mobile Number (Optional)
                </label>
                <div className="position-relative">
                  <input
                    type="tel"
                    name="phone"
                    className="form-control form-control-cinema ps-5"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <FaPhoneAlt
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                    size={13}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Password *
                </label>
                <div className="position-relative">
                  <input
                    type="password"
                    name="password"
                    className="form-control form-control-cinema ps-5"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <FaLock
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                    size={13}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">
                  Confirm Password *
                </label>
                <div className="position-relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control form-control-cinema ps-5"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <FaLock
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                    size={13}
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
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>

            <div className="text-center text-secondary small pt-2 border-top border-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-danger fw-semibold text-decoration-none">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
