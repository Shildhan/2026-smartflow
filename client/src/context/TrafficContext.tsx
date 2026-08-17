import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  IRoad,
  IJunction,
  IAlert,
  PeakHourType,
  IRouteAlternative,
  IAIRecommendation,
  IZoneData,
} from '../types';
import { api } from '../services/api';
import { initialRoads, initialJunctions } from '../data/seedData';

interface TrafficContextType {
  peakHour: PeakHourType;
  setPeakHour: (peak: PeakHourType) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  roads: IRoad[];
  junctions: IJunction[];
  alerts: IAlert[];
  unreadAlertsCount: number;
  routeAlternatives: IRouteAlternative[];
  recommendations: IAIRecommendation[];
  zoneData: IZoneData[];
  giniCoefficient: number;
  imbalanceRating: string;
  dashboardKPIs: any;
  timeSeries: any[];
  isLoading: boolean;
  selectedRoad: IRoad | null;
  setSelectedRoad: (road: IRoad | null) => void;
  selectedJunction: IJunction | null;
  setSelectedJunction: (junction: IJunction | null) => void;
  refreshData: () => Promise<void>;
  resetDemoData: () => Promise<void>;
  applyRouteDiversion: (id: string) => Promise<void>;
  applyRecommendation: (id: string) => Promise<void>;
  updateJunctionSignal: (id: string, timings: any) => Promise<void>;
  autoOptimizeJunction: (id: string) => Promise<void>;
  markAlertRead: (id: string) => Promise<void>;
}

const TrafficContext = createContext<TrafficContextType | undefined>(undefined);

export const TrafficProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [peakHour, setPeakHour] = useState<PeakHourType>('morning');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [roads, setRoads] = useState<IRoad[]>(initialRoads);
  const [junctions, setJunctions] = useState<IJunction[]>(initialJunctions);
  const [alerts, setAlerts] = useState<IAlert[]>([]);
  const [routeAlternatives, setRouteAlternatives] = useState<IRouteAlternative[]>([]);
  const [recommendations, setRecommendations] = useState<IAIRecommendation[]>([]);
  const [zoneData, setZoneData] = useState<IZoneData[]>([]);
  const [giniCoefficient, setGiniCoefficient] = useState<number>(0.44);
  const [imbalanceRating, setImbalanceRating] = useState<string>('Severe Jurisdictional Imbalance');
  const [dashboardKPIs, setDashboardKPIs] = useState<any>({
    totalVehicles: 38450,
    averageSpeedKmh: 24.8,
    averageDelayMin: 18.4,
    congestedRoadsCount: 6,
    flowEfficiencyPct: 58.2,
    co2EmissionTons: 14.6,
  });
  const [timeSeries, setTimeSeries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedRoad, setSelectedRoad] = useState<IRoad | null>(null);
  const [selectedJunction, setSelectedJunction] = useState<IJunction | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashRes, roadsRes, juncRes, alertsRes, routesRes, recsRes, zoneRes] = await Promise.all([
        api.getDashboard(peakHour),
        api.getRoads(),
        api.getJunctions(),
        api.getAlerts(),
        api.getRouteAlternatives(),
        api.getRecommendations(),
        api.getZoneDistribution(),
      ]);

      setDashboardKPIs(dashRes.kpis);
      setTimeSeries(dashRes.timeSeries || []);
      setRoads(roadsRes.roads || []);
      setJunctions(juncRes.junctions || []);
      setAlerts(alertsRes.alerts || []);
      setRouteAlternatives(routesRes.routes || []);
      setRecommendations(recsRes.recommendations || []);
      setZoneData(zoneRes.zones || []);
      setGiniCoefficient(zoneRes.giniCoefficient || 0.64);
      setImbalanceRating(zoneRes.imbalanceRating || 'Severe Jurisdictional Imbalance');
    } catch (err) {
      console.warn('Backend API refresh error, using cache/fallback', err);
    } finally {
      setIsLoading(false);
    }
  }, [peakHour]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const resetDemoData = async () => {
    setIsLoading(true);
    try {
      await api.resetDemoData();
      await refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyRouteDiversion = async (id: string) => {
    try {
      await api.applyRouteDiversion(id);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const applyRecommendation = async (id: string) => {
    try {
      await api.applyRecommendation(id);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateJunctionSignal = async (id: string, timings: any) => {
    try {
      await api.updateJunctionSignal(id, timings);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const autoOptimizeJunction = async (id: string) => {
    try {
      await api.autoOptimizeJunction(id);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const markAlertRead = async (id: string) => {
    try {
      await api.markAlertRead(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

  return (
    <TrafficContext.Provider
      value={{
        peakHour,
        setPeakHour,
        selectedDate,
        setSelectedDate,
        roads,
        junctions,
        alerts,
        unreadAlertsCount,
        routeAlternatives,
        recommendations,
        zoneData,
        giniCoefficient,
        imbalanceRating,
        dashboardKPIs,
        timeSeries,
        isLoading,
        selectedRoad,
        setSelectedRoad,
        selectedJunction,
        setSelectedJunction,
        refreshData,
        resetDemoData,
        applyRouteDiversion,
        applyRecommendation,
        updateJunctionSignal,
        autoOptimizeJunction,
        markAlertRead,
      }}
    >
      {children}
    </TrafficContext.Provider>
  );
};

export const useTraffic = () => {
  const context = useContext(TrafficContext);
  if (!context) throw new Error('useTraffic must be used within a TrafficProvider');
  return context;
};
