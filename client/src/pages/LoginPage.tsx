import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Success message passed from password reset or register
  const successMessage = (location.state as any)?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Frontend validation
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/10 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/landing" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-[1.5px] shadow-xl shadow-blue-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div className="text-left">
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent block">
                SmartFlow
              </span>
            </div>
          </Link>
          <p className="text-xs text-slate-400 font-medium">
            Smart Traffic Management & Simulation
          </p>
        </div>

        {/* Login Form Container */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl bg-slate-950/80 backdrop-blur-xl">
          {/* Security Banner / Title */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="font-bold text-base text-white">Authority Sign In</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Access your municipal traffic command center
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Success Notification */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Notification */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="name@nmcnagpur.gov.in"
                  autoComplete="email"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold block">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
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
                  autoComplete="current-password"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

            {/* 1-Click Quick Demo Accounts */}
            <div className="pt-2 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block text-center">
                — Or 1-Click Quick Demo Login —
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('commissioner@nmcnagpur.gov.in');
                    setPassword('SmartFlow@2026!');
                    setErrorMessage('');
                  }}
                  className="p-2 rounded-xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 text-[10px] font-semibold flex flex-col items-center gap-0.5 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>🏛️ Authority</span>
                  <span className="text-[8px] text-slate-400">Commissioner</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('traffic.cp@nagpurpolice.gov.in');
                    setPassword('SmartFlow@2026!');
                    setErrorMessage('');
                  }}
                  className="p-2 rounded-xl bg-slate-900/90 border border-blue-500/30 hover:border-blue-500/60 text-blue-300 text-[10px] font-semibold flex flex-col items-center gap-0.5 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>🚓 Traffic Police</span>
                  <span className="text-[8px] text-slate-400">Administrator</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('mobility.analyst@nsscdcl.in');
                    setPassword('SmartFlow@2026!');
                    setErrorMessage('');
                  }}
                  className="p-2 rounded-xl bg-slate-900/90 border border-purple-500/30 hover:border-purple-500/60 text-purple-300 text-[10px] font-semibold flex flex-col items-center gap-0.5 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>📊 Smart City</span>
                  <span className="text-[8px] text-slate-400">Analyst</span>
                </button>
              </div>
            </div>

            {/* Register Link */}
            <div className="pt-3 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>

        {/* Footer Note */}
        <p className="text-[11px] text-center text-slate-500">
          SmartFlow Traffic Intelligence Command &bull; Enterprise Production Security
        </p>
      </div>
    </div>
  );
};
