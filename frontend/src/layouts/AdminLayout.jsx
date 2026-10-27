import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Film, Building2, Calendar,
  Ticket, LogOut, Menu, X, Clapperboard, Shield,
} from 'lucide-react';

const NAV = [
  { to: '/admin',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/addmovie',      icon: Film,            label: 'Add Movie' },
  { to: '/addtheatre',    icon: Building2,        label: 'Add Theatre' },
  { to: '/addshow',       icon: Calendar,         label: 'Add Show' },
  { to: '/adminbookings', icon: Ticket,           label: 'All Bookings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/landing'); };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col ${mobile ? 'h-full' : 'h-screen sticky top-0'}`}
         style={{ width: mobile ? '100%' : '220px', background: '#0a1118', borderRight: '1px solid #1a242f' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1a242f]">
        <Link to="/admin" onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 rounded flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,#00a8e1,#0067a3)' }}>
            <Clapperboard size={14} color="#fff" />
          </div>
          <span className="text-base font-black text-white">
            i<span style={{ color: '#00a8e1' }}>Movies</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 mt-1.5">
          <Shield size={10} className="text-yellow-400" />
          <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Admin Console</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold no-underline transition-all ${
                active
                  ? 'text-white bg-[#1a242f] border-l-2 border-[#00a8e1] pl-[10px]'
                  : 'text-[#4a6275] hover:text-white hover:bg-[#1a242f]'
              }`}>
              <Icon size={16} style={{ color: active ? '#00a8e1' : undefined }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-[#1a242f]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
               style={{ background: '#00a8e1' }}>
            {(user?.name || user?.username || 'A')[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.name || user?.username}</p>
            <p className="text-[10px] text-[#4a6275] truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-[#1a242f] transition-colors text-left">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: '#0f171e' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-64 h-full"><Sidebar mobile /></div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#1a242f]"
             style={{ background: '#0a1118' }}>
          <button onClick={() => setSidebarOpen(true)} className="text-white p-1">
            <Menu size={20} />
          </button>
          <span className="text-sm font-bold text-white">Admin Console</span>
          <div className="w-7" />
        </div>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
