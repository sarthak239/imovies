import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaFilm,
  FaTicketAlt,
  FaUserCircle,
  FaSignOutAlt,
  FaShieldAlt,
  FaBars,
  FaTimes,
  FaCompass,
} from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="imv-navbar py-3">
      <div className="container d-flex align-items-center justify-content-between">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{
              width: '38px',
              height: '38px',
              background: 'linear-gradient(135deg, #e50914, #b20710)',
              boxShadow: '0 0 15px rgba(229, 9, 20, 0.5)',
            }}
          >
            <FaFilm size={20} color="#fff" />
          </div>
          <span>
            i<span style={{ color: 'var(--imv-primary)' }}>Movies</span>
          </span>
          <span className="brand-badge d-none d-sm-inline">Cinema</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="d-none d-md-flex align-items-center gap-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-decoration-none fw-semibold transition-colors ${
                isActive ? 'text-white' : 'text-secondary'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/movies"
            className={({ isActive }) =>
              `text-decoration-none fw-semibold transition-colors ${
                isActive ? 'text-white' : 'text-secondary'
              }`
            }
          >
            All Movies
          </NavLink>
          <NavLink
            to="/theaters"
            className={({ isActive }) =>
              `text-decoration-none fw-semibold transition-colors ${
                isActive ? 'text-white' : 'text-secondary'
              }`
            }
          >
            Theaters
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/my-bookings"
              className={({ isActive }) =>
                `text-decoration-none fw-semibold transition-colors d-flex align-items-center gap-1 ${
                  isActive ? 'text-white' : 'text-secondary'
                }`
              }
            >
              <FaTicketAlt size={13} className="text-danger" /> My Bookings
            </NavLink>
          )}
        </div>

        {/* Right Action / Auth Buttons */}
        <div className="d-none d-md-flex align-items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 px-3 py-1 rounded-pill"
              style={{ fontSize: '0.82rem' }}
            >
              <FaShieldAlt size={12} /> Admin Portal
            </Link>
          )}

          {isAuthenticated ? (
            <div className="dropdown">
              <button
                className="btn btn-dark dropdown-toggle d-flex align-items-center gap-2 border-secondary bg-transparent px-3 py-2 rounded-pill"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <FaUserCircle size={18} className="text-danger" />
                <span className="fw-semibold text-white" style={{ fontSize: '0.9rem' }}>
                  {user?.name?.split(' ')[0] || 'My Account'}
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow-lg border-secondary">
                <li className="px-3 py-2 border-bottom border-secondary mb-1">
                  <div className="fw-bold text-white small">{user?.name}</div>
                  <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                    {user?.email}
                  </div>
                  <span className="badge bg-danger mt-1" style={{ fontSize: '0.65rem' }}>
                    {user?.role === 'admin' ? 'Administrator' : 'Movie Buff'}
                  </span>
                </li>
                <li>
                  <Link className="dropdown-item py-2" to="/profile">
                    <FaUserCircle className="me-2 text-secondary" /> User Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item py-2" to="/my-bookings">
                    <FaTicketAlt className="me-2 text-danger" /> My Tickets
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link className="dropdown-item py-2 text-warning" to="/admin/dashboard">
                      <FaShieldAlt className="me-2" /> Admin Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <hr className="dropdown-divider border-secondary" />
                </li>
                <li>
                  <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Sign Out
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="btn btn-cinema-outline py-2 px-3">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-cinema py-2 px-3">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="btn btn-dark d-md-none border-secondary text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="d-md-none bg-dark border-top border-secondary px-4 py-3 mt-3">
          <div className="d-flex flex-column gap-3">
            <Link
              to="/"
              className="text-white text-decoration-none py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/movies"
              className="text-white text-decoration-none py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              All Movies
            </Link>
            <Link
              to="/theaters"
              className="text-white text-decoration-none py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Theaters
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/my-bookings"
                  className="text-white text-decoration-none py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Bookings
                </Link>
                <Link
                  to="/profile"
                  className="text-white text-decoration-none py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile ({user?.name})
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="text-warning text-decoration-none py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Console
                  </Link>
                )}
                <button
                  className="btn btn-danger btn-sm text-start py-2 mt-2"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="me-2" /> Sign Out
                </button>
              </>
            ) : (
              <div className="d-flex flex-column gap-2 mt-2">
                <Link
                  to="/login"
                  className="btn btn-cinema-outline w-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-cinema w-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
