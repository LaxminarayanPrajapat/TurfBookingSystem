import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

const RegisterPage = () => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const { register, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    if (isAuthenticated) {
        navigate('/');
        return null;
    }

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!displayName.trim()) {
            newErrors.displayName = 'Full name is required';
        }
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        }
        if (!/^\d{10}$/.test(phoneNumber)) {
            newErrors.phoneNumber = 'Phone number must be exactly 10 digits';
        }
        if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await register(email, password, displayName, phoneNumber);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fieldClass = (field: string) =>
        `w-full pl-10 pr-4 py-3 bg-surface rounded-lg border text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${errors[field] ? 'border-red-400' : 'border-gray-200'
        }`;

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
            <div className="w-full max-w-md">
                <div className="bg-surface-lowest rounded-xl shadow-sm p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-primary text-3xl">sports_cricket</span>
                            <span className="text-2xl font-bold text-primary" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                CricTurf
                            </span>
                        </Link>
                        <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Lexend, sans-serif' }}>
                            Create Account
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">Join CricTurf and start booking</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-1.5">Full Name</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                                    person
                                </span>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="John Doe"
                                    className={fieldClass('displayName')}
                                />
                            </div>
                            {errors.displayName && (
                                <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-1.5">Email Address</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                                    mail
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className={fieldClass('email')}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-1.5">Phone Number</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                                    phone
                                </span>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="9876543210"
                                    className={fieldClass('phoneNumber')}
                                    maxLength={10}
                                />
                            </div>
                            {errors.phoneNumber && (
                                <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                                    lock
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    className={`${fieldClass('password')} pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                                    lock
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={fieldClass('confirmPassword')}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gradient w-full py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] mt-2"
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner w-4 h-4 inline-block" />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
