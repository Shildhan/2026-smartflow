import React from 'react';

export const Skeleton: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => {
  return (
    <div
      style={style}
      className={`animate-pulse bg-gradient-to-r from-slate-900 via-slate-800/70 to-slate-900 rounded-xl ${className}`}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="w-24 h-3.5" />
            <Skeleton className="w-32 h-2.5" />
          </div>
        </div>
        <Skeleton className="w-14 h-5 rounded-md" />
      </div>
      <div className="flex items-baseline justify-between pt-2">
        <Skeleton className="w-28 h-8" />
        <Skeleton className="w-16 h-5 rounded-lg" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 6 }) => {
  return (
    <tr className="border-b border-slate-800/60">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3.5 px-3">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
};

export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-64' }) => {
  return (
    <div className={`glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 ${height}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="w-48 h-4" />
        <Skeleton className="w-20 h-4" />
      </div>
      <div className="h-4/5 flex items-end gap-3 pt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-lg"
            style={{ height: `${25 + (i * 13) % 70}%` } as any}
          />
        ))}
      </div>
    </div>
  );
};

export const MapSkeleton: React.FC<{ height?: string }> = ({ height = '500px' }) => {
  return (
    <div
      style={{ height }}
      className="relative rounded-2xl overflow-hidden border border-slate-800 glass-panel flex items-center justify-center bg-slate-950/80"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono tracking-wide">
          Streaming Live GIS Telemetry...
        </p>
      </div>
    </div>
  );
};
