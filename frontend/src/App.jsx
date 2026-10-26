import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages (All 18 required pages)
import HomePage from './pages/HomePage';
import AllMoviesPage from './pages/AllMoviesPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import TheaterSelectionPage from './pages/TheaterSelectionPage';
import ShowtimeSelectionPage from './pages/ShowtimeSelectionPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import BookingSummaryPage from './pages/BookingSummaryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyBookingsPage from './pages/MyBookingsPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminMoviesPage from './pages/AdminMoviesPage';
import AdminTheatersPage from './pages/AdminTheatersPage';
import AdminShowsPage from './pages/AdminShowsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      {/* Public & Customer Routes under MainLayout */}
      <Route element={<MainLayout />}>
        {/* 1. Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* 2. All Movies Page */}
        <Route path="/movies" element={<AllMoviesPage />} />

        {/* 3. Movie Details Page */}
        <Route path="/movies/:id" element={<MovieDetailsPage />} />

        {/* 4. Theater Selection Page */}
        <Route path="/movies/:id/theaters" element={<TheaterSelectionPage />} />
        <Route path="/theaters" element={<TheaterSelectionPage />} />

        {/* 5. Showtime Selection Page */}
        <Route path="/movies/:id/shows" element={<ShowtimeSelectionPage />} />
        <Route path="/shows" element={<ShowtimeSelectionPage />} />

        {/* 6. Interactive Seat Selection Page */}
        <Route path="/shows/:showId/seats" element={<SeatSelectionPage />} />

        {/* 7. Booking Summary Page (Protected) */}
        <Route
          path="/booking-summary"
          element={
            <ProtectedRoute>
              <BookingSummaryPage />
            </ProtectedRoute>
          }
        />

        {/* 8. Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* 9. Registration Page */}
        <Route path="/register" element={<RegisterPage />} />

        {/* 10. My Bookings Page (Protected) */}
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />

        {/* 11. User Profile Page (Protected) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* 12. Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* 18. 404 Not Found Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Management Routes under AdminLayout (Admin Protected) */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        {/* 13. Admin Dashboard */}
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

        {/* 14. Manage Movies */}
        <Route path="/admin/movies" element={<AdminMoviesPage />} />

        {/* 15. Manage Theaters */}
        <Route path="/admin/theaters" element={<AdminTheatersPage />} />

        {/* 16. Manage Shows */}
        <Route path="/admin/shows" element={<AdminShowsPage />} />

        {/* 17. Manage Bookings */}
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
