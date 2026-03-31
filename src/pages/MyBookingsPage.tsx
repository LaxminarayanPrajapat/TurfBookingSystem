import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { formatDate, formatTime } from '../utils/helpers';
import { FiCalendar, FiClock, FiDollarSign, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const MyBookingsPage = () => {
    const { user } = useAuthStore();
    const { bookings, loading, fetchUserBookings, cancelBooking } = useBookingStore();

    useEffect(() => {
        if (user) {
            fetchUserBookings(user.id);
        }
    }, [user, fetchUserBookings]);

    const handleCancelBooking = async (bookingId: string) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await cancelBooking(bookingId);
                toast.success('Booking cancelled successfully');
            } catch (error: any) {
                toast.error(error.message || 'Failed to cancel booking');
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container-max py-8">
            <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <div className="loading-spinner"></div>
                </div>
            ) : bookings.length > 0 ? (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="card">
                            <div className="grid md:grid-cols-5 gap-4 items-center">
                                <div>
                                    <p className="text-gray-600 text-sm">Date</p>
                                    <div className="flex items-center gap-2">
                                        <FiCalendar size={18} className="text-blue-600" />
                                        <span className="font-semibold">{formatDate(booking.startTime)}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-gray-600 text-sm">Time</p>
                                    <div className="flex items-center gap-2">
                                        <FiClock size={18} className="text-blue-600" />
                                        <span className="font-semibold">
                                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-gray-600 text-sm">Price</p>
                                    <div className="flex items-center gap-2">
                                        <FiDollarSign size={18} className="text-blue-600" />
                                        <span className="font-semibold">₹{booking.totalPrice}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-gray-600 text-sm">Status</p>
                                    <span className={`badge ${getStatusColor(booking.status)}`}>
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    {booking.status === 'pending' || booking.status === 'confirmed' ? (
                                        <button
                                            onClick={() => handleCancelBooking(booking.id)}
                                            className="btn-danger text-sm flex items-center gap-2"
                                        >
                                            <FiTrash2 />
                                            Cancel
                                        </button>
                                    ) : (
                                        <span className="text-gray-500 text-sm">No actions</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <p className="text-2xl text-gray-600 mb-4">No bookings yet</p>
                    <p className="text-gray-500 mb-6">Start booking turfs to see them here</p>
                    <a href="/browse" className="btn-primary">
                        Browse Turfs
                    </a>
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;
