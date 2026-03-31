import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTurfStore } from '../store/turfStore';
import { useBookingStore } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import CustomCalendar from '../components/CustomCalendar';
import TimeSlotGrid from '../components/TimeSlotGrid';
import type { TimeSlot } from '../types';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeSlotId(turfId: string, date: Date, hour: number) {
    return `${turfId}_${date.toISOString().slice(0, 10)}_${hour.toString().padStart(2, '0')}`;
}

function formatHour(hour: number) {
    return `${hour.toString().padStart(2, '0')}:00`;
}

function formatDate(date: Date) {
    return date.toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
}

// ─── component ──────────────────────────────────────────────────────────────

const TournamentBookingPage = () => {
    const { turfId } = useParams<{ turfId: string }>();
    const navigate = useNavigate();
    const { selectedTurf, fetchTurfById, loading: turfLoading } = useTurfStore();
    const { createBooking, getAvailableSlots, loading: bookingLoading } = useBookingStore();
    const { user } = useAuthStore();

    // ── form state ──────────────────────────────────────────────────────────
    const [tournamentName, setTournamentName] = useState('');
    const [teamCount, setTeamCount] = useState('');
    const [format, setFormat] = useState<'single_day' | 'multi_day'>('single_day');
    const [specialRequirements, setSpecialRequirements] = useState('');

    // ── scheduling state ────────────────────────────────────────────────────
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    // ── validation errors ───────────────────────────────────────────────────
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (turfId) fetchTurfById(turfId);
    }, [turfId]);

    // Reset end date when switching to single day
    useEffect(() => {
        if (format === 'single_day') setEndDate(null);
    }, [format]);

    const loadSlots = useCallback(async (date: Date) => {
        if (!turfId) return;
        setSlotsLoading(true);
        try {
            const raw = await getAvailableSlots(turfId, date);
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
        setErrors(prev => ({ ...prev, date: '' }));
    };

    const handleSlotToggle = (slotId: string) => {
        setSelectedSlotIds(prev =>
            prev.includes(slotId) ? prev.filter(id => id !== slotId) : [...prev, slotId]
        );
        setErrors(prev => ({ ...prev, slots: '' }));
    };

    // ── price calculation ───────────────────────────────────────────────────
    const pricePerHour = selectedTurf?.pricePerHour ?? 0;
    const duration = selectedSlotIds.length;

    // For multi-day, multiply by number of days
    const dayCount = (format === 'multi_day' && selectedDate && endDate)
        ? Math.max(1, Math.round((endDate.getTime() - selectedDate.getTime()) / 86400000) + 1)
        : 1;

    const subtotal = duration * pricePerHour * dayCount;
    const tournamentFee = Math.round(subtotal * 0.1);
    const tax = Math.round((subtotal + tournamentFee) * 0.18);
    const total = subtotal + tournamentFee + tax;

    // ── slot labels ─────────────────────────────────────────────────────────
    const slotLabels = selectedSlotIds
        .map(id => slots.find(s => s.id === id))
        .filter(Boolean)
        .sort((a, b) => a!.startTime.localeCompare(b!.startTime))
        .map(s => `${s!.startTime}–${s!.endTime}`);

    // ── validation ──────────────────────────────────────────────────────────
    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!tournamentName.trim()) newErrors.tournamentName = 'Tournament name is required';
        if (!teamCount || parseInt(teamCount) < 2) newErrors.teamCount = 'At least 2 teams required';
        if (!selectedDate) newErrors.date = 'Please select a start date';
        if (format === 'multi_day' && !endDate) newErrors.endDate = 'Please select an end date';
        if (selectedSlotIds.length === 0) newErrors.slots = 'Please select at least one time slot';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!selectedTurf || !user) return;
        if (!validate()) {
            toast.error('Please fill in all required fields');
            return;
        }

        const selectedSlotObjs = slots
            .filter(s => selectedSlotIds.includes(s.id))
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

        const startHour = parseInt(selectedSlotObjs[0].startTime.split(':')[0]);
        const endHour = parseInt(selectedSlotObjs[selectedSlotObjs.length - 1].endTime.split(':')[0]);

        const startDateTime = new Date(selectedDate!);
        startDateTime.setHours(startHour, 0, 0, 0);

        const endDateTime = new Date(format === 'multi_day' && endDate ? endDate : selectedDate!);
        endDateTime.setHours(endHour, 0, 0, 0);

        try {
            await createBooking({
                turfId: selectedTurf.id,
                turfName: selectedTurf.name,
                userId: user.id,
                startTime: startDateTime,
                endTime: endDateTime,
                totalPrice: total,
                status: 'pending',
                paymentStatus: 'pending',
                bookingType: 'tournament',
                tournamentDetails: {
                    tournamentName: tournamentName.trim(),
                    teamCount: parseInt(teamCount),
                    format,
                },
                specialRequests: specialRequirements.trim() || undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            toast.success('Tournament booking submitted! Redirecting...');
            navigate('/my-bookings');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create booking');
        }
    };

    // ── loading / not found states ──────────────────────────────────────────
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
                            ? `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%), url(${turf.images[0]})`
                            : 'linear-gradient(135deg, #a04100, #ec5b13)',
                    }}
                />
                <div className="absolute bottom-0 left-0 px-6 pb-5 text-white">
                    <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
                        Tournament Booking
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

            <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* ── Left column ── */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Section: Tournament Details */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                <span className="material-symbols-outlined text-primary">info</span>
                                Tournament Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Tournament Name */}
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-semibold text-on-surface">
                                        Tournament Name <span className="text-red-500">*</span>
                                    </span>
                                    <input
                                        type="text"
                                        value={tournamentName}
                                        onChange={e => { setTournamentName(e.target.value); setErrors(p => ({ ...p, tournamentName: '' })); }}
                                        placeholder="e.g. Winter Champions Trophy"
                                        className={`rounded-xl border bg-surface-low px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.tournamentName ? 'border-red-400' : 'border-gray-200'}`}
                                    />
                                    {errors.tournamentName && <p className="text-xs text-red-500">{errors.tournamentName}</p>}
                                </label>

                                {/* Team Count */}
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-semibold text-on-surface">
                                        Number of Teams <span className="text-red-500">*</span>
                                    </span>
                                    <input
                                        type="number"
                                        min={2}
                                        value={teamCount}
                                        onChange={e => { setTeamCount(e.target.value); setErrors(p => ({ ...p, teamCount: '' })); }}
                                        placeholder="e.g. 8"
                                        className={`rounded-xl border bg-surface-low px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.teamCount ? 'border-red-400' : 'border-gray-200'}`}
                                    />
                                    {errors.teamCount && <p className="text-xs text-red-500">{errors.teamCount}</p>}
                                </label>

                                {/* Special Requirements — full width */}
                                <label className="flex flex-col gap-1.5 md:col-span-2">
                                    <span className="text-sm font-semibold text-on-surface">Special Requirements</span>
                                    <textarea
                                        rows={3}
                                        value={specialRequirements}
                                        onChange={e => setSpecialRequirements(e.target.value)}
                                        placeholder="Any special setup, equipment, or catering needs..."
                                        className="rounded-xl border border-gray-200 bg-surface-low px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                                    />
                                </label>
                            </div>
                        </section>

                        {/* Section: Tournament Format */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                <span className="material-symbols-outlined text-primary">category</span>
                                Tournament Format
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Single Day */}
                                <button
                                    type="button"
                                    onClick={() => setFormat('single_day')}
                                    className={`relative cursor-pointer border-2 rounded-xl p-4 flex items-center gap-4 transition-all text-left ${format === 'single_day' ? 'border-primary bg-orange-50' : 'border-gray-200 bg-white hover:border-primary/40'}`}
                                >
                                    <span className={`material-symbols-outlined text-3xl ${format === 'single_day' ? 'text-primary' : 'text-gray-400'}`}>calendar_today</span>
                                    <div className="flex-1">
                                        <p className="font-bold text-on-surface">Single Day</p>
                                        <p className="text-xs text-gray-500">Knockout / 1-Day Carnival</p>
                                    </div>
                                    {format === 'single_day' && (
                                        <span className="material-symbols-outlined text-primary">check_circle</span>
                                    )}
                                </button>

                                {/* Multi-Day */}
                                <button
                                    type="button"
                                    onClick={() => setFormat('multi_day')}
                                    className={`relative cursor-pointer border-2 rounded-xl p-4 flex items-center gap-4 transition-all text-left ${format === 'multi_day' ? 'border-primary bg-orange-50' : 'border-gray-200 bg-white hover:border-primary/40'}`}
                                >
                                    <span className={`material-symbols-outlined text-3xl ${format === 'multi_day' ? 'text-primary' : 'text-gray-400'}`}>event_repeat</span>
                                    <div className="flex-1">
                                        <p className="font-bold text-on-surface">Multi-Day League</p>
                                        <p className="text-xs text-gray-500">Group stages and playoffs</p>
                                    </div>
                                    {format === 'multi_day' && (
                                        <span className="material-symbols-outlined text-primary">check_circle</span>
                                    )}
                                </button>
                            </div>
                        </section>

                        {/* Section: Date & Time Slots */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                <span className="material-symbols-outlined text-primary">schedule</span>
                                Date &amp; Time Slots
                            </h3>

                            {/* Calendar(s) */}
                            {format === 'single_day' ? (
                                <div className="mb-6">
                                    <p className="text-sm font-semibold text-on-surface mb-3">Select Date <span className="text-red-500">*</span></p>
                                    <div className="rounded-xl bg-surface-low p-2">
                                        <CustomCalendar
                                            selectedDate={selectedDate}
                                            onDateSelect={handleDateSelect}
                                        />
                                    </div>
                                    {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <p className="text-sm font-semibold text-on-surface mb-3">Start Date <span className="text-red-500">*</span></p>
                                        <div className="rounded-xl bg-surface-low p-2">
                                            <CustomCalendar
                                                selectedDate={selectedDate}
                                                onDateSelect={handleDateSelect}
                                            />
                                        </div>
                                        {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-on-surface mb-3">End Date <span className="text-red-500">*</span></p>
                                        <div className="rounded-xl bg-surface-low p-2">
                                            <CustomCalendar
                                                selectedDate={endDate}
                                                onDateSelect={date => {
                                                    setEndDate(date);
                                                    setErrors(p => ({ ...p, endDate: '' }));
                                                }}
                                                disabledDates={selectedDate ? [] : []}
                                            />
                                        </div>
                                        {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Slot legend */}
                            <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4">
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

                            {/* Time slot grid */}
                            {selectedDate ? (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                                        Daily Slots — {formatDate(selectedDate)}
                                    </p>
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
                                    {errors.slots && <p className="text-xs text-red-500 mt-2">{errors.slots}</p>}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                                    <span className="material-symbols-outlined text-4xl">calendar_today</span>
                                    <p className="text-sm">Select a date to see available slots</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* ── Right column: Summary sidebar ── */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-20 flex flex-col gap-5">
                            {/* Booking Summary card */}
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                                <div className="btn-gradient px-6 py-5">
                                    <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                        Booking Summary
                                    </h3>
                                    <p className="text-white/70 text-xs mt-1">Review your tournament costs</p>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Venue */}
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary text-xl mt-0.5">stadium</span>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wide">Venue</p>
                                            <p className="font-semibold text-on-surface text-sm">{turf.name}</p>
                                        </div>
                                    </div>

                                    {/* Tournament name */}
                                    {tournamentName && (
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-primary text-xl mt-0.5">emoji_events</span>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Tournament</p>
                                                <p className="font-semibold text-on-surface text-sm">{tournamentName}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Format */}
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary text-xl mt-0.5">category</span>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wide">Format</p>
                                            <p className="font-semibold text-on-surface text-sm">
                                                {format === 'single_day' ? 'Single Day' : 'Multi-Day League'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary text-xl mt-0.5">calendar_today</span>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wide">Date(s)</p>
                                            <p className="font-medium text-on-surface text-sm">
                                                {selectedDate ? formatDate(selectedDate) : <span className="text-gray-400">Not selected</span>}
                                                {format === 'multi_day' && endDate && (
                                                    <> → {formatDate(endDate)}</>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Slots */}
                                    {slotLabels.length > 0 && (
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-primary text-xl mt-0.5">schedule</span>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Daily Slots</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {slotLabels.map((label, i) => (
                                                        <span key={i} className="text-xs bg-orange-50 text-primary border border-orange-200 rounded-full px-2 py-0.5">
                                                            {label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-100" />

                                    {/* Price breakdown */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-gray-500">
                                            <span>Base Rent ({duration}h × {dayCount}d × ₹{pricePerHour})</span>
                                            <span>₹{subtotal}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500">
                                            <span>Tournament Fee (10%)</span>
                                            <span>₹{tournamentFee}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500">
                                            <span>GST (18%)</span>
                                            <span>₹{tax}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-on-surface text-base border-t border-gray-100 pt-2">
                                            <span>Total Amount</span>
                                            <span className="text-primary text-xl">₹{total}</span>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={bookingLoading}
                                        className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${bookingLoading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'btn-gradient hover:opacity-90 shadow-lg'}`}
                                    >
                                        <span className="material-symbols-outlined text-base">payments</span>
                                        {bookingLoading ? 'Processing...' : 'Prepay & Confirm'}
                                    </button>

                                    <p className="text-center text-[10px] text-gray-400 px-2">
                                        By clicking "Prepay &amp; Confirm", you agree to our Tournament Booking Terms and Ground Regulations.
                                    </p>
                                </div>
                            </div>

                            {/* Support card */}
                            <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl">
                                <div className="flex gap-4 items-start">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <span className="material-symbols-outlined text-primary">help_outline</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-on-surface">Need help?</h4>
                                        <p className="text-sm text-gray-600 mt-1">Our booking managers are available 24/7 for customization.</p>
                                        <button className="text-primary text-sm font-bold mt-2 hover:underline">Contact Support</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentBookingPage;
