import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Car, Sparkles, Navigation } from 'lucide-react';

interface TrafficEmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  iconType?: 'simulation' | 'reports' | 'alerts' | 'routes';
}

export const TrafficEmptyState: React.FC<TrafficEmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  iconType = 'simulation',
}) => {
  return (
    <div className="glass-panel rounded-2xl p-8 sm:p-12 border border-slate-800 text-center flex flex-col items-center justify-center space-y-4 bg-slate-950/70 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Traffic Illustration Visual */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 relative shadow-xl">
        <Car className="w-8 h-8 animate-pulse text-cyan-400" />
        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
          <Sparkles className="w-2.5 h-2.5 text-slate-950" />
        </span>
      </div>

      <div className="max-w-md space-y-1 relative z-10">
        <h3 className="font-bold text-base text-white font-outfit">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">{description}</p>
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer font-outfit"
        >
          <Activity className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
