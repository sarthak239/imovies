import React from 'react';
import { Link } from 'react-router-dom';
import { FaFilm, FaHeart, FaGithub, FaShieldAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer
      className="mt-auto border-top border-secondary py-5"
      style={{ backgroundColor: '#090a10', color: 'var(--imv-text-muted)' }}
    >
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
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
              <h5 className="text-white mb-0 brand-font">
                i<span style={{ color: 'var(--imv-primary)' }}>Movies</span>
              </h5>
            </div>
            <p className="small mb-3" style={{ lineHeight: '1.6' }}>
              Movie Ticket Booking Made Simple. Seamlessly browse trending releases, reserve preferred
              cinema seats in real-time, and experience blockbuster entertainment effortlessly.
            </p>
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-dark border border-secondary text-light small">
              <span>Skill Wallet Individual College Project</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white fw-bold mb-3">Explore</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <Link to="/" className="text-secondary text-decoration-none hover-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="text-secondary text-decoration-none hover-white">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link to="/movies?status=upcoming" className="text-secondary text-decoration-none hover-white">
                  Upcoming Releases
                </Link>
              </li>
              <li>
                <Link to="/theaters" className="text-secondary text-decoration-none hover-white">
                  Cinema Theaters
                </Link>
              </li>
            </ul>
          </div>

          {/* User Services */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="text-white fw-bold mb-3">Account & Safety</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <Link to="/my-bookings" className="text-secondary text-decoration-none hover-white">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-secondary text-decoration-none hover-white">
                  User Profile
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-warning text-decoration-none d-flex align-items-center gap-1">
                  <FaShieldAlt size={12} /> Admin Portal
                </Link>
              </li>
              <li>
                <span className="text-muted">Simulated Sandbox Payments</span>
              </li>
            </ul>
          </div>

          {/* Technology Badges */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Built With MERN Stack</h6>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <span className="badge bg-dark border border-secondary text-light">MongoDB</span>
              <span className="badge bg-dark border border-secondary text-light">Express.js</span>
              <span className="badge bg-dark border border-secondary text-light">React 18</span>
              <span className="badge bg-dark border border-secondary text-light">Node.js</span>
              <span className="badge bg-dark border border-secondary text-light">Bootstrap 5</span>
              <span className="badge bg-dark border border-secondary text-light">JWT Auth</span>
            </div>
            <p className="small text-muted mb-0" style={{ fontSize: '0.78rem' }}>
              Academic demonstration project. Independent showcase, not affiliated with commercial cinema chains.
            </p>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 text-secondary small">
          <div>
            &copy; {new Date().getFullYear()} <strong>iMovies</strong>. Built with{' '}
            <FaHeart className="text-danger mx-1" size={12} /> for Skill Wallet individual project evaluation.
          </div>
          <div>All rights reserved. Designed for optimal cinematic UX.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
