import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-blue-600">🏟️</div>
                        <span className="text-xl font-bold text-gray-800 hidden sm:inline">TurfBook</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/browse" className="text-gray-700 hover:text-blue-600 font-medium transition">
                            Browse Turfs
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link to="/my-bookings" className="text-gray-700 hover:text-blue-600 font-medium transition">
                                    My Bookings
                                </Link>

                                {user?.role === 'turf_owner' && (
                                    <Link to="/owner" className="text-gray-700 hover:text-blue-600 font-medium transition">
                                        My Turfs
                                    </Link>
                                )}

                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium transition">
                                        Admin
                                    </Link>
                                )}

                                <div className="flex items-center gap-4 border-l pl-4">
                                    <Link to="/profile" className="text-gray-700 hover:text-blue-600">
                                        <FiUser size={20} />
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-700 hover:text-red-600 transition"
                                        title="Logout"
                                    >
                                        <FiLogOut size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden text-gray-700 hover:text-blue-600"
                    >
                        {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4 border-t pt-4 space-y-3">
                        <Link to="/browse" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                            Browse Turfs
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link to="/my-bookings" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                                    My Bookings
                                </Link>

                                {user?.role === 'turf_owner' && (
                                    <Link to="/owner" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                                        My Turfs
                                    </Link>
                                )}

                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                                        Admin
                                    </Link>
                                )}

                                <Link to="/profile" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                                    Profile
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left text-red-600 hover:text-red-700 font-medium py-2"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                                    Login
                                </Link>
                                <Link to="/register" className="block text-blue-600 hover:text-blue-700 font-medium py-2">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
