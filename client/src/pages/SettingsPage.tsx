import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Sliders,
  Database,
  CheckCircle2,
  RefreshCw,
  Server,
  Zap,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [modThreshold, setModThreshold] = useState(50);
  const [heavyThreshold, setHeavyThreshold] = useState(70);
  const [severeThreshold, setSevereThreshold] = useState(85);
  const [greenshieldsSensitivity, setGreenshieldsSensitivity] = useState(1.2);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 lg:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg lg:text-xl text-white">
              System Settings & Simulation Calibration
            </h1>
            <Badge variant="blue" size="xs">
              Config V1.0
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure jurisdictional boundary thresholds, Greenshields physics coefficients, and authority profiles.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{savedSuccess ? 'Preferences Saved!' : 'Save Changes'}</span>
        </button>
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
                Severe Bottleneck Lockdown: {severeThreshold}%
              </span>
              <span className="text-slate-400">Red Status / Critical Alert</span>
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

      {/* Simulation Physics Parameters */}
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
                <p className="text-[10px] text-slate-400">{user?.agency || 'MDPA'}</p>
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
