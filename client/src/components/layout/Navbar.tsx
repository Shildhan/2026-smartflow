import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Bell,
  Calendar,
  Clock,
  Database,
  RefreshCw,
  Sun,
  Moon,
  ChevronDown,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Menu,
  X,
  Radio,
} from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { useAuth } from '../../context/AuthContext';
import { PeakHourType } from '../../types';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    peakHour,
    setPeakHour,
    selectedDate,
    setSelectedDate,
    resetDemoData,
    isLoading,
    alerts,
    unreadAlertsCount,
    markAlertRead,
  } = useTraffic();

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSimulationReset = async () => {
    setIsResetting(true);
    await resetDemoData();
    setTimeout(() => setIsResetting(false), 700);
  };

  const peakTimes: Record<PeakHourType, { label: string; time: string; icon: any }> = {
    morning: { label: 'Morning Peak', time: '09:00 AM – 12:00 PM', icon: Sun },
    evening: { label: 'Evening Peak', time: '04:00 PM – 07:00 PM', icon: Moon },
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-3 sm:px-6 lg:px-8 py-2.5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile Drawer Trigger + Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-[1.5px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent font-outfit">
                  SmartFlow
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/25">
                  Enterprise
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block font-medium">
                Nagpur Intelligent Traffic Management & Simulation
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Peak Hour Toggle, Date & Live Clock */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800/90 shadow-inner">
          {/* Peak Hour Selector */}
          <div className="flex items-center bg-slate-950/90 p-0.5 rounded-lg border border-slate-800/80">
            {(['morning', 'evening'] as PeakHourType[]).map((p) => {
              const Icon = peakTimes[p].icon;
              const active = peakHour === p;
              return (
                <button
                  key={p}
                  onClick={() => setPeakHour(p)}
                  className={`relative flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    active
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activePeakPill"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-md shadow-md shadow-blue-500/30"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{peakTimes[p].label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300 px-2 py-0.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-mono"
            />
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Live Telemetry Clock */}
          <div className="flex items-center gap-1.5 px-2 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">{currentTime || 'LIVE'}</span>
          </div>
        </div>

        {/* Right Actions: Reset, Alerts, User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Reset Live Simulation */}
          <button
            onClick={handleSimulationReset}
            disabled={isResetting || isLoading}
            title="Reset simulation physics to baseline"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-all disabled:opacity-50 active:scale-95 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden xl:inline font-medium">Reset Sim</span>
          </button>

          {/* Incident Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="relative p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 shadow-sm"
              aria-label="Incident Alerts"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse shadow-md shadow-rose-500/50">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Alerts Dropdown with AnimatePresence */}
            <AnimatePresence>
              {showAlertsDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel border border-slate-700/80 shadow-2xl p-3 z-50 space-y-2 bg-slate-950/95"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 px-1">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-xs text-white">Live Incident Alerts</span>
                    </div>
                    <Link
                      to="/alerts"
                      onClick={() => setShowAlertsDropdown(false)}
                      className="text-[11px] text-cyan-400 hover:underline font-semibold"
                    >
                      View All ({alerts.length})
                    </Link>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {alerts.slice(0, 4).map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => markAlertRead(alert.id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          alert.isRead
                            ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                            : alert.type === 'critical'
                            ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                            : alert.type === 'warning'
                            ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                            : 'bg-blue-950/30 border-blue-800/50 text-blue-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>{alert.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile & Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-all active:scale-95 shadow-sm"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-[10px] text-white shadow-inner">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="font-semibold text-[11px] leading-tight text-white">{user?.name || 'Authority'}</p>
                <p className="text-[9px] text-cyan-400 font-mono leading-tight">{user?.role || 'Planning Authority'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Dropdown with AnimatePresence */}
            <AnimatePresence>
              {showUserDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel border border-slate-700/80 shadow-2xl p-3.5 z-50 space-y-3 bg-slate-950/95 backdrop-blur-2xl"
                >
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-xs text-white shadow-md">
                        {user?.name ? user.name[0] : 'A'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-white truncate">{user?.name || 'Authority Official'}</p>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mt-0.5">
                          {user?.role || 'Planning Authority'}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Email:</span>
                        <span className="text-slate-200 font-mono text-[10px] truncate max-w-[140px]">{user?.email || 'officer@gov.in'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Agency:</span>
                        <span className="text-slate-200 text-[10px] truncate max-w-[140px]">{user?.agency || 'Municipal Traffic Command'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Status:</span>
                        <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Logged In
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      to="/settings"
                      onClick={() => setShowUserDropdown(false)}
                      className="w-full px-2.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900/80 rounded-xl font-medium transition-colors flex items-center justify-between"
                    >
                      <span>Authority Profile & Settings</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserDropdown(false);
                        window.location.href = '/login';
                      }}
                      className="w-full text-left px-2.5 py-2 text-xs text-rose-400 hover:bg-rose-950/30 rounded-xl font-semibold transition-colors flex items-center justify-between"
                    >
                      <span>Sign Out</span>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

