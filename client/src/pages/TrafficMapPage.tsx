import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  Gauge,
  Car,
  Clock,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  Shield,
  Compass,
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext';
import { TrafficMapComponent } from '../components/map/TrafficMapComponent';
import { CongestionBadge, Badge } from '../components/common/Badge';
import { IRoad, IJunction } from '../types';

export const TrafficMapPage: React.FC = () => {
  const {
    roads,
    junctions,
    selectedRoad,
    setSelectedRoad,
    selectedJunction,
    setSelectedJunction,
    autoOptimizeJunction,
  } = useTraffic();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedCongestion, setSelectedCongestion] = useState('all');
  const [showJunctions, setShowJunctions] = useState(true);
  const [showDiversions, setShowDiversions] = useState(true);

  const zones = [
    { id: 'Zone A', label: 'Zone A (Sitabuldi / Central)' },
    { id: 'Zone B', label: 'Zone B (Wardha Rd / MIHAN)' },
    { id: 'Zone C', label: 'Zone C (Western / Amravati Rd)' },
    { id: 'Zone D', label: 'Zone D (Medical / Umred Rd)' },
    { id: 'Zone E', label: 'Zone E (South Bypass / Hingna)' },
    { id: 'Zone F', label: 'Zone F (Outer Ring / Kamptee)' },
  ];

  const filteredRoads = roads.filter((road) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        road.name.toLowerCase().includes(q) ||
        road.code.toLowerCase().includes(q) ||
        road.zone.toLowerCase().includes(q) ||
        road.zoneName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedZone !== 'all' && !road.zone.toLowerCase().includes(selectedZone.toLowerCase())) {
      return false;
    }
    if (selectedCongestion !== 'all' && road.congestionLevel !== selectedCongestion) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-10">
      {/* Top Header & Fast Filters */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg lg:text-xl text-white font-outfit">
              Nagpur GIS Traffic Command Map
            </h1>
            <Badge variant="emerald" size="xs" dot pulse>
              Live GIS Stream
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographical command map of Nagpur arterial corridors, NMC smart junctions, and peripheral ring roads.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search road or corridor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-blue-500 w-full sm:w-56"
            />
          </div>

          {/* Zone Selector */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-blue-500"
          >
            <option value="all">All NMC Zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.label}
              </option>
            ))}
          </select>

          {/* Congestion Level */}
          <select
            value={selectedCongestion}
            onChange={(e) => setSelectedCongestion(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="low">Low Flow (🟢)</option>
            <option value="moderate">Moderate (🟡)</option>
            <option value="heavy">Heavy Flow (🟠)</option>
            <option value="severe">Severe Bottleneck (🔴)</option>
          </select>

          {/* Toggle Switches */}
          <button
            onClick={() => setShowJunctions((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              showJunctions
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Junctions {showJunctions ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setShowDiversions((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              showDiversions
                ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Alt Corridors {showDiversions ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Map & Side Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left GIS Map View */}
        <div className={`transition-all duration-300 ${selectedRoad || selectedJunction ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <TrafficMapComponent
            roads={filteredRoads}
            junctions={junctions}
            selectedRoad={selectedRoad}
            onSelectRoad={setSelectedRoad}
            selectedJunction={selectedJunction}
            onSelectJunction={setSelectedJunction}
            onOptimizeJunction={autoOptimizeJunction}
            showJunctions={showJunctions}
            showDiversions={showDiversions}
            height="calc(100vh - 250px)"
          />
        </div>

        {/* Right Drawer Inspector with Framer Motion */}
        <AnimatePresence mode="wait">
          {(selectedRoad || selectedJunction) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="lg:col-span-4 space-y-4"
            >
              {/* Road Inspector */}
              {selectedRoad && (
                <div className="glass-panel rounded-2xl p-5 border border-blue-500/40 space-y-4 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/30">
                          {selectedRoad.code}
                        </span>
                        <span className="text-xs text-slate-400">{selectedRoad.zone}</span>
                      </div>
                      <h3 className="font-bold text-base text-white mt-1 font-outfit">{selectedRoad.name}</h3>
                    </div>

                    <button
                      onClick={() => setSelectedRoad(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      aria-label="Close road details"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Congestion Status:</span>
                    <CongestionBadge level={selectedRoad.congestionLevel} />
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Current Speed</span>
                      <span className="font-bold text-base text-white font-mono">
                        {selectedRoad.averageSpeedKmh} <span className="text-xs font-normal text-slate-400">km/h</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Limit: {selectedRoad.speedLimitKmh} km/h
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Hourly Volume</span>
                      <span className="font-bold text-base text-white font-mono">
                        {selectedRoad.currentTrafficVeh.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Capacity: {selectedRoad.capacityVehPerHour.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Delay Added</span>
                      <span className="font-bold text-base text-amber-400 font-mono">
                        +{selectedRoad.estimatedDelayMin} min
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Normal: {selectedRoad.estimatedTravelTimeMin} min
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Capacity Utilization</span>
                      <span className="font-bold text-base text-white font-mono">
                        {selectedRoad.utilizationPct}%
                      </span>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            selectedRoad.utilizationPct > 80 ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${selectedRoad.utilizationPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex gap-2">
                    <a
                      href={`/route-optimization?roadId=${selectedRoad.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <span>Dynamic Reroute</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Junction Inspector */}
              {selectedJunction && (
                <div className="glass-panel rounded-2xl p-5 border border-emerald-500/40 space-y-4 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
                          {selectedJunction.code}
                        </span>
                        <span className="text-xs text-slate-400">{selectedJunction.zone}</span>
                      </div>
                      <h3 className="font-bold text-base text-white mt-1 font-outfit">{selectedJunction.name}</h3>
                    </div>

                    <button
                      onClick={() => setSelectedJunction(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      aria-label="Close junction details"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Active Light Disc */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3.5 h-3.5 rounded-full ${
                          selectedJunction.currentPhase === 'green'
                            ? 'bg-emerald-500 glow-emerald'
                            : selectedJunction.currentPhase === 'yellow'
                            ? 'bg-amber-500 glow-amber'
                            : 'bg-rose-500 glow-rose'
                        }`}
                      />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Current: {selectedJunction.currentPhase} Phase
                      </span>
                    </div>
                    <span className="text-xs font-mono text-cyan-400">
                      Cycle: {selectedJunction.signalCycleSec}s
                    </span>
                  </div>

                  {/* Timing Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-emerald-400 block font-semibold">Green</span>
                      <span className="font-bold text-base text-white font-mono">{selectedJunction.greenDurationSec}s</span>
                    </div>
                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-amber-400 block font-semibold">Yellow</span>
                      <span className="font-bold text-base text-white font-mono">{selectedJunction.yellowDurationSec}s</span>
                    </div>
                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-rose-400 block font-semibold">Red</span>
                      <span className="font-bold text-base text-white font-mono">{selectedJunction.redDurationSec}s</span>
                    </div>
                  </div>

                  {/* Queue & Wait Time */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Queue Length</span>
                      <span className="font-bold text-white text-sm font-mono">{selectedJunction.queueLengthVeh} veh</span>
                    </div>
                    <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Average Delay</span>
                      <span className="font-bold text-amber-400 text-sm font-mono">{selectedJunction.averageWaitingTimeSec}s</span>
                    </div>
                  </div>

                  <button
                    onClick={() => autoOptimizeJunction(selectedJunction.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Auto-Optimize Webster Timings</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

