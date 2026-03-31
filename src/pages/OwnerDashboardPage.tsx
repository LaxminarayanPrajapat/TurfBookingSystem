import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTurfStore } from '../store/turfStore';
import { FiPlus, FiEdit2, FiTrash2, FiTrendingUp } from 'react-icons/fi';

const OwnerDashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const { myTurfs, loading, fetchMyTurfs, deleteTurf } = useTurfStore();

    useEffect(() => {
        if (user) {
            fetchMyTurfs(user.id);
        }
    }, [user, fetchMyTurfs]);

    const totalRevenue = myTurfs.reduce((sum, turf) => sum + turf.pricePerHour * 10, 0);

    const handleDelete = async (turfId: string) => {
        if (window.confirm('Are you sure you want to delete this turf?')) {
            try {
                await deleteTurf(turfId);
            } catch (error) {
                console.error('Failed to delete turf:', error);
            }
        }
    };

    return (
        <div className="container-max py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Turfs</h1>
                <a href="/owner/add-turf" className="btn-primary flex items-center gap-2">
                    <FiPlus /> Add New Turf
                </a>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="card">
                    <p className="text-gray-600 text-sm">Total Turfs</p>
                    <p className="text-3xl font-bold text-blue-600">{myTurfs.length}</p>
                </div>
                <div className="card">
                    <p className="text-gray-600 text-sm">Average Rating</p>
                    <p className="text-3xl font-bold text-blue-600">
                        {myTurfs.length > 0
                            ? (myTurfs.reduce((sum, t) => sum + t.rating, 0) / myTurfs.length).toFixed(1)
                            : '0.0'}
                    </p>
                </div>
                <div className="card">
                    <p className="text-gray-600 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-blue-600">₹{totalRevenue}</p>
                </div>
            </div>

            {/* Turfs List */}
            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <div className="loading-spinner"></div>
                </div>
            ) : myTurfs.length > 0 ? (
                <div className="space-y-4">
                    {myTurfs.map((turf) => (
                        <div key={turf.id} className="card">
                            <div className="grid md:grid-cols-5 gap-4 items-center">
                                <div>
                                    <p className="text-gray-600 text-sm">Turf Name</p>
                                    <p className="font-semibold text-lg">{turf.name}</p>
                                </div>

                                <div>
                                    <p className="text-gray-600 text-sm">Location</p>
                                    <p className="font-semibold">{turf.location}</p>
                                </div>

                                <div>
                                    <p className="text-gray-600 text-sm">Price/Hour</p>
                                    <p className="font-semibold text-blue-600">₹{turf.pricePerHour}</p>
                                </div>

                                <div>
                                    <p className="text-gray-600 text-sm">Rating</p>
                                    <p className="font-semibold">⭐ {turf.rating.toFixed(1)}</p>
                                </div>

                                <div className="flex gap-2">
                                    <a href={`/owner/turf/${turf.id}/edit`} className="btn-secondary text-sm flex items-center gap-1">
                                        <FiEdit2 size={16} /> Edit
                                    </a>
                                    <button
                                        onClick={() => handleDelete(turf.id)}
                                        className="btn-danger text-sm flex items-center gap-1"
                                    >
                                        <FiTrash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <FiTrendingUp className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-2xl text-gray-600 mb-4">No turfs yet</p>
                    <p className="text-gray-500 mb-6">Add your first turf to start receiving bookings</p>
                    <a href="/owner/add-turf" className="btn-primary">
                        Add New Turf
                    </a>
                </div>
            )}
        </div>
    );
};

export default OwnerDashboardPage;
