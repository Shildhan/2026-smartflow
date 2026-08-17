import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, ShieldCheck, Car, Gauge } from 'lucide-react';
import { ISimulationResult } from '../../types';

interface BeforeAfterNetworkGraphicProps {
  simulationResult?: ISimulationResult | null;
}

export const BeforeAfterNetworkGraphic: React.FC<BeforeAfterNetworkGraphicProps> = ({
  simulationResult,
}) => {
  const [activeTab, setActiveTab] = useState<'before' | 'after' | 'split'>('split');

  const beforeMetrics = simulationResult?.beforeMetrics || {
    averageSpeedKmh: 18.4,
    congestedRoadsCount: 14,
    averageTrafficDelayMin: 28.6,
    roadUtilizationPct: 88,
    unevenDistributionIndex: 0.64,
  };

  const afterMetrics = simulationResult?.afterMetrics || {
    averageSpeedKmh: 36.2,
    congestedRoadsCount: 2,
    averageTrafficDelayMin: 8.6,
    roadUtilizationPct: 62,
    unevenDistributionIndex: 0.18,
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800 space-y-4 bg-slate-950/80">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
            Visual Before vs After Network Equilibrium
          </span>
          <h3 className="text-base font-bold text-white font-outfit mt-0.5">
            Intervention Impact: Choked Arterials → Balanced Peripheral Ring
          </h3>
        </div>

        {/* View mode toggle */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 font-mono text-xs self-start">
          <button
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'split' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dual Comparison
          </button>
          <button
            onClick={() => setActiveTab('before')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'before' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Before (Choked)
          </button>
          <button
            onClick={() => setActiveTab('after')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'after' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            After (Optimized)
          </button>
        </div>
      </div>

      {/* Visual Dual-Network Graphic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BEFORE BOX */}
        {(activeTab === 'split' || activeTab === 'before') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-rose-950/15 border border-rose-500/30 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
              <span className="text-xs font-bold text-rose-300 font-outfit flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>BEFORE: Severe Uneven Choke</span>
              </span>
              <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30 font-bold">
                Gini: {beforeMetrics.unevenDistributionIndex?.toFixed(2) || '0.64'}
              </span>
            </div>

            {/* Visual Road Network Illustration (Before) */}
            <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Sitabuldi CBD Arterials:</span>
                  <span className="text-rose-400 font-bold">96% Load (Gridlock)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="w-[96%] h-full bg-rose-500 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Outer Ring Road Bypass:</span>
                  <span className="text-emerald-400 font-bold">31% Load (Unused)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="w-[31%] h-full bg-emerald-500" />
                </div>
              </div>
            </div>

            {/* Metrics List */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2 rounded bg-slate-950 border border-rose-500/20">
                <span className="text-[9px] text-slate-400 block">Avg Speed</span>
                <span className="text-rose-400 font-bold text-xs">{beforeMetrics.averageSpeedKmh} km/h</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-rose-500/20">
                <span className="text-[9px] text-slate-400 block">Delay</span>
                <span className="text-rose-400 font-bold text-xs">{beforeMetrics.averageTrafficDelayMin} min</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-rose-500/20">
                <span className="text-[9px] text-slate-400 block">Congested</span>
                <span className="text-rose-400 font-bold text-xs">{beforeMetrics.congestedRoadsCount} Roads</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* AFTER BOX */}
        {(activeTab === 'split' || activeTab === 'after') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/30 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <span className="text-xs font-bold text-emerald-300 font-outfit flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>AFTER: Intelligent Equilibrium</span>
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                Gini: {afterMetrics.unevenDistributionIndex?.toFixed(2) || '0.18'}
              </span>
            </div>

            {/* Visual Road Network Illustration (After) */}
            <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Sitabuldi CBD Arterials:</span>
                  <span className="text-amber-400 font-bold">68% Load (Smooth Flow)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="w-[68%] h-full bg-amber-400" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Outer Ring Road Bypass:</span>
                  <span className="text-cyan-400 font-bold">64% Load (Active Bypass)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="w-[64%] h-full bg-cyan-400" />
                </div>
              </div>
            </div>

            {/* Metrics List */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2 rounded bg-slate-950 border border-emerald-500/20">
                <span className="text-[9px] text-slate-400 block">Avg Speed</span>
                <span className="text-emerald-400 font-bold text-xs">{afterMetrics.averageSpeedKmh} km/h</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-emerald-500/20">
                <span className="text-[9px] text-slate-400 block">Delay</span>
                <span className="text-cyan-400 font-bold text-xs">{afterMetrics.averageTrafficDelayMin} min</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-emerald-500/20">
                <span className="text-[9px] text-slate-400 block">Congested</span>
                <span className="text-emerald-400 font-bold text-xs">{afterMetrics.congestedRoadsCount} Roads</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
