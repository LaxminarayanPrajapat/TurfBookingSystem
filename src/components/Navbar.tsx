import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="glass-nav sticky top-0 z-50 border-b border-gray-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
                        <span className="material-symbols-outlined text-primary text-3xl">sports_cricket</span>
                        <span className="text-xl font-bold text-primary" style={{ fontFamily: 'Lexend, sans-serif' }}>
                            CricTurf
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-on-surface hover:text-primary font-medium transition-colors text-sm">
                            Home
                        </Link>
                        <Link to="/browse" className="text-on-surface hover:text-primary font-medium transition-colors text-sm">
                            Browse Turfs
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link to="/my-bookings" className="text-on-surface hover:text-primary font-medium transition-colors text-sm">
                                    My Bookings
                                </Link>
                                <Link to="/dashboard" className="text-on-surface hover:text-primary font-medium transition-colors text-sm">
                                    Dashboard
                                </Link>

                                {user?.role === 'turf_owner' && (
                                    <Link to="/owner" className="text-on-surface hover:text-primary font-medium transition-colors text-sm">
                                        Owner Dashboard
                                    </Link>
                                )}

                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="text-on-surface hover:text-primary font-medium transition-colors text-sm">
                                        Admin Panel
                                    </Link>
                                )}

                                <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-1.5 text-on-surface hover:text-primary transition-colors text-sm font-medium"
                                    >
                                        <span className="material-symbols-outlined text-xl">account_circle</span>
                                        <span className="hidden lg:inline">{user?.displayName?.split(' ')[0]}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-sm"
                                        title="Logout"
                                    >
                                        <span className="material-symbols-outlined text-xl">logout</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary hover:text-white transition-all"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-gradient px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden text-on-surface hover:text-primary transition-colors p-1"
                        aria-label="Toggle menu"
                    >
                        <span className="material-symbols-outlined text-2xl">
                            {isMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4 pt-2 border-t border-gray-200/50 space-y-1 fade-in">
                        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 px-2 py-3 text-on-surface hover:text-primary font-medium text-sm rounded-lg hover:bg-surface-low transition-colors">
                            <span className="material-symbols-outlined text-xl">home</span>
                            Home
                        </Link>
                        <Link to="/browse" onClick={closeMenu} className="flex items-center gap-2 px-2 py-3 text-on-surface hover:text-primary font-medium text-sm rounded-lg hover:bg-surface-low transition-colors">
                            <span className="material-symbols-outlined text-xl">search</span>
                            Browse Turfs
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link to="/my-bookings" onClick={closeMenu} className="flex items-center gap-2 px-2 py-3 text-on-surface hover:text-primary font-medium text-sm rounded-lg hover:bg-surface-low transition-colors">
                                    <span className="material-symbols-outlined text-xl">calendar_month</span>
                                    My Bookings
                                </Link>
                                <Link to="/dashboard" onClick={closeMenu} className="flex items-center gap-2 px-2 py-3 text-on-surface hover:text-primary font-medium text-sm rounded-lg hover:bg-surface-low transition-colors">
                                    <span className="material-symbols-outlined text-xl">dashboard</span>
                                    Dashboard
                                </Link>

                                {user?.role === 'turf_owner' && (
                                    <Link to="/owner" onClick={closeMenu} className="flex items-center gap-2 px-2 py-3 text-on-surface hover:text-primary font-medium text-sm rounded-lg hover:bg-surface-low transition-colors">
                                        <span className="material-symbols-outlined text-xl">manage_accounts</span>
                                        Owner Dashboard
                                    </Link>
                                )}

                                {user?.role === 'admin' && (
                                    <Link to="/admin" onClick={closeMenu} className="flex items-center gap-2 px-2 py-3 text-on-surface hover:text-primary font-medium text-sm rounded-lg hover:bg-surface-low transition-colors">
                                        <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                                        Admin Panel
                                    </Link>
                                )}

                                <Link to="/profile" onClick={closeMenu} className="flex items-center gap-2 px-2 py-3 text-on-surface hover:text-primary font-medium text-sm rounded-lg hover:bg-surface-low transition-colors">
                                    <span className="material-symbols-outlined text-xl">account_circle</span>
                                    Profile
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 w-full px-2 py-3 text-red-500 hover:text-red-600 font-medium text-sm rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">logout</span>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2 pt-2">
                                <Link to="/login" onClick={closeMenu} className="px-4 py-3 border border-primary text-primary rounded-full text-sm font-medium text-center hover:bg-primary hover:text-white transition-all">
                                    Login
                                </Link>
                                <Link to="/register" onClick={closeMenu} className="btn-gradient px-4 py-3 text-sm font-medium text-center hover:opacity-90 transition-opacity">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
