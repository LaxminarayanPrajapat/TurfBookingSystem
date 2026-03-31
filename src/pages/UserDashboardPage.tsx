import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { useTurfStore } from '../store/turfStore';
import type { Booking, Turf } from '../types';

type SidebarSection = 'dashboard' | 'bookings' | 'payments' | 'favorites' | 'settings';

const sidebarLinks: { id: SidebarSection; label: string; icon: string; href?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'bookings', label: 'My Bookings', icon: 'event_available', href: '/my-bookings' },
    { id: 'payments', label: 'Payments', icon: 'payments' },
    { id: 'favorites', label: 'Favorites', icon: 'favorite' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
];

function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(start: Date, end: Date): string {
    const fmt = (d: Date) =>
        new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${fmt(start)} - ${fmt(end)}`;
}

function StatusBadge({ status }: { status: Booking['status'] }) {
    const map: Record<Booking['status'], string> = {
        confirmed: 'bg-green-100 text-green-600',
        pending: 'bg-amber-100 text-amber-600',
        cancelled: 'bg-slate-100 text-slate-500',
        completed: 'bg-slate-100 text-slate-500',
    };
    return (
        <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${map[status]}`}>
            {status}
        </span>
    );
}

function TurfCard({ turf }: { turf: Turf }) {
    const navigate = useNavigate();
    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden group">
            <div className="relative h-48 overflow-hidden bg-slate-200">
                {turf.images?.[0] ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundImage: `url('${turf.images[0]}')` }}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                        <span className="material-symbols-outlined text-5xl text-primary/40">sports_cricket</span>
                    </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-lg flex items-center gap-1">
                    <span className="material-symbols-outlined text-amber-400 text-xs">star</span>
                    <span className="text-xs font-bold">{turf.rating?.toFixed(1) ?? '—'}</span>
                </div>
            </div>
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-on-surface">{turf.name}</h3>
                    <p className="text-primary font-bold">
                        ₹{turf.pricePerHour}<span className="text-xs text-slate-500 font-normal">/hr</span>
                    </p>
                </div>
                <div className="flex items-center gap-1 text-slate-500 text-xs mb-4">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span>{turf.location}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-5">
                    {turf.amenities?.slice(0, 3).map((a) => (
                        <span key={a} className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded uppercase">{a}</span>
                    ))}
                </div>
                <button
                    onClick={() => navigate(`/booking/${turf.id}`)}
                    className="w-full py-3 btn-gradient font-bold rounded-xl transition-all"
                >
                    Book Now
                </button>
            </div>
        </div>
    );
}

export default function UserDashboardPage() {
    const { user } = useAuthStore();
    const { bookings, fetchUserBookings, loading: bookingsLoading, error: bookingsError } = useBookingStore();
    const { turfs, fetchAllTurfs, loading: turfsLoading, error: turfsError } = useTurfStore();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<SidebarSection>('dashboard');

    useEffect(() => {
        if (user?.id) fetchUserBookings(user.id);
        fetchAllTurfs();
    }, [user?.id]);

    useEffect(() => {
        if (bookingsError) toast.error(bookingsError);
    }, [bookingsError]);

    useEffect(() => {
        if (turfsError) toast.error(turfsError);
    }, [turfsError]);

    const now = new Date();
    const upcomingBookings: Booking[] = bookings.filter(
        (b) => b.status === 'confirmed' && new Date(b.startTime) > now
    );
    const featuredTurfs: Turf[] = turfs.slice(0, 3);

    const handleSidebarClick = (link: typeof sidebarLinks[0]) => {
        if (link.href) {
            navigate(link.href);
        } else {
            setActiveSection(link.id);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-surface">
            {/* Main layout */}
            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 p-6 space-y-8 h-[calc(100vh-73px)] sticky top-[73px]">
                    {/* User info */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.displayName} className="h-12 w-12 rounded-xl object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined">person</span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-on-surface">{user?.displayName ?? 'Player'}</h3>
                                <p className="text-xs text-slate-500 font-medium">Pro Member</p>
                            </div>
                        </div>

                        {/* Nav links */}
                        <div className="space-y-1">
                            {sidebarLinks.map((link) => (
                                <button
                                    key={link.id}
                                    onClick={() => handleSidebarClick(link)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-left transition-colors ${activeSection === link.id
                                        ? 'bg-primary text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <span className="material-symbols-outlined">{link.icon}</span>
                                    <span>{link.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Membership card */}
                    <div className="mt-auto bg-primary/10 p-4 rounded-xl border border-primary/20">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Membership</p>
                        <p className="text-sm font-semibold mb-4 text-on-surface">
                            {user?.rewardPoints
                                ? `You have ${user.rewardPoints} reward points.`
                                : 'Earn reward points with every booking.'}
                        </p>
                        <Link
                            to="/browse"
                            className="block w-full btn-gradient text-center py-2 rounded-lg text-xs font-bold uppercase"
                        >
                            Book Now
                        </Link>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 p-6 md:p-10 space-y-10 overflow-x-hidden pb-24 lg:pb-10">
                    {/* Hero Banner */}
                    <section className="relative rounded-3xl overflow-hidden bg-slate-900 h-64 flex items-center p-8 group">
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80')" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
                        <div className="relative z-10 max-w-lg">
                            <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest mb-4 inline-block">
                                Flash Sale
                            </span>
                            <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight font-display">
                                Book Your Perfect Pitch Today!
                            </h1>
                            <p className="text-slate-300 text-sm mb-6">
                                Enjoy 20% off on all morning sessions this weekend. Find the best turfs near you.
                            </p>
                            <Link
                                to="/browse"
                                className="btn-gradient inline-flex items-center gap-2 font-bold py-3 px-8 rounded-xl transition-all"
                            >
                                <span>Book Quick Match</span>
                                <span className="material-symbols-outlined text-sm">bolt</span>
                            </Link>
                        </div>
                    </section>

                    {/* Upcoming Matches */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2 text-on-surface">
                                <span className="material-symbols-outlined text-primary">calendar_month</span>
                                Upcoming Matches
                            </h2>
                            <Link to="/my-bookings" className="text-primary text-sm font-bold hover:underline">
                                View All
                            </Link>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            {bookingsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="loading-spinner" />
                                </div>
                            ) : upcomingBookings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                    <span className="material-symbols-outlined text-4xl mb-3 text-slate-300">event_busy</span>
                                    <p className="font-semibold">No upcoming matches</p>
                                    <Link to="/browse" className="mt-3 text-primary text-sm font-bold hover:underline">
                                        Browse Turfs
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Turf Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Time</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {upcomingBookings.map((booking) => (
                                                <tr key={booking.id}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                                                                <span className="material-symbols-outlined">stadium</span>
                                                            </div>
                                                            <span className="font-bold text-sm text-on-surface">
                                                                {booking.turfName ?? booking.turfId}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-600 italic">
                                                        {formatDate(booking.startTime)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                                        {formatTime(booking.startTime, booking.endTime)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <StatusBadge status={booking.status} />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => navigate('/my-bookings')}
                                                            className="text-slate-400 hover:text-primary transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined">more_vert</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Featured Turfs */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2 text-on-surface">
                                <span className="material-symbols-outlined text-primary">stars</span>
                                Featured Turfs
                            </h2>
                            <Link to="/browse" className="text-primary text-sm font-bold hover:underline">
                                View All
                            </Link>
                        </div>

                        {turfsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="loading-spinner" />
                            </div>
                        ) : featuredTurfs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-3 text-slate-300">sports_cricket</span>
                                <p className="font-semibold">No turfs available</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {featuredTurfs.map((turf) => (
                                    <TurfCard key={turf.id} turf={turf} />
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>

            {/* Mobile bottom navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50">
                <button
                    onClick={() => setActiveSection('dashboard')}
                    className={`flex flex-col items-center gap-1 min-h-[44px] justify-center ${activeSection === 'dashboard' ? 'text-primary' : 'text-slate-400'}`}
                >
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-[10px] font-bold">Home</span>
                </button>
                <button
                    onClick={() => navigate('/browse')}
                    className="flex flex-col items-center gap-1 text-slate-400 min-h-[44px] justify-center"
                >
                    <span className="material-symbols-outlined">search</span>
                    <span className="text-[10px] font-bold">Explore</span>
                </button>
                <button
                    onClick={() => navigate('/my-bookings')}
                    className="flex flex-col items-center gap-1 text-slate-400 min-h-[44px] justify-center"
                >
                    <span className="material-symbols-outlined">event_available</span>
                    <span className="text-[10px] font-bold">Bookings</span>
                </button>
                <button
                    onClick={() => navigate('/profile')}
                    className="flex flex-col items-center gap-1 text-slate-400 min-h-[44px] justify-center"
                >
                    <span className="material-symbols-outlined">person</span>
                    <span className="text-[10px] font-bold">Profile</span>
                </button>
            </div>
        </div>
    );
}
