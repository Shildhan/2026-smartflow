import React from 'react';
import { motion } from 'framer-motion';
import { PeakHourType } from '../../types';
import { Sun, Moon, ArrowDownRight, ArrowUpLeft, Navigation, Car } from 'lucide-react';

interface PeakCommuteFlowGraphicProps {
  peakHour: PeakHourType;
  onTogglePeak?: (peak: PeakHourType) => void;
}

export const PeakCommuteFlowGraphic: React.FC<PeakCommuteFlowGraphicProps> = ({
  peakHour,
  onTogglePeak,
}) => {
  const isMorning = peakHour === 'morning';

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4 bg-slate-950/80">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
            Commuter Flow Directionality Analysis
          </span>
          <h4 className="text-sm font-bold text-white font-outfit mt-0.5">
            {isMorning ? '🌅 Morning Centripetal Inflow (Inward Surge)' : '🌆 Evening Centrifugal Outflow (Outward Dispersal)'}
          </h4>
        </div>

        {onTogglePeak && (
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 font-mono text-xs self-start">
            <button
              onClick={() => onTogglePeak('morning')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isMorning ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>09:00 - 12:00</span>
            </button>
            <button
              onClick={() => onTogglePeak('evening')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                !isMorning ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>16:00 - 19:00</span>
            </button>
          </div>
        )}
      </div>

      {/* Vector Graphic: Centripetal vs Centrifugal Commute Dynamics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Visual Schematic Box */}
        <div className="relative h-48 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden p-4">
          {/* Central CBD Core Node */}
          <div className="relative z-10 w-24 h-24 rounded-full bg-slate-950 border-2 border-cyan-500/60 shadow-2xl flex flex-col items-center justify-center text-center p-2">
            <span className="text-[10px] font-bold text-cyan-300 font-outfit">Sitabuldi CBD</span>
            <span className="text-[9px] font-mono text-rose-400 font-bold">96% Load</span>
          </div>

          {/* Orbiting / Surging Peripheral Suburban Nodes */}
          <div className="absolute top-3 left-4 text-[9px] font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
            North Suburbs
          </div>
          <div className="absolute top-3 right-4 text-[9px] font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
            East Industrial
          </div>
          <div className="absolute bottom-3 left-4 text-[9px] font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
            West Residential
          </div>
          <div className="absolute bottom-3 right-4 text-[9px] font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
            South Ring Outer
          </div>

          {/* Animated Inward / Outward Surging Arrows */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none">
            {isMorning ? (
              // Inward arrows toward CBD
              <g stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse">
                <line x1="20%" y1="20%" x2="42%" y2="42%" markerEnd="url(#arrow)" />
                <line x1="80%" y1="20%" x2="58%" y2="42%" markerEnd="url(#arrow)" />
                <line x1="20%" y1="80%" x2="42%" y2="58%" markerEnd="url(#arrow)" />
                <line x1="80%" y1="80%" x2="58%" y2="58%" markerEnd="url(#arrow)" />
              </g>
            ) : (
              // Outward arrows away from CBD
              <g stroke="#818cf8" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse">
                <line x1="42%" y1="42%" x2="20%" y2="20%" markerEnd="url(#arrow)" />
                <line x1="58%" y1="42%" x2="80%" y2="20%" markerEnd="url(#arrow)" />
                <line x1="42%" y1="58%" x2="20%" y2="80%" markerEnd="url(#arrow)" />
                <line x1="58%" y1="58%" x2="80%" y2="80%" markerEnd="url(#arrow)" />
              </g>
            )}
          </svg>
        </div>

        {/* Dynamics Breakdown Text */}
        <div className="space-y-2.5 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">
              {isMorning ? 'Morning Surge Pattern (09:00 - 12:00)' : 'Evening Dispersal Pattern (16:00 - 19:00)'}
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {isMorning
                ? '68,400 vehicles converge inward toward Sitabuldi CBD & Wardha Road IT corridors, creating severe choke points while Outer Ring Corridors run at only 31% utilization.'
                : 'Commuters disperse outwards from commercial employment centers towards residential zones (Dharampeth, Besa, Wardha Suburbs), causing radial arterial queues.'}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-cyan-300">
            <span>Recommended Intervention:</span>
            <strong className="text-white font-bold">
              {isMorning ? 'Inbound Outer Bypass Diversion' : 'Radial Staggered Exit Waves'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
