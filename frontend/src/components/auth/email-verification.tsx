'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Mail, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onVerificationSuccess: (token: string, refreshToken: string, user: any) => void;
  onBack?: () => void;
}

export default function EmailVerification({
  email,
  onVerificationSuccess,
  onBack,
}: EmailVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [remainingTime, setRemainingTime] = useState(900); // 15 minutes in seconds
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for OTP expiry
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setError('Verification code has expired. Please request a new one.');
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendCooldown === 0 && remainingTime > 0) {
      setCanResend(true);
    }
  }, [resendCooldown, remainingTime]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === 'Backspace') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);

      // Focus previous input on backspace
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          otp_code: otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed. Please try again.');
        return;
      }

      setSuccess(true);

      // Call success callback after brief delay
      setTimeout(() => {
        onVerificationSuccess(
          data.access_token,
          data.refresh_token,
          data.user
        );
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      setError(null);

      const response = await fetch('/api/auth/resend-verification-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to resend code');
        return;
      }

      // Reset OTP and timers
      setOtp(['', '', '', '', '', '']);
      setRemainingTime(900);
      setResendCooldown(60);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setResendLoading(false);
    }
  };

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  };

  if (success) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-block"
        >
          <CheckCircle className="w-16 h-16 text-emerald-400 mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Email Verified!
        </h2>
        <p className="text-white/60">Redirecting to your dashboard...</p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Mail className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Verify Your Email
          </h1>
          <p className="text-white/60">
            Enter the verification code sent to <br />
            <span className="font-semibold text-white">{email}</span>
          </p>
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}

        {/* OTP Input Fields */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <motion.input
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e.key)}
                autoFocus={index === 0}
                className="w-12 h-14 rounded-lg liquid-glass text-center text-2xl font-bold text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all duration-300"
                placeholder="•"
                whileHover={{ scale: 1.05 }}
                whileFocus={{ scale: 1.05 }}
              />
            ))}
          </div>

          {/* Timer */}
          <div
            className={`text-center text-sm font-semibold ${
              remainingTime < 180 ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            Code expires in {String(minutes).padStart(2, '0')}:
            {String(seconds).padStart(2, '0')}
          </div>
        </motion.div>

        {/* Verify Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleVerify}
          disabled={loading || otp.join('').length !== 6}
          className="w-full py-3 rounded-lg liquid-glass font-semibold text-emerald-300 hover:border-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </motion.button>

        {/* Resend Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleResend}
          disabled={!canResend || resendLoading}
          className="w-full py-3 rounded-lg border border-white/10 font-semibold text-white/60 hover:border-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {resendLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </>
          )}
        </motion.button>

        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="w-full mt-4 py-3 rounded-lg text-white/60 hover:text-white transition-all duration-300 text-sm"
          >
            Back to Sign Up
          </button>
        )}
      </div>
    </motion.div>
  );
}
