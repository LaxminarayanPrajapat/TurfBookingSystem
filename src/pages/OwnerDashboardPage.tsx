import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { useTurfStore } from '../store/turfStore';
import { useBookingStore } from '../store/bookingStore';
import type { Turf, Booking } from '../types';

type SidebarSection = 'dashboard' | 'bookings' | 'pricing' | 'grounds' | 'settings';

const sidebarLinks: { id: SidebarSection; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'bookings', label: 'Bookings', icon: 'event_available' },
    { id: 'pricing', label: 'Pricing', icon: 'payments' },
    { id: 'grounds', label: 'My Grounds', icon: 'grass' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
];

function formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function getTurfStatus(turf: Turf, bookings: Booking[]): 'available' | 'occupied' | 'maintenance' {
    if (!turf.isAvailable) return 'maintenance';
    const now = new Date();
    const active = bookings.find(
        (b) =>
            b.turfId === turf.id &&
            b.status === 'confirmed' &&
            new Date(b.startTime) <= now &&
            new Date(b.endTime) >= now
    );
    return active ? 'occupied' : 'available';
}

function StatusBadge({ status }: { status: 'available' | 'occupied' | 'maintenance' }) {
    const map = {
        available: 'bg-green-500 text-white',
        occupied: 'bg-red-500 text-white',
        maintenance: 'bg-amber-500 text-white',
    };
    const labels = { available: 'Available', occupied: 'Occupied', maintenance: 'Maintenance' };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${map[status]}`}>
            {status === 'available' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            {labels[status]}
        </span>
    );
}

function calcDailyRevenue(bookings: Booking[]): number {
    const today = new Date();
    return bookings
        .filter((b) => {
            const d = new Date(b.startTime);
            return (
                b.status === 'confirmed' &&
                d.getFullYear() === today.getFullYear() &&
                d.getMonth() === today.getMonth() &&
                d.getDate() === today.getDate()
            );
        })
        .reduce((sum, b) => sum + b.totalPrice, 0);
}

function calcPeakHour(bookings: Booking[]): string {
    const counts: Record<number, number> = {};
    bookings.forEach((b) => {
        if (b.status === 'confirmed') {
            const h = new Date(b.startTime).getHours();
            counts[h] = (counts[h] ?? 0) + 1;
        }
    });
    const entries = Object.entries(counts);
    if (entries.length === 0) return '—';
    const peak = entries.reduce((a, b) => (Number(b[1]) > Number(a[1]) ? b : a));
    const h = Number(peak[0]);
    const fmt = (n: number) => {
        const suffix = n >= 12 ? 'PM' : 'AM';
        const h12 = n % 12 === 0 ? 12 : n % 12;
        return `${h12} ${suffix}`;
    };
    return `${fmt(h)} - ${fmt(h + 1)}`;
}

function getActiveSessions(bookings: Booking[]): Booking[] {
    const now = new Date();
    return bookings.filter(
        (b) =>
            b.status === 'confirmed' &&
            new Date(b.startTime) <= now &&
            new Date(b.endTime) >= now
    );
}

function getTurfName(turfId: string, turfs: Turf[]): string {
    return turfs.find((t) => t.id === turfId)?.name ?? turfId;
}

interface PriceState {
    dayRate: string;
    nightRate: string;
}

export default function OwnerDashboardPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { myTurfs, loading: turfsLoading, fetchMyTurfs, updateTurf, error: turfsError } = useTurfStore();
    const { updateBooking } = useBookingStore();

    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [activeSection, setActiveSection] = useState<SidebarSection>('dashboard');
    const [priceStates, setPriceStates] = useState<Record<string, PriceState>>({});

    useEffect(() => {
        if (user?.id) fetchMyTurfs(user.id);
    }, [user?.id]);

    useEffect(() => {
        if (turfsError) toast.error(turfsError);
    }, [turfsError]);

    useEffect(() => {
        if (myTurfs.length === 0) return;
        let cancelled = false;
        const loadAll = async () => {
            setBookingsLoading(true);
            try {
                const { bookingService } = await import('../services/bookingService');
                const allResults = await Promise.all(myTurfs.map((t) => bookingService.getTurfBookings(t.id)));
                if (!cancelled) setAllBookings(allResults.flat());
            } catch (err: any) {
                if (!cancelled) toast.error(err?.message || 'Failed to load bookings');
            }
            finally { if (!cancelled) setBookingsLoading(false); }
        };
        loadAll();
        return () => { cancelled = true; };
    }, [myTurfs.length]);

    useEffect(() => {
        const init: Record<string, PriceState> = {};
        myTurfs.forEach((t) => {
            if (!priceStates[t.id]) {
                init[t.id] = {
                    dayRate: String(t.dayRate ?? t.pricePerHour),
                    nightRate: String(t.nightRate ?? t.pricePerHour),
                };
            }
        });
        if (Object.keys(init).length > 0) setPriceStates((prev) => ({ ...prev, ...init }));
    }, [myTurfs]);

    const loading = turfsLoading || bookingsLoading;
    const pendingBookings = allBookings.filter((b) => b.status === 'pending');
    const activeSessions = getActiveSessions(allBookings);
    const dailyRevenue = calcDailyRevenue(allBookings);
    const peakHour = calcPeakHour(allBookings);

    const handleStatusToggle = async (turf: Turf) => {
        try {
            await updateTurf(turf.id, { isAvailable: !turf.isAvailable });
            await fetchMyTurfs(user!.id);
            toast.success(`${turf.name} marked as ${!turf.isAvailable ? 'available' : 'maintenance'}`);
        } catch { toast.error('Failed to update turf status'); }
    };

    const refreshBookings = async () => {
        if (myTurfs.length === 0) return;
        try {
            const { bookingService } = await import('../services/bookingService');
            const allResults = await Promise.all(myTurfs.map((t) => bookingService.getTurfBookings(t.id)));
            setAllBookings(allResults.flat());
        } catch (err: any) {
            toast.error(err?.message || 'Failed to refresh bookings');
        }
    };

    const handleAccept = async (booking: Booking) => {
        try {
            await updateBooking(booking.id, { status: 'confirmed' });
            toast.success('Booking confirmed');
            await refreshBookings();
        } catch { toast.error('Failed to confirm booking'); }
    };

    const handleReject = async (booking: Booking) => {
        try {
            await updateBooking(booking.id, { status: 'cancelled' });
            toast.success('Booking rejected');
            await refreshBookings();
        } catch { toast.error('Failed to reject booking'); }
    };

    const handleSavePrice = async (turf: Turf) => {
        const ps = priceStates[turf.id];
        if (!ps) return;
        try {
            await updateTurf(turf.id, { dayRate: Number(ps.dayRate), nightRate: Number(ps.nightRate) });
            toast.success(`Pricing updated for ${turf.name}`);
        } catch { toast.error('Failed to update pricing'); }
    };

    return (
        <div className="flex min-h-screen bg-surface">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-primary p-1.5 rounded-lg text-white">
                        <span className="material-symbols-outlined text-xl">sports_cricket</span>
                    </div>
                    <h1 className="text-xl font-black tracking-tight text-primary font-display">CricTurf</h1>
                </div>
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {sidebarLinks.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => setActiveSection(link.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-left transition-colors ${activeSection === link.id ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <span className="material-symbols-outlined">{link.icon}</span>
                            <span>{link.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4">
                    <button
                        onClick={() => navigate('/owner/add-turf')}
                        className="w-full flex items-center justify-center gap-2 btn-gradient py-3 rounded-xl font-bold shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-xl">add_circle</span>
                        <span>Add New Turf</span>
                    </button>
                </div>
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 p-2">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {user?.avatar
                                ? <img src={user.avatar} alt={user.displayName} className="size-10 rounded-full object-cover" />
                                : <span className="material-symbols-outlined">person</span>}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate">{user?.displayName ?? 'Owner'}</p>
                            <p className="text-xs text-slate-500 truncate">Ground Owner</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black tracking-tight font-display">Dashboard Overview</h2>
                        <p className="text-xs text-slate-500">Manage your turf operations</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500 font-medium hidden sm:block">{user?.displayName}</span>
                        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-sm">person</span>
                        </div>
                    </div>
                </header>

                <div className="p-8 space-y-10 max-w-7xl mx-auto">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="loading-spinner w-8 h-8" />
                        </div>
                    )}

                    {/* Stats Row */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white flex-shrink-0">
                                <span className="material-symbols-outlined">trending_up</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Daily Revenue</p>
                                <p className="text-2xl font-black text-on-surface">₹{dailyRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="bg-blue-500/5 p-6 rounded-2xl border border-blue-500/20 flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                                <span className="material-symbols-outlined">group</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Total Bookings</p>
                                <p className="text-2xl font-black text-on-surface">{allBookings.length} Slots</p>
                            </div>
                        </div>
                        <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                                <span className="material-symbols-outlined">schedule</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Peak Hours</p>
                                <p className="text-2xl font-black text-on-surface">{peakHour}</p>
                            </div>
                        </div>
                    </section>

                    {/* Ground Availability Grid */}
                    <section>
                        <h2 className="text-2xl font-black tracking-tight font-display flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-primary">grass</span>
                            Ground Availability
                        </h2>
                        {myTurfs.length === 0 && !loading ? (
                            <div className="bg-white rounded-2xl p-12 text-center">
                                <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">sports_cricket</span>
                                <p className="text-slate-500 font-semibold">No turfs yet.</p>
                                <button onClick={() => navigate('/owner/add-turf')} className="mt-4 btn-gradient px-6 py-2 rounded-xl font-bold">
                                    Add Your First Turf
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {myTurfs.map((turf) => {
                                    const status = getTurfStatus(turf, allBookings);
                                    return (
                                        <div key={turf.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
                                            <div className="relative h-40 bg-slate-200">
                                                {turf.images?.[0] ? (
                                                    <img src={turf.images[0]} alt={turf.name} className={`w-full h-full object-cover ${status === 'maintenance' ? 'grayscale' : ''}`} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                                                        <span className="material-symbols-outlined text-4xl text-primary/40">sports_cricket</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3"><StatusBadge status={status} /></div>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-base text-on-surface">{turf.name}</h3>
                                                    <span className="text-primary font-black">₹{turf.pricePerHour}<span className="text-xs text-slate-500 font-normal">/hr</span></span>
                                                </div>
                                                <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                                    {turf.location}
                                                </p>
                                                <button
                                                    onClick={() => handleStatusToggle(turf)}
                                                    className={`w-full py-2 rounded-xl font-bold text-sm transition-all ${turf.isAvailable ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                                >
                                                    {turf.isAvailable ? 'Set Maintenance' : 'Set Available'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Two-column: Pending Approvals + Price Management | Active Sessions */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Pending Approvals */}
                            <section>
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-primary">notification_important</span>
                                    Pending Approvals
                                    {pendingBookings.length > 0 && (
                                        <span className="ml-1 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingBookings.length}</span>
                                    )}
                                </h2>
                                {pendingBookings.length === 0 ? (
                                    <div className="bg-white rounded-2xl p-8 text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">check_circle</span>
                                        <p className="text-slate-500 font-semibold">No pending approvals</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingBookings.map((booking) => (
                                            <div key={booking.id} className="bg-white p-5 rounded-2xl flex flex-wrap md:flex-nowrap items-center gap-6">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="size-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                        <span className="material-symbols-outlined">person</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-on-surface">{booking.turfName ?? getTurfName(booking.turfId, myTurfs)}</h4>
                                                        <p className="text-sm text-slate-500">{formatDateTime(booking.startTime)} – {formatTime(booking.endTime)}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">₹{booking.totalPrice}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleAccept(booking)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-xl text-sm font-bold transition-colors">Accept</button>
                                                    <button onClick={() => handleReject(booking)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-xl text-sm font-bold transition-colors">Reject</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Price Management */}
                            <section>
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-primary">sell</span>
                                    Price Management
                                </h2>
                                {myTurfs.length === 0 ? (
                                    <div className="bg-white rounded-2xl p-8 text-center"><p className="text-slate-500">Add a turf to manage pricing.</p></div>
                                ) : (
                                    <div className="space-y-4">
                                        {myTurfs.map((turf) => {
                                            const ps = priceStates[turf.id] ?? { dayRate: '', nightRate: '' };
                                            return (
                                                <div key={turf.id} className="bg-white p-6 rounded-2xl">
                                                    <h3 className="font-bold text-on-surface mb-4">{turf.name}</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold text-slate-700">Day Rate (₹) <span className="text-xs text-slate-400 font-normal">06:00 – 18:00</span></label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                                                <input type="number" value={ps.dayRate} onChange={(e) => setPriceStates((prev) => ({ ...prev, [turf.id]: { ...ps, dayRate: e.target.value } }))} className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold text-slate-700">Night Rate (₹) <span className="text-xs text-slate-400 font-normal">18:00 – 02:00</span></label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                                                <input type="number" value={ps.nightRate} onChange={(e) => setPriceStates((prev) => ({ ...prev, [turf.id]: { ...ps, nightRate: e.target.value } }))} className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 flex justify-end">
                                                        <button onClick={() => handleSavePrice(turf)} className="btn-gradient px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20">Update Pricing</button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Active Sessions */}
                        <div className="lg:col-span-1 space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">timer</span>
                                Active Sessions
                            </h2>
                            <div className="bg-white rounded-2xl overflow-hidden">
                                {activeSessions.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">sports_cricket</span>
                                        <p className="text-slate-500 font-semibold text-sm">No active sessions right now</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Turf / User</th>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {activeSessions.map((session) => (
                                                    <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-4">
                                                            <p className="font-bold text-sm text-on-surface">{session.turfName ?? getTurfName(session.turfId, myTurfs)}</p>
                                                            <p className="text-xs text-slate-500">{session.userId}</p>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <p className="text-xs font-medium text-slate-600">{formatTime(session.startTime)}</p>
                                                            <p className="text-xs text-slate-400">– {formatTime(session.endTime)}</p>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            {pendingBookings.length > 0 && (
                                <div className="bg-primary/10 p-5 rounded-2xl border border-primary/20 border-dashed">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-primary text-sm">event</span>
                                        <h3 className="font-bold text-sm">Pending Requests</h3>
                                    </div>
                                    <p className="text-2xl font-black text-primary">{pendingBookings.length}</p>
                                    <p className="text-xs text-slate-500 mt-1">awaiting your approval</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile bottom nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50">
                {sidebarLinks.slice(0, 4).map((link) => (
                    <button
                        key={link.id}
                        onClick={() => setActiveSection(link.id)}
                        className={`flex flex-col items-center gap-1 min-h-[44px] justify-center ${activeSection === link.id ? 'text-primary' : 'text-slate-400'}`}
                    >
                        <span className="material-symbols-outlined text-xl">{link.icon}</span>
                        <span className="text-[10px] font-bold">{link.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
