import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#1a242f] border border-[#2c3e50] text-[#00a8e1] mb-4 shadow-xl">
        <Film size={32} />
      </div>
      <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">404</h1>
      <h2 className="text-xl font-bold text-white mb-2">Feature Reel Not Found</h2>
      <p className="text-sm text-[#8ea3b0] max-w-md mb-6">
        The cinema screen or page you are trying to reach does not exist or has moved.
      </p>
      <Link to="/home" className="btn-prime text-sm px-6 py-2.5 rounded-md font-bold no-underline">
        <ArrowLeft size={16} /> Return to Home
      </Link>
    </div>
  );
}
