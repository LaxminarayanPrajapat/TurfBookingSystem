import React from 'react';
import { useAuthStore } from '../store/authStore';
import { FiUser, FiMail, FiPhone, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const UserProfilePage: React.FC = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();


    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Failed to logout');
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container-max py-8">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            <div className="max-w-2xl">
                <div className="card">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-4xl">
                            {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{user.displayName}</h2>
                            <p className="text-gray-600 capitalize">{user.role.replace('_', ' ')}</p>
                        </div>
                    </div>

                    <div className="space-y-6 border-t pt-6">
                        <div>
                            <label className="text-gray-600 text-sm font-medium block mb-2">Full Name</label>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <FiUser className="text-gray-400" />
                                <input
                                    type="text"
                                    value={user.displayName}
                                    readOnly
                                    className="bg-transparent outline-none flex-1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-600 text-sm font-medium block mb-2">Email</label>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <FiMail className="text-gray-400" />
                                <input
                                    type="email"
                                    value={user.email}
                                    readOnly
                                    className="bg-transparent outline-none flex-1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-600 text-sm font-medium block mb-2">Phone Number</label>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <FiPhone className="text-gray-400" />
                                <input
                                    type="tel"
                                    value={user.phoneNumber}
                                    readOnly
                                    className="bg-transparent outline-none flex-1"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <p className="text-gray-600 text-sm">
                                Member since {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full btn-danger mt-8 flex items-center justify-center gap-2"
                    >
                        <FiLogOut />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
