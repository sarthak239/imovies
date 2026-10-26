import React from 'react';
import { FaFilm } from 'react-icons/fa';

const LoadingSpinner = ({ message = 'Loading cinema experience...' }) => {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center py-5 my-5"
      style={{ minHeight: '300px' }}
    >
      <div className="position-relative mb-3">
        <div
          className="spinner-border text-danger"
          style={{ width: '3.5rem', height: '3.5rem', borderWidth: '0.25em' }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <div
          className="position-absolute top-50 start-50 translate-middle text-danger opacity-75"
        >
          <FaFilm size={20} />
        </div>
      </div>
      <p className="text-secondary fw-medium small mb-0">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
