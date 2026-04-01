import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import Navbar from '../components/Navbar';
import type { Booking } from '../types';
import { toast } from 'react-toastify';

type Tab = 'upcoming' | 'past';

function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

function StatusBadge({ status }: { status: Booking['status'] }) {
    if (status === 'confirmed') {
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-secondary text-white">
                Confirmed
            </span>
        );
    }
    if (status === 'pending') {
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-[#ec5b13] text-white">
                Pending
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-400 text-white">
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

function PaymentBadge({ status }: { status: Booking['paymentStatus'] }) {
    const map: Record<Booking['paymentStatus'], string> = {
        completed: 'bg-secondary/10 text-secondary',
        pending: 'bg-amber-100 text-amber-700',
        failed: 'bg-red-100 text-red-600',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${map[status]}`}>
            {status}
        </span>
    );
}

function BookingCard({
    booking,
    onCancel,
    cancelling,
}: {
    booking: Booking;
    onCancel?: (id: string) => void;
    cancelling: boolean;
}) {
    const isUpcoming = booking.status === 'confirmed' && new Date(booking.startTime) > new Date();

    return (
        <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Turf icon */}
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-2xl">stadium</span>
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <h3 className="font-bold text-on-surface font-headline text-base leading-tight">
                            {booking.turfName ?? booking.turfId}
                        </h3>
                        <StatusBadge status={booking.status} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Date</p>
                            <div className="flex items-center gap-1 text-on-surface font-medium">
                                <span className="material-symbols-outlined text-[16px] text-secondary">calendar_today</span>
                                <span>{formatDate(booking.startTime)}</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Time</p>
                            <div className="flex items-center gap-1 text-on-surface font-medium">
                                <span className="material-symbols-outlined text-[16px] text-secondary">schedule</span>
                                <span>{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Total</p>
                            <div className="flex items-center gap-1 text-on-surface font-bold">
                                <span className="material-symbols-outlined text-[16px] text-secondary">currency_rupee</span>
                                <span>₹{booking.totalPrice.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Payment</p>
                            <PaymentBadge status={booking.paymentStatus} />
                        </div>
                    </div>
                </div>

                {/* Cancel action */}
                {isUpcoming && onCancel && (
                    <div className="flex-shrink-0 self-start sm:self-center">
                        <button
                            onClick={() => onCancel(booking.id)}
                            disabled={cancelling}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-red-500 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                        >
                            <span className="material-symbols-outlined text-[16px]">cancel</span>
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MyBookingsPage() {
    const { user } = useAuthStore();
    const { bookings, loading, fetchUserBookings, cancelBooking } = useBookingStore();
    const [activeTab, setActiveTab] = useState<Tab>('upcoming');
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchUserBookings(user.id);
        }
    }, [user?.id, fetchUserBookings]);

    const now = new Date();

    const upcomingBookings = bookings.filter(
        (b) => b.status === 'confirmed' && new Date(b.startTime) > now
    );

    const pastBookings = bookings.filter(
        (b) =>
            b.status === 'completed' ||
            b.status === 'cancelled' ||
            new Date(b.startTime) <= now
    );

    const handleCancel = async (bookingId: string) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        setCancellingId(bookingId);
        try {
            await cancelBooking(bookingId);
            toast.success('Booking cancelled successfully');
        } catch (err: any) {
            toast.error(err.message ?? 'Failed to cancel booking');
        } finally {
            setCancellingId(null);
        }
    };

    const displayed = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

    return (
        <div className="min-h-screen bg-surface">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-on-surface font-headline">My Bookings</h1>
                    <p className="text-slate-500 mt-1 text-sm">Track and manage all your turf reservations</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-surface-low rounded-xl p-1 mb-6 w-fit">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-h-[44px] ${activeTab === 'upcoming'
                            ? 'bg-white text-on-surface shadow-sm'
                            : 'text-slate-500 hover:text-on-surface'
                            }`}
                    >
                        Upcoming
                        {upcomingBookings.length > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-secondary text-white text-[10px] font-bold">
                                {upcomingBookings.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-h-[44px] ${activeTab === 'past'
                            ? 'bg-white text-on-surface shadow-sm'
                            : 'text-slate-500 hover:text-on-surface'
                            }`}
                    >
                        Past
                        {pastBookings.length > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-400 text-white text-[10px] font-bold">
                                {pastBookings.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="loading-spinner h-10 w-10" />
                        <p className="text-slate-400 text-sm font-medium">Loading your bookings…</p>
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="h-20 w-20 rounded-full bg-surface-low flex items-center justify-center mb-5">
                            <span className="material-symbols-outlined text-4xl text-slate-300">
                                {activeTab === 'upcoming' ? 'event_busy' : 'history'}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-on-surface font-headline mb-2">
                            {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
                        </h2>
                        <p className="text-slate-500 text-sm mb-6 max-w-xs">
                            {activeTab === 'upcoming'
                                ? 'Ready to play? Find and book a turf near you.'
                                : 'Your completed and cancelled bookings will appear here.'}
                        </p>
                        {activeTab === 'upcoming' && (
                            <Link
                                to="/browse"
                                className="btn-gradient inline-flex items-center gap-2 px-6 py-3 font-bold text-sm"
                            >
                                <span className="material-symbols-outlined text-[18px]">search</span>
                                Browse Turfs
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayed.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onCancel={activeTab === 'upcoming' ? handleCancel : undefined}
                                cancelling={cancellingId === booking.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
