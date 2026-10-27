import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Film, Ticket, User, LogOut, Shield, Menu, X,
  Search, Heart, ChevronDown, Clapperboard,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/landing'); setOpen(false); setDropOpen(false); };

  const navLinkCls = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-150 hover:text-white ${isActive ? 'text-white' : 'text-[#8ea3b0]'}`;

  return (
    <nav className={`imv-navbar transition-shadow duration-300 ${scrolled ? 'shadow-lg shadow-black/50' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">

        {/* Brand */}
        <Link to="/home" onClick={() => setOpen(false)}
          className="flex items-center gap-2 no-underline group">
          <div className="w-8 h-8 rounded flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,#00a8e1,#0067a3)' }}>
            <Clapperboard size={16} color="#fff" />
          </div>
          <span className="text-lg font-black tracking-tight text-white">
            i<span style={{ color: '#00a8e1' }}>Movies</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
          <NavLink to="/home"       className={navLinkCls} end>Home</NavLink>
          <NavLink to="/watchlist"  className={navLinkCls}>Watchlist</NavLink>
          {isAuthenticated && (
            <NavLink to="/bookings" className={navLinkCls}>My Bookings</NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) =>
              `text-sm font-semibold flex items-center gap-1 transition-colors ${isActive ? 'text-yellow-400' : 'text-yellow-500/70 hover:text-yellow-400'}`
            }>
              <Shield size={13} /> Admin
            </NavLink>
          )}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => setDropOpen(p => !p)}
                className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#2c3e50] hover:border-[#00a8e1] transition-colors text-sm font-semibold text-white">
                <User size={15} style={{ color: '#00a8e1' }} />
                <span>{user?.name?.split(' ')[0] || user?.username || 'Me'}</span>
                <ChevronDown size={13} className={`transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-lg border border-[#2c3e50] shadow-2xl overflow-hidden z-50"
                     style={{ background: '#1f2d3a' }}>
                  <div className="px-4 py-3 border-b border-[#2c3e50]">
                    <p className="text-xs font-bold text-white truncate">{user?.name || user?.username}</p>
                    <p className="text-xs text-[#8ea3b0] truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{ background: isAdmin ? '#f5a623' : '#00a8e1', color: isAdmin ? '#1a1a1a' : '#fff' }}>
                      {isAdmin ? 'ADMIN' : 'MEMBER'}
                    </span>
                  </div>
                  <Link to="/bookings" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#8ea3b0] hover:text-white hover:bg-[#263340] transition-colors no-underline">
                    <Ticket size={14} /> My Tickets
                  </Link>
                  <Link to="/watchlist" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#8ea3b0] hover:text-white hover:bg-[#263340] transition-colors no-underline">
                    <Heart size={14} /> Watchlist
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-yellow-400 hover:bg-[#263340] transition-colors no-underline">
                      <Shield size={14} /> Admin Dashboard
                    </Link>
                  )}
                  <div className="border-t border-[#2c3e50]">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-[#263340] transition-colors text-left">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"
                className="px-4 py-1.5 text-sm font-semibold text-white border border-[#2c3e50] rounded hover:border-white transition-colors no-underline">
                Sign In
              </Link>
              <Link to="/register"
                className="px-4 py-1.5 text-sm font-semibold text-white rounded no-underline btn-prime">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(p => !p)}
          className="md:hidden p-1.5 rounded border border-[#2c3e50] text-white hover:border-[#00a8e1] transition-colors">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-[#2c3e50] px-4 py-4 flex flex-col gap-3"
             style={{ background: '#1a242f' }}>
          {[
            { to: '/home', label: 'Home' },
            { to: '/watchlist', label: 'Watchlist' },
            ...(isAuthenticated ? [{ to: '/bookings', label: 'My Bookings' }] : []),
            ...(isAdmin ? [{ to: '/admin', label: 'Admin Dashboard' }] : []),
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className="text-sm font-semibold text-[#8ea3b0] hover:text-white py-1 no-underline transition-colors">
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#2c3e50] flex flex-col gap-2">
            {isAuthenticated ? (
              <button onClick={handleLogout}
                className="text-left text-sm text-red-400 py-1 flex items-center gap-2">
                <LogOut size={14} /> Sign Out ({user?.name?.split(' ')[0] || user?.username})
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}
                  className="btn-prime-outline text-center text-sm no-underline py-2 rounded">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}
                  className="btn-prime text-center text-sm no-underline py-2 rounded justify-center">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
