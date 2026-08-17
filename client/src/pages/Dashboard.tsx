import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Car,
  Clock,
  Compass,
  Download,
  Flame,
  Gauge,
  Layers,
  MapPin,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTraffic } from '../context/TrafficContext';
import { useSimulation } from '../context/SimulationContext';
import { MetricCard } from '../components/common/MetricCard';
import { Badge, CongestionBadge } from '../components/common/Badge';
import { TrafficMapComponent } from '../components/map/TrafficMapComponent';
import { TrafficNetworkHero } from '../components/visualizations/TrafficNetworkHero';
import { TrafficDensityIndicator } from '../components/visualizations/TrafficDensityIndicator';
import { CardSkeleton, TableRowSkeleton, ChartSkeleton } from '../components/common/SkeletonLoader';

export const Dashboard: React.FC = () => {
  const {
    peakHour,
    setPeakHour,
    roads,
    junctions,
    giniCoefficient,
    imbalanceRating,
    dashboardKPIs,
    timeSeries,
    zoneData,
    recommendations,
    selectedRoad,
    setSelectedRoad,
    selectedJunction,
    setSelectedJunction,
    autoOptimizeJunction,
    refreshData,
    isLoading,
  } = useTraffic();

  const { runSimulation } = useSimulation();
  const navigate = useNavigate();

  const [congestionFilter, setCongestionFilter] = useState('all');
  const [tableSearch, setTableSearch] = useState('');

  const kpis = dashboardKPIs || {
    totalVehicles: 38450,
    averageSpeedKmh: 24.8,
    averageDelayMin: 18.4,
    congestedRoadsCount: 9,
    flowEfficiencyPct: 58.2,
    co2EmissionTons: 14.6,
  };

  const handleQuickSimulate = async () => {
    await runSimulation();
    navigate('/simulation');
  };

  const filteredRoads = roads.filter((road) => {
    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      if (!road.name.toLowerCase().includes(q) && !road.code.toLowerCase().includes(q) && !road.zone.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (congestionFilter === 'severe') return road.congestionLevel === 'severe';
    if (congestionFilter === 'heavy') return road.congestionLevel === 'severe' || road.congestionLevel === 'heavy';
    if (congestionFilter === 'low') return road.congestionLevel === 'low';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Jurisdictional Imbalance Alert Ribbon */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-panel rounded-2xl p-4 lg:p-5 border border-amber-500/35 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-blue-950/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 glow-amber">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm lg:text-base text-white font-outfit">
                Nagpur Municipal Jurisdictional Traffic Imbalance
              </h3>
              <Badge variant="amber" size="xs" dot pulse>
                Gini Index: {giniCoefficient.toFixed(2)}
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-3xl leading-relaxed">
              Core arterials in <strong className="text-white">Zone A (Sitabuldi)</strong> & <strong className="text-white">Zone B (Wardha Rd)</strong> operate at <strong className="text-amber-300">96% capacity</strong>, while peripheral bypasses in <strong className="text-white">Zone E (South Ring Rd)</strong> & <strong className="text-white">Zone F (Outer Ring Rd)</strong> sit underutilized at <strong className="text-cyan-300">31%</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={handleQuickSimulate}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Simulate AI Optimization</span>
          </button>

          <Link
            to="/distribution"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all hover:text-white"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>

      {/* Dynamic Traffic Network Hero Visualization */}
      <TrafficNetworkHero
        roads={roads}
        junctions={junctions}
        peakHour={peakHour}
        giniCoefficient={giniCoefficient}
        onSelectJunction={setSelectedJunction}
        onSelectRoad={setSelectedRoad}
      />

      {/* KPI Cards Row */}
      {isLoading && !dashboardKPIs ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Average Network Speed"
            subtitle="All Municipal Corridors"
            value={`${kpis.averageSpeedKmh} km/h`}
            icon={Gauge}
            accentColor="blue"
            trend={{ value: '-22%', isPositive: false, label: 'vs off-peak' }}
            badge="Live Speed"
            delayIndex={0}
          />

          <MetricCard
            title="Average Peak Delay"
            subtitle="Commute Bottlenecks"
            value={`+${kpis.averageDelayMin} min`}
            icon={Clock}
            accentColor="rose"
            trend={{ value: '+34%', isPositive: false, label: 'peak hour' }}
            badge="Delay Index"
            delayIndex={1}
          />

          <MetricCard
            title="Bottleneck Corridors"
            subtitle=">85% Capacity Overload"
            value={`${kpis.congestedRoadsCount} Roads`}
            icon={Flame}
            accentColor="amber"
            trend={{ value: `${roads.length} Monitored`, isNeutral: true }}
            badge="Choke Points"
            delayIndex={2}
          />

          <MetricCard
            title="Flow Efficiency"
            subtitle="Network Throughput"
            value={`${kpis.flowEfficiencyPct}%`}
            icon={Zap}
            accentColor="emerald"
            trend={{ value: '+41% Potential', isPositive: true, label: 'with SmartFlow' }}
            badge="Throughput"
            delayIndex={3}
          />
        </div>
      )}

      {/* Main Grid: GIS Live Map & Zone Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: GIS Traffic Map (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <h2 className="font-bold text-sm lg:text-base text-white font-outfit">
                Nagpur Metropolitan GIS Traffic Command Map
              </h2>
            </div>
            <Link
              to="/map"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <span>Full Screen GIS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <TrafficMapComponent
            roads={roads}
            junctions={junctions}
            selectedRoad={selectedRoad}
            onSelectRoad={setSelectedRoad}
            selectedJunction={selectedJunction}
            onSelectJunction={setSelectedJunction}
            onOptimizeJunction={autoOptimizeJunction}
            height="460px"
          />
        </div>

        {/* Right: Peak-Hour Trend & Zone Utilization (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Peak Hour Flow Curve */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-xs lg:text-sm text-white font-outfit">
                  Peak Flow Profile ({peakHour === 'morning' ? '09:00 - 12:00' : '16:00 - 19:00'})
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">15-min Intervals</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#f8fafc',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalVehicles"
                    name="Vehicles"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#trafficGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="averageSpeedKmh"
                    name="Avg Speed (km/h)"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#speedGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Zone Utilization Imbalance Breakdown */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-xs lg:text-sm text-white font-outfit">
                  Jurisdictional Zone Capacities
                </h3>
              </div>
              <Link to="/distribution" className="text-[11px] text-purple-400 hover:underline font-semibold">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {zoneData.slice(0, 4).map((zone) => {
                const isOverloaded = zone.averageUtilizationPct > 80;
                const isUnderutilized = zone.averageUtilizationPct < 50;
                return (
                  <div
                    key={zone.zoneId}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{zone.zoneId}</span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {zone.zoneName}
                        </span>
                      </div>
                      <span
                        className={`font-mono font-bold text-xs ${
                          isOverloaded
                            ? 'text-rose-400'
                            : isUnderutilized
                            ? 'text-cyan-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {zone.averageUtilizationPct}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverloaded
                            ? 'bg-rose-500'
                            : isUnderutilized
                            ? 'bg-cyan-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${zone.averageUtilizationPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations Highlight Ribbon */}
      <div className="glass-panel rounded-2xl p-4 lg:p-5 border border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-slate-900/50 to-blue-950/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 glow-purple">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-outfit">
                AI Policy & Dynamic Optimization Dispatch
              </h3>
              <p className="text-xs text-slate-400">
                Actionable AI recommendations generated by Webster-Greenshields physics modeling
              </p>
            </div>
          </div>

          <Link
            to="/recommendations"
            className="text-xs text-purple-300 hover:text-purple-200 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>View All ({recommendations.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendations.slice(0, 3).map((rec) => (
            <div
              key={rec.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-2.5 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">
                    {rec.targetName}
                  </span>
                  <Badge variant={rec.priority === 'critical' ? 'rose' : 'amber'} size="xs">
                    {rec.priority}
                  </Badge>
                </div>
                <h4 className="font-semibold text-xs text-white line-clamp-1">{rec.title}</h4>
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">{rec.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-emerald-400 font-semibold font-mono">{rec.projectedImprovement}</span>
                <span className="text-slate-400 font-mono">{rec.confidencePct}% Confidence</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Bottlenecks & Arterial Road Status Table */}
      <div className="glass-panel rounded-2xl p-4 lg:p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm lg:text-base text-white font-outfit">
              Arterial Road Network Status & Bottlenecks
            </h3>
            <p className="text-xs text-slate-400">
              Live capacity utilization, vehicular speeds, and estimated peak delays across metropolitan segments
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter roads..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-blue-500 w-36 sm:w-44"
              />
            </div>

            <select
              value={congestionFilter}
              onChange={(e) => setCongestionFilter(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Congestion</option>
              <option value="severe">Severe Only</option>
              <option value="heavy">Heavy & Severe</option>
              <option value="low">Underutilized</option>
            </select>

            <button
              onClick={() => refreshData()}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Road / Corridor</th>
                <th className="pb-3 px-3">Zone</th>
                <th className="pb-3 px-3">Congestion</th>
                <th className="pb-3 px-3">Speed (Actual / Limit)</th>
                <th className="pb-3 px-3">Volume (Veh/h)</th>
                <th className="pb-3 px-3">Delay</th>
                <th className="pb-3 px-3">Utilization</th>
                <th className="pb-3 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading && roads.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
              ) : (
                filteredRoads.slice(0, 8).map((road) => (
                  <tr
                    key={road.id}
                    className={`hover:bg-slate-900/60 transition-colors ${
                      selectedRoad?.id === road.id ? 'bg-blue-600/10' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-cyan-400 bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
                          {road.code}
                        </span>
                        <span>{road.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{road.zone}</td>
                    <td className="py-3 px-3">
                      <CongestionBadge level={road.congestionLevel} />
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">
                      <span className={road.averageSpeedKmh < 20 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                        {road.averageSpeedKmh}
                      </span>{' '}
                      / {road.speedLimitKmh} km/h
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-mono">
                      {road.currentTrafficVeh.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold">
                      <span className={road.estimatedDelayMin > 10 ? 'text-rose-400' : 'text-slate-300'}>
                        +{road.estimatedDelayMin} min
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              road.utilizationPct > 80
                                ? 'bg-rose-500'
                                : road.utilizationPct > 55
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${road.utilizationPct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-300">{road.utilizationPct}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/route-optimization?roadId=${road.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all hover:scale-105 active:scale-95"
                      >
                        <span>Divert</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

