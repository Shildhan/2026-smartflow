import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  FastForward,
  Sparkles,
  Zap,
  Sliders,
  CloudRain,
  CloudFog,
  Sun,
  Layers,
  TrendingUp,
  TrendingDown,
  Clock,
  Gauge,
  Car,
  Flame,
  CheckCircle2,
  GitCompare,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSimulation } from '../context/SimulationContext';
import { TrafficStrategy, WeatherCondition, PeakHourType } from '../types';
import { Badge } from '../components/common/Badge';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { SimulationNetworkCanvas } from '../components/visualizations/SimulationNetworkCanvas';

export const SimulationPage: React.FC = () => {
  const {
    config,
    setConfig,
    isRunning,
    result,
    currentStepIndex,
    setCurrentStepIndex,
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    togglePlay,
    restartPlayback,
    stepForward,
    stepBackward,
    runSimulation,
    applySimulationToLive,
    toggleStrategy,
  } = useSimulation();

  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const availableStrategies: { name: TrafficStrategy; label: string; desc: string; icon: string }[] = [
    {
      name: 'Signal Timing Optimization',
      label: 'Webster Signal Timing',
      desc: 'Optimizes cycle lengths & green ratios to minimize junction queue buildup.',
      icon: '🚦',
    },
    {
      name: 'Adaptive Traffic Signals',
      label: 'Dynamic Adaptive Control',
      desc: 'Real-time sensor-based green waves for congested corridors.',
      icon: '⚡',
    },
    {
      name: 'Dynamic Traffic Diversion',
      label: 'Dynamic Route Diversion',
      desc: 'Diverts 35-45% of overflow vehicles from choked CBD to underutilized bypasses.',
      icon: '🔄',
    },
    {
      name: 'Public Transport Priority',
      label: 'Transit Signal Priority',
      desc: 'Grants immediate green phase extensions to BRT and high-capacity buses.',
      icon: '🚌',
    },
    {
      name: 'Lane Management',
      label: 'Reversible Flow Lanes',
      desc: 'Converts underused opposing lanes to absorb heavy inbound commute traffic.',
      icon: '↔️',
    },
    {
      name: 'Emergency Vehicle Priority',
      label: 'Emergency Green Corridor',
      desc: 'Pre-clears signal intersections for medical and rapid response units.',
      icon: '🚨',
    },
  ];

  const handleApply = async () => {
    await applySimulationToLive();
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 4000);
  };

  const steps = result?.timelineSteps || [];
  const currentStep = steps[currentStepIndex] || (steps.length > 0 ? steps[0] : null);

  // Prepare chart data comparing before vs after across timeline steps
  const chartData = steps.map((s) => ({
    time: s.timeLabel,
    beforeSpeed: s.metricsBefore.averageSpeedKmh,
    afterSpeed: s.metricsAfter.averageSpeedKmh,
    beforeDelay: s.metricsBefore.averageTrafficDelayMin,
    afterDelay: s.metricsAfter.averageTrafficDelayMin,
    beforeBottlenecks: s.metricsBefore.congestedRoadsCount,
    afterBottlenecks: s.metricsAfter.congestedRoadsCount,
  }));

  const progressPct = steps.length > 1 ? Math.round((currentStepIndex / (steps.length - 1)) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="glass-panel rounded-2xl p-4 lg:p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg lg:text-xl text-white font-outfit">
              Peak-Hour Traffic Simulation & Physics Engine
            </h1>
            <Badge variant="blue" size="xs">
              Greenshields Flow Model
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test policy interventions, multi-strategy diversions, and signal re-timing before deploying to live city roads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => runSimulation()}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running Physics Model...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Simulation</span>
              </>
            )}
          </button>

          <Link
            to="/comparison"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all hover:text-white"
          >
            <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Before vs After</span>
          </Link>
        </div>
      </div>

      {/* Configuration & Scenario Parameter Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Simulation Scenario Parameters (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 font-outfit">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Simulation Scenario Controls</span>
            </h3>

            {/* Peak Hour Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Target Peak Window
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['morning', 'evening'] as PeakHourType[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setConfig((prev) => ({ ...prev, peakHour: p }))}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      config.peakHour === p
                        ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-md shadow-blue-500/10'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {p === 'morning' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>{p === 'morning' ? 'Morning (9-12 AM)' : 'Evening (4-7 PM)'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Multiplier Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Traffic Surge Multiplier</span>
                <span className="font-mono font-bold text-cyan-400">{config.volumeMultiplier}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={config.volumeMultiplier}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    volumeMultiplier: parseFloat(e.target.value),
                    trafficVolume: parseFloat(e.target.value) > 1.2 ? 'high' : 'medium',
                  }))
                }
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0.5x (Light)</span>
                <span>1.0x (Standard)</span>
                <span>1.5x (Severe)</span>
                <span>2.0x (Crisis)</span>
              </div>
            </div>

            {/* Weather Condition */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Weather & Road Surface Friction
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { id: 'normal', label: 'Clear', icon: Sun },
                    { id: 'rain', label: 'Rain', icon: CloudRain },
                    { id: 'heavy_rain', label: 'Heavy Rain', icon: CloudRain },
                    { id: 'fog', label: 'Fog', icon: CloudFog },
                  ] as const
                ).map((w) => {
                  const Icon = w.icon;
                  const active = config.weather === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => setConfig((prev) => ({ ...prev, weather: w.id as WeatherCondition }))}
                      className={`p-2 rounded-xl text-[11px] font-semibold border flex flex-col items-center gap-1 transition-all active:scale-95 ${
                        active
                          ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 glow-blue'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-slate-500'}`} />
                      <span>{w.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulation Duration */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Simulation Time Horizon
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {([15, 30, 60, 120] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setConfig((prev) => ({ ...prev, durationMin: d }))}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                      config.durationMin === d
                        ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Strategy Checklist */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center justify-between font-outfit">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Intervention Strategies</span>
              </div>
              <span className="text-[10px] text-purple-400 font-mono font-bold">
                {config.strategies.length} active
              </span>
            </h3>

            <div className="space-y-2">
              {availableStrategies.map((strat) => {
                const isActive = config.strategies.includes(strat.name);
                return (
                  <div
                    key={strat.name}
                    onClick={() => toggleStrategy(strat.name)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isActive
                        ? 'bg-purple-950/20 border-purple-500/40 text-purple-200 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-base">{strat.icon}</span>
                      <div>
                        <p className="font-semibold text-xs text-white">{strat.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{strat.desc}</p>
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center mt-0.5 border shrink-0 ${
                        isActive
                          ? 'bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-600/40'
                          : 'border-slate-700 bg-slate-950'
                      }`}
                    >
                      {isActive && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Simulation Timeline, Scrubber & Real-time Chart (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Timeline Playback Bar */}
          <div className="glass-panel rounded-2xl p-4 lg:p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs lg:text-sm text-white font-outfit">
                  Simulation Timeline: {currentStep?.timeLabel || 'T+00 min'}
                </span>
              </div>

              {/* Playback Speed Switcher */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                {[1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] transition-all ${
                      playbackSpeed === spd
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Time Scrubber Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={Math.max(0, steps.length - 1)}
                value={currentStepIndex}
                onChange={(e) => setCurrentStepIndex(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-950 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Start (T+0m)</span>
                <span>T+{Math.floor(config.durationMin / 2)}m</span>
                <span>Peak End (T+{config.durationMin}m)</span>
              </div>
            </div>

            {/* Playback Controls Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={restartPlayback}
                title="Restart"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={stepBackward}
                title="Step Backward"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all active:scale-95"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>

              <button
                onClick={stepForward}
                title="Step Forward"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all active:scale-95"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dynamic 2D Simulation Network Canvas */}
          <SimulationNetworkCanvas
            currentStep={currentStep}
            progressPct={progressPct}
            strategies={config.strategies}
            isPlaying={isPlaying}
          />

          {/* Real-time Dynamic Metrics Comparison Cards */}
          {currentStep && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Avg Speed</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {currentStep.metricsAfter.averageSpeedKmh} km/h
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Before: <span className="line-through text-rose-400">{currentStep.metricsBefore.averageSpeedKmh}</span>
                </span>
              </div>

              <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Avg Delay</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-bold text-amber-400 font-mono">
                    {currentStep.metricsAfter.averageTrafficDelayMin} min
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Before: <span className="line-through text-rose-400">{currentStep.metricsBefore.averageTrafficDelayMin}</span>
                </span>
              </div>

              <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Bottlenecks</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-bold text-cyan-400 font-mono">
                    {currentStep.metricsAfter.congestedRoadsCount}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Before: <span className="line-through text-rose-400">{currentStep.metricsBefore.congestedRoadsCount}</span>
                </span>
              </div>

              <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Efficiency</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-bold text-purple-400 font-mono">
                    {currentStep.metricsAfter.flowEfficiencyPct}%
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Before: <span className="line-through text-rose-400">{currentStep.metricsBefore.flowEfficiencyPct}%</span>
                </span>
              </div>
            </div>
          )}

          {/* Speed & Delay Comparison Charts */}
          <div className="glass-panel rounded-2xl p-4 lg:p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs lg:text-sm text-white flex items-center gap-2 font-outfit">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Speed & Delay Trajectory (Baseline vs SmartFlow)</span>
              </h3>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
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
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line
                    type="monotone"
                    dataKey="beforeSpeed"
                    name="Before Speed (km/h)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="afterSpeed"
                    name="SmartFlow Speed (km/h)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="afterDelay"
                    name="SmartFlow Delay (min)"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Diversions Visualizer */}
          {currentStep?.activeDiversions && currentStep.activeDiversions.length > 0 && (
            <div className="glass-panel rounded-2xl p-4 border border-cyan-500/30 bg-cyan-950/15 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <h4 className="font-bold text-xs text-white font-outfit">
                    Active Inter-Corridor Vehicle Diversions
                  </h4>
                </div>
                <span className="text-[10px] text-cyan-300 font-mono font-semibold">Dynamic Balancing</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentStep.activeDiversions.map((div, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {div.fromRoadId} ➔ {div.toRoadId}
                      </span>
                      <span className="font-semibold text-white">Cross-Zone Reroute</span>
                    </div>
                    <span className="font-bold text-cyan-400 font-mono text-sm">
                      +{div.divertedVehiclesCount} veh/h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Callout: Apply to Live Traffic */}
          <div className="glass-panel rounded-2xl p-4 border border-emerald-500/30 bg-emerald-950/15 flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-xs lg:text-sm text-white font-outfit">
                Satisfied with Simulation Improvements?
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Deploy these dynamic signal timings and diversion paths directly to municipal controllers.
              </p>
            </div>

            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
            >
              {appliedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Applied to Live City Grid!</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Apply to Live Network</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

