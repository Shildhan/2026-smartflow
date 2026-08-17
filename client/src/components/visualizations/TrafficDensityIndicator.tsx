import React from 'react';
import { CongestionLevel } from '../../types';
import { Car, AlertCircle } from 'lucide-react';

interface TrafficDensityIndicatorProps {
  utilizationPct: number;
  congestionLevel: CongestionLevel;
  lanes?: number;
  currentTrafficVeh?: number;
  averageSpeedKmh?: number;
  compact?: boolean;
}

export const TrafficDensityIndicator: React.FC<TrafficDensityIndicatorProps> = ({
  utilizationPct,
  congestionLevel,
  lanes = 4,
  currentTrafficVeh,
  averageSpeedKmh,
  compact = false,
}) => {
  const getLevelConfig = () => {
    switch (congestionLevel) {
      case 'severe':
        return {
          color: '#ef4444',
          bgClass: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          laneFillClass: 'bg-rose-500 shadow-[0_0_8px_#ef4444]',
          flowSpeedClass: 'animate-pulse text-rose-400',
          label: 'Gridlock / Choked',
          occupiedLanes: lanes,
        };
      case 'heavy':
        return {
          color: '#f97316',
          bgClass: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
          laneFillClass: 'bg-orange-500 shadow-[0_0_6px_#f97316]',
          flowSpeedClass: 'text-orange-400',
          label: 'Heavy Congestion',
          occupiedLanes: Math.max(1, Math.round(lanes * 0.8)),
        };
      case 'moderate':
        return {
          color: '#f59e0b',
          bgClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          laneFillClass: 'bg-amber-500',
          flowSpeedClass: 'text-amber-400',
          label: 'Moderate Flow',
          occupiedLanes: Math.max(1, Math.round(lanes * 0.55)),
        };
      default:
        return {
          color: '#10b981',
          bgClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          laneFillClass: 'bg-emerald-500',
          flowSpeedClass: 'text-emerald-400',
          label: 'Free Flow',
          occupiedLanes: Math.max(1, Math.round(lanes * 0.3)),
        };
    }
  };

  const config = getLevelConfig();

  if (compact) {
    return (
      <div className="flex items-center gap-1.5" title={`Utilization: ${utilizationPct}% (${config.label})`}>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: lanes }).map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-3.5 rounded-sm transition-all duration-300 ${
                i < config.occupiedLanes ? config.laneFillClass : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] font-mono font-bold text-white">{utilizationPct}%</span>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5 text-slate-400" />
          <span>Road Capacity Cross-Section</span>
        </span>
        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${config.bgClass}`}>
          {utilizationPct}% • {config.label}
        </span>
      </div>

      {/* Physical Multi-Lane Road Cross Section Representation */}
      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-1 relative overflow-hidden">
        {/* Asphalt Road Texture */}
        <div className="flex items-center justify-between gap-1">
          {Array.from({ length: lanes }).map((_, i) => {
            const isLaneCongested = i < config.occupiedLanes;
            return (
              <div
                key={i}
                className={`flex-1 h-6 rounded-md flex items-center justify-center relative transition-all duration-500 ${
                  isLaneCongested
                    ? `${config.laneFillClass} text-slate-950 font-bold`
                    : 'bg-slate-800/60 text-slate-600 border border-dashed border-slate-700/50'
                }`}
              >
                <span className="text-[9px] font-mono select-none">
                  {isLaneCongested ? '🚗' : `L${i + 1}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Median divider */}
        <div className="w-full border-t border-dashed border-slate-700/60 my-0.5" />
      </div>

      {/* Telemetry info row */}
      {(currentTrafficVeh !== undefined || averageSpeedKmh !== undefined) && (
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
          {currentTrafficVeh !== undefined && (
            <span>Load: <strong className="text-white font-bold">{currentTrafficVeh.toLocaleString()}</strong> veh/h</span>
          )}
          {averageSpeedKmh !== undefined && (
            <span className={config.flowSpeedClass}>Speed: <strong>{averageSpeedKmh}</strong> km/h</span>
          )}
        </div>
      )}
    </div>
  );
};
