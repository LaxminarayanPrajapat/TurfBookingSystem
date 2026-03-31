import React, { useEffect, useState } from 'react';
import { useTurfStore } from '@store/turfStore';
import { FiMapPin, FiStar, FiUsers, FiClock, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const BrowseTurfsPage: React.FC = () => {
    const { turfs, loading, fetchAllTurfs } = useTurfStore();
    const [search, setSearch] = useState('');
    const [priceFilter, setPriceFilter] = useState({ min: '0', max: '500' });
    const [filteredTurfs, setFilteredTurfs] = useState(turfs);

    useEffect(() => {
        fetchAllTurfs({ isAvailable: true });
    }, [fetchAllTurfs]);

    useEffect(() => {
        const filtered = turfs.filter((turf) => {
            const matchesSearch =
                turf.name.toLowerCase().includes(search.toLowerCase()) ||
                turf.location.toLowerCase().includes(search.toLowerCase());
            const matchesPrice =
                turf.pricePerHour >= parseInt(priceFilter.min) &&
                turf.pricePerHour <= parseInt(priceFilter.max);
            return matchesSearch && matchesPrice;
        });
        setFilteredTurfs(filtered);
    }, [search, priceFilter, turfs]);

    return (
        <div className="container-max py-8">
            <h1 className="text-3xl font-bold mb-8">Browse Turfs</h1>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="grid md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Search</label>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or location..."
                                className="input-field pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Min Price</label>
                        <input
                            type="number"
                            value={priceFilter.min}
                            onChange={(e) => setPriceFilter({ ...priceFilter, min: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Max Price</label>
                        <input
                            type="number"
                            value={priceFilter.max}
                            onChange={(e) => setPriceFilter({ ...priceFilter, max: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearch('');
                                setPriceFilter({ min: '0', max: '500' });
                            }}
                            className="w-full btn-secondary"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Turfs Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <div className="loading-spinner"></div>
                </div>
            ) : filteredTurfs.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                    {filteredTurfs.map((turf) => (
                        <Link key={turf.id} to={`/turf/${turf.id}`}>
                            <div className="card hover:shadow-xl transition-all cursor-pointer h-full">
                                {/* Turf Image */}
                                <div className="w-full h-48 bg-gray-300 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                    {turf.images && turf.images[0] ? (
                                        <img
                                            src={turf.images[0]}
                                            alt={turf.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-4xl">🏟️</div>
                                    )}
                                </div>

                                {/* Turf Info */}
                                <h3 className="text-xl font-bold mb-2">{turf.name}</h3>

                                <div className="flex items-center gap-2 text-gray-600 mb-3">
                                    <FiMapPin size={16} />
                                    <span className="text-sm">{turf.location}</span>
                                </div>

                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-lg font-bold text-blue-600">₹{turf.pricePerHour}/hr</span>
                                    <div className="flex items-center gap-1">
                                        <FiStar size={16} className="text-yellow-400" />
                                        <span className="font-semibold">{turf.rating.toFixed(1)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-gray-600 text-sm mb-4">
                                    <div className="flex items-center gap-1">
                                        <FiUsers size={16} />
                                        <span>{turf.capacity}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FiClock size={16} />
                                        <span>{turf.amenities?.length || 0} amenities</span>
                                    </div>
                                </div>

                                <button className="w-full btn-primary">View Details</button>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-2xl text-gray-600 mb-4">No turfs found</p>
                    <p className="text-gray-500">Try adjusting your filters</p>
                </div>
            )}
        </div>
    );
};

export default BrowseTurfsPage;
