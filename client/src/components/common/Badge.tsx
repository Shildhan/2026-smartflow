import React from 'react';
import { CongestionLevel } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'orange' | 'rose' | 'blue' | 'purple' | 'cyan' | 'slate';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'xs',
  dot = false,
  pulse = false,
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30 glow-amber',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30 glow-orange',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30 glow-rose',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30 glow-blue',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30 glow-purple',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 glow-cyan',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
  };

  const dotColors = {
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    orange: 'bg-orange-400',
    rose: 'bg-rose-400',
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    cyan: 'bg-cyan-400',
    slate: 'bg-slate-400',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border transition-all ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
};

export const CongestionBadge: React.FC<{ level: CongestionLevel; size?: 'xs' | 'sm' | 'md' }> = ({
  level,
  size = 'xs',
}) => {
  const map: Record<
    CongestionLevel,
    { variant: 'emerald' | 'amber' | 'orange' | 'rose'; label: string; icon: string }
  > = {
    low: { variant: 'emerald', label: 'Low Flow (<40%)', icon: '🟢' },
    moderate: { variant: 'amber', label: 'Moderate (40-65%)', icon: '🟡' },
    heavy: { variant: 'orange', label: 'Heavy Flow (65-85%)', icon: '🟠' },
    severe: { variant: 'rose', label: 'Severe Bottleneck (>85%)', icon: '🔴' },
  };

  const cfg = map[level] || map.low;
  return (
    <Badge variant={cfg.variant} size={size} dot pulse={level === 'severe' || level === 'heavy'}>
      <span>{cfg.label}</span>
    </Badge>
  );
};

