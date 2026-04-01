import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import OtpVerification from '../components/OtpVerification';

type Role = 'user' | 'turf_owner';
type Step = 'form' | 'email-otp' | 'phone-otp' | 'done';

const RegisterPage = () => {
    const [step, setStep] = useState<Step>('form');
    const [role, setRole] = useState<Role>('user');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [registeredUid, setRegisteredUid] = useState('');

    const { register, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && step === 'form') navigate('/');
    }, [isAuthenticated]);

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!displayName.trim()) e.displayName = 'Full name is required';
        if (!email.trim()) e.email = 'Email is required';
        if (!/^\d{10}$/.test(phoneNumber)) e.phoneNumber = 'Phone number must be exactly 10 digits';
        if (password.length < 6) e.password = 'Password must be at least 6 characters';
        if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            if (role === 'turf_owner') {
                // Create account + send email verification
                const user = await authService.registerTurfOwner(email, password, displayName, phoneNumber);
                setRegisteredUid(user.uid);
                toast.info('Verification email sent! Please check your inbox.');
                setStep('email-otp');
            } else {
                await register(email, password, displayName, phoneNumber);
                toast.success('Account created successfully!');
                navigate('/');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    // Email verification — poll Firebase until emailVerified = true
    const handleEmailVerify = async (_otp: string): Promise<boolean> => {
        const verified = await authService.checkAndUpdateEmailVerification(registeredUid);
        if (!verified) throw new Error('Email not verified yet. Please click the link in your inbox, then try again.');
        return true;
    };

    const handleEmailVerified = () => {
        toast.success('Email verified!');
        setStep('phone-otp');
        // Send phone OTP
        authService.sendPhoneOtp(phoneNumber, 'recaptcha-container').catch((err) => {
            toast.error(err.message || 'Failed to send phone OTP');
        });
    };

    const handleResendEmail = async () => {
        const { sendEmailVerification } = await import('firebase/auth');
        const { auth } = await import('../services/firebase');
        if (auth.currentUser) await sendEmailVerification(auth.currentUser);
    };

    const handlePhoneVerify = async (otp: string): Promise<boolean> => {
        return authService.verifyPhoneOtp(registeredUid, otp);
    };

    const handlePhoneVerified = async () => {
        toast.success('Phone verified! Your account is pending admin approval.');
        setStep('done');
    };

    const handleResendPhone = async () => {
        await authService.sendPhoneOtp(phoneNumber, 'recaptcha-container');
    };

    const fieldClass = (field: string) =>
        `w-full pl-10 pr-4 py-3 bg-surface rounded-lg border text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${errors[field] ? 'border-red-400' : 'border-gray-200'}`;

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
            {/* Invisible reCAPTCHA container */}
            <div id="recaptcha-container" />

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

                        {step === 'form' && (
                            <>
                                <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                    Create Account
                                </h1>
                                <p className="text-gray-500 mt-1 text-sm">Join CricTurf and start booking</p>
                            </>
                        )}
                        {step === 'email-otp' && (
                            <p className="text-sm text-gray-500 mt-1">Step 1 of 2 — Email Verification</p>
                        )}
                        {step === 'phone-otp' && (
                            <p className="text-sm text-gray-500 mt-1">Step 2 of 2 — Phone Verification</p>
                        )}
                    </div>

                    {/* ── Step: Registration Form ── */}
                    {step === 'form' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Role selector */}
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                {(['user', 'turf_owner'] as Role[]).map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all min-h-[72px] ${role === r ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <span className={`material-symbols-outlined text-2xl ${role === r ? 'text-primary' : 'text-gray-400'}`}>
                                            {r === 'user' ? 'person' : 'stadium'}
                                        </span>
                                        <span className={`text-xs font-bold ${role === r ? 'text-primary' : 'text-gray-500'}`}>
                                            {r === 'user' ? 'Player' : 'Turf Owner'}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {role === 'turf_owner' && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
                                    <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                                    <span>Turf owner accounts require email + phone verification and admin approval before activation.</span>
                                </div>
                            )}

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1.5">Full Name</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">person</span>
                                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="John Doe" className={fieldClass('displayName')} />
                                </div>
                                {errors.displayName && <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1.5">Email Address</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">mail</span>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className={fieldClass('email')} />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1.5">
                                    Phone Number {role === 'turf_owner' && <span className="text-primary text-xs">(will be verified via OTP)</span>}
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">phone</span>
                                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" className={fieldClass('phoneNumber')} maxLength={10} />
                                </div>
                                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
                                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" className={`${fieldClass('password')} pr-12`} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
                                    <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className={fieldClass('confirmPassword')} />
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                            </div>

                            <button type="submit" disabled={loading} className="btn-gradient w-full py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] mt-2">
                                {loading ? (
                                    <><span className="loading-spinner w-4 h-4 inline-block" /> Creating Account...</>
                                ) : (
                                    role === 'turf_owner' ? 'Continue to Verification' : 'Create Account'
                                )}
                            </button>
                        </form>
                    )}

                    {/* ── Step: Email OTP ── */}
                    {step === 'email-otp' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700 flex items-start gap-2">
                                <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                                <span>Click the verification link in your email, then click "Verify Code" below. No code entry needed for email — Firebase handles it via link.</span>
                            </div>
                            <OtpVerification
                                type="email"
                                target={email}
                                onVerified={handleEmailVerified}
                                onResend={handleResendEmail}
                                onVerify={handleEmailVerify}
                            />
                        </div>
                    )}

                    {/* ── Step: Phone OTP ── */}
                    {step === 'phone-otp' && (
                        <OtpVerification
                            type="phone"
                            target={phoneNumber}
                            onVerified={handlePhoneVerified}
                            onResend={handleResendPhone}
                            onVerify={handlePhoneVerify}
                        />
                    )}

                    {/* ── Step: Done ── */}
                    {step === 'done' && (
                        <div className="text-center space-y-4 py-4">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
                            </div>
                            <h3 className="text-lg font-bold text-on-surface" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                Verification Complete!
                            </h3>
                            <p className="text-sm text-gray-500">
                                Your turf owner account has been submitted for admin approval. You'll be able to log in once approved.
                            </p>
                            <Link to="/login" className="btn-gradient inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-full">
                                Go to Login
                            </Link>
                        </div>
                    )}

                    {step === 'form' && (
                        <p className="text-center text-sm text-gray-500 mt-6">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in here</Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
