import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Lock,
  Mail,
  User,
  Building2,
  Shield,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { UserRole } from '../types';

type EmailValidationState = 'idle' | 'invalid_format' | 'checking' | 'available' | 'registered';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Planning Authority');
  const [agency, setAgency] = useState('Nagpur Municipal Corporation (NMC)');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email validation state
  const [emailState, setEmailState] = useState<EmailValidationState>('idle');
  const [emailMessage, setEmailMessage] = useState<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password requirement checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  const isPasswordMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const passedCriteriaCount = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  const getStrengthBar = () => {
    if (!password) return { width: '0%', color: 'bg-slate-700', label: 'Not Entered' };
    if (passedCriteriaCount <= 1) return { width: '20%', color: 'bg-rose-500', label: 'Very Weak' };
    if (passedCriteriaCount === 2) return { width: '40%', color: 'bg-orange-500', label: 'Weak' };
    if (passedCriteriaCount === 3) return { width: '60%', color: 'bg-amber-500', label: 'Fair' };
    if (passedCriteriaCount === 4) return { width: '80%', color: 'bg-cyan-500', label: 'Strong' };
    return { width: '100%', color: 'bg-emerald-500', label: 'Very Strong' };
  };

  const strength = getStrengthBar();

  // Debounced Email Verification (500ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = email.trim();
    if (!trimmed) {
      setEmailState('idle');
      setEmailMessage('');
      return;
    }

    // 1. Frontend format validation
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailState('invalid_format');
      setEmailMessage('Please enter a valid email address.');
      return;
    }

    // 2. Set checking state & debounce backend database call
    setEmailState('checking');
    setEmailMessage('Checking email...');

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.checkEmailAvailability(trimmed);
        if (res.available) {
          setEmailState('available');
          setEmailMessage('Email is available');
        } else {
          setEmailState('registered');
          setEmailMessage('This email is already registered');
        }
      } catch (err) {
        setEmailState('idle');
        setEmailMessage('');
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [email]);

  const isFormValid =
    name.trim().length >= 2 &&
    emailState === 'available' &&
    isPasswordValid &&
    isPasswordMatch &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (emailState === 'registered') {
      setErrorMessage('This email is already registered. Please use another email or sign in.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('Password must satisfy all 5 security requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.register({
        name: name.trim(),
        email: cleanEmail,
        password,
        role,
        agency: agency.trim(),
      });

      setSuccessMessage('Account created successfully! Redirecting to login...');

      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Account created successfully! Please sign in with your credentials.' },
        });
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 relative overflow-hidden py-10">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/10 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/landing" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-[1.5px] shadow-xl shadow-blue-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent font-outfit">
              SmartFlow
            </span>
          </Link>
          <p className="text-xs text-slate-400 font-medium">
            Intelligent Traffic Management & Municipal Command
          </p>
        </div>

        {/* Register Form Container */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl bg-slate-950/80 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="font-bold text-base text-white font-outfit">Create Authority Account</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Register for municipal mobility and traffic command access
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Success Banner */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg shadow-emerald-500/10"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium font-outfit">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Dr. Rajesh Sharma"
                  autoComplete="name"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Email Address with Real-Time Validation */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block flex items-center justify-between">
                <span>Official Email Address</span>
                {/* Status Indicator Chip */}
                {emailState === 'checking' && (
                  <span className="text-[10px] text-cyan-400 flex items-center gap-1 font-mono">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Checking email...</span>
                  </span>
                )}
                {emailState === 'available' && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>🟢 Email is available</span>
                  </span>
                )}
                {emailState === 'registered' && (
                  <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>🔴 This email is already registered</span>
                  </span>
                )}
                {emailState === 'invalid_format' && (
                  <span className="text-[10px] text-rose-400 font-medium flex items-center gap-1 font-mono">
                    <span>🔴 Invalid email</span>
                  </span>
                )}
              </label>

              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="commissioner@nmcnagpur.gov.in"
                  autoComplete="email"
                  disabled={isSubmitting}
                  className={`w-full bg-slate-900/90 border rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-mono ${
                    emailState === 'available'
                      ? 'border-emerald-500/60 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30'
                      : emailState === 'registered' || emailState === 'invalid_format'
                      ? 'border-rose-500/60 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                      : 'border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                  }`}
                />

                {/* Right side field icon */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {emailState === 'checking' && (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  )}
                  {emailState === 'available' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {(emailState === 'registered' || emailState === 'invalid_format') && (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              </div>

              {/* Helper text below input */}
              {emailMessage && (
                <p
                  className={`text-[11px] font-mono transition-colors ${
                    emailState === 'available'
                      ? 'text-emerald-400'
                      : emailState === 'checking'
                      ? 'text-cyan-400'
                      : 'text-rose-400'
                  }`}
                >
                  {emailMessage}
                </p>
              )}
            </div>

            {/* Role and Agency Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Jurisdiction Role</label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    disabled={isSubmitting}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Planning Authority">Planning Authority</option>
                    <option value="Traffic Administrator">Traffic Administrator</option>
                    <option value="Traffic Analyst">Traffic Analyst</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Agency / Department</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                    placeholder="Nagpur Municipal Corp (NMC)"
                    disabled={isSubmitting}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className="font-semibold text-white font-mono">{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                </div>
              )}

              {/* Criteria Checklist */}
              <div className="grid grid-cols-2 gap-1.5 pt-1.5 text-[10px] text-slate-400">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                  {hasMinLength ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-slate-600" />}
                  <span>Min 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                  {hasUppercase ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-slate-600" />}
                  <span>Uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                  {hasLowercase ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-slate-600" />}
                  <span>Lowercase letter (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                  {hasNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-slate-600" />}
                  <span>Number digit (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 col-span-2 ${hasSpecial ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                  {hasSpecial ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-slate-600" />}
                  <span>Special character (!@#$%^&*)</span>
                </div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block flex items-center justify-between">
                <span>Confirm Password</span>
                {confirmPassword && (
                  <span
                    className={`text-[10px] font-mono flex items-center gap-1 ${
                      isPasswordMatch ? 'text-emerald-400 font-medium' : 'text-rose-400'
                    }`}
                  >
                    {isPasswordMatch ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 text-rose-400" />
                        <span>Passwords do not match</span>
                      </>
                    )}
                  </span>
                )}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className={`w-full bg-slate-900/90 border rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-mono ${
                    confirmPassword && !isPasswordMatch
                      ? 'border-rose-500/60 focus:border-rose-400'
                      : confirmPassword && isPasswordMatch
                      ? 'border-emerald-500/60 focus:border-emerald-400'
                      : 'border-slate-700/80 focus:border-cyan-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Register Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 font-outfit ${
                  isFormValid
                    ? 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 cursor-pointer'
                    : 'bg-slate-800/80 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Creating your SmartFlow account...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create SmartFlow Account</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              Already hold an official authorization?{' '}
              <Link
                to="/login"
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Sign In to Command Center
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
