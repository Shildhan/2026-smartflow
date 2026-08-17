import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, ArrowRight, ShieldCheck, AlertTriangle, Car } from 'lucide-react';
import { ISimulationStep } from '../../types';

interface SimulationNetworkCanvasProps {
  currentStep?: ISimulationStep | null;
  progressPct: number;
  strategies: string[];
  isPlaying: boolean;
}

export const SimulationNetworkCanvas: React.FC<SimulationNetworkCanvasProps> = ({
  currentStep,
  progressPct,
  strategies,
  isPlaying,
}) => {
  const [particleTick, setParticleTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setParticleTick((prev) => (prev + 1) % 100);
    }, 45);
    return () => clearInterval(timer);
  }, []);

  // Determine active simulation stage
  const isEarlyPhase = progressPct < 30;
  const isChokePhase = progressPct >= 30 && progressPct < 55;
  const isInterventionPhase = progressPct >= 55 && progressPct < 80;
  const isEquilibriumPhase = progressPct >= 80;

  const stageName = isEarlyPhase
    ? '1. Commuter Influx Surge (Inbound Flow)'
    : isChokePhase
    ? '2. CBD Arterial Congestion Peak (96% Load)'
    : isInterventionPhase
    ? '3. SmartFlow Strategy Deployed (Webster + Diversion)'
    : '4. Jurisdictional Equilibrium Achieved (Balanced Flow)';

  const stageBadgeColor = isEarlyPhase
    ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    : isChokePhase
    ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    : isInterventionPhase
    ? 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3 bg-slate-950/85 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${stageBadgeColor}`}>
            {stageName}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {currentStep?.timeLabel || 'T+00 min'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span>Active Strategies:</span>
          <span className="text-cyan-300 font-bold">{strategies.length} Enabled</span>
        </div>
      </div>

      {/* 2D Animated Simulation Network Schematic */}
      <div className="relative w-full h-[220px] sm:h-[260px] bg-slate-950 rounded-xl border border-slate-800/90 overflow-hidden flex items-center justify-center">
        {/* Subtle coordinate grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:20px_20px]" />

        <svg className="w-full h-full absolute inset-0 pointer-events-none">
          {/* Primary Arterial Link (Sitabuldi CBD -> Wardha Rd) */}
          <line
            x1="25%"
            y1="35%"
            x2="75%"
            y2="35%"
            stroke={isEquilibriumPhase ? '#f59e0b' : isChokePhase ? '#ef4444' : '#ef4444'}
            strokeWidth={isChokePhase ? '6' : '3.5'}
            strokeOpacity="0.9"
            strokeLinecap="round"
          />

          {/* Peripheral Bypass Link (Manewada -> Outer Ring) */}
          <line
            x1="25%"
            y1="75%"
            x2="75%"
            y2="75%"
            stroke={isEquilibriumPhase || isInterventionPhase ? '#06b6d4' : '#10b981'}
            strokeWidth={isInterventionPhase || isEquilibriumPhase ? '4.5' : '2.5'}
            strokeDasharray={isEarlyPhase ? '4 4' : undefined}
            strokeOpacity="0.85"
            strokeLinecap="round"
          />

          {/* Diversion Link (Connecting Arterial down to Bypass) */}
          <path
            d="M 45% 35% C 45% 55%, 55% 55%, 55% 75%"
            fill="none"
            stroke={isInterventionPhase || isEquilibriumPhase ? '#a855f7' : '#334155'}
            strokeWidth="3"
            strokeDasharray="4 4"
            strokeOpacity="0.9"
          />

          {/* Animated Particles flowing across corridors */}
          {Array.from({ length: 4 }).map((_, i) => {
            const progress = ((particleTick + i * 25) % 100) / 100;
            // Arterial flow particles
            const artX = 25 + progress * 50;
            return (
              <circle
                key={`art-${i}`}
                cx={`${artX}%`}
                cy="35%"
                r="3"
                fill={isChokePhase ? '#ef4444' : '#fbbf24'}
                className="shadow-sm"
              />
            );
          })}

          {/* Diversion stream particles active during intervention */}
          {(isInterventionPhase || isEquilibriumPhase) &&
            Array.from({ length: 3 }).map((_, i) => {
              const p = ((particleTick * 1.2 + i * 33) % 100) / 100;
              const dx = 45 + p * 10;
              const dy = 35 + p * 40;
              return (
                <circle
                  key={`div-${i}`}
                  cx={`${dx}%`}
                  cy={`${dy}%`}
                  r="3.5"
                  fill="#c084fc"
                />
              );
            })}
        </svg>

        {/* Node A (CBD Node) */}
        <div className="absolute left-[25%] top-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold font-mono shadow-xl transition-all ${
              isChokePhase
                ? 'bg-rose-950 border-rose-500 text-rose-300'
                : 'bg-slate-900 border-amber-400 text-amber-300'
            }`}
          >
            CBD
          </div>
          <span className="text-[9px] font-mono text-slate-400 mt-1">Sitabuldi</span>
        </div>

        {/* Node B (Wardha Rd Choke Node) */}
        <div className="absolute left-[75%] top-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold font-mono shadow-xl transition-all ${
              isChokePhase
                ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-900 border-emerald-400 text-emerald-300'
            }`}
          >
            IT
          </div>
          <span className="text-[9px] font-mono text-slate-400 mt-1">Wardha Rd</span>
        </div>

        {/* Node C (Bypass Entrance) */}
        <div className="absolute left-[25%] top-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-[10px] font-bold font-mono text-cyan-300 shadow-xl">
            BYP
          </div>
          <span className="text-[9px] font-mono text-slate-400 mt-1">Ring Entry</span>
        </div>

        {/* Node D (Bypass Exit) */}
        <div className="absolute left-[75%] top-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-[10px] font-bold font-mono text-cyan-300 shadow-xl">
            OUT
          </div>
          <span className="text-[9px] font-mono text-slate-400 mt-1">Outer Ring</span>
        </div>

        {/* Strategy Activation Overlay Tag */}
        {isInterventionPhase && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-3 bg-purple-950/90 border border-purple-500/50 text-purple-200 px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-xl"
          >
            <Zap className="w-3 h-3 text-purple-400 animate-bounce" />
            <span>AI Dynamic Diversion & Webster Green Waves Active</span>
          </motion.div>
        )}
      </div>

      {/* Scrubber Progression Telemetry */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
        <span>Timeline Scrubber Progress: <strong>{progressPct}%</strong></span>
        <span className={isEquilibriumPhase ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
          {isEquilibriumPhase ? '✨ Equilibrium Reached (Gini: 0.18)' : 'Balancing Traffic...'}
        </span>
      </div>
    </div>
  );
};
