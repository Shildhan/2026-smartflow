import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Sun,
  Moon,
  Clock,
  Car,
  Gauge,
  CloudRain,
  Flame,
  BarChart3,
  Calendar,
  Layers,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useTraffic } from '../context/TrafficContext';
import { PeakHourType } from '../types';
import { Badge } from '../components/common/Badge';
import { PeakCommuteFlowGraphic } from '../components/visualizations/PeakCommuteFlowGraphic';

export const PeakHourAnalysisPage: React.FC = () => {
  const { peakHour, setPeakHour, timeSeries, roads } = useTraffic();
  const [selectedDay, setSelectedDay] = useState('Monday');

  const morningStats = {
    peakTime: '09:45 AM',
    maxVehicles: 44200,
    minSpeed: 19.2,
    avgDelay: 21.4,
    bottlenecks: 11,
  };

  const eveningStats = {
    peakTime: '06:15 PM',
    maxVehicles: 46800,
    minSpeed: 17.8,
    avgDelay: 24.6,
    bottlenecks: 13,
  };

  const currentStats = peakHour === 'morning' ? morningStats : eveningStats;
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="glass-panel rounded-2xl p-4 lg:p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg lg:text-xl text-white font-outfit">
              Peak-Hour Trend Analytics & Flow Dynamics
            </h1>
            <Badge variant="amber" size="xs">
              Temporal Modeling
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare morning commute influx versus evening return surges across municipal sectors.
          </p>
        </div>

        {/* Peak Switcher */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          {(['morning', 'evening'] as PeakHourType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeakHour(p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                peakHour === p
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p === 'morning' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{p === 'morning' ? 'Morning (09:00 - 12:00)' : 'Evening (16:00 - 19:00)'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Commute Flow Directionality Graphic */}
      <PeakCommuteFlowGraphic peakHour={peakHour} onTogglePeak={setPeakHour} />

      {/* Peak Profile Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0 }}
          className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-1"
        >
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Peak Surge Apex</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-1">{currentStats.peakTime}</p>
          <p className="text-[10px] text-amber-400 font-semibold font-mono">Highest Load Interval</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08 }}
          className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-1"
        >
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Car className="w-4 h-4 text-blue-400" />
            <span>Peak Volume Influx</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            {currentStats.maxVehicles.toLocaleString()}
          </p>
          <p className="text-[10px] text-blue-400 font-semibold font-mono">veh/h Across Corridors</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.16 }}
          className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-1"
        >
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Gauge className="w-4 h-4 text-rose-400" />
            <span>Lowest Corridor Velocity</span>
          </div>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">{currentStats.minSpeed} km/h</p>
          <p className="text-[10px] text-rose-400 font-semibold font-mono">-58% vs Free Flow Speed</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.24 }}
          className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-1"
        >
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Bottleneck Count</span>
          </div>
          <p className="text-2xl font-bold font-mono text-orange-400 mt-1">
            {currentStats.bottlenecks} Corridors
          </p>
          <p className="text-[10px] text-orange-400 font-semibold font-mono">&gt;85% Saturated</p>
        </motion.div>
      </div>

      {/* Main Charts: Peak Surge Curve & Speed Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Volume Surge Area Chart (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm lg:text-base text-white font-outfit">
                Hourly Vehicular Density Progression
              </h3>
              <p className="text-xs text-slate-400">15-minute granularity telemetry over target peak window</p>
            </div>
            <span className="text-[10px] text-blue-400 font-mono font-semibold">Live Feed</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="peakVehGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
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
                  fill="url(#peakVehGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Average Speed Inversion Curve (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm lg:text-base text-white font-outfit">
                Corridor Velocity Inversion
              </h3>
              <p className="text-xs text-slate-400">Drop in transit speeds during peak volume peaks</p>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">Speed (km/h)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="averageSpeedKmh"
                  name="Avg Speed"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Day-of-Week Variation Breakdown */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm lg:text-base text-white font-outfit">
              Day-of-Week Commute Variation Analysis
            </h3>
            <p className="text-xs text-slate-400">
              Corridor stress distribution across weekly cycles in the Nagpur metropolitan area
            </p>
          </div>

          {/* Days Switcher */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedDay === day
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] block uppercase font-semibold">Commute Character</span>
            <p className="font-bold text-white text-sm">
              {selectedDay === 'Monday' || selectedDay === 'Friday' ? 'High Surge Peak (Heavy Office Influx)' : selectedDay === 'Saturday' || selectedDay === 'Sunday' ? 'Dispersed Commercial & Leisure Flow' : 'Standard Mid-Week Commute'}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] block uppercase font-semibold">Recommended Signal Plan</span>
            <p className="font-bold text-cyan-400 text-sm">
              {selectedDay === 'Monday' ? 'Plan A-1 (Extended Inbound Green Wave)' : selectedDay === 'Friday' ? 'Plan A-3 (Extended Outbound Bypass Wave)' : 'Plan A-2 (Adaptive Cycle Balancing)'}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] block uppercase font-semibold">Expected Gini Index</span>
            <p className="font-bold text-amber-400 text-sm font-mono">
              {selectedDay === 'Monday' ? '0.66 (High Disparity)' : selectedDay === 'Sunday' ? '0.41 (Moderate Disparity)' : '0.58 (Substantial Disparity)'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
