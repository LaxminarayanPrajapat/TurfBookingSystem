import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTurfStore } from '../store/turfStore';
import { FiMapPin, FiStar, FiUsers, FiCheck } from 'react-icons/fi';

const TurfDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { selectedTurf, loading, fetchTurfById } = useTurfStore();

    useEffect(() => {
        if (id) {
            fetchTurfById(id);
        }
    }, [id, fetchTurfById]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!selectedTurf) {
        return (
            <div className="container-max py-8">
                <p className="text-2xl text-gray-600">Turf not found</p>
            </div>
        );
    }

    return (
        <div className="container-max py-8">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Images */}
                <div>
                    <div className="w-full h-96 bg-gray-300 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        {selectedTurf.images && selectedTurf.images[0] ? (
                            <img
                                src={selectedTurf.images[0]}
                                alt={selectedTurf.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-6xl">🏟️</div>
                        )}
                    </div>
                    {selectedTurf.images && selectedTurf.images.length > 1 && (
                        <div className="grid grid-cols-3 gap-2">
                            {selectedTurf.images.slice(1, 4).map((img, idx) => (
                                <div key={idx} className="w-full h-24 bg-gray-300 rounded flex items-center justify-center overflow-hidden">
                                    <img src={img} alt={`${selectedTurf.name} ${idx}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div>
                    <h1 className="text-4xl font-bold mb-4">{selectedTurf.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-1">
                            <FiStar size={20} className="text-yellow-400" />
                            <span className="text-lg font-semibold">{selectedTurf.rating.toFixed(1)}</span>
                            <span className="text-gray-600">({selectedTurf.reviewCount} reviews)</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <FiMapPin />
                        <span>{selectedTurf.location}</span>
                    </div>

                    <div className="mb-6">
                        <p className="text-gray-700">{selectedTurf.description}</p>
                    </div>

                    <div className="bg-gray-100 rounded-lg p-6 mb-6">
                        <div className="text-3xl font-bold text-blue-600 mb-2">₹{selectedTurf.pricePerHour}/hour</div>
                        <div className="space-y-2 text-gray-700">
                            <div className="flex items-center gap-2">
                                <FiUsers />
                                <span>Capacity: {selectedTurf.capacity} people</span>
                            </div>
                            {selectedTurf.isAvailable && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <FiCheck />
                                    <span>Available for booking</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-bold mb-3">Amenities</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {selectedTurf.amenities && selectedTurf.amenities.length > 0 ? (
                                selectedTurf.amenities.map((amenity, idx) => (
                                    <div key={idx} className="badge badge-info">
                                        {amenity}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600">No amenities listed</p>
                            )}
                        </div>
                    </div>

                    {selectedTurf.isAvailable && (
                        <a href={`/booking/${selectedTurf.id}`} className="w-full btn-primary block text-center">
                            Book Now
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TurfDetailsPage;
