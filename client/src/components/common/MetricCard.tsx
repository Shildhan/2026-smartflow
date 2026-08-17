import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    isNeutral?: boolean;
    label?: string;
  };
  accentColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan';
  badge?: string;
  onClick?: () => void;
  className?: string;
  delayIndex?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'blue',
  badge,
  onClick,
  className = '',
  delayIndex = 0,
}) => {
  const accentStyles = {
    blue: {
      bgIcon: 'bg-blue-500/10 text-blue-400 border-blue-500/30 glow-blue',
      border: 'hover:border-blue-500/50',
      radial: 'rgba(59, 130, 246, 0.15)',
      accentText: 'text-blue-400',
    },
    emerald: {
      bgIcon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald',
      border: 'hover:border-emerald-500/50',
      radial: 'rgba(16, 185, 129, 0.15)',
      accentText: 'text-emerald-400',
    },
    amber: {
      bgIcon: 'bg-amber-500/10 text-amber-400 border-amber-500/30 glow-amber',
      border: 'hover:border-amber-500/50',
      radial: 'rgba(245, 158, 11, 0.15)',
      accentText: 'text-amber-400',
    },
    rose: {
      bgIcon: 'bg-rose-500/10 text-rose-400 border-rose-500/30 glow-rose',
      border: 'hover:border-rose-500/50',
      radial: 'rgba(239, 68, 68, 0.15)',
      accentText: 'text-rose-400',
    },
    purple: {
      bgIcon: 'bg-purple-500/10 text-purple-400 border-purple-500/30 glow-purple',
      border: 'hover:border-purple-500/50',
      radial: 'rgba(168, 85, 247, 0.15)',
      accentText: 'text-purple-400',
    },
    cyan: {
      bgIcon: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 glow-cyan',
      border: 'hover:border-cyan-500/50',
      radial: 'rgba(6, 182, 212, 0.15)',
      accentText: 'text-cyan-400',
    },
  };

  const style = accentStyles[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delayIndex * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      style={{
        backgroundImage: `radial-gradient(circle at 15% 15%, ${style.radial}, transparent 65%)`,
      }}
      className={`glass-panel rounded-2xl p-5 border border-slate-800/80 transition-all duration-300 relative overflow-hidden group shadow-lg ${
        onClick ? 'cursor-pointer hover:shadow-2xl' : ''
      } ${style.border} ${className}`}
    >
      {/* Subtle top edge glow bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-700/40 to-transparent group-hover:via-blue-500/60 transition-colors" />

      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-xl border ${style.bgIcon} transition-transform group-hover:scale-110 duration-200`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              {title}
            </span>
            {subtitle && <span className="text-[11px] text-slate-400">{subtitle}</span>}
          </div>
        </div>

        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/80 text-slate-300 shadow-sm">
            {badge}
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline justify-between mt-2">
        <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-outfit">
          <AnimatedCounter value={value} />
        </div>

        {/* Trend pill */}
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg border ${
              trend.isNeutral
                ? 'bg-slate-800 text-slate-300 border-slate-700'
                : trend.isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {trend.isNeutral ? (
              <Minus className="w-3 h-3" />
            ) : trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{trend.value}</span>
            {trend.label && <span className="text-[10px] text-slate-400 font-normal ml-0.5">{trend.label}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
};
