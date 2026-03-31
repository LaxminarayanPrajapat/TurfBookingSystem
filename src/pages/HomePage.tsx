import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTurfStore } from '../store/turfStore';
import type { Turf } from '../types';

const STATIC_TURFS: Partial<Turf>[] = [
    { id: '1', name: 'Elite Indoor Pavilion', location: 'Canary Wharf', rating: 4.9, pricePerHour: 25, pitchType: 'Indoor • 3 Lane', images: [] },
    { id: '2', name: 'Legacy Oval Park', location: 'West London', rating: 4.8, pricePerHour: 80, pitchType: 'Outdoor • 11-a-side', images: [] },
    { id: '3', name: 'Skyline Sports Roof', location: 'Downtown Hub', rating: 4.7, pricePerHour: 45, pitchType: 'Rooftop • 7-a-side', images: [] },
    { id: '4', name: 'Quick Nets Center', location: 'East Village', rating: 4.5, pricePerHour: 15, pitchType: 'Training • Singles', images: [] },
];

const AMENITIES = [
    { icon: 'lightbulb', title: 'Pro Floodlights', desc: 'Daylight-quality lighting for night matches without shadows.' },
    { icon: 'deck', title: 'Comfortable Dugouts', desc: 'Spacious team seating and gear storage at every pitch side.' },
    { icon: 'checkroom', title: 'Changing Rooms', desc: 'Private locker rooms with clean showers and drying areas.' },
    { icon: 'local_cafe', title: 'Refreshments', desc: 'On-site sports drinks, water stations, and healthy snacks.' },
    { icon: 'grass', title: 'Hybrid Turf', desc: 'Choice of premium synthetic mats or natural curated grass.' },
];

const TESTIMONIALS = [
    {
        name: 'James Wilson',
        team: 'Wandsworth Strikers',
        quote: '"The booking process is incredibly smooth. I used to spend hours calling different turfs, but now I can secure a pitch in under 30 seconds. The facilities at the Sky Dome are world-class."',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHmEErW8AnDMRM5LDFkTPihaJwZNWkNtUFrYRw_ThQlIESByuUPU-siC9dqivb77c600L8Hs53YXX5lRgjIn6KEILQZ5EJVx2UlKrwNZowFLkbjQ3eEbnvC5uFnwBAZ3dGXQWcFGhNKj0UqxZbUm6DagXMUjX9xbsfy-5Ib74Ea1jYlMSiByR200szf28XYkg9C30KKUEyzkvIPst9ZXSCTyNgktPQ094MH-BeyESwD8tHZ3eqXMwm0Xqcb3qtDvdnu5M9FRQTVvpg',
    },
    {
        name: 'Sarah Ahmed',
        team: 'City Cricketers',
        quote: '"Best turf management app I\'ve used. We play every Friday night and the floodlights at Legacy Grounds are amazing. The showers are always clean which is a huge plus."',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjjTXgtr2CmIrSotkfcj1bTawDuIK6ZnHJt0FfZe2_5aGTi9yFe8Ni7KBqEIicWvKKw484eCymZbGsGf3nxKS5IuXUXkuKg6ACFbk2nJM25CFCHxKt_PsyeY8mjk050nZStVZirkRgc2FjOdIIFEopA6Ot8u7nzsKZtpH_OkzWPxKUoZi2z0O4_Srmt-u6j4oLxcTw4HHJjVWpnVvTjD_xdTOOGOh2DAsLjhjGL8ls0MaD5MGkeSgN7bLD2LtXA5GIKTJuKeMxr9hn',
    },
    {
        name: 'David Chen',
        team: 'Amateur Pro',
        quote: '"Found a local indoor net for some late-night practice using CricTurf. The quality of the synthetic matting is perfect for batting drills. Highly recommend!"',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtkeUm7V7qydFTIal1m416q4JXFuDqBAiCqrAJGwuJnXn2fqYa9Lkr4bUE-cgBdtaWdYIzwL7Wc6-ghC_DAZNb22iCaojpNwMqDGUkhbmqchQs4_O4UbfoZTXYudSMHfZTspU-9bE5fAnAXZ20v_EMvZbCBmBKfpw0umwV3bODN8cxVbA2K0Atu8qsP6paGmgxjE5rVLIItESXZfqHfdlWcXSkxRNgRlO-QHoBf9_UCPZFc_mq2qeZHQhhGNSPYp6tgwa_Btb_2RbN',
    },
];

const FilledStar = () => (
    <span className="material-symbols-outlined text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
);

const HomePage = () => {
    const navigate = useNavigate();
    const { turfs, loading, fetchAllTurfs } = useTurfStore();

    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        fetchAllTurfs();
    }, [fetchAllTurfs]);

    const displayTurfs: Partial<Turf>[] = turfs.length > 0 ? turfs.slice(0, 4) : STATIC_TURFS;

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (location) params.set('location', location);
        if (date) params.set('date', date);
        navigate(`/browse${params.toString() ? `?${params.toString()}` : ''}`);
    };

    return (
        <div className="min-h-screen font-body text-on-surface">
            {/* ── Hero Section ── */}
            <header className="relative overflow-hidden bg-surface pb-20 pt-10 md:pt-16 lg:pb-32">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left: text + search */}
                    <div className="lg:col-span-7 z-10">
                        <span className="inline-block text-secondary font-bold text-sm tracking-widest mb-4 uppercase">
                            Find Your Perfect Pitch
                        </span>
                        <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.05] text-on-surface mb-8">
                            The Ultimate{' '}
                            <span className="text-primary italic">Playing Experience</span>{' '}
                            for Every Cricketer
                        </h1>
                        <p className="text-lg text-on-surface-variant max-w-xl mb-10 leading-relaxed">
                            Book world-class indoor and outdoor arenas equipped with premium amenities.
                            From 5-a-side nets to full-sized grounds, we have it all.
                        </p>

                        {/* Search bar */}
                        <div className="bg-surface-container-low p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-md max-w-2xl">
                            <div className="flex-1 flex items-center px-4 gap-3 bg-surface-container-lowest rounded-xl py-3">
                                <span className="material-symbols-outlined text-primary">location_on</span>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Enter your city or area"
                                    className="w-full bg-transparent border-none outline-none text-on-surface placeholder:text-zinc-400 font-medium"
                                />
                            </div>
                            <div className="flex-1 flex items-center px-4 gap-3 bg-surface-container-lowest rounded-xl py-3">
                                <span className="material-symbols-outlined text-primary">calendar_month</span>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none text-on-surface font-medium"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="btn-gradient font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <span>Search</span>
                                <span className="material-symbols-outlined">search</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: hero image */}
                    <div className="lg:col-span-5 relative">
                        <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBQDtcSbdgWpGT-xIRGOzLDG2-zWnBn6ZBmagRmgkRsTgr5GeQEhOLOxflsUp75vjGFJGsoWOlSRf6zwcLc13XkWe4pUWp86dWw4hzLVUf0ISDhBlLWveZYRerBaptsm25HMDmul8lXsyEKyTy0EMIS4Jq-eWqkNbr2De9QtPon53y2HBJ2LN45tCwZV-9KcnZ9R-1yWxzx-682syTCEwQvd1MXabI3Fey2No7A74oH72i8F2QvdDlfcV3lA3NnezbYVd1swwFvHES"
                                alt="Professional Cricket Player"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            {/* Gradient fallback shown behind image */}
                            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/80 to-primary-container/60" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 p-6 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full btn-gradient flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined">groups</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-lg">5,000+ Teams Active</p>
                                        <p className="text-white/80 text-sm">Join the largest cricket network</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-secondary-container opacity-30 rounded-full blur-[100px]" />
                    </div>
                </div>
            </header>

            {/* ── Features / Amenities Section ── */}
            <section className="py-24 bg-surface-container-low">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-secondary font-bold text-xs tracking-[0.3em] uppercase mb-4 block">
                            Engineered for Players
                        </span>
                        <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface">
                            Premium Arena Amenities
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {AMENITIES.map((a) => (
                            <div
                                key={a.icon}
                                className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm text-center hover:shadow-md transition-all"
                            >
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl">{a.icon}</span>
                                </div>
                                <h3 className="font-bold mb-2">{a.title}</h3>
                                <p className="text-sm text-on-surface-variant">{a.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Top Rated Arenas Section ── */}
            <section className="py-24 bg-surface">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div>
                            <span className="text-secondary font-bold text-sm tracking-widest mb-2 uppercase block">
                                Explore Local Grounds
                            </span>
                            <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface">
                                Top Rated Arenas
                            </h2>
                        </div>
                        <Link
                            to="/browse"
                            className="px-8 py-3 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all"
                        >
                            View All Venues
                        </Link>
                    </div>

                    {loading && turfs.length === 0 ? (
                        <div className="flex justify-center py-16">
                            <div className="loading-spinner w-10 h-10" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {displayTurfs.map((turf) => (
                                <div
                                    key={turf.id}
                                    onClick={() => navigate(`/turf/${turf.id}`)}
                                    className="group bg-surface-container-low rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer"
                                >
                                    <div className="relative h-56 overflow-hidden">
                                        {turf.images && turf.images.length > 0 ? (
                                            <img
                                                src={turf.images[0]}
                                                alt={turf.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-container/40 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-6xl text-primary/50">sports_cricket</span>
                                            </div>
                                        )}
                                        {turf.pitchType && (
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-primary text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                    {turf.pitchType}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-primary font-bold text-sm">
                                            £{turf.pricePerHour}/hr
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                                            {turf.name}
                                        </h3>
                                        <p className="text-on-surface-variant text-xs flex items-center gap-1 mb-4">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            {turf.location}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <FilledStar />
                                            <span className="text-on-surface font-bold text-sm">{turf.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Testimonials Section ── */}
            <section className="py-24 bg-surface-container-high relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary-container/20 rounded-full blur-[120px]" />
                </div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-secondary font-bold text-sm tracking-widest mb-4 uppercase block">
                            The CricTurf Community
                        </span>
                        <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface">
                            Trusted by 10,000+ Players
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {TESTIMONIALS.map((t) => (
                            <div
                                key={t.name}
                                className="bg-white p-8 rounded-[2rem] shadow-md"
                            >
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => <FilledStar key={i} />)}
                                </div>
                                <p className="text-on-surface-variant italic mb-8 leading-relaxed">{t.quote}</p>
                                <div className="flex items-center gap-4">
                                    <img
                                        src={t.avatar}
                                        alt={t.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src =
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=a04100&color=fff`;
                                        }}
                                    />
                                    <div>
                                        <p className="font-bold text-on-surface">{t.name}</p>
                                        <p className="text-xs text-on-surface-variant uppercase tracking-tighter">{t.team}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Section ── */}
            <section className="py-20 bg-primary">
                <div className="max-w-4xl mx-auto px-6 text-center text-white">
                    <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-8">
                        Ready to Take the Field?
                    </h2>
                    <p className="text-xl mb-10 text-white/90">
                        Join thousands of players already booking their matches through CricTurf.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/register"
                            className="px-10 py-4 bg-white text-primary font-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all text-lg"
                        >
                            Register for Free
                        </Link>
                        <Link
                            to="/browse"
                            className="px-10 py-4 border-2 border-white text-white font-black rounded-full hover:bg-white/10 active:scale-95 transition-all text-lg"
                        >
                            Browse Venues
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="bg-zinc-50 border-t border-zinc-200">
                <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
                    <div className="flex flex-col gap-2">
                        <p className="text-xl font-bold text-zinc-900 font-headline">CricTurf</p>
                        <p className="text-zinc-500">© 2024 CricTurf. All rights reserved.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8">
                        {['About Us', 'Partner With Us', 'Privacy Policy', 'Terms of Service', 'Support'].map((label) => (
                            <a key={label} href="#" className="text-zinc-500 hover:text-primary transition-colors">
                                {label}
                            </a>
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <a
                            href="#"
                            className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-primary hover:text-white transition-all"
                        >
                            <span className="material-symbols-outlined">share</span>
                        </a>
                        <a
                            href="#"
                            className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-primary hover:text-white transition-all"
                        >
                            <span className="material-symbols-outlined">public</span>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
