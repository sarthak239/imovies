import React from 'react';
import { Link } from 'react-router-dom';
import { FaFilm, FaHome, FaCompass } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <div className="container py-5 text-center my-auto">
      <div className="py-5">
        <div
          className="d-inline-flex p-4 rounded-circle mb-4 text-danger"
          style={{ backgroundColor: 'rgba(229, 9, 20, 0.15)', border: '1px solid rgba(229, 9, 20, 0.3)' }}
        >
          <FaFilm size={54} />
        </div>

        <h1 className="display-1 fw-black text-danger mb-2 font-monospace">404</h1>
        <h3 className="text-white fw-bold mb-2">Lost in the Reels?</h3>
        <p className="text-secondary small mb-4" style={{ maxWidth: '450px', margin: '0 auto' }}>
          The scene or page you are looking for has been cut from the final screening or doesn't exist.
        </p>

        <div className="d-flex justify-content-center gap-3">
          <Link to="/" className="btn btn-cinema d-flex align-items-center gap-2">
            <FaHome size={14} /> Return to Home
          </Link>
          <Link to="/movies" className="btn btn-cinema-outline d-flex align-items-center gap-2">
            <FaCompass size={14} /> Explore Movies
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
