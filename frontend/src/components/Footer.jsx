import React from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#0a1118', borderTop: '1px solid #1a242f' }}
            className="mt-auto py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/home" className="flex items-center gap-2 no-underline mb-3">
              <div className="w-7 h-7 rounded flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg,#00a8e1,#0067a3)' }}>
                <Clapperboard size={14} color="#fff" />
              </div>
              <span className="text-base font-black text-white">
                i<span style={{ color: '#00a8e1' }}>Movies</span>
              </span>
            </Link>
            <p className="text-xs text-[#4a6275] leading-relaxed">
              Book movie tickets online for the best cinematic experiences across India.
            </p>
          </div>

          {[
            { title: 'Discover', links: [['Home', '/home'], ['Watchlist', '/watchlist'], ['Bookings', '/bookings']] },
            { title: 'Company',  links: [['About', '#'], ['Careers', '#'], ['Press', '#']] },
            { title: 'Support',  links: [['Help Center', '#'], ['Contact', '#'], ['Privacy', '#']] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h6 className="text-xs font-bold text-white uppercase tracking-widest mb-4">{title}</h6>
              <ul className="space-y-2 list-none p-0 m-0">
                {links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-xs text-[#4a6275] hover:text-[#00a8e1] no-underline transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#1a242f] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#2c3e50]">
            © {new Date().getFullYear()} iMovies. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-[#2c3e50]">
            <span>Built with</span>
            <span style={{ color: '#00a8e1' }}>React + Node.js + MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
