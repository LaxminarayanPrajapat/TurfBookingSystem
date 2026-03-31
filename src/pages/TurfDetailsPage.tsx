import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTurfStore } from '../store/turfStore';
import { useAuthStore } from '../store/authStore';
import BookingSidebar from '../components/BookingSidebar';

const AMENITIES = [
    { icon: 'wb_twilight', label: 'Floodlights' },
    { icon: 'meeting_room', label: 'Changing Rooms' },
    { icon: 'local_parking', label: 'Parking' },
    { icon: 'sports_cricket', label: 'Pitch Type' },
];

const TURF_RULES = [
    'No metal spikes allowed on the turf surface.',
    'Booking must be cancelled at least 2 hours in advance.',
    'Maximum 22 players per session.',
    'Bring your own equipment — rental not guaranteed.',
    'No food or drinks allowed on the pitch.',
];

const TurfDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { selectedTurf, loading, fetchTurfById } = useTurfStore();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (id) {
            fetchTurfById(id);
        }
    }, [id, fetchTurfById]);

    const handleProceedToBooking = () => {
        if (isAuthenticated) {
            navigate(`/booking/${id}`);
        } else {
            navigate('/login');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="loading-spinner w-10 h-10"></div>
            </div>
        );
    }

    // Not found state
    if (!selectedTurf) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <span className="material-symbols-outlined text-6xl text-gray-300">sports_cricket</span>
                <h2 className="text-2xl font-semibold text-on-surface" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    Turf not found
                </h2>
                <p className="text-gray-500 text-sm">We couldn't find the turf you're looking for.</p>
                <Link
                    to="/browse"
                    className="btn-gradient px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                    Back to Browse
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8 flex flex-col lg:flex-row gap-8">
            {/* Left column */}
            <div className="flex-1 space-y-8">

                {/* 8.1 Hero Section */}
                <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden shadow-lg group">
                    {selectedTurf.images && selectedTurf.images[0] ? (
                        <img
                            src={selectedTurf.images[0]}
                            alt={selectedTurf.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 to-secondary/80 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-8xl opacity-40">sports_cricket</span>
                        </div>
                    )}
                    {/* Gradient overlay */}
                    <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85))' }}
                    />
                    {/* Turf name overlay */}
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                        <span className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
                            Premium Turf
                        </span>
                        <h1
                            className="text-3xl md:text-4xl font-black leading-tight"
                            style={{ fontFamily: 'Lexend, sans-serif' }}
                        >
                            {selectedTurf.name}
                        </h1>
                        <p className="mt-1 flex items-center gap-1.5 text-slate-200 text-sm">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {selectedTurf.location}
                        </p>
                    </div>
                </div>

                {/* 8.2 Amenities Section */}
                <section className="rounded-xl bg-white p-6 shadow-sm">
                    <h3
                        className="text-xl font-bold mb-4 text-on-surface"
                        style={{ fontFamily: 'Lexend, sans-serif' }}
                    >
                        Turf Amenities
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {AMENITIES.map(({ icon, label }) => (
                            <div
                                key={label}
                                className="flex flex-col items-center gap-2 rounded-lg p-4"
                                style={{ backgroundColor: '#f3f4f5' }}
                            >
                                <span
                                    className="material-symbols-outlined text-2xl"
                                    style={{ color: '#3b6934' }}
                                >
                                    {icon}
                                </span>
                                <span className="text-xs font-semibold text-on-surface text-center">{label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Description */}
                {selectedTurf.description && (
                    <section className="rounded-xl bg-white p-6 shadow-sm">
                        <h3
                            className="text-xl font-bold mb-3 text-on-surface"
                            style={{ fontFamily: 'Lexend, sans-serif' }}
                        >
                            About this Turf
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{selectedTurf.description}</p>
                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-secondary">group</span>
                                Capacity: {selectedTurf.capacity} players
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-secondary">star</span>
                                {selectedTurf.rating.toFixed(1)} ({selectedTurf.reviewCount} reviews)
                            </span>
                            {selectedTurf.pitchType && (
                                <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base text-secondary">sports_cricket</span>
                                    {selectedTurf.pitchType}
                                </span>
                            )}
                        </div>
                    </section>
                )}

                {/* 8.4 Turf Rules Section */}
                <section className="rounded-xl bg-white p-6 shadow-sm">
                    <h3
                        className="text-xl font-bold mb-4 text-on-surface"
                        style={{ fontFamily: 'Lexend, sans-serif' }}
                    >
                        Turf Rules &amp; Guidelines
                    </h3>
                    <ul className="space-y-3">
                        {TURF_RULES.map((rule, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-sm mt-0.5 text-primary">check_circle</span>
                                <span className="text-sm text-gray-700">{rule}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* 8.3 Right Sidebar */}
            <div className="w-full lg:w-96">
                <BookingSidebar
                    turfName={selectedTurf.name}
                    selectedDate={null}
                    selectedSlots={[]}
                    slotLabels={[]}
                    pricePerHour={selectedTurf.pricePerHour}
                    ctaLabel="Proceed to Booking"
                    onCtaClick={handleProceedToBooking}
                />
            </div>
        </div>
    );
};

export default TurfDetailsPage;
