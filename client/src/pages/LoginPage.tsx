import React, { useState, useEffect } from 'react';
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
  Zap,
  TrendingDown,
  Navigation,
  Check,
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

  // Simulation animation states
  const [tick, setTick] = useState(0);
  const [activePhase, setActivePhase] = useState<'EW_GREEN' | 'NS_GREEN'>('EW_GREEN');

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => (prev + 1) % 1000);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const phaseTimer = setInterval(() => {
      setActivePhase((prev) => (prev === 'EW_GREEN' ? 'NS_GREEN' : 'EW_GREEN'));
    }, 3500);
    return () => clearInterval(phaseTimer);
  }, []);

  const successMessage = (location.state as any)?.message;

  useEffect(() => {
    const token = localStorage.getItem('smartflow_token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

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
      window.location.href = '/';
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Main Split-Screen Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-2xl shadow-2xl overflow-hidden relative z-10 min-h-[640px]">
        
        {/* ================= LEFT COLUMN: DYNAMIC TRAFFIC SIMULATION & CITY GRAPHICS ================= */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-[#070d1a]/95 p-6 sm:p-10 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-slate-800/80 overflow-hidden">
          
          {/* Subtle Grid Radar Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf812_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-3">
            <Link to="/landing" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-[1.5px] shadow-lg shadow-blue-500/30">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent block">
                  SmartFlow
                </span>
                <span className="text-[10px] font-mono text-cyan-400/90 uppercase tracking-widest block font-bold">
                  Intelligent Traffic Management Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Centerpiece: Dynamic SVG Traffic Junction & Vehicle Movement Visualization */}
          <div className="my-6 relative rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-inner overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-white font-mono uppercase tracking-wider">
                  Sitabuldi Central Junction Simulation
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Phase: {activePhase === 'EW_GREEN' ? 'East-West Green (35s)' : 'North-South Green (30s)'}
              </span>
            </div>

            {/* Dynamic Interactive SVG Canvas */}
            <div className="relative h-56 w-full flex items-center justify-center my-2">
              <svg viewBox="0 0 500 240" className="w-full h-full">
                <defs>
                  {/* Road Gradient */}
                  <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  {/* Glowing Vehicle Light */}
                  <radialGradient id="vehicleGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Horizontal Arterial Road (East-West) */}
                <rect x="0" y="90" width="500" height="60" fill="url(#roadGrad)" stroke="#334155" strokeWidth="1" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#facc15" strokeDasharray="8 8" strokeWidth="1.5" />

                {/* Vertical Arterial Road (North-South) */}
                <rect x="220" y="0" width="60" height="240" fill="url(#roadGrad)" stroke="#334155" strokeWidth="1" />
                <line x1="250" y1="0" x2="250" y2="240" stroke="#facc15" strokeDasharray="8 8" strokeWidth="1.5" />

                {/* Center Intersection Box */}
                <rect x="220" y="90" width="60" height="60" fill="#090d16" stroke="#06b6d4" strokeDasharray="4 4" strokeWidth="1.5" />

                {/* Crosswalk Zebra Lines */}
                <line x1="220" y1="85" x2="280" y2="85" stroke="#94a3b8" strokeDasharray="4 3" strokeWidth="2" />
                <line x1="220" y1="155" x2="280" y2="155" stroke="#94a3b8" strokeDasharray="4 3" strokeWidth="2" />
                <line x1="215" y1="90" x2="215" y2="150" stroke="#94a3b8" strokeDasharray="4 3" strokeWidth="2" />
                <line x1="285" y1="90" x2="285" y2="150" stroke="#94a3b8" strokeDasharray="4 3" strokeWidth="2" />

                {/* 4-Way Traffic Light Signals */}
                {/* North Signal */}
                <circle cx="210" cy="80" r="4" fill={activePhase === 'NS_GREEN' ? '#22c55e' : '#ef4444'} />
                {/* South Signal */}
                <circle cx="290" cy="160" r="4" fill={activePhase === 'NS_GREEN' ? '#22c55e' : '#ef4444'} />
                {/* West Signal */}
                <circle cx="210" cy="160" r="4" fill={activePhase === 'EW_GREEN' ? '#22c55e' : '#ef4444'} />
                {/* East Signal */}
                <circle cx="290" cy="80" r="4" fill={activePhase === 'EW_GREEN' ? '#22c55e' : '#ef4444'} />

                {/* Animated Moving Vehicles (Eastbound) */}
                <g transform={`translate(${((tick * 2.8) % 520) - 20}, 105)`}>
                  <rect x="0" y="0" width="16" height="8" rx="2" fill="#38bdf8" />
                  <circle cx="8" cy="4" r="8" fill="url(#vehicleGlow)" />
                </g>
                <g transform={`translate(${(((tick * 2.8) + 180) % 520) - 20}, 105)`}>
                  <rect x="0" y="0" width="22" height="9" rx="2" fill="#10b981" />
                </g>

                {/* Animated Moving Vehicles (Westbound) */}
                <g transform={`translate(${520 - (((tick * 2.4) + 60) % 540)}, 127)`}>
                  <rect x="0" y="0" width="16" height="8" rx="2" fill="#a855f7" />
                </g>
                <g transform={`translate(${520 - (((tick * 2.4) + 300) % 540)}, 127)`}>
                  <rect x="0" y="0" width="26" height="10" rx="2" fill="#f59e0b" />
                </g>

                {/* Animated Moving Vehicles (North-South) */}
                <g transform={`translate(235, ${((tick * 2.0) % 260) - 20})`}>
                  <rect x="0" y="0" width="8" height="15" rx="2" fill="#ec4899" />
                </g>
                <g transform={`translate(257, ${260 - (((tick * 1.8) + 120) % 280)})`}>
                  <rect x="0" y="0" width="8" height="15" rx="2" fill="#06b6d4" />
                </g>

                {/* Junction Radar Pulse Ring */}
                <circle
                  cx="250"
                  cy="120"
                  r={15 + ((tick % 100) * 0.45)}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  opacity={1 - ((tick % 100) / 100)}
                />
              </svg>
            </div>

            {/* Live Telemetry Bar */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center">
              <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Delay Reduction</span>
                <span className="text-xs font-extrabold text-emerald-400 font-mono flex items-center justify-center gap-1 mt-0.5">
                  <TrendingDown className="w-3.5 h-3.5" /> -28.4%
                </span>
              </div>
              <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Corridor Flow</span>
                <span className="text-xs font-extrabold text-cyan-400 font-mono flex items-center justify-center gap-1 mt-0.5">
                  <Navigation className="w-3.5 h-3.5" /> 4,120 v/hr
                </span>
              </div>
              <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">AI Green Wave</span>
                <span className="text-xs font-extrabold text-indigo-400 font-mono flex items-center justify-center gap-1 mt-0.5">
                  <Zap className="w-3.5 h-3.5" /> Active (98%)
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Bullet Points / Value Proposition */}
          <div className="relative z-10 space-y-2 text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span>Real-time Webster signal optimization for 12 key municipal intersections</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span>Greenshields bottleneck prediction & dynamic bypass rerouting</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: AUTHORITY LOGIN FORM ================= */}
        <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-center relative bg-slate-950/60">
          
          <div className="space-y-6 max-w-sm mx-auto w-full">
            
            {/* Form Title & Authority Security Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="font-bold text-lg text-white tracking-tight">Authority Sign In</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Municipal Traffic Command Center
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Success Message Alert */}
            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
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
                    placeholder="commissioner@nmcnagpur.gov.in"
                    autoComplete="email"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
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
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
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
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="pt-4 border-t border-slate-800/80 text-center">
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

            {/* Footer Tag */}
            <p className="text-[10px] text-center text-slate-500">
              SmartFlow Traffic Intelligence Command &bull; Enterprise Production Security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
