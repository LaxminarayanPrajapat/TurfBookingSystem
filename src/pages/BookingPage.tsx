import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTurfStore } from '../store/turfStore';
import { useBookingStore } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import CustomCalendar from '../components/CustomCalendar';
import TimeSlotGrid from '../components/TimeSlotGrid';
import BookingSidebar from '../components/BookingSidebar';
import type { TimeSlot } from '../types';

// Generate a stable slot id from turfId + date + hour
function makeSlotId(turfId: string, date: Date, hour: number) {
    return `${turfId}_${date.toISOString().slice(0, 10)}_${hour.toString().padStart(2, '0')}`;
}

function formatHour(hour: number) {
    return `${hour.toString().padStart(2, '0')}:00`;
}

const BookingPage = () => {
    const { turfId } = useParams<{ turfId: string }>();
    const navigate = useNavigate();
    const { selectedTurf, fetchTurfById, loading: turfLoading } = useTurfStore();
    const { createBooking, getAvailableSlots, loading: bookingLoading } = useBookingStore();
    const { user } = useAuthStore();

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    useEffect(() => {
        if (turfId) fetchTurfById(turfId);
    }, [turfId]);

    // Fetch available slots whenever date changes
    const loadSlots = useCallback(async (date: Date) => {
        if (!turfId) return;
        setSlotsLoading(true);
        try {
            const raw = await getAvailableSlots(turfId, date);
            // Map raw slots to TimeSlot shape
            const mapped: TimeSlot[] = raw.map((s: any) => {
                const hour = s.startTime instanceof Date
                    ? s.startTime.getHours()
                    : new Date(s.startTime).getHours();
                return {
                    id: makeSlotId(turfId, date, hour),
                    turfId: turfId,
                    date,
                    startTime: formatHour(hour),
                    endTime: formatHour(hour + 1),
                    isAvailable: s.isAvailable,
                    price: selectedTurf?.pricePerHour ?? 0,
                };
            });
            setSlots(mapped);
        } catch {
            toast.error('Failed to load available slots');
        } finally {
            setSlotsLoading(false);
        }
    }, [turfId, selectedTurf]);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedSlotIds([]);
        loadSlots(date);
    };

    const handleSlotToggle = (slotId: string) => {
        setSelectedSlotIds(prev =>
            prev.includes(slotId) ? prev.filter(id => id !== slotId) : [...prev, slotId]
        );
    };

    // Build human-readable labels for selected slots
    const slotLabels = selectedSlotIds.map(id => {
        const slot = slots.find(s => s.id === id);
        return slot ? `${slot.startTime}–${slot.endTime}` : id;
    }).sort();

    const handleProceed = async () => {
        if (!selectedTurf || !user) return;

        if (!selectedDate) {
            toast.error('Please select a date');
            return;
        }
        if (selectedSlotIds.length === 0) {
            toast.error('Please select at least one time slot');
            return;
        }

        // Build start/end from first and last selected slots
        const selectedSlotObjs = slots
            .filter(s => selectedSlotIds.includes(s.id))
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

        const firstSlot = selectedSlotObjs[0];
        const lastSlot = selectedSlotObjs[selectedSlotObjs.length - 1];

        const startHour = parseInt(firstSlot.startTime.split(':')[0]);
        const endHour = parseInt(lastSlot.endTime.split(':')[0]);

        const startDateTime = new Date(selectedDate);
        startDateTime.setHours(startHour, 0, 0, 0);
        const endDateTime = new Date(selectedDate);
        endDateTime.setHours(endHour, 0, 0, 0);

        const duration = selectedSlotIds.length;
        const subtotal = duration * selectedTurf.pricePerHour;
        const tax = Math.round(subtotal * 0.18);
        const totalPrice = subtotal + tax;

        try {
            await createBooking({
                turfId: selectedTurf.id,
                turfName: selectedTurf.name,
                userId: user.id,
                startTime: startDateTime,
                endTime: endDateTime,
                totalPrice,
                status: 'pending',
                paymentStatus: 'pending',
                bookingType: 'regular',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            toast.success('Booking confirmed! Redirecting to your bookings...');
            navigate('/my-bookings');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create booking');
        }
    };

    if (turfLoading && !selectedTurf) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <div className="loading-spinner" />
            </div>
        );
    }

    if (!selectedTurf) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-4">
                <span className="material-symbols-outlined text-5xl text-gray-300">stadium</span>
                <p className="text-on-surface font-semibold text-lg">Turf not found</p>
                <button onClick={() => navigate('/browse')} className="btn-gradient px-6 py-2 text-sm font-semibold rounded-full">
                    Browse Turfs
                </button>
            </div>
        );
    }

    const turf = selectedTurf;

    return (
        <div className="min-h-screen bg-surface">
            {/* Hero */}
            <div className="relative w-full h-48 md:h-64 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: turf.images?.[0]
                            ? `linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%), url(${turf.images[0]})`
                            : 'linear-gradient(135deg, #a04100, #ec5b13)',
                    }}
                />
                <div className="absolute bottom-0 left-0 px-6 pb-5 text-white">
                    <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
                        Book Slot
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black leading-tight" style={{ fontFamily: 'Lexend, sans-serif' }}>
                        {turf.name}
                    </h1>
                    <p className="flex items-center gap-1 text-slate-200 text-sm mt-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {turf.location}
                    </p>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">
                {/* Left column */}
                <div className="flex-1 space-y-6">
                    {/* Amenities */}
                    <section className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-on-surface mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>
                            Turf Amenities
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { icon: 'lightbulb', label: 'Floodlights' },
                                { icon: 'dry_cleaning', label: 'Changing Rooms' },
                                { icon: 'local_parking', label: 'Parking' },
                                { icon: 'sports_cricket', label: turf.pitchType || 'Cricket Pitch' },
                            ].map(({ icon, label }) => (
                                <div key={label} className="flex flex-col items-center gap-2 rounded-xl bg-surface-low p-4">
                                    <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
                                    <span className="text-xs font-semibold text-on-surface text-center">{label}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Date & Slot Selection */}
                    <section className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-on-surface" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                Select Date &amp; Time
                            </h3>
                            <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                                <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded-full bg-primary inline-block" /> Available
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" /> Booked
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded-full border-2 border-primary inline-block" /> Selected
                                </span>
                            </div>
                        </div>

                        {/* Calendar */}
                        <div className="mb-6 rounded-xl bg-surface-low p-2">
                            <CustomCalendar
                                selectedDate={selectedDate}
                                onDateSelect={handleDateSelect}
                            />
                        </div>

                        {/* Slots */}
                        {selectedDate ? (
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                                    Available Slots — {selectedDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </h4>
                                {slotsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="loading-spinner" />
                                    </div>
                                ) : (
                                    <TimeSlotGrid
                                        slots={slots}
                                        selectedSlots={selectedSlotIds}
                                        onSlotToggle={handleSlotToggle}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                                <span className="material-symbols-outlined text-4xl">calendar_today</span>
                                <p className="text-sm">Select a date to see available slots</p>
                            </div>
                        )}
                    </section>

                    {/* Turf Rules */}
                    <section className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-on-surface mb-4" style={{ fontFamily: 'Lexend, sans-serif' }}>
                            Turf Rules &amp; Guidelines
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { icon: 'check_circle', color: 'text-secondary', text: 'Proper cricket footwear is mandatory.' },
                                { icon: 'check_circle', color: 'text-secondary', text: 'Report 15 minutes prior to your booking slot.' },
                                { icon: 'check_circle', color: 'text-secondary', text: 'Hard leather balls allowed only in designated net areas.' },
                                { icon: 'cancel', color: 'text-red-500', text: 'No food or sugary drinks allowed on the turf surface.' },
                            ].map(({ icon, color, text }) => (
                                <li key={text} className="flex items-start gap-3">
                                    <span className={`material-symbols-outlined text-sm mt-0.5 ${color}`}>{icon}</span>
                                    <span className="text-sm text-on-surface">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {/* Right column — Booking Sidebar */}
                <div className="w-full lg:w-96">
                    <BookingSidebar
                        turfName={turf.name}
                        selectedDate={selectedDate}
                        selectedSlots={selectedSlotIds}
                        slotLabels={slotLabels}
                        pricePerHour={turf.pricePerHour}
                        ctaLabel={bookingLoading ? 'Processing...' : 'Proceed to Payment'}
                        onCtaClick={handleProceed}
                        ctaDisabled={bookingLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
