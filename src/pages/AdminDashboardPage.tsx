import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { bookingService } from '../services/bookingService';
import type { User, Booking } from '../types';

// ── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
}

function StatusBadge({ suspended, role }: { suspended?: boolean; role: string }) {
    if (suspended)
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Suspended
            </span>
        );
    if (role === 'turf_owner')
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Active
            </span>
        );
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Pending Approval
        </span>
    );
}

function BookingStatusBadge({ status }: { status: Booking['status'] }) {
    const map: Record<Booking['status'], string> = {
        confirmed: 'bg-emerald-100 text-emerald-800',
        pending: 'bg-orange-100 text-orange-800',
        cancelled: 'bg-slate-100 text-slate-600',
        completed: 'bg-blue-100 text-blue-800',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

// ── main component ────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const [owners, setOwners] = useState<User[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ── data fetch ──────────────────────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            try {
                const [users, bookings] = await Promise.all([
                    authService.getAllUsers(),
                    bookingService.getAllBookings(),
                ]);
                setOwners(users.filter((u) => u.role === 'turf_owner' || u.role === 'admin'));
                setAllBookings(bookings);
            } catch (err: any) {
                toast.error(err.message || 'Failed to load admin data');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // ── derived stats ───────────────────────────────────────────────────────────
    const totalRevenue = useMemo(
        () => allBookings.filter((b) => b.status === 'completed').reduce((s, b) => s + b.totalPrice, 0),
        [allBookings]
    );
    const activeOwners = useMemo(() => owners.filter((o) => !o.suspended && o.role === 'turf_owner').length, [owners]);
    const pendingApprovals = useMemo(() => allBookings.filter((b) => b.status === 'pending').length, [allBookings]);
    const recentActivity = useMemo(() => allBookings.slice(0, 10), [allBookings]);

    // ── filtered owners ─────────────────────────────────────────────────────────
    const filteredOwners = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return owners.filter((o) => {
            const matchesSearch =
                !q || o.displayName.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
            const matchesStatus =
                statusFilter === 'All Status' ||
                (statusFilter === 'Active' && !o.suspended && o.role === 'turf_owner') ||
                (statusFilter === 'Suspended' && o.suspended) ||
                (statusFilter === 'Pending' && o.role !== 'turf_owner' && !o.suspended);
            return matchesSearch && matchesStatus;
        });
    }, [owners, searchQuery, statusFilter]);

    // ── actions ─────────────────────────────────────────────────────────────────
    async function handleSuspend(uid: string) {
        try {
            await authService.updateUserSuspension(uid, true);
            setOwners((prev) => prev.map((o) => (o.id === uid ? { ...o, suspended: true } : o)));
            toast.success('Owner suspended');
        } catch (err: any) {
            toast.error(err.message || 'Failed to suspend owner');
        }
    }

    async function handleReactivate(uid: string) {
        try {
            await authService.updateUserSuspension(uid, false);
            setOwners((prev) => prev.map((o) => (o.id === uid ? { ...o, suspended: false } : o)));
            toast.success('Owner reactivated');
        } catch (err: any) {
            toast.error(err.message || 'Failed to reactivate owner');
        }
    }

    async function handleDelete(uid: string, name: string) {
        if (!window.confirm(`Delete account for "${name}"? This cannot be undone.`)) return;
        try {
            await authService.deleteUser(uid);
            setOwners((prev) => prev.filter((o) => o.id !== uid));
            toast.success('Owner account deleted');
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete owner');
        }
    }

    async function handleLogout() {
        await logout();
        navigate('/');
    }

    // ── nav items ────────────────────────────────────────────────────────────────
    const navItems = [
        { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
        { id: 'owners', icon: 'group', label: 'Owner Management' },
        { id: 'reports', icon: 'monitoring', label: 'Financial Reports' },
        { id: 'settings', icon: 'settings', label: 'Platform Settings' },
        { id: 'support', icon: 'confirmation_number', label: 'Support Tickets', badge: '4' },
    ];

    // ── render ───────────────────────────────────────────────────────────────────
    return (
        <div className="flex h-screen overflow-hidden bg-surface">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Brand */}
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">sports_cricket</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-none font-display text-on-surface">CricTurf</h1>
                        <p className="text-xs text-slate-500">Super Admin Panel</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${activeSection === item.id
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span>{item.label}</span>
                            {item.badge && (
                                <span className="ml-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* User footer */}
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                            {user?.displayName?.charAt(0).toUpperCase() ?? 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{user?.displayName ?? 'Admin'}</p>
                            <p className="text-xs text-slate-500 truncate">Super Admin</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-slate-400 hover:text-slate-600"
                            title="Logout"
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="text-xl font-bold text-on-surface">Platform Overview</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <button className="btn-gradient px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-sm">add</span>
                            New Owner
                        </button>
                    </div>
                </header>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="loading-spinner" />
                        </div>
                    ) : (
                        <>
                            {/* ── Stats Grid ── */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    icon="payments"
                                    iconBg="bg-emerald-100 text-emerald-600"
                                    label="Total Revenue"
                                    value={`₹${totalRevenue.toLocaleString()}`}
                                    trend="+12.5%"
                                    trendIcon="trending_up"
                                    trendColor="text-emerald-600"
                                />
                                <StatCard
                                    icon="groups"
                                    iconBg="bg-primary/10 text-primary"
                                    label="Active Owners"
                                    value={activeOwners.toString()}
                                    trend="+3.2%"
                                    trendIcon="trending_up"
                                    trendColor="text-emerald-600"
                                />
                                <StatCard
                                    icon="calendar_today"
                                    iconBg="bg-blue-100 text-blue-600"
                                    label="Total Bookings"
                                    value={allBookings.length.toString()}
                                    trend="+8.1%"
                                    trendIcon="trending_up"
                                    trendColor="text-emerald-600"
                                />
                                <StatCard
                                    icon="pending_actions"
                                    iconBg="bg-orange-100 text-orange-600"
                                    label="Pending Approvals"
                                    value={pendingApprovals.toString()}
                                    trend="Priority"
                                    trendIcon="warning"
                                    trendColor="text-slate-500"
                                />
                            </div>

                            {/* ── Owner Management Table ── */}
                            <OwnerManagementSection
                                owners={filteredOwners}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                statusFilter={statusFilter}
                                setStatusFilter={setStatusFilter}
                                onSuspend={handleSuspend}
                                onReactivate={handleReactivate}
                                onDelete={handleDelete}
                                totalCount={owners.length}
                            />

                            {/* ── Bottom: Activity + Health ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <RecentActivitySection bookings={recentActivity} />
                                <PlatformHealthCard bookings={allBookings} />
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
    icon, iconBg, label, value, trend, trendIcon, trendColor,
}: {
    icon: string; iconBg: string; label: string; value: string;
    trend: string; trendIcon: string; trendColor: string;
}) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <span className={`p-2 rounded-lg ${iconBg}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </span>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${trendColor}`}>
                    {trend}
                    <span className="material-symbols-outlined text-sm">{trendIcon}</span>
                </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold mt-1 text-on-surface">{value}</p>
        </div>
    );
}

function OwnerManagementSection({
    owners, searchQuery, setSearchQuery, statusFilter, setStatusFilter,
    onSuspend, onReactivate, onDelete, totalCount,
}: {
    owners: User[];
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    statusFilter: string;
    setStatusFilter: (v: string) => void;
    onSuspend: (uid: string) => void;
    onReactivate: (uid: string) => void;
    onDelete: (uid: string, name: string) => void;
    totalCount: number;
}) {
    return (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-on-surface">Owner Management</h3>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search owners by name or email..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-primary/20 text-sm outline-none"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-slate-100 border-none rounded-xl py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                            {['All Status', 'Active', 'Pending', 'Suspended'].map((s) => (
                                <option key={s}>{s}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Owner</th>
                            <th className="px-6 py-4 font-semibold">Email</th>
                            <th className="px-6 py-4 font-semibold">Verified</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {owners.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">No owners found</td>
                            </tr>
                        ) : (
                            owners.map((owner) => (
                                <tr key={owner.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary">stadium</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-on-surface">{owner.displayName}</p>
                                                <p className="text-xs text-slate-500">{owner.phoneNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{owner.email}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${owner.emailVerified ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                <span className="material-symbols-outlined text-sm">{owner.emailVerified ? 'mark_email_read' : 'mail'}</span>
                                                Email
                                            </span>
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${owner.phoneVerified ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                <span className="material-symbols-outlined text-sm">{owner.phoneVerified ? 'verified' : 'phone'}</span>
                                                Phone
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge suspended={owner.suspended} role={owner.role} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                            {owner.suspended ? (
                                                <button
                                                    onClick={() => onReactivate(owner.id)}
                                                    title="Reactivate"
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                                >
                                                    <span className="material-symbols-outlined text-xl">check_circle</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onSuspend(owner.id)}
                                                    title="Suspend"
                                                    className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                                >
                                                    <span className="material-symbols-outlined text-xl">block</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onDelete(owner.id, owner.displayName)}
                                                title="Delete account"
                                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">Showing {owners.length} of {totalCount} owners</p>
            </div>
        </section>
    );
}

function RecentActivitySection({ bookings }: { bookings: Booking[] }) {
    return (
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold mb-4 text-on-surface">Recent Platform Activity</h3>
            {bookings.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No recent activity</p>
            ) : (
                <div className="space-y-5">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="flex items-start gap-4">
                            <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-sm">event</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-on-surface">
                                    Booking for{' '}
                                    <strong>{booking.turfName ?? booking.turfId}</strong> —{' '}
                                    <BookingStatusBadge status={booking.status} />
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {timeAgo(booking.createdAt)} · ₹{booking.totalPrice.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function PlatformHealthCard({ bookings }: { bookings: Booking[] }) {
    const activeSessions = bookings.filter((b) => {
        const now = Date.now();
        return (
            b.status === 'confirmed' &&
            new Date(b.startTime).getTime() <= now &&
            new Date(b.endTime).getTime() >= now
        );
    }).length;

    const capacity = bookings.length > 0
        ? Math.min(100, Math.round((bookings.filter((b) => b.status === 'confirmed').length / bookings.length) * 100))
        : 0;

    return (
        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-primary mb-2">Platform Health</h3>
                <p className="text-sm text-slate-600">All systems operational. Active sessions: {activeSessions}.</p>
            </div>
            <div className="mt-8">
                <div className="flex items-end justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Booking Capacity
                    </span>
                    <span className="text-sm font-bold text-primary">{capacity}%</span>
                </div>
                <div className="w-full bg-primary/20 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${capacity}%` }} />
                </div>
            </div>
            <button className="w-full mt-6 py-2.5 btn-gradient text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                Download Global Report
            </button>
        </div>
    );
}
