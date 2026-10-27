import React from 'react';

export default function LoadingSpinner({ message = 'Loading…' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5"
         style={{ background: '#0f171e' }}>
      <div className="spinner-ring" />
      <p className="text-sm font-semibold tracking-widest uppercase"
         style={{ color: '#8ea3b0' }}>{message}</p>
    </div>
  );
}
