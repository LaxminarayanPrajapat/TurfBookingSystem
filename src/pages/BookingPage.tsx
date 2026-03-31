import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTurfStore } from '../store/turfStore';
import { useBookingStore } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { calculateDuration, calculateTotalPrice } from '../utils/helpers';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const BookingPage = () => {
    const { turfId } = useParams<{ turfId: string }>();
    const navigate = useNavigate();
    const { selectedTurf, fetchTurfById } = useTurfStore();
    const { createBooking, loading: bookingLoading } = useBookingStore();
    const { user } = useAuthStore();

    const [date, setDate] = useState<Date>(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (turfId) {
            fetchTurfById(turfId);
        }
    }, [turfId]);

    const calculatePrice = () => {
        if (!selectedTurf || !startTime || !endTime) return 0;
        const start = new Date(`${date.toDateString()} ${startTime}`);
        const end = new Date(`${date.toDateString()} ${endTime}`);
        const duration = calculateDuration(start, end);
        return calculateTotalPrice(selectedTurf.pricePerHour, duration);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTurf || !user) {
            toast.error('Missing information');
            return;
        }

        if (!startTime || !endTime) {
            toast.error('Please select start and end times');
            return;
        }

        const startDateTime = new Date(`${date.toDateString()} ${startTime}`);
        const endDateTime = new Date(`${date.toDateString()} ${endTime}`);

        if (startDateTime >= endDateTime) {
            toast.error('End time must be after start time');
            return;
        }

        setLoading(true);
        try {
            const bookingId = await createBooking({
                turfId: selectedTurf.id,
                userId: user.id,
                startTime: startDateTime,
                endTime: endDateTime,
                totalPrice: calculatePrice(),
                status: 'pending',
                paymentStatus: 'pending',
                specialRequests: specialRequests || undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            toast.success('Booking created! Proceed to payment.');
            navigate(`/booking/${bookingId}/payment`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    if (!selectedTurf) {
        return (
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <p className="text-2xl text-gray-600">Loading turf details...</p>
            </div>
        );
    }

    const timeOptions = Array.from({ length: 16 }, (_, i) => {
        const hour = i + 6;
        return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
    });

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8">
            <div className="grid md:grid-cols-3 gap-8">
                {/* Booking Form */}
                <div className="md:col-span-2">
                    <h1 className="text-3xl font-bold mb-6">Book {selectedTurf.name}</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Date Selection */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-bold mb-4">Select Date</h3>
                            <Calendar
                                value={date}
                                onChange={(value) => setDate(value as Date)}
                                minDate={new Date()}
                                className="w-full"
                            />
                        </div>

                        {/* Time Selection */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-bold mb-4">Select Time</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Start Time</label>
                                    <select
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select start time</option>
                                        {timeOptions.map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">End Time</label>
                                    <select
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select end time</option>
                                        {timeOptions.map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Special Requests */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-bold mb-4">Special Requests</h3>
                            <textarea
                                value={specialRequests}
                                onChange={(e) => setSpecialRequests(e.target.value)}
                                placeholder="Any special requests or requirements?"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={bookingLoading || loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
                        >
                            {loading ? 'Processing...' : 'Proceed to Payment'}
                        </button>
                    </form>
                </div>

                {/* Booking Summary */}
                <div className="bg-white rounded-lg shadow p-6 h-fit">
                    <h3 className="text-xl font-bold mb-4">Booking Summary</h3>

                    <div className="space-y-3 border-b pb-4 mb-4">
                        <div>
                            <p className="text-gray-600 text-sm">Turf</p>
                            <p className="font-semibold">{selectedTurf.name}</p>
                        </div>

                        <div>
                            <p className="text-gray-600 text-sm">Date</p>
                            <p className="font-semibold">{date.toDateString()}</p>
                        </div>

                        {startTime && endTime && (
                            <div>
                                <p className="text-gray-600 text-sm">Time</p>
                                <p className="font-semibold">
                                    {startTime} - {endTime}
                                </p>
                            </div>
                        )}

                        {startTime && endTime && (
                            <div>
                                <p className="text-gray-600 text-sm">Duration</p>
                                <p className="font-semibold">
                                    {calculateDuration(
                                        new Date(`${date.toDateString()} ${startTime}`),
                                        new Date(`${date.toDateString()} ${endTime}`)
                                    )} hours
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Price per hour</span>
                            <span className="font-semibold">₹{selectedTurf.pricePerHour}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t">
                            <span>Total</span>
                            <span>₹{calculatePrice()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
