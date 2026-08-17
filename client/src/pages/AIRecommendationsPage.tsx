import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Gauge,
  Clock,
  Layers,
  Filter,
  Check,
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext';
import { Badge } from '../components/common/Badge';
import { CorridorDiversionFlow } from '../components/visualizations/CorridorDiversionFlow';

export const AIRecommendationsPage: React.FC = () => {
  const { recommendations, applyRecommendation } = useTraffic();
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const handleApply = async (id: string) => {
    setApplyingId(id);
    await applyRecommendation(id);
    setTimeout(() => setApplyingId(null), 800);
  };

  const filteredRecs = recommendations.filter((rec) => {
    if (filterPriority !== 'all' && rec.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 lg:p-5 border border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-slate-900/40 to-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg lg:text-xl text-white font-outfit">
              AI Intelligent Policy & Tactical Recommendations
            </h1>
            <Badge variant="purple" size="xs">
              Autonomous Advisory
            </Badge>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Physics-driven and machine-learning optimized traffic policy actions tailored for jurisdictional equilibrium.
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Priorities ({recommendations.length})</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
          </select>
        </div>
      </div>

      {/* Primary Strategic AI Corridor Diversion Graphic */}
      <CorridorDiversionFlow
        primaryName="Sitabuldi Commercial Spine (CBD)"
        primaryCode="NGP-RD-01"
        primaryBeforeUtil={96}
        primaryAfterUtil={68}
        bypassName="Besa-Manewada Peripheral Bypass"
        bypassCode="NGP-RD-20"
        bypassBeforeUtil={31}
        bypassAfterUtil={64}
        diversionPct={25}
        speedGainPct={41}
        delaySavedMin={16.2}
        isApplied={recommendations.some((r) => r.applied && r.targetName.includes('Sitabuldi'))}
        onApply={() => {
          const rec = recommendations.find((r) => r.targetName.includes('Sitabuldi'));
          if (rec) handleApply(rec.id);
        }}
      />

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecs.map((rec, index) => {
          const isApplying = applyingId === rec.id;
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.06 }}
              className={`glass-panel rounded-2xl p-5 border transition-all space-y-4 flex flex-col justify-between shadow-sm ${
                rec.applied
                  ? 'border-emerald-500/40 bg-emerald-950/15'
                  : rec.priority === 'critical'
                  ? 'border-rose-500/40 hover:border-rose-500/60'
                  : 'border-slate-800 hover:border-purple-500/40'
              }`}
            >
              <div className="space-y-2.5">
                {/* Top Target & Priority */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/25 font-mono">
                      {rec.targetName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono capitalize">
                      {rec.targetType}
                    </span>
                  </div>

                  <Badge
                    variant={
                      rec.priority === 'critical'
                        ? 'rose'
                        : rec.priority === 'high'
                        ? 'amber'
                        : 'blue'
                    }
                    size="xs"
                  >
                    {rec.priority.toUpperCase()}
                  </Badge>
                </div>

                <h3 className="font-bold text-sm lg:text-base text-white font-outfit">{rec.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{rec.description}</p>

                {/* AI Impact Projections */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Projected Gain</span>
                    <span className="font-bold text-emerald-400 font-mono text-xs">
                      {rec.projectedImprovement}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Model Confidence</span>
                      <span className="font-mono text-cyan-400 font-bold">{rec.confidencePct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all"
                        style={{ width: `${rec.confidencePct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  Trigger: Webster Optimization
                </span>

                <button
                  onClick={() => handleApply(rec.id)}
                  disabled={rec.applied || isApplying}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    rec.applied
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-md shadow-purple-600/25 hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {rec.applied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Policy Deployed</span>
                    </>
                  ) : isApplying ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deploying...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Deploy Directive</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
