import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { authService } from '../services/authService';
import type { Booking } from '../types';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

type ActiveTab = 'history' | 'favorites' | 'rewards';

function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatTime(start: Date, end: Date): string {
    const fmt = (d: Date) =>
        new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${fmt(start)} - ${fmt(end)}`;
}

function BookingHistoryCard({ booking }: { booking: Booking }) {
    const isUpcoming = booking.status === 'confirmed' && new Date(booking.startTime) > new Date();
    return (
        <div className={`flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border transition-all group ${isUpcoming ? 'border-2 border-primary/20 bg-primary/5' : 'border border-slate-100 bg-slate-50/50 hover:border-primary/30'}`}>
            <div className="size-16 rounded-lg overflow-hidden flex-shrink-0 bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-secondary">stadium</span>
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-on-surface">{booking.turfName ?? booking.turfId}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            {formatDate(booking.startTime)} • {formatTime(booking.startTime, booking.endTime)}
                        </p>
                    </div>
                    {isUpcoming ? (
                        <span className="px-2.5 py-1 bg-primary text-white text-[10px] font-bold uppercase rounded-full">Upcoming</span>
                    ) : booking.status === 'completed' ? (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">Completed</span>
                    ) : booking.status === 'cancelled' ? (
                        <span className="px-2.5 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold uppercase rounded-full">Cancelled</span>
                    ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-full">Pending</span>
                    )}
                </div>
                <div className="mt-2 flex items-center gap-4">
                    <span className="text-xs font-semibold text-slate-700">
                        ₹{booking.totalPrice.toLocaleString('en-IN')}
                    </span>
                    {booking.bookingType === 'tournament' && (
                        <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded uppercase">Tournament</span>
                    )}
                </div>
            </div>
            <button className="flex items-center justify-center p-2 rounded-lg bg-white text-slate-400 hover:text-primary border border-slate-200 shadow-sm flex-shrink-0">
                <span className="material-symbols-outlined">receipt_long</span>
            </button>
        </div>
    );
}

export default function UserProfilePage() {
    const { user, logout } = useAuthStore();
    const { bookings, fetchUserBookings, loading } = useBookingStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<ActiveTab>('history');

    // Edit form state
    const [editing, setEditing] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName ?? '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user?.id) fetchUserBookings(user.id);
    }, [user?.id, fetchUserBookings]);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName);
            setPhoneNumber(user.phoneNumber);
        }
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="loading-spinner h-10 w-10" />
            </div>
        );
    }

    // Stats derived from bookings
    const completedBookings = bookings.filter((b) => b.status === 'completed');
    const matchesPlayed = completedBookings.length;
    const rewardPoints = matchesPlayed * 10;

    const pastBookings = bookings.filter(
        (b) => b.status === 'completed' || b.status === 'cancelled' || new Date(b.startTime) <= new Date()
    );

    const memberSince = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
        : '—';

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/');
        } catch {
            toast.error('Failed to logout');
        }
    };

    const handleSaveProfile = async () => {
        if (!displayName.trim()) {
            toast.error('Display name cannot be empty');
            return;
        }
        if (!/^\d{10}$/.test(phoneNumber)) {
            toast.error('Phone number must be exactly 10 digits');
            return;
        }
        setSaving(true);
        try {
            await authService.updateUserProfile(user.id, { displayName, phoneNumber });
            toast.success('Profile updated successfully');
            setEditing(false);
        } catch (err: any) {
            toast.error(err.message ?? 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface">
            <Navbar />

            <main className="max-w-[1200px] mx-auto w-full p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* ── Left Sidebar ── */}
                    <aside className="lg:col-span-3 space-y-6">
                        {/* Avatar card */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-center">
                            <div className="relative inline-block mb-4">
                                <div className="size-28 rounded-full border-4 border-primary/10 mx-auto bg-primary/10 flex items-center justify-center text-primary text-5xl font-bold">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.displayName} className="size-28 rounded-full object-cover" />
                                    ) : (
                                        <span>{user.displayName.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-lg border-2 border-white flex"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                            </div>
                            <h1 className="text-on-surface text-xl font-bold">{user.displayName}</h1>
                            <p className="text-primary text-sm font-medium">Gold Member</p>
                            <p className="text-slate-500 text-xs mt-1">Member since {memberSince}</p>
                            <div className="mt-6 flex flex-col gap-2">
                                <button
                                    onClick={() => setEditing(true)}
                                    className="w-full py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* Nav links */}
                        <nav className="bg-white rounded-xl p-2 shadow-sm border border-slate-200">
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-primary/5 hover:text-primary rounded-lg transition-all group"
                            >
                                <span className="material-symbols-outlined">dashboard</span>
                                <span className="text-sm font-medium">Dashboard</span>
                            </Link>
                            <Link
                                to="/my-bookings"
                                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-primary/5 hover:text-primary rounded-lg transition-all group"
                            >
                                <span className="material-symbols-outlined">calendar_month</span>
                                <span className="text-sm font-medium">Bookings</span>
                            </Link>
                            <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-lg">
                                <span className="material-symbols-outlined">person</span>
                                <span className="text-sm font-bold">Profile Settings</span>
                            </div>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-primary/5 hover:text-primary rounded-lg transition-all group">
                                <span className="material-symbols-outlined">wallet</span>
                                <span className="text-sm font-medium">Payment Methods</span>
                            </button>
                            <div className="my-2 border-t border-slate-100" />
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <span className="material-symbols-outlined">logout</span>
                                <span className="text-sm font-medium">Sign Out</span>
                            </button>
                        </nav>
                    </aside>

                    {/* ── Main Content ── */}
                    <div className="lg:col-span-9 space-y-8">

                        {/* Stats row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                                <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <span className="material-symbols-outlined">sports_score</span>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Matches Played</p>
                                    <p className="text-on-surface text-2xl font-bold">{matchesPlayed}</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">stars</span>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Reward Points</p>
                                    <p className="text-on-surface text-2xl font-bold">{rewardPoints.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                                <div className="size-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <span className="material-symbols-outlined">trending_up</span>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Win Rate</p>
                                    <p className="text-on-surface text-2xl font-bold">65%</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs + content */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="flex border-b border-slate-100 px-4">
                                {(['history', 'favorites', 'rewards'] as ActiveTab[]).map((tab) => {
                                    const labels: Record<ActiveTab, string> = {
                                        history: 'Match History',
                                        favorites: 'Favorite Turfs',
                                        rewards: 'Rewards',
                                    };
                                    return (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-6 py-4 text-sm font-bold transition-colors ${activeTab === tab
                                                ? 'text-primary border-b-[3px] border-primary'
                                                : 'text-slate-500 hover:text-on-surface'
                                                }`}
                                        >
                                            {labels[tab]}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="p-4 md:p-6 space-y-4">
                                {/* Match History tab */}
                                {activeTab === 'history' && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-on-surface">Recent Activities</h3>
                                        </div>
                                        {loading ? (
                                            <div className="flex items-center justify-center py-12">
                                                <div className="loading-spinner h-8 w-8" />
                                            </div>
                                        ) : pastBookings.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">history</span>
                                                <p className="font-semibold text-slate-500">No match history yet</p>
                                                <Link to="/browse" className="mt-3 text-primary text-sm font-bold hover:underline">
                                                    Book your first match
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {pastBookings.map((b) => (
                                                    <BookingHistoryCard key={b.id} booking={b} />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Favorites tab */}
                                {activeTab === 'favorites' && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">favorite</span>
                                        <p className="font-semibold text-slate-500">No favorite turfs yet</p>
                                        <Link to="/browse" className="mt-3 text-primary text-sm font-bold hover:underline">
                                            Explore turfs
                                        </Link>
                                    </div>
                                )}

                                {/* Rewards tab */}
                                {activeTab === 'rewards' && (
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-primary to-[#ff7e3d] rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="flex items-center gap-5">
                                                <div className="size-16 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                                                    <span className="material-symbols-outlined text-3xl">card_membership</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold">Premium Rewards</h3>
                                                    <p className="text-white/80 text-sm">
                                                        {rewardPoints >= 1500
                                                            ? 'You have enough points for a FREE 1-hour session!'
                                                            : `You're only ${1500 - rewardPoints} points away from a FREE 1-hour session!`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Your Points</p>
                                                    <p className="font-bold">{rewardPoints.toLocaleString('en-IN')} pts</p>
                                                </div>
                                                <button className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
                                                    Redeem Points
                                                </button>
                                            </div>
                                        </div>
                                        <div className="bg-surface-low rounded-xl p-5">
                                            <h4 className="font-bold text-on-surface mb-3">How to earn points</h4>
                                            <ul className="space-y-2 text-sm text-slate-600">
                                                <li className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                                                    Complete a booking — earn 10 points
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                                                    Refer a friend — earn 50 points
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                                                    Write a review — earn 20 points
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rewards banner (always visible below tabs) */}
                        {activeTab === 'history' && (
                            <div className="bg-gradient-to-r from-primary to-[#ff7e3d] rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="size-16 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                                        <span className="material-symbols-outlined text-3xl">card_membership</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Premium Rewards</h3>
                                        <p className="text-white/80 text-sm">
                                            {rewardPoints >= 1500
                                                ? 'You have enough points for a FREE 1-hour session!'
                                                : `You're only ${1500 - rewardPoints} points away from a FREE 1-hour session!`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Next Goal</p>
                                        <p className="font-bold">1,500 pts</p>
                                    </div>
                                    <button className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
                                        Redeem Points
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Edit Profile Modal */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-on-surface">Edit Profile</h2>
                            <button
                                onClick={() => setEditing(false)}
                                className="text-slate-400 hover:text-on-surface transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Display Name</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-surface-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    readOnly
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                                />
                                <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-surface-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                    placeholder="10-digit phone number"
                                    maxLength={10}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setEditing(false)}
                                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="flex-1 py-3 btn-gradient font-bold text-sm rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
