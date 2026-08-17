import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  ArrowRight,
  Zap,
  CheckCircle2,
  Clock,
  Car,
  Compass,
  TrendingDown,
  Shuffle,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext';
import { Badge, CongestionBadge } from '../components/common/Badge';
import { CorridorDiversionFlow } from '../components/visualizations/CorridorDiversionFlow';

export const RouteOptimizationPage: React.FC = () => {
  const { routeAlternatives, applyRouteDiversion, roads } = useTraffic();
  const [searchParams] = useSearchParams();
  const [divertingId, setDivertingId] = useState<string | null>(null);
  const [diversionPct, setDiversionPct] = useState<Record<string, number>>({});

  const handleApply = async (id: string) => {
    setDivertingId(id);
    await applyRouteDiversion(id);
    setTimeout(() => setDivertingId(null), 1000);
  };

  const getPct = (id: string, defaultPct: number) => diversionPct[id] ?? defaultPct;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 lg:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg lg:text-xl text-white font-outfit">
              Dynamic Route Diversion & Corridor Balancing
            </h1>
            <Badge variant="cyan" size="xs">
              Overflow Relief Protocol
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Shift vehicular overflow from choked municipal core arterials to high-capacity peripheral bypasses.
          </p>
        </div>
      </div>

      {/* Dynamic Diversion & Load Balancing Visualization */}
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
        speedGainPct={38}
        delaySavedMin={14.5}
        isApplied={routeAlternatives.some((r) => r.strategyApplied)}
        onApply={() => {
          if (routeAlternatives.length > 0) handleApply(routeAlternatives[0].id);
        }}
      />

      {/* Corridor Routing Cards */}
      <div className="space-y-4">
        {routeAlternatives.map((alt, index) => {
          const currentPct = getPct(alt.id, alt.diversionPercentage);
          const isDiverting = divertingId === alt.id;
          const timeSaved = alt.recommendedRoute.timeSavedMin;

          return (
            <motion.div
              key={alt.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.08 }}
              className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-md"
            >
              {/* Top Origin -> Destination banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 glow-cyan">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white font-outfit">
                      {alt.sourceName} ➔ {alt.destinationName}
                    </h3>
                    <span className="text-xs text-slate-400">High-Density Commute Arterial</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="emerald" size="sm" dot>
                    ⚡ Saves {timeSaved} min per vehicle
                  </Badge>
                  {alt.strategyApplied && (
                    <Badge variant="blue" size="sm">
                      Diversion Active
                    </Badge>
                  )}
                </div>
              </div>

              {/* Side-by-Side Comparison: Primary vs Alternate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Congested Primary Route */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono">
                        Primary Corridor (Choked)
                      </span>
                      <h4 className="font-semibold text-sm text-white font-outfit">{alt.currentRoute.name}</h4>
                    </div>
                    <CongestionBadge level={alt.currentRoute.congestionLevel} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Distance</span>
                      <span className="font-bold text-white font-mono">{alt.currentRoute.distanceKm} km</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Travel Time</span>
                      <span className="font-bold text-rose-400 font-mono">{alt.currentRoute.estimatedTravelTimeMin} min</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Traffic Delay</span>
                      <span className="font-bold text-rose-400 font-mono">+{alt.currentRoute.delayMin} min</span>
                    </div>
                  </div>
                </div>

                {/* Recommended Alternate Bypass */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                        Recommended Alternate (Bypass)
                      </span>
                      <h4 className="font-semibold text-sm text-white font-outfit">{alt.recommendedRoute.name}</h4>
                    </div>
                    <CongestionBadge level={alt.recommendedRoute.congestionLevel} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Distance</span>
                      <span className="font-bold text-white font-mono">{alt.recommendedRoute.distanceKm} km</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Travel Time</span>
                      <span className="font-bold text-emerald-400 font-mono">{alt.recommendedRoute.estimatedTravelTimeMin} min</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Traffic Delay</span>
                      <span className="font-bold text-emerald-400 font-mono">+{alt.recommendedRoute.delayMin} min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Diversion Ratio Slider & Deploy Button */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 max-w-md">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      Traffic Split Allocation Ratio
                    </span>
                    <span className="font-mono font-bold text-cyan-400">{currentPct}% Diversion</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={currentPct}
                    onChange={(e) =>
                      setDiversionPct((prev) => ({
                        ...prev,
                        [alt.id]: parseInt(e.target.value),
                      }))
                    }
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>10% (Low)</span>
                    <span>35% (Optimal)</span>
                    <span>60% (Max Capacity)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApply(alt.id)}
                    disabled={isDiverting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {isDiverting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Broadcasting to VMS & Navigation...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>Deploy Diversion Plan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
