import { useState, useRef, useEffect } from 'react';

interface OtpVerificationProps {
    type: 'email' | 'phone';
    target: string; // email address or phone number
    onVerified: () => void;
    onResend: () => Promise<void>;
    onVerify: (otp: string) => Promise<boolean>;
}

const OtpVerification = ({ type, target, onVerified, onResend, onVerify }: OtpVerificationProps) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setError('');
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length < 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const success = await onVerify(code);
            if (success) onVerified();
        } catch (err: any) {
            setError(err.message || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        try {
            await onResend();
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            setError(err.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    const maskedTarget = type === 'email'
        ? target.replace(/(.{2})(.*)(@.*)/, '$1***$3')
        : `+91 ****${target.slice(-4)}`;

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-primary text-3xl">
                        {type === 'email' ? 'mark_email_read' : 'sms'}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-on-surface" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    {type === 'email' ? 'Verify Email' : 'Verify Phone'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    We sent a 6-digit code to <span className="font-semibold text-on-surface">{maskedTarget}</span>
                </p>
            </div>

            {/* OTP inputs */}
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                    <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className={`w-11 h-12 text-center text-lg font-bold rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${digit ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 bg-surface'
                            } ${error ? 'border-red-400' : ''}`}
                    />
                ))}
            </div>

            {error && (
                <p className="text-red-500 text-xs text-center">{error}</p>
            )}

            <button
                onClick={handleVerify}
                disabled={loading || otp.join('').length < 6}
                className="btn-gradient w-full py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
            >
                {loading ? (
                    <><span className="loading-spinner w-4 h-4 inline-block" /> Verifying...</>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-sm">verified</span>
                        Verify Code
                    </>
                )}
            </button>

            <div className="text-center text-sm text-gray-500">
                {countdown > 0 ? (
                    <span>Resend code in <span className="font-semibold text-primary">{countdown}s</span></span>
                ) : (
                    <button
                        onClick={handleResend}
                        disabled={resending}
                        className="text-primary font-semibold hover:underline disabled:opacity-50"
                    >
                        {resending ? 'Sending...' : 'Resend Code'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default OtpVerification;
