import React, { useState } from 'react';
import {
  Shield,
  Sliders,
  Database,
  CheckCircle2,
  Server,
  Zap,
  Building,
  Mail,
  UserCheck,
  KeyRound,
  Globe2,
  Clock,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [modThreshold, setModThreshold] = useState(50);
  const [heavyThreshold, setHeavyThreshold] = useState(70);
  const [severeThreshold, setSevereThreshold] = useState(85);
  const [greenshieldsSensitivity, setGreenshieldsSensitivity] = useState(1.2);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSignOut = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 lg:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg lg:text-xl text-white">
              Authority Profile & System Settings
            </h1>
            <Badge variant="blue" size="xs">
              Command v2.4
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Active login session details, authority clearances, and traffic simulation parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-600/30 transition-all active:scale-95"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{savedSuccess ? 'Preferences Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      {/* ================= ACTIVE AUTHORITY PROFILE & LOGIN DETAILS CARD ================= */}
      <div className="glass-panel rounded-2xl p-5 lg:p-6 border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-[#080e1a]/90 relative overflow-hidden shadow-xl">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-blue-500/25">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-extrabold text-base text-cyan-400">
                {user?.name ? user.name[0] : 'A'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-white">{user?.name || 'Municipal Authority Official'}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Active Session
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user?.agency || 'Nagpur Municipal Corporation (NMC) & NIT'}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/40 text-rose-300 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* 4-Grid Authority Login Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 relative z-10">
          {/* Email */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Login Email</span>
            </div>
            <p className="font-mono text-xs font-bold text-slate-100 truncate">{user?.email || 'officer@gov.in'}</p>
            <span className="text-[10px] text-emerald-400 font-semibold block">Verified Identity</span>
          </div>

          {/* Role */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Assigned Role</span>
            </div>
            <p className="text-xs font-bold text-slate-100 truncate">{user?.role || 'Planning Authority'}</p>
            <span className="text-[10px] text-blue-400 font-semibold block">Level 4 Clearance</span>
          </div>

          {/* Jurisdiction */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Globe2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Jurisdiction</span>
            </div>
            <p className="text-xs font-bold text-slate-100 truncate">Nagpur Metro Region</p>
            <span className="text-[10px] text-purple-400 font-semibold block">6 Municipal Sectors</span>
          </div>

          {/* Security Protocol */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Token Protocol</span>
            </div>
            <p className="font-mono text-xs font-bold text-slate-100 truncate">TLS 1.3 &bull; JWT Auth</p>
            <span className="text-[10px] text-amber-400 font-semibold block">24-Hour Expiry</span>
          </div>
        </div>
      </div>

      {/* Congestion Thresholds Section */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Congestion Capacity Alert Thresholds</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-amber-400">
                Moderate Congestion Trigger: {modThreshold}%
              </span>
              <span className="text-slate-400">Yellow Status</span>
            </div>
            <input
              type="range"
              min="30"
              max="65"
              value={modThreshold}
              onChange={(e) => setModThreshold(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-orange-400">
                Heavy Flow Warning Trigger: {heavyThreshold}%
              </span>
              <span className="text-slate-400">Orange Status</span>
            </div>
            <input
              type="range"
              min="60"
              max="80"
              value={heavyThreshold}
              onChange={(e) => setHeavyThreshold(parseInt(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-rose-400">
                Severe Gridlock Lockdown Trigger: {severeThreshold}%
              </span>
              <span className="text-slate-400">Red Status</span>
            </div>
            <input
              type="range"
              min="75"
              max="95"
              value={severeThreshold}
              onChange={(e) => setSevereThreshold(parseInt(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Greenshields Physics & Signal Timing Multipliers */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span>Greenshields Traffic Stream Physics</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
            <span className="font-semibold text-white block">Driver Reaction Sensitivity</span>
            <input
              type="number"
              step="0.1"
              value={greenshieldsSensitivity}
              onChange={(e) => setGreenshieldsSensitivity(parseFloat(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 w-full font-mono"
            />
            <span className="text-[10px] text-slate-400 block">
              Default: 1.2 (Higher = faster braking wave propagation)
            </span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
            <span className="font-semibold text-white block">Transit Green Wave Ratio</span>
            <input
              type="number"
              defaultValue={1.4}
              step="0.1"
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 w-full font-mono"
            />
            <span className="text-[10px] text-slate-400 block">
              Multiplies green duration for BRT priority corridors
            </span>
          </div>
        </div>
      </div>

      {/* System Diagnostics & Agency Profile */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>System Health & Data Source</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-blue-400" />
              <div>
                <p className="font-semibold text-white">Backend Simulation Store</p>
                <p className="text-[10px] text-slate-400">In-Memory Engine & MongoDB Sync</p>
              </div>
            </div>
            <Badge variant="emerald" size="xs">
              Online
            </Badge>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Building className="w-4 h-4 text-purple-400" />
              <div>
                <p className="font-semibold text-white">Active Agency</p>
                <p className="text-[10px] text-slate-400">{user?.agency || 'Nagpur Municipal Corporation'}</p>
              </div>
            </div>
            <Badge variant="blue" size="xs">
              {user?.role || 'Planning Authority'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
