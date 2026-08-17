import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Split,
  Zap,
  Sliders,
  Clock,
  Car,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Settings,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext';
import { IJunction } from '../types';
import { Badge, CongestionBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { JunctionSchematic } from '../components/visualizations/JunctionSchematic';

export const JunctionManagementPage: React.FC = () => {
  const {
    junctions,
    updateJunctionSignal,
    autoOptimizeJunction,
    isLoading,
  } = useTraffic();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [editingJunction, setEditingJunction] = useState<IJunction | null>(null);

  // Modal editing form state
  const [editGreen, setEditGreen] = useState(45);
  const [editYellow, setEditYellow] = useState(5);
  const [editRed, setEditRed] = useState(40);
  const [saveToast, setSaveToast] = useState(false);

  const openEditModal = (junc: IJunction) => {
    setEditingJunction(junc);
    setEditGreen(junc.greenDurationSec);
    setEditYellow(junc.yellowDurationSec);
    setEditRed(junc.redDurationSec);
  };

  const handleSaveModal = async () => {
    if (!editingJunction) return;
    await updateJunctionSignal(editingJunction.id, {
      greenDurationSec: editGreen,
      yellowDurationSec: editYellow,
      redDurationSec: editRed,
      signalCycleSec: editGreen + editYellow + editRed,
    });
    setEditingJunction(null);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleOptimizeAll = async () => {
    for (const j of junctions) {
      await autoOptimizeJunction(j.id);
    }
  };

  const filteredJunctions = junctions.filter((junc) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!junc.name.toLowerCase().includes(q) && !junc.code.toLowerCase().includes(q) && !junc.zone.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedZone !== 'all' && !junc.zone.toLowerCase().includes(selectedZone.toLowerCase())) {
      return false;
    }
    return true;
  });

  const [activeJunctionId, setActiveJunctionId] = useState<string>('J1');
  const activeJunction = junctions.find((j) => j.id === activeJunctionId || j.code === activeJunctionId) || junctions[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="glass-panel rounded-2xl p-4 lg:p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg lg:text-xl text-white font-outfit">
              NMC Smart Traffic Signal & Junction Command
            </h1>
            <Badge variant="blue" size="xs">
              Webster Signal Synchronization
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time signal phase management, Webster optimum cycle time calculation, and autonomous green-wave calibration.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleOptimizeAll}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Optimize All Junctions</span>
          </button>
        </div>
      </div>

      {/* Interactive 4-Way Junction Geometric Schematic */}
      {activeJunction && (
        <JunctionSchematic
          junction={activeJunction}
          onAutoOptimize={autoOptimizeJunction}
          isOptimizing={isLoading}
        />
      )}

      {/* Quick Search & Zone Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search intersection, code, or zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 w-full"
            />
          </div>

          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Zones</option>
            <option value="Zone A">Zone A (Central)</option>
            <option value="Zone B">Zone B (Wardha Rd)</option>
            <option value="Zone C">Zone C (Western)</option>
            <option value="Zone D">Zone D (Medical)</option>
            <option value="Zone E">Zone E (South)</option>
            <option value="Zone F">Zone F (Outer Ring)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>Active Signals: <strong className="text-white">{filteredJunctions.length}</strong> / {junctions.length}</span>
        </div>
      </div>

      {/* Junctions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJunctions.map((junc) => {
          const isCongested = junc.congestionLevel === 'severe' || junc.congestionLevel === 'heavy';
          const isSelected = activeJunctionId === junc.id || activeJunctionId === junc.code;
          return (
            <motion.div
              key={junc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setActiveJunctionId(junc.id)}
              className={`glass-panel rounded-2xl p-4 lg:p-5 border transition-all space-y-4 shadow-sm flex flex-col justify-between cursor-pointer ${
                isSelected ? 'border-cyan-500 ring-2 ring-cyan-500/40 bg-cyan-950/10' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-cyan-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/30">
                        {junc.code}
                      </span>
                      <span className="text-xs text-slate-400">{junc.zone}</span>
                    </div>
                    <h3 className="font-bold text-sm lg:text-base text-white mt-1 font-outfit">{junc.name}</h3>
                  </div>

                  <CongestionBadge level={junc.congestionLevel} />
                </div>

                {/* Live Traffic Light Status Disc */}
                <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-950 border border-slate-800">
                      <div
                        className={`w-3 h-3 rounded-full transition-all ${
                          junc.currentPhase === 'red' ? 'bg-rose-500 glow-rose' : 'bg-rose-950/60'
                        }`}
                      />
                      <div
                        className={`w-3 h-3 rounded-full transition-all ${
                          junc.currentPhase === 'yellow' ? 'bg-amber-500 glow-amber' : 'bg-amber-950/60'
                        }`}
                      />
                      <div
                        className={`w-3 h-3 rounded-full transition-all ${
                          junc.currentPhase === 'green' ? 'bg-emerald-500 glow-emerald' : 'bg-emerald-950/60'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {junc.currentPhase} Phase
                    </span>
                  </div>

                  <span className="text-xs font-mono text-cyan-400 font-semibold">
                    Cycle: {junc.signalCycleSec}s
                  </span>
                </div>

                {/* Timing Split Bars */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-semibold">Green: {junc.greenDurationSec}s</span>
                    <span className="text-amber-400 font-semibold">Yellow: {junc.yellowDurationSec}s</span>
                    <span className="text-rose-400 font-semibold">Red: {junc.redDurationSec}s</span>
                  </div>

                  {/* Multi-color Split Bar */}
                  <div className="w-full h-2 rounded-full overflow-hidden bg-slate-950 flex border border-slate-800">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${(junc.greenDurationSec / junc.signalCycleSec) * 100}%` }}
                    />
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${(junc.yellowDurationSec / junc.signalCycleSec) * 100}%` }}
                    />
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${(junc.redDurationSec / junc.signalCycleSec) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Queue Length & Delay Stats */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Queue Length</span>
                    <span className="font-bold text-white font-mono">{junc.queueLengthVeh} vehicles</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Avg Delay</span>
                    <span className="font-bold text-amber-400 font-mono">
                      {junc.averageWaitingTimeSec} sec
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => autoOptimizeJunction(junc.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Webster Optimize</span>
                </button>

                <button
                  onClick={() => openEditModal(junc)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all hover:text-white active:scale-95"
                  title="Manual Signal Timing Override"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Manual Timing Modal Dialog */}
      <Modal
        isOpen={!!editingJunction}
        onClose={() => setEditingJunction(null)}
        title={`Manual Signal Timing Calibration: ${editingJunction?.name || ''}`}
      >
        {editingJunction && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Manually calibrate Webster cycle phase split for junction <strong className="text-cyan-400">{editingJunction.code}</strong>. Total cycle length will adjust automatically.
            </p>

            <div className="space-y-3">
              {/* Green Duration */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-emerald-400">Green Light Duration</span>
                  <span className="font-mono text-white">{editGreen} seconds</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  value={editGreen}
                  onChange={(e) => setEditGreen(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
                />
              </div>

              {/* Yellow Duration */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-amber-400">Yellow / Clearance Duration</span>
                  <span className="font-mono text-white">{editYellow} seconds</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={editYellow}
                  onChange={(e) => setEditYellow(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
                />
              </div>

              {/* Red Duration */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-rose-400">Red Light Duration</span>
                  <span className="font-mono text-white">{editRed} seconds</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  value={editRed}
                  onChange={(e) => setEditRed(parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
                />
              </div>
            </div>

            {/* Total Calculated Cycle */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Calculated Cycle Length:</span>
              <span className="text-cyan-400 font-bold text-sm">
                {editGreen + editYellow + editRed} seconds
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingJunction(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-500/25 transition-all"
              >
                Deploy Timings
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
