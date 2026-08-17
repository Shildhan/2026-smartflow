import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Play,
  BarChart2,
  Trash2,
  Search,
  Filter,
  Clock,
  CloudRain,
  Sun,
  CloudFog,
  Zap,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useSimulation, ISimulationHistoryItem } from '../context/SimulationContext';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { Modal } from '../components/common/Modal';
import { TrafficEmptyState } from '../components/common/TrafficEmptyState';

export const SimulationHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { history, isLoadingHistory, loadHistoricalSimulation, deleteHistoricalSimulation } = useSimulation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeakFilter, setSelectedPeakFilter] = useState<'all' | 'morning' | 'evening'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingSimId, setLoadingSimId] = useState<string | null>(null);

  // Filter history items
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.config.strategies.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPeak =
        selectedPeakFilter === 'all' ? true : item.config.peakHour === selectedPeakFilter;

      return matchesSearch && matchesPeak;
    });
  }, [history, searchQuery, selectedPeakFilter]);

  const handleLoadAndReplay = async (simulationId: string) => {
    setLoadingSimId(simulationId);
    try {
      await loadHistoricalSimulation(simulationId);
      navigate('/simulation');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSimId(null);
    }
  };

  const handleLoadAndCompare = async (simulationId: string) => {
    setLoadingSimId(simulationId);
    try {
      await loadHistoricalSimulation(simulationId);
      navigate('/comparison');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSimId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteHistoricalSimulation(deletingId);
      setDeletingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getWeatherIcon = (weather?: string) => {
    switch (weather) {
      case 'rain':
      case 'severe_rain':
      case 'heavy_rain':
        return <CloudRain className="w-3.5 h-3.5 text-blue-400" />;
      case 'fog':
        return <CloudFog className="w-3.5 h-3.5 text-slate-400" />;
      default:
        return <Sun className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-xl lg:text-2xl font-bold text-white font-outfit">
              Simulation Archive & Scenario History
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-slate-400">
            Database-backed audit trail of all executed Greenshields & Webster scenario simulations across Nagpur zones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{history.length} Scenarios Stored</span>
          </div>
          <button
            onClick={() => navigate('/simulation')}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 font-outfit"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Run New Scenario</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search simulations by scenario name, strategy, or authority..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Peak:</span>
          </span>
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedPeakFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                selectedPeakFilter === 'all' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedPeakFilter('morning')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                selectedPeakFilter === 'morning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Morning Peak
            </button>
            <button
              onClick={() => setSelectedPeakFilter('evening')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                selectedPeakFilter === 'evening' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Evening Peak
            </button>
          </div>
        </div>
      </div>

      {/* History Grid */}
      {isLoadingHistory ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredHistory.length === 0 ? (
        <TrafficEmptyState
          title={searchQuery ? 'No Scenario Simulations Found' : 'No Simulation History Recorded Yet'}
          description={
            searchQuery
              ? 'No past simulation records match your active search filters.'
              : 'Run your first traffic simulation in the Simulation Studio to generate persistent database records and audit Before vs. After results.'
          }
          actionText="Launch Simulation Studio"
          onAction={() => navigate('/simulation')}
          iconType="simulation"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredHistory.map((item, idx) => {
              const speedGain = item.improvements?.speedImprovementPct || 0;
              const delaySaved = item.improvements?.delayReductionPct || 0;

              return (
                <motion.div
                  key={item.simulationId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                  {/* Card Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                              item.config.peakHour === 'morning'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            }`}
                          >
                            {item.config.peakHour} Peak
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono flex items-center gap-1">
                            {getWeatherIcon(item.config.weather)}
                            <span className="capitalize">{item.config.weather}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono">
                            {item.config.durationMin}m window
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-white font-outfit group-hover:text-cyan-300 transition-colors">
                          {item.name}
                        </h3>
                      </div>

                      <button
                        onClick={() => setDeletingId(item.simulationId)}
                        title="Delete simulation record"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Authority Metadata */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                      {item.user && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-300">{item.user.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Strategy Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.config.strategies.map((strat, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-300 border border-slate-800 text-[10px] font-medium"
                      >
                        {strat}
                      </span>
                    ))}
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Avg Speed Gain</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        +{speedGain}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Delay Saved</span>
                      <span className="text-sm font-bold text-cyan-400 font-mono">
                        -{delaySaved}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Network State</span>
                      <span className="text-sm font-bold text-purple-300 font-mono capitalize">
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleLoadAndReplay(item.simulationId)}
                      disabled={loadingSimId === item.simulationId}
                      className="flex-1 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 font-outfit"
                    >
                      <Play className="w-3.5 h-3.5 fill-emerald-400" />
                      <span>{loadingSimId === item.simulationId ? 'Loading...' : 'Load & Replay'}</span>
                    </button>
                    <button
                      onClick={() => handleLoadAndCompare(item.simulationId)}
                      disabled={loadingSimId === item.simulationId}
                      className="flex-1 py-2 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 font-outfit"
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Audit in Comparison</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Confirm Scenario Deletion"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Are you sure you want to permanently delete this simulation record from MongoDB? This action cannot be undone.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeletingId(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors shadow-lg shadow-rose-500/20"
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
