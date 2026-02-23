'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, Phone, Building2, ChevronRight, ChevronLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { ValidationFeedback } from './validation-feedback';
import EmailVerification from './email-verification';
import { useAuth } from '@/context/auth-context';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateFullName,
  validatePhoneNumber,
  validateStudentId,
  validateCampus,
  FormErrors,
} from '@/lib/validation/auth-validation';

interface PremiumAuthProps {
  onBack: () => void;
}

type AuthMode = 'choose' | 'signin' | 'signup' | 'verify-email';
type SignupStep = 1 | 2 | 3;
type SigninMode = 'email' | 'studentid';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

export default function PremiumAuth({ onBack }: PremiumAuthProps) {
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('choose');
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signinMode, setSigninMode] = useState<SigninMode>('email');

  // Sign In State
  const [signinEmail, setSigninEmail] = useState('');
  const [signinStudentId, setSigninStudentId] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [signinErrors, setSigninErrors] = useState<FormErrors>({});
  const [signinGeneralError, setSigninGeneralError] = useState('');

  // Sign Up State
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [campus, setCampus] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupErrors, setSignupErrors] = useState<FormErrors & { course?: string }>({});
  const [signupGeneralError, setSignupGeneralError] = useState('');
  
  // Email Verification State
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigninErrors({});
    setSigninGeneralError('');

    let identifier = '';
    
    // Validate based on signin mode
    if (signinMode === 'email') {
      const emailValidation = validateEmail(signinEmail);
      if (!emailValidation.isValid) {
        setSigninErrors({ signinEmail: emailValidation.error });
        return;
      }
      identifier = signinEmail;
    } else {
      // Student ID mode
      const studentIdValidation = validateStudentId(signinStudentId);
      if (!studentIdValidation.isValid) {
        setSigninErrors({ studentId: studentIdValidation.error });
        return;
      }
      identifier = signinStudentId;
    }

    // Validate password
    const passwordValidation = validatePassword(signinPassword);
    if (!passwordValidation.isValid) {
      setSigninErrors({ signinPassword: 'Password is required' });
      return;
    }

    setLoading(true);
    try {
      // Use auth context to handle login
      const isStudentId = signinMode === 'studentid';
      await login(identifier, signinPassword, isStudentId);
      // Auth context will update app state, no need to call onLogin
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      
      // Map backend errors to specific fields
      if (signinMode === 'email') {
        if (errorMessage?.includes('email') || errorMessage?.includes('Email')) {
          setSigninErrors({ signinEmail: errorMessage });
        } else if (errorMessage?.includes('password') || errorMessage?.includes('Password')) {
          setSigninErrors({ signinPassword: errorMessage });
        } else if (errorMessage?.includes('not found') || errorMessage?.includes('invalid')) {
          setSigninGeneralError('Email or password is incorrect. Please try again.');
          setSigninErrors({
            signinEmail: 'Email or password is incorrect',
            signinPassword: 'Email or password is incorrect',
          });
        } else {
          setSigninGeneralError(errorMessage);
        }
      } else {
        if (errorMessage?.includes('student') || errorMessage?.includes('Student')) {
          setSigninErrors({ studentId: errorMessage });
        } else if (errorMessage?.includes('password') || errorMessage?.includes('Password')) {
          setSigninErrors({ signinPassword: errorMessage });
        } else if (errorMessage?.includes('not found') || errorMessage?.includes('invalid')) {
          setSigninGeneralError('Student ID or password is incorrect. Please try again.');
          setSigninErrors({
            studentId: 'Student ID or password is incorrect',
            signinPassword: 'Student ID or password is incorrect',
          });
        } else {
          setSigninGeneralError(errorMessage);
        }
      }
      setLoading(false);
    }
  };

  const handleGoogleSignin = async () => {
    setLoading(true);
    try {
      // TODO: Implement Google OAuth integration
      // For now, redirect to backend Google OAuth endpoint
      // window.location.href = '/api/auth/google';
      alert('Google Sign-in will be available soon. Please use email/password.');
    } catch (error) {
      console.error('Google sign in error:', error);
      alert('Google Sign-in is not available yet');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (signupStep < 3) {
      setDirection(1);
      setSignupStep((prev) => (prev + 1) as SignupStep);
    }
  };

  const handlePrevStep = () => {
    if (signupStep > 1) {
      setDirection(-1);
      setSignupStep((prev) => (prev - 1) as SignupStep);
    }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't allow submission if already loading
    if (loading) return;
    
    setSignupErrors({});
    setSignupGeneralError('');

    // Validate all fields
    const newErrors: FormErrors & { course?: string } = {};

    const nameValidation = validateFullName(fullName);
    if (!nameValidation.isValid) newErrors.fullName = nameValidation.error;

    const emailValidation = validateEmail(signupEmail);
    if (!emailValidation.isValid) newErrors.signupEmail = emailValidation.error;

    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.isValid) newErrors.phone = phoneValidation.error;

    const studentIdValidation = validateStudentId(studentId);
    if (!studentIdValidation.isValid) newErrors.studentId = studentIdValidation.error;

    const campusValidation = validateCampus(campus);
    if (!campusValidation.isValid) newErrors.campus = campusValidation.error;

    if (!course) newErrors.course = 'Course is required';

    const passwordValidation = validatePassword(signupPassword);
    if (!passwordValidation.isValid) newErrors.signupPassword = passwordValidation.error;

    const matchValidation = validatePasswordMatch(signupPassword, confirmPassword);
    if (!matchValidation.isValid) newErrors.confirmPassword = matchValidation.error;

    // If there are validation errors, display them
    if (Object.keys(newErrors).length > 0) {
      setSignupErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: signupEmail,
          phone: phone,
          student_id: studentId,
          password: signupPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Map backend errors to specific fields
        const errorMessage = data.error || 'Registration failed. Please try again.';
        console.error('[v0] Registration failed:', { status: response.status, error: errorMessage });

        if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('already')) {
          setSignupErrors({ signupEmail: 'This email is already registered' });
          setSignupGeneralError('This email is already registered. Please sign in instead.');
        } else if (errorMessage.toLowerCase().includes('email')) {
          setSignupErrors({ signupEmail: errorMessage });
        } else if (errorMessage.toLowerCase().includes('student_id') || errorMessage.toLowerCase().includes('student id')) {
          setSignupErrors({ studentId: errorMessage });
        } else if (errorMessage.toLowerCase().includes('password')) {
          setSignupErrors({ signupPassword: errorMessage });
        } else {
          setSignupGeneralError(errorMessage);
        }

        setLoading(false);
        return;
      }

      // Show email verification modal instead of auto-login
      setVerificationEmail(data.user.email);
      setAuthMode('verify-email');
      setLoading(false);
    } catch (error) {
      console.error('Sign up error:', error);
      setSignupGeneralError('An error occurred. Please check your connection and try again.');
      setLoading(false);
    }
  };

  // Step validation checks
  const isStep1Valid = () => {
    const nameValidation = validateFullName(fullName);
    const emailValidation = validateEmail(signupEmail);
    const phoneValidation = validatePhoneNumber(phone);
    return nameValidation.isValid && emailValidation.isValid && phoneValidation.isValid;
  };

  const isStep2Valid = () => {
    const studentIdValidation = validateStudentId(studentId);
    const campusValidation = validateCampus(campus);
    return studentIdValidation.isValid && campusValidation.isValid && !!course;
  };

  const isStep3Valid = () => {
    const passwordValidation = validatePassword(signupPassword);
    const matchValidation = validatePasswordMatch(signupPassword, confirmPassword);
    return passwordValidation.isValid && matchValidation.isValid;
  };

  const handleVerificationSuccess = (accessToken: string, refreshToken: string, user: any) => {
    // Store tokens and user info
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Redirect to home page which will show student dashboard
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen w-full bg-stone-950 flex items-center justify-center px-4 py-12 overflow-hidden relative">
      {/* Ambient Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-slate-600/10 rounded-full blur-3xl opacity-20 animate-drift" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <AnimatePresence mode="wait" custom={direction}>
          {/* Choose Auth Mode */}
          {authMode === 'choose' && (
            <motion.div
              key="choose"
              variants={slideVariants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center mb-12">
                <div className="inline-block mb-6 p-4 rounded-2xl bg-emerald-950/50 border border-emerald-900/50">
                  <Lock className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-4xl font-black text-white mb-3">Welcome to CampusFind</h1>
                <p className="text-white/60 font-light">Recover your lost items in seconds</p>
              </div>

              {/* Sign Up Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setDirection(1);
                  setAuthMode('signup');
                  setSignupStep(1);
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-4 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30"
              >
                Create New Account
                <ChevronRight className="w-5 h-5" />
              </motion.button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-stone-950 text-white/50 font-light">Or</span>
                </div>
              </div>

              {/* ID Sign Up */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setDirection(1);
                  setAuthMode('signup');
                  setSignupStep(1);
                }}
                disabled={loading}
                className="w-full bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/20 text-white px-6 py-4 rounded-2xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Top left - Blue */}
                    <circle cx="8" cy="8" r="4.5" fill="#4285F4" />
                    {/* Top right - Red */}
                    <circle cx="16" cy="8" r="4.5" fill="#EA4335" />
                    {/* Bottom left - Yellow */}
                    <circle cx="8" cy="16" r="4.5" fill="#FBBC04" />
                    {/* Bottom right - Green */}
                    <circle cx="16" cy="16" r="4.5" fill="#34A853" />
                    {/* Center white square to blend them */}
                    <rect x="10" y="10" width="4" height="4" fill="white" opacity="0.8" />
                  </svg>
                )}
                Sign up with ID
              </motion.button>

              {/* Sign In Link */}
              <button
                onClick={() => {
                  setDirection(1);
                  setAuthMode('signin');
                }}
                className="w-full text-white/70 hover:text-white font-medium transition-colors py-3"
              >
                Already have an account? <span className="text-emerald-400">Sign in</span>
              </button>

              {/* Back Button */}
              <button
                onClick={onBack}
                className="w-full text-white/50 hover:text-white/70 font-light text-sm transition-colors py-2"
              >
                ← Back to Home
              </button>
            </motion.div>
          )}

          {/* Sign In */}
          {authMode === 'signin' && (
            <motion.div
              key="signin"
              variants={slideVariants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
                <p className="text-white/60 font-light">Sign in to your CampusFind account</p>
              </div>

              {/* General Error Message */}
              {signinGeneralError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4"
                >
                  <p className="text-sm text-red-200">{signinGeneralError}</p>
                </motion.div>
              )}

              {/* Sign In Mode Toggle - Apple Glass */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setSigninMode('email');
                    setSigninErrors({});
                  }}
                  className={`flex-1 py-2 px-4 rounded-xl font-semibold text-sm input-field-smooth ${
                    signinMode === 'email'
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setSigninMode('studentid');
                    setSigninErrors({});
                  }}
                  className={`flex-1 py-2 px-4 rounded-xl font-semibold text-sm input-field-smooth ${
                    signinMode === 'studentid'
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Student ID
                </motion.button>
              </div>

              {/* Liquid Glass Form Container - Apple iOS 18+ */}
              <div className="space-y-4 liquid-glass rounded-3xl p-8">
                <form onSubmit={handleSignin} className="space-y-5">
                  {/* Email Input - Smooth simultaneous transitions */}
                  <motion.div
                    key={`email-${signinMode}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: signinMode === 'email' ? 1 : 0, y: signinMode === 'email' ? 0 : -8 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className={`space-y-2 ${signinMode !== 'email' ? 'pointer-events-none absolute' : ''}`}
                  >
                    <label className="text-sm font-semibold text-white/80">Email Address</label>
                    <div className="relative">
                      <Mail className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-300 ${
                        signinErrors.signinEmail ? 'text-red-400/60' : 'text-emerald-400/60'
                      }`} />
                      <input
                        type="email"
                        placeholder="your.email@zetech.ac.ke"
                        value={signinEmail}
                        onChange={(e) => {
                          setSigninEmail(e.target.value);
                          if (signinErrors.signinEmail) {
                            setSigninErrors({ ...signinErrors, signinEmail: undefined });
                          }
                        }}
                        autoFocus={signinMode === 'email'}
                        className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 input-field-smooth ${
                          signinErrors.signinEmail
                            ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
                            : 'border-white/20 hover:border-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                        }`}
                      />
                    </div>
                    {signinErrors.signinEmail && (
                      <ValidationFeedback error={signinErrors.signinEmail} />
                    )}
                  </motion.div>

                  {/* Student ID Input - Smooth simultaneous transitions */}
                  <motion.div
                    key={`studentid-${signinMode}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: signinMode === 'studentid' ? 1 : 0, y: signinMode === 'studentid' ? 0 : -8 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className={`space-y-2 ${signinMode !== 'studentid' ? 'pointer-events-none absolute' : ''}`}
                  >
                    <label className="text-sm font-semibold text-white/80">Student ID</label>
                    <div className="relative">
                      <User className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-300 ${
                        signinErrors.studentId ? 'text-red-400/60' : 'text-emerald-400/60'
                      }`} />
                      <input
                        type="text"
                        placeholder="BIT-01-1234/2024"
                        value={signinStudentId}
                        onChange={(e) => {
                          setSigninStudentId(e.target.value);
                          if (signinErrors.studentId) {
                            setSigninErrors({ ...signinErrors, studentId: undefined });
                          }
                        }}
                        autoFocus={signinMode === 'studentid'}
                        className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 input-field-smooth ${
                          signinErrors.studentId
                            ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
                            : 'border-white/20 hover:border-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                        }`}
                      />
                    </div>
                    {signinErrors.studentId && (
                      <ValidationFeedback error={signinErrors.studentId} />
                    )}
                  </motion.div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/80">Password</label>
                    <div className="relative">
                      <Lock className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-300 ${
                        signinErrors.signinPassword ? 'text-red-400/60' : 'text-emerald-400/60'
                      }`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={signinPassword}
                        onChange={(e) => {
                          setSigninPassword(e.target.value);
                          if (signinErrors.signinPassword) {
                            setSigninErrors({ ...signinErrors, signinPassword: undefined });
                          }
                        }}
                        className={`w-full pl-12 pr-12 py-3 bg-white/10 border rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 input-field-smooth ${
                          signinErrors.signinPassword
                            ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
                            : 'border-white/20 hover:border-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                        }`}
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute right-4 top-4 text-white/50 hover:text-white/80 transition-colors duration-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
                    {signinErrors.signinPassword && (
                      <ValidationFeedback error={signinErrors.signinPassword} />
                    )}
                  </div>

                  {/* Sign In Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !!signinGeneralError}
                    className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-3 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-emerald-600/30"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>
              </div>



              {/* Links */}
              <div className="text-center space-y-2">
                <button
                  onClick={() => {
                    setDirection(1);
                    setAuthMode('signup');
                    setSignupStep(1);
                  }}
                  className="block w-full text-white/70 hover:text-white font-medium transition-colors"
                >
                  Don't have an account? <span className="text-emerald-400">Sign up</span>
                </button>
                <button
                  onClick={() => {
                    setDirection(-1);
                    setAuthMode('choose');
                  }}
                  className="block w-full text-white/50 hover:text-white/70 font-light text-sm transition-colors pt-2"
                >
                  ← Back
                </button>
              </div>
            </motion.div>
          )}

          {/* Sign Up - Multi Step */}
          {authMode === 'signup' && (
            <motion.div
              key="signup"
              variants={slideVariants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              {/* Progress Indicator */}
              <div className="flex gap-2">
                {[1, 2, 3].map((step) => (
                  <motion.div
                    key={step}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      step === signupStep
                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                        : step < signupStep
                          ? 'bg-emerald-600/50'
                          : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white mb-2">Create Account</h1>
                <p className="text-white/60 font-light">
                  {signupStep === 1 && 'Tell us about yourself'}
                  {signupStep === 2 && 'Zetech student information'}
                  {signupStep === 3 && 'Set your password'}
                </p>
              </div>

              {/* General Error Message */}
              {signupGeneralError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4"
                >
                  <p className="text-sm text-red-200">{signupGeneralError}</p>
                </motion.div>
              )}

              {/* Liquid Glass Form Container - Apple iOS 18+ */}
              <div className="space-y-4 liquid-glass rounded-3xl p-8">
                {/* Step 1: Personal Info */}
                <AnimatePresence mode="wait">
                  {signupStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      {/* Full Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/80">Full Name</label>
                        <div className="relative">
                          <User className={`absolute left-4 top-4 w-5 h-5 transition-colors ${
                            signupErrors.fullName ? 'text-red-400/60' : 'text-emerald-400/60'
                          }`} />
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => {
                              setFullName(e.target.value);
                              if (signupErrors.fullName) {
                                setSignupErrors({ ...signupErrors, fullName: undefined });
                              }
                            }}
                            className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 input-field-smooth ${
                              signupErrors.fullName
                                ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
                                : 'border-white/20 hover:border-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                            }`}
                          />
                        </div>
                        {signupErrors.fullName && (
                          <ValidationFeedback error={signupErrors.fullName} />
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/80">Email</label>
                        <div className="relative">
                          <Mail className={`absolute left-4 top-4 w-5 h-5 transition-colors ${
                            signupErrors.signupEmail ? 'text-red-400/60' : 'text-emerald-400/60'
                          }`} />
                          <input
                            type="email"
                            placeholder="your@zetech.ac.ke"
                            value={signupEmail}
                            onChange={(e) => {
                              setSignupEmail(e.target.value);
                              if (signupErrors.signupEmail) {
                                setSignupErrors({ ...signupErrors, signupEmail: undefined });
                              }
                            }}
                            className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 input-field-smooth ${
                              signupErrors.signupEmail
                                ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
                                : 'border-white/20 hover:border-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                            }`}
                          />
                        </div>
                        {signupErrors.signupEmail && (
                          <ValidationFeedback error={signupErrors.signupEmail} />
                        )}
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/80">Phone Number</label>
                        <div className="relative">
                          <Phone className={`absolute left-4 top-4 w-5 h-5 transition-colors ${
                            signupErrors.phone ? 'text-red-400/60' : 'text-emerald-400/60'
                          }`} />
                          <input
                            type="tel"
                            placeholder="+254712345678"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (signupErrors.phone) {
                                setSignupErrors({ ...signupErrors, phone: undefined });
                              }
                            }}
                            className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 input-field-smooth ${
                              signupErrors.phone
                                ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
                                : 'border-white/20 hover:border-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                            }`}
                          />
                        </div>
                        {signupErrors.phone && (
                          <ValidationFeedback error={signupErrors.phone} suggestion={signupErrors.phone?.includes('format') ? 'Format: +254712345678' : undefined} />
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Student Info */}
                  {signupStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      {/* Student ID */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/80">Student ID</label>
                        <div className="relative">
                          <User className={`absolute left-4 top-4 w-5 h-5 transition-colors ${
                            signupErrors.studentId ? 'text-red-400/60' : 'text-emerald-400/60'
                          }`} />
                          <input
                            type="text"
                            placeholder="BIT-01-1234/2024"
                            value={studentId}
                            onChange={(e) => {
                              setStudentId(e.target.value);
                              if (signupErrors.studentId) {
                                setSignupErrors({ ...signupErrors, studentId: undefined });
                              }
                            }}
                            className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 input-field-smooth ${
                              signupErrors.studentId
                                ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
                                : 'border-white/20 hover:border-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                            }`}
                          />
                        </div>
                        {signupErrors.studentId && (
                          <ValidationFeedback error={signupErrors.studentId} suggestion="Format: BIT-01-1234/2024" />
                        )}
                      </div>

                      {/* Campus */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/80">Campus</label>
                        <div className="relative">
                          <Building2 className={`absolute left-4 top-4 w-5 h-5 transition-colors ${
                            signupErrors.campus ? 'text-red-400/60' : 'text-emerald-400/60'
                          }`} />
                          <select
                            value={campus}
                            onChange={(e) => {
                              setCampus(e.target.value);
                              if (signupErrors.campus) {
                                setSignupErrors({ ...signupErrors, campus: undefined });
                              }
                            }}
                            className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-2xl text-white focus:outline-none focus:ring-2 transition-all duration-300 appearance-none ${
                              signupErrors.campus
                                ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
                                : 'border-white/20 hover:border-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                            }`}
                          >
                            <option value="" className="bg-stone-950 text-white">
                              Select Campus
                            </option>
                            <option value="main" className="bg-stone-950 text-white">
                              Main Campus
                            </option>
                            <option value="westlands" className="bg-stone-950 text-white">
                              Westlands
                            </option>
                            <option value="ruiru" className="bg-stone-950 text-white">
                              Ruiru
                            </option>
                          </select>
                        </div>
                        {signupErrors.campus && (
                          <ValidationFeedback error={signupErrors.campus} />
                        )}
                      </div>

                      {/* Course */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/80">Course</label>
                        <div className="relative">
                          <Building2 className={`absolute left-4 top-4 w-5 h-5 transition-colors ${
                            signupErrors.course ? 'text-red-400/60' : 'text-emerald-400/60'
                          }`} />
                          <input
                            type="text"
                            placeholder="e.g., Computer Science"
                            value={course}
                            onChange={(e) => {
                              setCourse(e.target.value);
                              if (signupErrors.course) {
                                setSignupErrors({ ...signupErrors, course: undefined });
                              }
                            }}
                            className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 input-field-smooth ${
                              signupErrors.course
                                ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
                                : 'border-white/20 hover:border-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                            }`}
                          />
                        </div>
                        {signupErrors.course && (
                          <ValidationFeedback error={signupErrors.course} />
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Password */}
                  {signupStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      {/* Password */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/80">Password</label>
                        <div className="relative">
                          <Lock className={`absolute left-4 top-4 w-5 h-5 transition-colors ${
                            signupErrors.signupPassword ? 'text-red-400/60' : 'text-emerald-400/60'
                          }`} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a strong password"
                            value={signupPassword}
                            onChange={(e) => {
                              setSignupPassword(e.target.value);
                              if (signupErrors.signupPassword) {
                                setSignupErrors({ ...signupErrors, signupPassword: undefined });
                              }
                            }}
                            className={`w-full pl-12 pr-12 py-3 bg-white/10 border rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 input-field-smooth ${
                              signupErrors.signupPassword
                                ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
                                : 'border-white/20 hover:border-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-4 text-white/50 hover:text-white/80 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {signupErrors.signupPassword && (
                          <ValidationFeedback error={signupErrors.signupPassword} />
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white/80">Confirm Password</label>
                        <div className="relative">
                          <Lock className={`absolute left-4 top-4 w-5 h-5 transition-colors ${
                            signupErrors.confirmPassword ? 'text-red-400/60' : 'text-emerald-400/60'
                          }`} />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (signupErrors.confirmPassword) {
                                setSignupErrors({ ...signupErrors, confirmPassword: undefined });
                              }
                            }}
                            className={`w-full pl-12 pr-12 py-3 bg-white/10 border rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 input-field-smooth ${
                              signupErrors.confirmPassword
                                ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
                                : signupPassword && confirmPassword === signupPassword
                                  ? 'border-emerald-500/50 focus:border-emerald-500/70 focus:ring-emerald-500/20'
                                  : 'border-white/20 hover:border-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-4 text-white/50 hover:text-white/80 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {signupErrors.confirmPassword && (
                          <ValidationFeedback error={signupErrors.confirmPassword} />
                        )}
                        {signupPassword && confirmPassword && signupPassword === confirmPassword && !signupErrors.confirmPassword && (
                          <ValidationFeedback success="Passwords match" />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                {signupStep > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePrevStep}
                    className="flex-1 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/20 text-white px-6 py-3 rounded-2xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </motion.button>
                )}

                {signupStep < 3 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNextStep}
                    disabled={
                      signupStep === 1
                        ? !isStep1Valid()
                        : signupStep === 2
                          ? !isStep2Valid()
                          : false
                    }
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-3 rounded-2xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-emerald-600/30"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                )}

                {signupStep === 3 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCompleteSignup}
                    disabled={loading || !isStep3Valid()}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-3 rounded-2xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-emerald-600/30"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Create Account
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                )}
              </div>

              {/* Back Link */}
              <button
                onClick={() => {
                  setDirection(-1);
                  setAuthMode('choose');
                }}
                className="w-full text-white/50 hover:text-white/70 font-light text-sm transition-colors py-2"
              >
                ← Back to Options
              </button>
            </motion.div>
          )}

          {/* Email Verification */}
          {authMode === 'verify-email' && (
            <motion.div
              key="verify-email"
              variants={slideVariants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <EmailVerification
                email={verificationEmail}
                onVerificationSuccess={handleVerificationSuccess}
                onBack={() => {
                  setDirection(-1);
                  setAuthMode('signup');
                  setSignupStep(1);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
