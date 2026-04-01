import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTurfStore } from '../store/turfStore';
import { useAuthStore } from '../store/authStore';
import type { Turf } from '../types';

// ── Filter state types ──────────────────────────────────────────────────────
type PriceRange = 'all' | 'under500' | '500to1000' | 'above1000';
type SortBy = 'popularity' | 'price_asc' | 'price_desc' | 'newest';
type PitchType = 'all' | 'indoor' | 'outdoor' | 'synthetic' | 'grass';

// ── Filter chip component ───────────────────────────────────────────────────
const FilterChip = ({
    icon,
    label,
    active,
    onClick,
}: {
    icon: string;
    label: string;
    active?: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`flex min-h-[44px] items-center justify-center gap-x-2 rounded-xl border px-4 text-sm font-medium transition-all ${active
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-gray-200 bg-white text-gray-700 hover:border-primary'
            }`}
    >
        <span className="material-symbols-outlined text-lg">{icon}</span>
        <span>{label}</span>
        <span className="material-symbols-outlined text-lg">expand_more</span>
    </button>
);

// ── Turf grid card ──────────────────────────────────────────────────────────
const TurfCard = ({
    turf,
    onViewDetails,
    onBookNow,
}: {
    turf: Turf;
    onViewDetails: () => void;
    onBookNow: () => void;
}) => (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-200 hover:shadow-lg transition-all group">
        {/* Image */}
        <div className="relative h-56 bg-center bg-no-repeat bg-cover bg-gray-200"
            style={turf.images?.[0] ? { backgroundImage: `url(${turf.images[0]})` } : undefined}>
            {!turf.images?.[0] && (
                <div className="absolute inset-0 flex items-center justify-center text-5xl">🏟️</div>
            )}
            {/* Rating badge */}
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-sm text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-xs font-bold">{turf.rating.toFixed(1)}</span>
                {turf.reviewCount > 0 && (
                    <span className="text-[10px] text-gray-400">({turf.reviewCount})</span>
                )}
            </div>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-2">
                <h3
                    className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors cursor-pointer"
                    onClick={onViewDetails}
                >
                    {turf.name}
                </h3>
                {turf.isAvailable ? (
                    <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded whitespace-nowrap">
                        Open Now
                    </span>
                ) : (
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                        Unavailable
                    </span>
                )}
            </div>

            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">location_on</span>
                {turf.location}
            </p>

            {/* Amenity tags */}
            {turf.amenities?.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-4">
                    {turf.amenities.slice(0, 2).map((a) => (
                        <span
                            key={a}
                            className="bg-gray-100 text-gray-600 text-[11px] font-bold px-2 py-1 rounded uppercase"
                        >
                            {a}
                        </span>
                    ))}
                </div>
            )}

            {/* Price + actions */}
            <div className="mt-auto flex items-center justify-between pt-2">
                <div>
                    <p className="text-lg font-black text-on-surface">
                        ₹{turf.pricePerHour}
                        <span className="text-xs font-normal text-gray-500">/hr</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onViewDetails}
                        className="text-sm font-bold px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-primary hover:text-primary transition-all min-h-[44px]"
                    >
                        View Details
                    </button>
                    <button
                        onClick={onBookNow}
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-bold text-sm px-4 py-2 rounded-lg min-h-[44px]"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ── Main page ───────────────────────────────────────────────────────────────
const BrowseTurfsPage = () => {
    const navigate = useNavigate();
    const { turfs, loading, fetchAllTurfs, error } = useTurfStore();
    const { isAuthenticated } = useAuthStore();

    // Search & filter state
    const [search, setSearch] = useState('');
    const [priceRange, setPriceRange] = useState<PriceRange>('all');
    const [availabilityOnly, setAvailabilityOnly] = useState(false);
    const [pitchType, setPitchType] = useState<PitchType>('all');
    const [sortBy, setSortBy] = useState<SortBy>('popularity');

    // Dropdown open state
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    useEffect(() => {
        fetchAllTurfs();
    }, [fetchAllTurfs]);

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = () => setOpenDropdown(null);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    // ── Client-side filtering & sorting ──────────────────────────────────────
    const filteredTurfs = useMemo(() => {
        let result = [...turfs];

        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (t) =>
                    t.name.toLowerCase().includes(q) ||
                    t.location.toLowerCase().includes(q)
            );
        }

        // Availability
        if (availabilityOnly) {
            result = result.filter((t) => t.isAvailable);
        }

        // Price range
        if (priceRange === 'under500') {
            result = result.filter((t) => t.pricePerHour < 500);
        } else if (priceRange === '500to1000') {
            result = result.filter((t) => t.pricePerHour >= 500 && t.pricePerHour <= 1000);
        } else if (priceRange === 'above1000') {
            result = result.filter((t) => t.pricePerHour > 1000);
        }

        // Pitch type
        if (pitchType !== 'all') {
            result = result.filter(
                (t) => t.pitchType?.toLowerCase() === pitchType
            );
        }

        // Sort
        if (sortBy === 'price_asc') {
            result.sort((a, b) => a.pricePerHour - b.pricePerHour);
        } else if (sortBy === 'price_desc') {
            result.sort((a, b) => b.pricePerHour - a.pricePerHour);
        } else if (sortBy === 'newest') {
            result.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        } else {
            // popularity = rating desc
            result.sort((a, b) => b.rating - a.rating);
        }

        return result;
    }, [turfs, search, availabilityOnly, priceRange, pitchType, sortBy]);

    // Featured turf: first with featured=true, else first turf
    const featuredTurf: Turf | null = useMemo(
        () => turfs.find((t) => t.featured) ?? turfs[0] ?? null,
        [turfs]
    );

    // Grid turfs: exclude featured from grid
    const gridTurfs = useMemo(
        () =>
            featuredTurf
                ? filteredTurfs.filter((t) => t.id !== featuredTurf.id)
                : filteredTurfs,
        [filteredTurfs, featuredTurf]
    );

    const handleBookNow = (turfId: string) => {
        if (isAuthenticated) {
            navigate(`/booking/${turfId}`);
        } else {
            navigate('/login');
        }
    };

    const handleViewDetails = (turfId: string) => {
        navigate(`/turf/${turfId}`);
    };

    const sortLabels: Record<SortBy, string> = {
        popularity: 'Popularity',
        price_asc: 'Price: Low → High',
        price_desc: 'Price: High → Low',
        newest: 'Newest',
    };

    const priceLabels: Record<PriceRange, string> = {
        all: 'Price Range',
        under500: 'Under ₹500',
        '500to1000': '₹500 – ₹1000',
        above1000: 'Above ₹1000',
    };

    const pitchLabels: Record<PitchType, string> = {
        all: 'Pitch Type',
        indoor: 'Indoor',
        outdoor: 'Outdoor',
        synthetic: 'Synthetic',
        grass: 'Grass',
    };

    const stopProp = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div className="relative flex min-h-screen flex-col bg-surface">
            <main className="flex-1 px-4 sm:px-6 lg:px-40 py-8 pb-24 md:pb-8">
                {/* Hero */}
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-on-surface text-4xl font-black leading-tight tracking-tight font-headline">
                        Discover Cricket Turfs
                    </h1>
                    <p className="text-gray-500 text-lg">
                        Find and book the highest-rated pitches in your city.
                    </p>
                </div>

                {/* Search bar */}
                <div className="mb-6">
                    <div className="flex w-full max-w-md items-stretch rounded-xl h-11 border border-gray-200 bg-white">
                        <div className="text-gray-400 flex items-center justify-center pl-3">
                            <span className="material-symbols-outlined text-xl">search</span>
                        </div>
                        <input
                            className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:outline-none focus:ring-0 text-sm placeholder:text-gray-400 px-3"
                            placeholder="Search areas or turfs"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filter chips */}
                <div className="flex flex-wrap gap-3 mb-10 pb-4 border-b border-gray-200 relative">
                    {/* Location chip (static label, no filter logic needed) */}
                    <div className="relative" onClick={stopProp}>
                        <FilterChip
                            icon="location_on"
                            label="Location"
                            onClick={() =>
                                setOpenDropdown(openDropdown === 'location' ? null : 'location')
                            }
                        />
                        {openDropdown === 'location' && (
                            <div className="absolute top-12 left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-[160px]">
                                <p className="text-xs text-gray-400 px-2 py-1">Filter by location coming soon</p>
                            </div>
                        )}
                    </div>

                    {/* Price Range */}
                    <div className="relative" onClick={stopProp}>
                        <FilterChip
                            icon="payments"
                            label={priceLabels[priceRange]}
                            active={priceRange !== 'all'}
                            onClick={() =>
                                setOpenDropdown(openDropdown === 'price' ? null : 'price')
                            }
                        />
                        {openDropdown === 'price' && (
                            <div className="absolute top-12 left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-[180px]">
                                {(['all', 'under500', '500to1000', 'above1000'] as PriceRange[]).map(
                                    (opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                setPriceRange(opt);
                                                setOpenDropdown(null);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${priceRange === opt
                                                ? 'bg-primary/10 text-primary font-semibold'
                                                : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            {priceLabels[opt]}
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* Availability */}
                    <div className="relative" onClick={stopProp}>
                        <FilterChip
                            icon="event_available"
                            label="Availability"
                            active={availabilityOnly}
                            onClick={() => setAvailabilityOnly((v) => !v)}
                        />
                    </div>

                    {/* Pitch Type */}
                    <div className="relative" onClick={stopProp}>
                        <FilterChip
                            icon="layers"
                            label={pitchLabels[pitchType]}
                            active={pitchType !== 'all'}
                            onClick={() =>
                                setOpenDropdown(openDropdown === 'pitch' ? null : 'pitch')
                            }
                        />
                        {openDropdown === 'pitch' && (
                            <div className="absolute top-12 left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-[160px]">
                                {(['all', 'indoor', 'outdoor', 'synthetic', 'grass'] as PitchType[]).map(
                                    (opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                setPitchType(opt);
                                                setOpenDropdown(null);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${pitchType === opt
                                                ? 'bg-primary/10 text-primary font-semibold'
                                                : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            {pitchLabels[opt]}
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sort By */}
                    <div className="ml-auto flex items-center gap-2 relative" onClick={stopProp}>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:inline">
                            Sort By:
                        </span>
                        <button
                            onClick={() =>
                                setOpenDropdown(openDropdown === 'sort' ? null : 'sort')
                            }
                            className="text-sm font-bold text-primary flex items-center gap-1"
                        >
                            {sortLabels[sortBy]}
                            <span className="material-symbols-outlined text-lg">sort</span>
                        </button>
                        {openDropdown === 'sort' && (
                            <div className="absolute top-10 right-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-[200px]">
                                {(['popularity', 'price_asc', 'price_desc', 'newest'] as SortBy[]).map(
                                    (opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                setSortBy(opt);
                                                setOpenDropdown(null);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${sortBy === opt
                                                ? 'bg-primary/10 text-primary font-semibold'
                                                : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            {sortLabels[opt]}
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="loading-spinner w-10 h-10"></div>
                    </div>
                ) : (
                    <>
                        {/* Featured Turf Card */}
                        {featuredTurf && (
                            <div className="mb-10 group">
                                <div className="flex flex-col md:flex-row items-stretch rounded-2xl overflow-hidden shadow-sm bg-white border border-gray-200 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                                    {/* Image */}
                                    <div
                                        className="w-full md:w-2/5 bg-center bg-no-repeat bg-cover aspect-video relative bg-gray-200"
                                        style={
                                            featuredTurf.images?.[0]
                                                ? { backgroundImage: `url(${featuredTurf.images[0]})` }
                                                : undefined
                                        }
                                    >
                                        {!featuredTurf.images?.[0] && (
                                            <div className="absolute inset-0 flex items-center justify-center text-6xl">🏟️</div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                                            Featured
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex w-full md:w-3/5 grow flex-col items-stretch justify-between p-6 lg:p-8">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h2 className="text-on-surface text-2xl font-bold leading-tight tracking-tight font-headline">
                                                    {featuredTurf.name}
                                                </h2>
                                                <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-700 px-2 py-1 rounded-lg shrink-0 ml-2">
                                                    <span
                                                        className="material-symbols-outlined text-sm"
                                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                                    >
                                                        star
                                                    </span>
                                                    <span className="text-sm font-bold">
                                                        {featuredTurf.rating.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-gray-500 mb-4">
                                                <span className="flex items-center gap-1 text-sm">
                                                    <span className="material-symbols-outlined text-base">location_on</span>
                                                    {featuredTurf.location}
                                                </span>
                                                {featuredTurf.pitchType && (
                                                    <span className="flex items-center gap-1 text-sm">
                                                        <span className="material-symbols-outlined text-base">layers</span>
                                                        {featuredTurf.pitchType}
                                                    </span>
                                                )}
                                                {featuredTurf.amenities?.slice(0, 2).map((a) => (
                                                    <span key={a} className="flex items-center gap-1 text-sm">
                                                        <span className="material-symbols-outlined text-base">check_circle</span>
                                                        {a}
                                                    </span>
                                                ))}
                                            </div>

                                            {featuredTurf.description && (
                                                <p className="text-gray-500 mb-4 line-clamp-2 text-sm">
                                                    {featuredTurf.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase">Starting from</p>
                                                <p className="text-2xl font-black text-on-surface">
                                                    ₹{featuredTurf.pricePerHour}
                                                    <span className="text-sm font-normal text-gray-500">/hr</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleViewDetails(featuredTurf.id)}
                                                    className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:border-primary hover:text-primary transition-all"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => handleBookNow(featuredTurf.id)}
                                                    className="btn-gradient flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden h-12 px-6 text-sm font-bold leading-normal hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                                                >
                                                    Book Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grid */}
                        {gridTurfs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {gridTurfs.map((turf) => (
                                    <TurfCard
                                        key={turf.id}
                                        turf={turf}
                                        onViewDetails={() => handleViewDetails(turf.id)}
                                        onBookNow={() => handleBookNow(turf.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            !featuredTurf && (
                                <div className="text-center py-20">
                                    <span className="material-symbols-outlined text-6xl text-gray-300">
                                        sports_cricket
                                    </span>
                                    <p className="text-xl text-gray-500 mt-4 font-semibold">No turfs found</p>
                                    <p className="text-gray-400 mt-1">Try adjusting your filters</p>
                                </div>
                            )
                        )}
                    </>
                )}
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 flex justify-between items-center z-50">
                <Link to="/" className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary transition-colors min-h-[56px]">
                    <span className="material-symbols-outlined">home</span>
                    <span className="text-[10px] font-bold uppercase">Home</span>
                </Link>
                <Link to="/browse" className="flex flex-col items-center justify-center gap-1 text-primary min-h-[56px]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
                    <span className="text-[10px] font-bold uppercase">Browse</span>
                </Link>
                <Link to="/my-bookings" className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary transition-colors min-h-[56px]">
                    <span className="material-symbols-outlined">calendar_today</span>
                    <span className="text-[10px] font-bold uppercase">Bookings</span>
                </Link>
                <Link to="/profile" className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary transition-colors min-h-[56px]">
                    <span className="material-symbols-outlined">person</span>
                    <span className="text-[10px] font-bold uppercase">Profile</span>
                </Link>
            </div>
        </div>
    );
};

export default BrowseTurfsPage;
