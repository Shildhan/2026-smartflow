import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  ISimulationConfig,
  ISimulationResult,
  TrafficStrategy,
} from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface ISimulationHistoryItem {
  simulationId: string;
  name: string;
  simulationDate: string;
  createdAt: string;
  config: ISimulationConfig;
  beforeMetrics?: any;
  afterMetrics?: any;
  improvements?: {
    speedImprovementPct: number;
    delayReductionPct: number;
    congestionReductionPct: number;
  };
  status: string;
  userId?: string;
  user?: {
    name: string;
    email: string;
    agency?: string;
    role?: string;
  };
}

interface SimulationContextType {
  config: ISimulationConfig;
  setConfig: React.Dispatch<React.SetStateAction<ISimulationConfig>>;
  isRunning: boolean;
  result: ISimulationResult | null;
  history: ISimulationHistoryItem[];
  isLoadingHistory: boolean;
  currentStepIndex: number;
  setCurrentStepIndex: (index: number) => void;
  isPlaying: boolean;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  togglePlay: () => void;
  restartPlayback: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  runSimulation: (customConfig?: Partial<ISimulationConfig>) => Promise<ISimulationResult>;
  fetchHistory: () => Promise<void>;
  loadHistoricalSimulation: (simulationId: string) => Promise<ISimulationResult>;
  deleteHistoricalSimulation: (simulationId: string) => Promise<void>;
  applySimulationToLive: () => Promise<void>;
  toggleStrategy: (strategy: TrafficStrategy) => void;
}

const defaultStrategies: TrafficStrategy[] = [
  'Signal Timing Optimization',
  'Adaptive Traffic Signals',
  'Dynamic Traffic Diversion',
  'Public Transport Priority',
];

const defaultSimConfig: ISimulationConfig = {
  peakHour: 'morning',
  trafficVolume: 'medium',
  volumeMultiplier: 1.0,
  durationMin: 60,
  weather: 'normal',
  strategies: defaultStrategies,
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [config, setConfig] = useState<ISimulationConfig>(defaultSimConfig);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<ISimulationResult | null>(null);
  const [history, setHistory] = useState<ISimulationHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const timerRef = useRef<any>(null);

  // User-scoped storage key
  const getUserStorageKey = () => `smartflow_simulations_${user?.id || user?.email || 'guest'}`;

  // Fetch history and run benchmark whenever user changes
  useEffect(() => {
    fetchHistory();
  }, [user?.id, user?.email]);

  // Initial benchmark run on mount
  useEffect(() => {
    runSimulation();
  }, []);

  // Playback timer
  useEffect(() => {
    if (isPlaying && result?.timelineSteps?.length) {
      const intervalTime = Math.max(400, 1800 / playbackSpeed);
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= ((result.timelineSteps.length || 1) - 1)) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalTime);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, result]);

  const toggleStrategy = (strategy: TrafficStrategy) => {
    setConfig((prev) => {
      const exists = prev.strategies.includes(strategy);
      const updated = exists ? prev.strategies.filter((s) => s !== strategy) : [...prev.strategies, strategy];
      return { ...prev, strategies: updated };
    });
  };

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const storageKey = getUserStorageKey();
      const localSaved = localStorage.getItem(storageKey);
      let localItems: ISimulationHistoryItem[] = [];
      if (localSaved) {
        try {
          localItems = JSON.parse(localSaved);
        } catch {}
      }

      const res = await api.getSimulationHistory();
      const remoteItems: ISimulationHistoryItem[] = res.simulations || [];

      // Merge and deduplicate by simulationId
      const mergedMap = new Map<string, ISimulationHistoryItem>();
      localItems.forEach((item) => mergedMap.set(item.simulationId, item));
      remoteItems.forEach((item) => mergedMap.set(item.simulationId, item));

      const mergedList = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setHistory(mergedList);
    } catch (err) {
      console.warn('Failed to fetch simulation history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const runSimulation = async (customConfig?: Partial<ISimulationConfig>): Promise<ISimulationResult> => {
    setIsRunning(true);
    const finalConfig = { ...config, ...customConfig };
    try {
      const res = await api.runSimulation(finalConfig);
      setResult(res.result);
      setConfig(res.result.config);
      setCurrentStepIndex(0);
      setIsPlaying(true);

      // Save record locally scoped to the active user ID
      const newHistoryItem: ISimulationHistoryItem = {
        simulationId: res.result.simulationId,
        name: finalConfig.name || `${finalConfig.peakHour.toUpperCase()} Peak Optimization`,
        simulationDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdAt: new Date().toISOString(),
        config: finalConfig,
        beforeMetrics: res.result.beforeMetrics,
        afterMetrics: res.result.afterMetrics,
        improvements: {
          speedImprovementPct: res.result.improvements.speedImprovementPct,
          delayReductionPct: res.result.improvements.delayReductionPct,
          congestionReductionPct: res.result.improvements.congestionReductionPct,
        },
        status: 'Completed',
        userId: user?.id || 'usr-default',
        user: {
          name: user?.name || 'Authority Official',
          email: user?.email || 'officer@gov.in',
          agency: user?.agency || 'Municipal Traffic Command',
          role: user?.role || 'Planning Authority',
        },
      };

      const storageKey = getUserStorageKey();
      const currentSaved = localStorage.getItem(storageKey);
      let list: ISimulationHistoryItem[] = [];
      if (currentSaved) {
        try {
          list = JSON.parse(currentSaved);
        } catch {}
      }
      list = [newHistoryItem, ...list.filter((x) => x.simulationId !== newHistoryItem.simulationId)].slice(0, 20);
      localStorage.setItem(storageKey, JSON.stringify(list));
      setHistory(list);

      return res.result;
    } catch (err) {
      console.error('Simulation execution error:', err);
      throw err;
    } finally {
      setIsRunning(false);
    }
  };

  const loadHistoricalSimulation = async (simulationId: string): Promise<ISimulationResult> => {
    setIsRunning(true);
    try {
      const res = await api.getSimulationById(simulationId);
      setResult(res.simulation);
      setConfig(res.simulation.config);
      setCurrentStepIndex(0);
      setIsPlaying(false);
      return res.simulation;
    } catch (err) {
      console.error('Failed to load historical simulation:', err);
      throw err;
    } finally {
      setIsRunning(false);
    }
  };

  const deleteHistoricalSimulation = async (simulationId: string): Promise<void> => {
    try {
      await api.deleteSimulation(simulationId);
      const storageKey = getUserStorageKey();
      const updated = history.filter((item) => item.simulationId !== simulationId);
      setHistory(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to delete simulation:', err);
      throw err;
    }
  };

  const applySimulationToLive = async () => {
    if (!result) return;
    try {
      await api.applySimulation(result.simulationId);
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlay = () => {
    if (currentStepIndex >= ((result?.timelineSteps?.length || 1) - 1)) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const restartPlayback = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const stepForward = () => {
    if (result?.timelineSteps && currentStepIndex < result.timelineSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const stepBackward = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <SimulationContext.Provider
      value={{
        config,
        setConfig,
        isRunning,
        result,
        history,
        isLoadingHistory,
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
        fetchHistory,
        loadHistoricalSimulation,
        deleteHistoricalSimulation,
        applySimulationToLive,
        toggleStrategy,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within a SimulationProvider');
  return context;
};
