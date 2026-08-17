import {
  ISimulationConfig,
  ISimulationResult,
  ISimulationMetrics,
  ISimulationStep,
  IRoad,
  IJunction,
  CongestionLevel,
  TrafficStrategy,
} from '../types';
import { initialRoads, initialJunctions } from './seedData';

export class TrafficSimulationEngine {
  private roads: IRoad[];
  private junctions: IJunction[];

  constructor(roads?: IRoad[], junctions?: IJunction[]) {
    this.roads = roads ? JSON.parse(JSON.stringify(roads)) : JSON.parse(JSON.stringify(initialRoads));
    this.junctions = junctions ? JSON.parse(JSON.stringify(junctions)) : JSON.parse(JSON.stringify(initialJunctions));
  }

  public runSimulation(config: ISimulationConfig): ISimulationResult {
    const simulationId = config.id || `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Multipliers
    let volumeMult = config.volumeMultiplier || 1.0;
    if (config.trafficVolume === 'low') volumeMult = 0.75;
    if (config.trafficVolume === 'medium') volumeMult = 1.0;
    if (config.trafficVolume === 'high') volumeMult = 1.35;

    // Weather impact factors
    let weatherSpeedFactor = 1.0;
    let weatherDelayFactor = 1.0;
    if (config.weather === 'rain') {
      weatherSpeedFactor = 0.88;
      weatherDelayFactor = 1.18;
    } else if (config.weather === 'heavy_rain') {
      weatherSpeedFactor = 0.72;
      weatherDelayFactor = 1.45;
    } else if (config.weather === 'fog') {
      weatherSpeedFactor = 0.78;
      weatherDelayFactor = 1.35;
    }

    // Baseline calculation (Before optimization)
    const baselineRoads = this.simulateRoadStates(this.roads, volumeMult, weatherSpeedFactor, weatherDelayFactor, []);
    const baselineMetrics = this.calculateNetworkMetrics(baselineRoads);

    // Optimized calculation (After optimization)
    const optimizedRoads = this.simulateRoadStates(
      this.roads,
      volumeMult,
      weatherSpeedFactor,
      weatherDelayFactor,
      config.strategies
    );
    const optimizedMetrics = this.calculateNetworkMetrics(optimizedRoads);

    // Generate timeline steps
    const timelineSteps = this.generateTimelineSteps(config, weatherSpeedFactor, weatherDelayFactor);

    // Calculate dynamic percentage improvements
    const speedImprovementPct = Number(
      (((optimizedMetrics.averageSpeedKmh - baselineMetrics.averageSpeedKmh) / baselineMetrics.averageSpeedKmh) * 100).toFixed(1)
    );

    const delayReductionPct = Number(
      (((baselineMetrics.averageTrafficDelayMin - optimizedMetrics.averageTrafficDelayMin) / Math.max(0.1, baselineMetrics.averageTrafficDelayMin)) * 100).toFixed(1)
    );

    const congestionReductionPct = Number(
      (((baselineMetrics.congestedRoadsCount - optimizedMetrics.congestedRoadsCount) / Math.max(1, baselineMetrics.congestedRoadsCount)) * 100).toFixed(1)
    );

    const travelTimeReductionPct = Number(
      (((baselineMetrics.averageTravelTimeMin - optimizedMetrics.averageTravelTimeMin) / baselineMetrics.averageTravelTimeMin) * 100).toFixed(1)
    );

    const utilizationBalanceImprovementPct = Number(
      (((baselineMetrics.unevenDistributionIndex - optimizedMetrics.unevenDistributionIndex) / Math.max(0.01, baselineMetrics.unevenDistributionIndex)) * 100).toFixed(1)
    );

    const efficiencyImprovementPct = Number(
      (optimizedMetrics.flowEfficiencyPct - baselineMetrics.flowEfficiencyPct).toFixed(1)
    );

    const co2ReductionPct = Number(
      (((baselineMetrics.co2EmissionTons - optimizedMetrics.co2EmissionTons) / baselineMetrics.co2EmissionTons) * 100).toFixed(1)
    );

    const affectedRoads = this.roads.map((road) => {
      const bRoad = baselineRoads.find((r) => r.id === road.id)!;
      const oRoad = optimizedRoads.find((r) => r.id === road.id)!;
      let statusChange = 'Stabilized';
      if (bRoad.utilizationPct > 85 && oRoad.utilizationPct <= 75) {
        statusChange = 'Congestion Relieved';
      } else if (bRoad.utilizationPct < 40 && oRoad.utilizationPct >= 50) {
        statusChange = 'Capacity Utilized';
      } else if (oRoad.averageSpeedKmh > bRoad.averageSpeedKmh + 8) {
        statusChange = 'Speed Increased';
      }

      return {
        roadId: road.id,
        roadName: road.name,
        beforeUtilization: bRoad.utilizationPct,
        afterUtilization: oRoad.utilizationPct,
        beforeSpeed: bRoad.averageSpeedKmh,
        afterSpeed: oRoad.averageSpeedKmh,
        statusChange,
      };
    });

    return {
      simulationId,
      config,
      beforeMetrics: baselineMetrics,
      afterMetrics: optimizedMetrics,
      improvements: {
        speedImprovementPct,
        delayReductionPct,
        congestionReductionPct,
        travelTimeReductionPct,
        utilizationBalanceImprovementPct,
        efficiencyImprovementPct,
        co2ReductionPct,
      },
      timelineSteps,
      affectedRoads,
      createdAt: new Date().toISOString(),
    };
  }

  private simulateRoadStates(
    baseRoads: IRoad[],
    volumeMult: number,
    weatherSpeed: number,
    weatherDelay: number,
    strategies: TrafficStrategy[]
  ): IRoad[] {
    const hasSignalOpt = strategies.includes('Signal Timing Optimization');
    const hasAdaptive = strategies.includes('Adaptive Traffic Signals');
    const hasDiversion =
      strategies.includes('Alternate Route Assignment') ||
      strategies.includes('Dynamic Traffic Diversion');
    const hasLaneMgmt = strategies.includes('Lane Management') || strategies.includes('One-Way Traffic');
    const hasTransitPriority = strategies.includes('Public Transport Priority');
    const hasEmergency = strategies.includes('Emergency Vehicle Priority');

    // Make copy
    const simulatedRoads: IRoad[] = JSON.parse(JSON.stringify(baseRoads));

    // Pairs of congested road -> underutilized bypass for diversion
    const diversionPairs: [string, string, number][] = [
      ['R1', 'R4', 0.32], // MG Road -> Outer River Bypass
      ['R2', 'R8', 0.35], // Cyber Gateway -> Airport Trunk
      ['R5', 'R14', 0.28], // Tech Park Link -> East Transit
      ['R11', 'R13', 0.30], // South Gateway -> West Peripheral
      ['R16', 'R20', 0.38], // Electronic City Flyover -> Riverfront Parallel
      ['R22', 'R23', 0.34], // Innovation Expressway -> East Bypass
      ['R24', 'R21', 0.40], // Silk Board South -> Green Park Outer
    ];

    simulatedRoads.forEach((road) => {
      let vehicleInflow = road.currentTrafficVeh * volumeMult;

      // Public transport reduces overall vehicle load by encouraging bus share
      if (hasTransitPriority) {
        vehicleInflow *= 0.88;
      }

      // Lane management increases capacity in bottleneck corridors
      let effectiveCapacity = road.capacityVehPerHour;
      if (hasLaneMgmt) {
        effectiveCapacity *= 1.22;
      }

      // Signal optimizations prevent blockages from cascading
      if (hasSignalOpt) {
        effectiveCapacity *= 1.12;
      }
      if (hasAdaptive) {
        effectiveCapacity *= 1.18;
      }

      road.capacityVehPerHour = Math.round(effectiveCapacity);
      road.currentTrafficVeh = Math.round(vehicleInflow);
    });

    // Apply Route Diversion rebalancing
    if (hasDiversion) {
      diversionPairs.forEach(([congestedId, bypassId, pct]) => {
        const cRoad = simulatedRoads.find((r) => r.id === congestedId);
        const bRoad = simulatedRoads.find((r) => r.id === bypassId);
        if (cRoad && bRoad) {
          const divertedVehicles = Math.round(cRoad.currentTrafficVeh * pct);
          cRoad.currentTrafficVeh -= divertedVehicles;
          bRoad.currentTrafficVeh += Math.round(divertedVehicles * 0.92); // some vehicles take other sub-arterials
        }
      });
    }

    // Now compute Greenshield Speed-Density physics for each road
    simulatedRoads.forEach((road) => {
      const freeFlowSpeed = road.speedLimitKmh * weatherSpeed;
      const jamDensity = (road.lanes * 120); // 120 veh/km/lane max jam density
      const density = road.currentTrafficVeh / Math.max(0.5, road.lengthKm);

      // Greenshield's equation: v = v_f * (1 - k / k_j)
      let calculatedSpeed = freeFlowSpeed * Math.max(0.18, 1 - (density / jamDensity));

      // Adaptive signal & emergency speed bonus
      if (hasAdaptive) calculatedSpeed = Math.min(freeFlowSpeed, calculatedSpeed * 1.14);
      if (hasEmergency) calculatedSpeed = Math.min(freeFlowSpeed, calculatedSpeed * 1.06);

      const utilization = Math.min(100, Math.round((road.currentTrafficVeh / road.capacityVehPerHour) * 100));

      const freeFlowTime = (road.lengthKm / freeFlowSpeed) * 60;
      const actualTime = (road.lengthKm / Math.max(5, calculatedSpeed)) * 60;
      const delay = Math.max(0, (actualTime - freeFlowTime) * weatherDelay);

      let congestion: CongestionLevel = 'low';
      if (utilization >= 88) congestion = 'severe';
      else if (utilization >= 75) congestion = 'heavy';
      else if (utilization >= 52) congestion = 'moderate';

      road.averageSpeedKmh = Math.round(calculatedSpeed);
      road.utilizationPct = utilization;
      road.congestionLevel = congestion;
      road.estimatedTravelTimeMin = Number(actualTime.toFixed(1));
      road.estimatedDelayMin = Number(delay.toFixed(1));

      if (utilization >= 88) road.status = 'severe' as any;
      else if (utilization >= 75) road.status = 'congested';
      else if (utilization <= 42) road.status = 'underutilized';
      else road.status = 'normal';
    });

    return simulatedRoads;
  }

  private calculateNetworkMetrics(roads: IRoad[]): ISimulationMetrics {
    const totalVehicles = roads.reduce((acc, r) => acc + r.currentTrafficVeh, 0);
    const totalLength = roads.reduce((acc, r) => acc + r.lengthKm, 0);

    // Weighted average speed by vehicle count
    const totalVehicleKm = roads.reduce((acc, r) => acc + r.currentTrafficVeh * r.averageSpeedKmh, 0);
    const averageSpeedKmh = Number((totalVehicleKm / Math.max(1, totalVehicles)).toFixed(1));

    const totalTravelTime = roads.reduce((acc, r) => acc + r.estimatedTravelTimeMin * r.currentTrafficVeh, 0);
    const averageTravelTimeMin = Number((totalTravelTime / Math.max(1, totalVehicles)).toFixed(1));

    const totalDelay = roads.reduce((acc, r) => acc + r.estimatedDelayMin * r.currentTrafficVeh, 0);
    const averageTrafficDelayMin = Number((totalDelay / Math.max(1, totalVehicles)).toFixed(1));

    const avgUtilization = Number(
      (roads.reduce((acc, r) => acc + r.utilizationPct, 0) / roads.length).toFixed(1)
    );

    const congestedCount = roads.filter((r) => r.congestionLevel === 'severe' || r.congestionLevel === 'heavy').length;
    const trafficDensity = Number((totalVehicles / totalLength).toFixed(1));

    // Calculate Uneven Distribution Index (Normalized Standard Deviation of utilization)
    const meanUtil = avgUtilization;
    const variance = roads.reduce((acc, r) => acc + Math.pow(r.utilizationPct - meanUtil, 2), 0) / roads.length;
    const stdDev = Math.sqrt(variance);
    const unevenDistributionIndex = Number((stdDev / 50).toFixed(2)); // scale between 0.00 and 1.00

    // Efficiency: higher speed & lower delay relative to free-flow
    const flowEfficiencyPct = Math.min(98, Math.max(25, Math.round((averageSpeedKmh / 55) * 100 - (averageTrafficDelayMin * 1.5))));

    // CO2 Emissions in Tons (idle delay heavily burns fuel)
    const co2EmissionTons = Number(
      ((totalVehicles * 0.00018) + (totalDelay * 0.00025)).toFixed(2)
    );

    return {
      averageSpeedKmh,
      averageTravelTimeMin,
      congestedRoadsCount: congestedCount,
      averageTrafficDelayMin,
      roadUtilizationPct: avgUtilization,
      trafficDensityVehPerKm: trafficDensity,
      totalThroughputVeh: Math.round(totalVehicles * 1.25),
      flowEfficiencyPct,
      co2EmissionTons,
      unevenDistributionIndex,
    };
  }

  private generateTimelineSteps(
    config: ISimulationConfig,
    weatherSpeed: number,
    weatherDelay: number
  ): ISimulationStep[] {
    const isMorning = config.peakHour === 'morning';
    const startHour = isMorning ? 9 : 16;
    const timeLabels = [
      `${startHour.toString().padStart(2, '0')}:00`,
      `${startHour.toString().padStart(2, '0')}:30`,
      `${(startHour + 1).toString().padStart(2, '0')}:00`,
      `${(startHour + 1).toString().padStart(2, '0')}:30`,
      `${(startHour + 2).toString().padStart(2, '0')}:00`,
      `${(startHour + 2).toString().padStart(2, '0')}:30`,
      `${(startHour + 3).toString().padStart(2, '0')}:00`,
    ];

    // Bell curve factors for peak intensity: starts moderate, peaks at +60min to +90min, cools down
    const curveFactors = [0.78, 0.92, 1.22, 1.30, 1.15, 0.90, 0.74];

    const steps: ISimulationStep[] = [];

    timeLabels.forEach((label, idx) => {
      const stepVolumeMult = (config.volumeMultiplier || 1.0) * curveFactors[idx];
      const minute = idx * 30;

      const stepRoadsBefore = this.simulateRoadStates(this.roads, stepVolumeMult, weatherSpeed, weatherDelay, []);
      const metricsBefore = this.calculateNetworkMetrics(stepRoadsBefore);

      const stepRoadsAfter = this.simulateRoadStates(
        this.roads,
        stepVolumeMult,
        weatherSpeed,
        weatherDelay,
        config.strategies
      );
      const metricsAfter = this.calculateNetworkMetrics(stepRoadsAfter);

      const roadStatesBefore: Record<string, { speed: number; vehicles: number; utilization: number; level: CongestionLevel }> = {};
      stepRoadsBefore.forEach((r) => {
        roadStatesBefore[r.id] = {
          speed: r.averageSpeedKmh,
          vehicles: r.currentTrafficVeh,
          utilization: r.utilizationPct,
          level: r.congestionLevel,
        };
      });

      const roadStatesAfter: Record<string, { speed: number; vehicles: number; utilization: number; level: CongestionLevel }> = {};
      stepRoadsAfter.forEach((r) => {
        roadStatesAfter[r.id] = {
          speed: r.averageSpeedKmh,
          vehicles: r.currentTrafficVeh,
          utilization: r.utilizationPct,
          level: r.congestionLevel,
        };
      });

      const activeDiversions = [
        { fromRoadId: 'R1', toRoadId: 'R4', divertedVehiclesCount: Math.round(580 * stepVolumeMult) },
        { fromRoadId: 'R2', toRoadId: 'R8', divertedVehiclesCount: Math.round(640 * stepVolumeMult) },
        { fromRoadId: 'R16', toRoadId: 'R20', divertedVehiclesCount: Math.round(720 * stepVolumeMult) },
      ];

      steps.push({
        timeLabel: label,
        minute,
        metricsBefore,
        metricsAfter,
        roadStatesBefore,
        roadStatesAfter,
        activeDiversions,
      });
    });

    return steps;
  }
}
