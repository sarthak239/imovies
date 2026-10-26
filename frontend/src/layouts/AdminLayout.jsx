import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaTachometerAlt,
  FaFilm,
  FaBuilding,
  FaCalendarAlt,
  FaTicketAlt,
  FaArrowLeft,
  FaSignOutAlt,
  FaShieldAlt,
} from 'react-icons/fa';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#090a10' }}>
      {/* Admin Top Header */}
      <header className="border-bottom border-secondary py-3 px-4 bg-dark d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <Link to="/" className="brand-logo text-decoration-none">
            <div
              className="d-flex align-items-center justify-content-center rounded-2"
              style={{
                width: '32px',
                height: '32px',
                background: 'var(--imv-primary)',
              }}
            >
              <FaFilm color="#fff" size={16} />
            </div>
            <span className="fs-5">
              i<span style={{ color: 'var(--imv-primary)' }}>Movies</span>
            </span>
          </Link>
          <span className="badge bg-warning text-dark fw-bold px-2 py-1">
            <FaShieldAlt className="me-1" /> Admin Console
          </span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <Link to="/" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <FaArrowLeft size={11} /> View Live Website
          </Link>
          <div className="d-none d-sm-block text-end">
            <div className="text-white small fw-bold">{user?.name}</div>
            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
              Master Admin
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
          >
            <FaSignOutAlt size={12} /> Sign Out
          </button>
        </div>
      </header>

      {/* Admin Body with Sidebar and Main View */}
      <div className="container-fluid flex-grow-1">
        <div className="row">
          {/* Sidebar */}
          <aside className="col-lg-2 col-md-3 admin-sidebar py-4 px-3 border-end border-secondary">
            <div className="text-uppercase text-secondary small fw-bold px-3 mb-3">
              Navigation
            </div>
            <nav className="d-flex flex-column gap-1">
              <NavLink
                to="/admin/dashboard"
                end
                className={({ isActive }) =>
                  `admin-nav-item text-decoration-none ${isActive ? 'active' : ''}`
                }
              >
                <FaTachometerAlt size={16} /> Dashboard
              </NavLink>
              <NavLink
                to="/admin/movies"
                className={({ isActive }) =>
                  `admin-nav-item text-decoration-none ${isActive ? 'active' : ''}`
                }
              >
                <FaFilm size={16} /> Movies
              </NavLink>
              <NavLink
                to="/admin/theaters"
                className={({ isActive }) =>
                  `admin-nav-item text-decoration-none ${isActive ? 'active' : ''}`
                }
              >
                <FaBuilding size={16} /> Theaters
              </NavLink>
              <NavLink
                to="/admin/shows"
                className={({ isActive }) =>
                  `admin-nav-item text-decoration-none ${isActive ? 'active' : ''}`
                }
              >
                <FaCalendarAlt size={16} /> Shows
              </NavLink>
              <NavLink
                to="/admin/bookings"
                className={({ isActive }) =>
                  `admin-nav-item text-decoration-none ${isActive ? 'active' : ''}`
                }
              >
                <FaTicketAlt size={16} /> Bookings
              </NavLink>
            </nav>

            <div className="mt-5 p-3 rounded-3 bg-dark border border-secondary text-secondary small">
              <div className="text-white fw-bold mb-1">System Status</div>
              <div>Database: <span className="text-success fw-bold">Connected</span></div>
              <div>Port: 5000 (REST)</div>
              <div>Node: v24 / MERN</div>
            </div>
          </aside>

          {/* Main Content View */}
          <main className="col-lg-10 col-md-9 py-4 px-md-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
