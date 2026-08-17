import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Compass,
  ArrowRight,
  Zap,
  Layers,
  Scale,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Building2,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTraffic } from '../context/TrafficContext';
import { Badge } from '../components/common/Badge';
import { TrafficDensityIndicator } from '../components/visualizations/TrafficDensityIndicator';

export const TrafficDistributionPage: React.FC = () => {
  const {
    giniCoefficient,
    imbalanceRating,
    zoneData,
    roads,
    refreshData,
    isLoading,
  } = useTraffic();

  const [selectedZoneDetail, setSelectedZoneDetail] = useState<string | null>(null);
  const [protocolActivated, setProtocolActivated] = useState(false);

  const zoneColors: Record<string, string> = {
    'Zone A': '#ef4444', // Sitabuldi - Severe Red
    'Zone B': '#f97316', // Wardha Rd - Orange
    'Zone C': '#f59e0b', // Amravati Rd - Amber
    'Zone D': '#3b82f6', // Medical Rd - Blue
    'Zone E': '#06b6d4', // South Bypass - Cyan
    'Zone F': '#10b981', // Outer Ring - Emerald
  };

  const chartData = zoneData.map((z) => ({
    name: z.zoneId,
    zoneName: z.zoneName,
    utilization: z.averageUtilizationPct,
    capacity: 100,
    vehicleCount: z.totalVehicles,
  }));

  const handleActivateProtocol = () => {
    setProtocolActivated(true);
    setTimeout(() => setProtocolActivated(false), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Problem Statement Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-5 border border-amber-500/35 bg-gradient-to-r from-amber-950/25 via-slate-900/50 to-blue-950/20 space-y-4 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 glow-amber">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-lg lg:text-xl text-white font-outfit">
                  Inter-Jurisdictional Traffic Distribution & Gini Index
                </h1>
                <Badge variant="rose" size="xs" dot pulse>
                  Critical Problem Focus
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-4xl leading-relaxed">
                Metropolitan planning authorities often operate in operational silos: Central commercial corridors in <strong className="text-white">Zone A (Sitabuldi)</strong> suffer gridlock (96% load) while adjacent peripheral corridors in <strong className="text-white">Zone E & F (Ring Roads)</strong> remain underutilized (31% load).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleActivateProtocol}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-600/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              {protocolActivated ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Protocol Active</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Deploy Cross-Zone Diversion</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Imbalance KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Gini Concentration Index
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-amber-400">
                {giniCoefficient.toFixed(2)}
              </span>
              <span className="text-[10px] text-amber-400 font-semibold uppercase">{imbalanceRating}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Scale: 0.00 (Uniform) to 1.00 (Choked)</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Max Core Saturation
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-rose-400">96.4%</span>
              <span className="text-[10px] text-rose-400 font-semibold">Zone A (CBD)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Sitabuldi, Medical Square</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Spare Bypass Capacity
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-cyan-400">68.8%</span>
              <span className="text-[10px] text-cyan-400 font-semibold">Available</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Outer Ring Rd & South Bypass</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Recoverable Delay
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">-55.4%</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Commute Relief</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Via dynamic cross-zone diversions</p>
          </div>
        </div>
      </motion.div>

      {/* Top Hero: Gini Inequality Gauge Card & Utilization Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gini Coefficient Index Card (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-slate-900/60 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white font-outfit">
                Gini Concentration Index
              </h3>
            </div>
            <Badge variant="amber" size="xs" dot pulse>
              {imbalanceRating.toUpperCase()} IMBALANCE
            </Badge>
          </div>

          {/* Big Number & Meter */}
          <div className="text-center py-2">
            <span className="font-mono text-5xl font-black text-amber-400 tracking-tight">
              {giniCoefficient.toFixed(2)}
            </span>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Scale 0.00 (Perfect Uniform Load) to 1.00 (Extreme Choke Point)
            </p>
          </div>

          {/* Gradient Scale Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-500"
                style={{ width: `${giniCoefficient * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span className="text-emerald-400">0.00 Optimal</span>
              <span className="text-amber-400">0.40 Moderate</span>
              <span className="text-rose-400 font-bold">0.65+ Severe Alert</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Diagnosis:</strong> High disparity between central CBD arterials (Zone A at 96% load) vs outer bypass rings (Zone F at 31% load). Diverting 20-30% of through-traffic brings Gini Index to optimal <strong className="text-emerald-400">0.22</strong>.
          </div>
        </div>

        {/* Zone Utilization Bar Chart (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm lg:text-base text-white font-outfit">
                Average Capacity Utilization per Municipal Zone
              </h3>
              <p className="text-xs text-slate-400">
                Peak load vs available arterial road capacity across all 6 administrative sectors
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">100% = Saturation</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any) => [`${val}% Utilization`, 'Load']}
                />
                <Bar dataKey="utilization" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={zoneColors[entry.name] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid of 6 Zone Cards */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm lg:text-base text-white font-outfit flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>Sector-by-Sector Capacity & Congestion Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zoneData.map((zone) => {
            const isOverloaded = zone.averageUtilizationPct > 80;
            const isUnderutilized = zone.averageUtilizationPct < 45;
            const color = zoneColors[zone.zoneId] || '#3b82f6';

            return (
              <motion.div
                key={zone.zoneId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedZoneDetail(zone.zoneId)}
                className={`glass-panel rounded-2xl p-4 lg:p-5 border transition-all cursor-pointer hover:-translate-y-1 space-y-3.5 shadow-sm ${
                  isOverloaded
                    ? 'border-rose-500/40 hover:border-rose-500/60'
                    : isUnderutilized
                    ? 'border-cyan-500/40 hover:border-cyan-500/60'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md border"
                      style={{
                        backgroundColor: `${color}20`,
                        color: color,
                        borderColor: `${color}40`,
                      }}
                    >
                      {zone.zoneId}
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1 font-outfit">{zone.zoneName}</h4>
                  </div>

                  <span
                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      isOverloaded
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isUnderutilized
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {zone.averageUtilizationPct}% Load
                  </span>
                </div>

                {/* Multi-Lane Road Cross-Section Capacity Visualization */}
                <TrafficDensityIndicator
                  utilizationPct={zone.averageUtilizationPct}
                  congestionLevel={
                    zone.averageUtilizationPct >= 85
                      ? 'severe'
                      : zone.averageUtilizationPct >= 70
                      ? 'heavy'
                      : zone.averageUtilizationPct >= 45
                      ? 'moderate'
                      : 'low'
                  }
                  lanes={4}
                  currentTrafficVeh={zone.totalVehicles}
                  averageSpeedKmh={zone.averageSpeedKmh}
                />

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Vehicles / Hr</span>
                    <span className="font-bold text-white font-mono">{zone.totalVehicles.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Corridors</span>
                    <span className="font-bold text-white font-mono">{(zone.roads || []).length} Segments</span>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-300 flex items-center justify-between">
                  <span className="text-slate-400">Bottleneck Points:</span>
                  <span className={`font-bold font-mono ${zone.congestedRoads > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {zone.congestedRoads} {zone.congestedRoads === 1 ? 'road' : 'roads'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Inter-Agency Collaboration Solutions */}
      <div className="glass-panel rounded-2xl p-4 lg:p-5 border border-purple-500/30 bg-purple-950/15 space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2 font-outfit">
          <Building2 className="w-4 h-4 text-purple-400" />
          <span>Cross-Jurisdiction Coordination Strategy</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
            <h4 className="font-semibold text-purple-300 mb-1">1. Unified Corridor Green Wave</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Synchronizes 18 cross-boundary traffic signals between Zone A (Sitabuldi) and Zone E (South Ring Road / Besa), preventing junction queue spillback across administrative lines.
            </p>
          </div>
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
            <h4 className="font-semibold text-cyan-300 mb-1">2. Dynamic Variable Message Signage (VMS)</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Broadcasts real-time commute comparisons (+19 min delay via Wardha Rd vs 0 min delay via Outer Ring Road) to incentivize voluntary bypass usage.
            </p>
          </div>
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
            <h4 className="font-semibold text-emerald-300 mb-1">3. Automated Inter-Agency Dispatch</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Instantly notifies Nagpur Traffic Police units across Sitabuldi, Sonegaon, and Lakadganj divisions when volume on primary arterials exceeds 80% threshold.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
