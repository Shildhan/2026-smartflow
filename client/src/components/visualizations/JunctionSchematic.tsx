import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IJunction } from '../../types';
import { Clock, Zap, AlertTriangle, ShieldCheck, Car } from 'lucide-react';

interface JunctionSchematicProps {
  junction: IJunction;
  onAutoOptimize?: (id: string) => void;
  isOptimizing?: boolean;
}

export const JunctionSchematic: React.FC<JunctionSchematicProps> = ({
  junction,
  onAutoOptimize,
  isOptimizing = false,
}) => {
  const [currentPhase, setCurrentPhase] = useState<'green' | 'yellow' | 'red'>(junction.currentPhase || 'green');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(junction.greenDurationSec || 45);

  // Live countdown timer simulating actual traffic signal cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Switch phase
          if (currentPhase === 'green') {
            setCurrentPhase('yellow');
            return junction.yellowDurationSec || 5;
          } else if (currentPhase === 'yellow') {
            setCurrentPhase('red');
            return junction.redDurationSec || 45;
          } else {
            setCurrentPhase('green');
            return junction.greenDurationSec || 45;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPhase, junction]);

  const isGreen = currentPhase === 'green';
  const isYellow = currentPhase === 'yellow';
  const isRed = currentPhase === 'red';

  const phaseColor = isGreen ? '#10b981' : isYellow ? '#f59e0b' : '#ef4444';

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800 space-y-4 bg-slate-950/80">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-[10px] font-bold">
              {junction.code}
            </span>
            <span className="text-xs text-slate-400 font-mono">4-Way Signalized Geometric Intersection</span>
          </div>
          <h3 className="text-base font-bold text-white font-outfit mt-0.5">{junction.name}</h3>
        </div>

        {/* Phase Countdown Disc */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono">
            <span
              className="w-3 h-3 rounded-full animate-pulse shadow-md"
              style={{ backgroundColor: phaseColor }}
            />
            <span className="text-xs uppercase font-bold" style={{ color: phaseColor }}>
              {currentPhase} ({secondsRemaining}s)
            </span>
          </div>

          {onAutoOptimize && (
            <button
              onClick={() => onAutoOptimize(junction.id || junction.code)}
              disabled={isOptimizing}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer font-outfit"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isOptimizing ? 'Optimizing...' : 'Webster Auto-Tune'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2D Geometric Intersection Canvas (4-Way) */}
      <div className="relative w-full h-[320px] sm:h-[360px] bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
        {/* Asphalt road cross layout */}
        {/* Vertical Road (North-South) */}
        <div className="absolute w-28 sm:w-36 h-full bg-[#0a0f1d] border-x-2 border-slate-700/80 flex flex-col justify-between py-2">
          {/* North Approach Lane Markings */}
          <div className="w-full flex justify-around border-b border-dashed border-yellow-500/40 pb-2">
            <span className="text-[10px] text-slate-400 font-mono font-bold">Northbound</span>
          </div>

          {/* South Approach Lane Markings */}
          <div className="w-full flex justify-around border-t border-dashed border-yellow-500/40 pt-2">
            <span className="text-[10px] text-slate-400 font-mono font-bold">Southbound</span>
          </div>
        </div>

        {/* Horizontal Road (East-West) */}
        <div className="absolute h-28 sm:h-36 w-full bg-[#0a0f1d] border-y-2 border-slate-700/80 flex justify-between items-center px-2">
          <span className="text-[10px] text-slate-400 font-mono font-bold -rotate-90">Westbound</span>
          <span className="text-[10px] text-slate-400 font-mono font-bold rotate-90">Eastbound</span>
        </div>

        {/* Center Intersection Box with Zebra Crossings */}
        <div className="relative z-10 w-28 sm:w-36 h-28 sm:h-36 bg-slate-950/90 border border-slate-700 flex flex-col items-center justify-center p-2 text-center shadow-2xl">
          <div className="w-8 h-8 rounded-full bg-slate-900 border-2 flex items-center justify-center" style={{ borderColor: phaseColor }}>
            <span className="text-xs font-mono font-bold" style={{ color: phaseColor }}>{secondsRemaining}</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 mt-1">Cycle: {junction.signalCycleSec}s</span>
        </div>

        {/* 4 Traffic Light Heads with live 3-Aspect LEDs */}
        {/* North Signal Head */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center bg-slate-950 p-1.5 rounded-lg border border-slate-700 shadow-xl">
          <div className="flex gap-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isRed ? 'bg-rose-500 shadow-[0_0_8px_#ef4444]' : 'bg-rose-950'}`} />
            <span className={`w-2.5 h-2.5 rounded-full ${isYellow ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-amber-950'}`} />
            <span className={`w-2.5 h-2.5 rounded-full ${isGreen ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-emerald-950'}`} />
          </div>
        </div>

        {/* South Signal Head */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center bg-slate-950 p-1.5 rounded-lg border border-slate-700 shadow-xl">
          <div className="flex gap-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isRed ? 'bg-rose-500 shadow-[0_0_8px_#ef4444]' : 'bg-rose-950'}`} />
            <span className={`w-2.5 h-2.5 rounded-full ${isYellow ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-amber-950'}`} />
            <span className={`w-2.5 h-2.5 rounded-full ${isGreen ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-emerald-950'}`} />
          </div>
        </div>

        {/* East Signal Head */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center bg-slate-950 p-1.5 rounded-lg border border-slate-700 shadow-xl">
          <div className="flex flex-col gap-1">
            <span className={`w-2.5 h-2.5 rounded-full ${!isRed ? 'bg-rose-500 shadow-[0_0_8px_#ef4444]' : 'bg-rose-950'}`} />
            <span className={`w-2.5 h-2.5 rounded-full ${isYellow ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-amber-950'}`} />
            <span className={`w-2.5 h-2.5 rounded-full ${isRed ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-emerald-950'}`} />
          </div>
        </div>

        {/* West Signal Head */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center bg-slate-950 p-1.5 rounded-lg border border-slate-700 shadow-xl">
          <div className="flex flex-col gap-1">
            <span className={`w-2.5 h-2.5 rounded-full ${!isRed ? 'bg-rose-500 shadow-[0_0_8px_#ef4444]' : 'bg-rose-950'}`} />
            <span className={`w-2.5 h-2.5 rounded-full ${isYellow ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-amber-950'}`} />
            <span className={`w-2.5 h-2.5 rounded-full ${isRed ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-emerald-950'}`} />
          </div>
        </div>

        {/* Queue Vehicle Visual Representation */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1">
          <div className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold flex items-center gap-1 shadow-md">
            <Car className="w-3 h-3" />
            <span>{junction.queueLengthVeh} Veh Queued</span>
          </div>
        </div>
      </div>

      {/* Signal Timing Split Bar */}
      <div className="space-y-1.5 text-xs font-mono">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Signal Split Allocation (Total: {junction.signalCycleSec}s)</span>
          <span className="text-emerald-400 font-bold">{Math.round((junction.greenDurationSec / junction.signalCycleSec) * 100)}% Green Ratio (λ)</span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full flex items-center justify-center text-[9px] text-slate-950 font-bold"
            style={{ width: `${(junction.greenDurationSec / junction.signalCycleSec) * 100}%` }}
            title={`Green: ${junction.greenDurationSec}s`}
          >
            {junction.greenDurationSec}s
          </div>
          <div
            className="bg-amber-400 h-full flex items-center justify-center text-[9px] text-slate-950 font-bold"
            style={{ width: `${(junction.yellowDurationSec / junction.signalCycleSec) * 100}%` }}
            title={`Yellow: ${junction.yellowDurationSec}s`}
          >
            {junction.yellowDurationSec}s
          </div>
          <div
            className="bg-rose-500 h-full flex items-center justify-center text-[9px] text-slate-950 font-bold"
            style={{ width: `${(junction.redDurationSec / junction.signalCycleSec) * 100}%` }}
            title={`Red: ${junction.redDurationSec}s`}
          >
            {junction.redDurationSec}s
          </div>
        </div>
      </div>
    </div>
  );
};
