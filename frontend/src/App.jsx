import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import UserProtection from './components/UserProtection';
import AdminProtection from './components/AdminProtection';
import LoadingSpinner from './components/LoadingSpinner';

// ── Lazy-loaded pages ──────────────────────────────────────────
const LandingPage          = lazy(() => import('./pages/LandingPage'));
const LoginPage            = lazy(() => import('./pages/LoginPage'));
const RegisterPage         = lazy(() => import('./pages/RegisterPage'));
const HomePage             = lazy(() => import('./pages/HomePage'));
const MovieDetailsPage     = lazy(() => import('./pages/MovieDetailsPage'));
const MovieShowsPage       = lazy(() => import('./pages/MovieShowsPage'));
const SeatSlugPage         = lazy(() => import('./pages/SeatSlugPage'));
const BookingsPage         = lazy(() => import('./pages/BookingsPage'));
const WatchlistPage        = lazy(() => import('./pages/WatchlistPage'));
const AdminDashboard       = lazy(() => import('./pages/admin/AdminDashboard'));
const AddMoviePage         = lazy(() => import('./pages/admin/AddMoviePage'));
const AddTheatrePage       = lazy(() => import('./pages/admin/AddTheatrePage'));
const AddShowPage          = lazy(() => import('./pages/admin/AddShowPage'));
const AdminBookingsPage    = lazy(() => import('./pages/admin/AdminBookingsPage'));
const NotFoundPage         = lazy(() => import('./pages/NotFoundPage'));

const Fallback = () => <LoadingSpinner message="Loading…" />;

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* ── Public routes ─────────────────────────── */}
        <Route path="/landing"   element={<LandingPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />
        <Route path="/"          element={<Navigate to="/landing" replace />} />

        {/* ── User routes inside MainLayout ─────────── */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={
            <UserProtection><HomePage /></UserProtection>
          } />
          <Route path="/moviedetails/:movieId" element={
            <UserProtection><MovieDetailsPage /></UserProtection>
          } />
          <Route path="/movieshows/:movieId" element={
            <UserProtection><MovieShowsPage /></UserProtection>
          } />
          <Route path="/seatslug/:showId" element={
            <UserProtection><SeatSlugPage /></UserProtection>
          } />
          <Route path="/bookings" element={
            <UserProtection><BookingsPage /></UserProtection>
          } />
          <Route path="/watchlist" element={
            <UserProtection><WatchlistPage /></UserProtection>
          } />
        </Route>

        {/* ── Admin routes inside AdminLayout ────────── */}
        <Route element={<AdminProtection><AdminLayout /></AdminProtection>}>
          <Route path="/admin"          element={<AdminDashboard />} />
          <Route path="/addmovie"       element={<AddMoviePage />} />
          <Route path="/addtheatre"     element={<AddTheatrePage />} />
          <Route path="/addshow"        element={<AddShowPage />} />
          <Route path="/adminbookings"  element={<AdminBookingsPage />} />
        </Route>

        {/* ── 404 ───────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
