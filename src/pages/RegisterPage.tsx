import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { validateEmail, validatePhoneNumber } from '../utils/helpers';

const RegisterPage: React.FC = () => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    if (isAuthenticated) {
        navigate('/');
    }

    const validateForm = (): boolean => {
        if (!displayName.trim()) {
            toast.error('Please enter your name');
            return false;
        }
        if (!validateEmail(email)) {
            toast.error('Please enter a valid email');
            return false;
        }
        if (!validatePhoneNumber(phoneNumber)) {
            toast.error('Please enter a valid phone number');
            return false;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return false;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            await register(email, password, displayName, phoneNumber);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
            <div className="max-w-md w-full card">
                <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
                <p className="text-gray-600 text-center mb-8">Join TurfBook today</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="John Doe"
                                className="input-field pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Email</label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="input-field pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                        <div className="relative">
                            <FiPhone className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="9876543210"
                                className="input-field pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input-field pl-10 pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input-field pl-10 pr-10"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
