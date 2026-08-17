import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertTriangle,
  CornerDownRight,
  Car,
} from 'lucide-react';

interface CorridorDiversionFlowProps {
  primaryName: string;
  primaryCode?: string;
  primaryBeforeUtil: number;
  primaryAfterUtil: number;
  bypassName: string;
  bypassCode?: string;
  bypassBeforeUtil: number;
  bypassAfterUtil: number;
  diversionPct: number;
  speedGainPct?: number;
  delaySavedMin?: number;
  isApplied?: boolean;
  onApply?: () => void;
}

export const CorridorDiversionFlow: React.FC<CorridorDiversionFlowProps> = ({
  primaryName,
  primaryCode,
  primaryBeforeUtil,
  primaryAfterUtil,
  bypassName,
  bypassCode,
  bypassBeforeUtil,
  bypassAfterUtil,
  diversionPct,
  speedGainPct = 38,
  delaySavedMin = 14.5,
  isApplied = false,
  onApply,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4 bg-slate-950/80 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
            Dynamic Corridor Load Balancing Strategy
          </span>
          <h4 className="text-sm font-bold text-white font-outfit mt-0.5">
            Divert {diversionPct}% Traffic from {primaryName} to {bypassName}
          </h4>
        </div>

        {isApplied ? (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1.5 self-start">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strategy Active</span>
          </span>
        ) : onApply ? (
          <button
            onClick={onApply}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer font-outfit"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Deploy Diversion</span>
          </button>
        ) : null}
      </div>

      {/* Visual Flow Stream Representation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        {/* 1. Primary Corridor (Before -> After) */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">{primaryName}</span>
            {primaryCode && <span className="text-[10px] font-mono text-slate-400">{primaryCode}</span>}
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Bottleneck Load:</span>
            <span className="text-rose-400 font-bold">{primaryBeforeUtil}% → {primaryAfterUtil}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 ${isApplied ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'}`}
              style={{ width: `${isApplied ? primaryAfterUtil : primaryBeforeUtil}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400 block">
            {isApplied ? '🟡 Relieved to Optimal Load' : '🔴 Severe Arterial Gridlock'}
          </span>
        </div>

        {/* 2. Middle: Dynamic Diversion Stream */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-center space-y-1.5">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs font-outfit">
            <Car className="w-3.5 h-3.5 animate-bounce" />
            <span>{diversionPct}% Volume Diverted</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-cyan-400">
            <span className="w-6 h-0.5 bg-cyan-400/60" />
            <CornerDownRight className="w-4 h-4 text-cyan-400" />
            <span className="w-6 h-0.5 bg-cyan-400/60" />
          </div>
          <span className="text-[10px] font-mono text-slate-300">
            Saved <strong>{delaySavedMin} min</strong> commute delay
          </span>
        </div>

        {/* 3. Bypass Corridor (Before -> After) */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">{bypassName}</span>
            {bypassCode && <span className="text-[10px] font-mono text-slate-400">{bypassCode}</span>}
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Bypass Utilization:</span>
            <span className="text-emerald-400 font-bold">{bypassBeforeUtil}% → {bypassAfterUtil}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 ${isApplied ? 'bg-amber-400' : 'bg-emerald-500'}`}
              style={{ width: `${isApplied ? bypassAfterUtil : bypassBeforeUtil}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400 block">
            {isApplied ? '🟡 Fully Utilized Capacity' : '🟢 69% Underutilized Spare Road'}
          </span>
        </div>
      </div>

      {/* Outcome Gain Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Corridor Speed Improvement: <strong>+{speedGainPct}%</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-cyan-400">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Average Delay Slashed: <strong>-{delaySavedMin} min</strong></span>
        </div>
      </div>
    </div>
  );
};
