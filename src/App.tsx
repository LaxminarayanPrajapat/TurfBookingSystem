import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BrowseTurfsPage from './pages/BrowseTurfsPage';
import TurfDetailsPage from './pages/TurfDetailsPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function App() {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/browse" element={<BrowseTurfsPage />} />
                    <Route path="/turf/:id" element={<TurfDetailsPage />} />

                    {/* Protected Routes - User */}
                    <Route
                        path="/booking/:turfId"
                        element={
                            <ProtectedRoute>
                                <BookingPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-bookings"
                        element={
                            <ProtectedRoute>
                                <MyBookingsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <UserProfilePage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected Routes - Admin */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminDashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected Routes - Turf Owner */}
                    <Route
                        path="/owner"
                        element={
                            <ProtectedRoute requiredRole="turf_owner">
                                <OwnerDashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <ToastContainer position="bottom-right" />
            </div>
        </Router>
    );
}

export default App;
