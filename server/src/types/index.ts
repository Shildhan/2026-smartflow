export type UserRole = 'Planning Authority' | 'Traffic Administrator' | 'Analyst' | 'Traffic Analyst';

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  agency?: string;
  createdAt: Date;
}

export interface IPasswordResetToken {
  id: string;
  userId: string;
  userEmail: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  usedAt?: Date | null;
}

export type CongestionLevel = 'low' | 'moderate' | 'heavy' | 'severe';
export type WeatherCondition = 'normal' | 'rain' | 'heavy_rain' | 'fog';
export type PeakHourType = 'morning' | 'evening';

export interface ICoordinates {
  lat: number;
  lng: number;
}

export interface IRoad {
  id: string;
  name: string;
  code: string;
  zone: 'Zone A' | 'Zone B' | 'Zone C' | 'Zone D' | 'Zone E' | 'Zone F';
  zoneName: string;
  startJunctionId: string;
  endJunctionId: string;
  coordinates: [number, number][]; // Polylines [lat, lng]
  lengthKm: number;
  lanes: number;
  speedLimitKmh: number;
  capacityVehPerHour: number;
  currentTrafficVeh: number;
  averageSpeedKmh: number;
  utilizationPct: number;
  congestionLevel: CongestionLevel;
  estimatedTravelTimeMin: number;
  estimatedDelayMin: number;
  isAlternativeRoute?: boolean;
  status: 'normal' | 'congested' | 'bottleneck' | 'underutilized' | 'diverted';
}

export interface IJunction {
  id: string;
  name: string;
  code: string;
  location: ICoordinates;
  zone: string;
  incomingRoadIds: string[];
  vehicleCount: number;
  queueLengthVeh: number;
  averageWaitingTimeSec: number;
  congestionLevel: CongestionLevel;
  signalCycleSec: number;
  greenDurationSec: number;
  yellowDurationSec: number;
  redDurationSec: number;
  currentPhase: 'green' | 'yellow' | 'red';
  isAdaptive: boolean;
}

export interface ITrafficDataPoint {
  timestamp: string; // e.g. "09:00", "09:30"
  timeMinutes: number;
  totalVehicles: number;
  averageSpeedKmh: number;
  averageDelayMin: number;
  trafficDensityVehPerKm: number;
  roadUtilizationPct: number;
  congestedRoadsCount: number;
  flowEfficiencyPct: number;
}

export type TrafficStrategy =
  | 'Signal Timing Optimization'
  | 'Adaptive Traffic Signals'
  | 'Alternate Route Assignment'
  | 'Lane Management'
  | 'One-Way Traffic'
  | 'Dynamic Traffic Diversion'
  | 'Public Transport Priority'
  | 'Emergency Vehicle Priority';

export interface ISimulationConfig {
  id?: string;
  name?: string;
  userId?: string;
  peakHour: PeakHourType; // morning (9-12) or evening (4-7)
  trafficVolume: 'low' | 'medium' | 'high' | 'custom';
  volumeMultiplier: number; // e.g. 0.8, 1.0, 1.35
  durationMin: 15 | 30 | 60 | 120 | 180;
  weather: WeatherCondition;
  strategies: TrafficStrategy[];
  createdAt?: string;
}

export interface ISimulationMetrics {
  averageSpeedKmh: number;
  averageTravelTimeMin: number;
  congestedRoadsCount: number;
  averageTrafficDelayMin: number;
  roadUtilizationPct: number;
  trafficDensityVehPerKm: number;
  totalThroughputVeh: number;
  flowEfficiencyPct: number;
  co2EmissionTons: number;
  unevenDistributionIndex: number; // 0 = perfectly even, 1 = severely congested in one spot
}

export interface ISimulationStep {
  timeLabel: string;
  minute: number;
  metricsBefore: ISimulationMetrics;
  metricsAfter: ISimulationMetrics;
  roadStatesBefore: Record<string, { speed: number; vehicles: number; utilization: number; level: CongestionLevel }>;
  roadStatesAfter: Record<string, { speed: number; vehicles: number; utilization: number; level: CongestionLevel }>;
  activeDiversions: { fromRoadId: string; toRoadId: string; divertedVehiclesCount: number }[];
}

export interface ISimulationResult {
  simulationId: string;
  config: ISimulationConfig;
  beforeMetrics: ISimulationMetrics;
  afterMetrics: ISimulationMetrics;
  improvements: {
    speedImprovementPct: number;
    delayReductionPct: number;
    congestionReductionPct: number;
    travelTimeReductionPct: number;
    utilizationBalanceImprovementPct: number;
    efficiencyImprovementPct: number;
    co2ReductionPct: number;
  };
  timelineSteps: ISimulationStep[];
  affectedRoads: {
    roadId: string;
    roadName: string;
    beforeUtilization: number;
    afterUtilization: number;
    beforeSpeed: number;
    afterSpeed: number;
    statusChange: string;
  }[];
  createdAt: string;
}

export interface IAIRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  targetType: 'road' | 'junction' | 'corridor' | 'zone';
  targetId: string;
  targetName: string;
  recommendedStrategy: TrafficStrategy;
  projectedImprovement: string;
  confidencePct: number;
  applied: boolean;
}

export interface IAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  location: string;
  timestamp: string;
  isRead: boolean;
  actionRequired?: string;
}

export interface IRouteAlternative {
  id: string;
  sourceName: string;
  destinationName: string;
  currentRoute: {
    name: string;
    roadCodes: string[];
    distanceKm: number;
    estimatedTravelTimeMin: number;
    congestionLevel: CongestionLevel;
    vehicleCount: number;
    delayMin: number;
  };
  recommendedRoute: {
    name: string;
    roadCodes: string[];
    distanceKm: number;
    estimatedTravelTimeMin: number;
    congestionLevel: CongestionLevel;
    vehicleCount: number;
    delayMin: number;
    timeSavedMin: number;
  };
  diversionPercentage: number;
  strategyApplied: boolean;
}

export interface IZoneData {
  zoneId: string;
  zoneName: string;
  totalVehicles: number;
  totalCapacity: number;
  averageUtilizationPct: number;
  averageSpeedKmh: number;
  congestedRoads: number;
  underutilizedRoads: number;
  distributionScore: number;
  status: string;
  roads: IRoad[];
}


