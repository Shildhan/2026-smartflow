import { UserModel } from '../models/User';
import { RoadModel } from '../models/Road';
import { JunctionModel } from '../models/Junction';
import { TrafficDataModel } from '../models/TrafficData';
import { RouteAlternativeModel } from '../models/RouteAlternative';
import { AlertModel } from '../models/Alert';
import { RecommendationModel } from '../models/Recommendation';
import { AIRecommendationEngine } from '../simulationEngine/aiRecommender';
import {
  initialUsers,
  initialRoads,
  initialJunctions,
  initialPeakHourData,
  initialAlerts,
  initialRouteAlternatives,
} from '../simulationEngine/seedData';

export const autoSeedDatabase = async (): Promise<void> => {
  try {
    // 1. Seed Users if empty
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      for (const u of initialUsers) {
        await UserModel.create({
          name: u.name,
          email: u.email.toLowerCase(),
          passwordHash: u.passwordHash,
          role: u.role,
          agency: u.agency,
        });
      }
      console.log(`[SmartFlow DB Seed] Seeded ${initialUsers.length} official users.`);
    }

    // 2. Seed Roads if empty
    const roadCount = await RoadModel.countDocuments();
    if (roadCount === 0) {
      for (const r of initialRoads) {
        await RoadModel.create({
          code: r.code,
          name: r.name,
          zone: r.zone.split(' - ')[0] || r.zone,
          zoneName: r.zoneName || r.zone,
          startJunctionId: r.startJunctionId,
          endJunctionId: r.endJunctionId,
          coordinates: r.coordinates,
          lengthKm: r.lengthKm,
          lanes: r.lanes || 4,
          speedLimitKmh: r.speedLimitKmh || 50,
          capacityVehPerHour: r.capacityVehPerHour,
          currentTrafficVeh: r.currentTrafficVeh,
          averageSpeedKmh: r.averageSpeedKmh,
          utilizationPct: r.utilizationPct,
          congestionLevel: r.congestionLevel,
          estimatedTravelTimeMin: r.estimatedTravelTimeMin,
          estimatedDelayMin: r.estimatedDelayMin,
          isAlternativeRoute: r.isAlternativeRoute || false,
          status: r.status || 'normal',
        });
      }
      console.log(`[SmartFlow DB Seed] Seeded ${initialRoads.length} arterial road corridors.`);
    }

    // 3. Seed Junctions if empty
    const junctionCount = await JunctionModel.countDocuments();
    if (junctionCount === 0) {
      for (const j of initialJunctions) {
        await JunctionModel.create({
          code: j.code,
          name: j.name,
          location: j.location,
          zone: j.zone.split(' - ')[0] || j.zone,
          incomingRoadIds: j.incomingRoadIds || [],
          vehicleCount: j.vehicleCount,
          queueLengthVeh: j.queueLengthVeh,
          averageWaitingTimeSec: j.averageWaitingTimeSec,
          congestionLevel: j.congestionLevel,
          signalCycleSec: j.signalCycleSec,
          greenDurationSec: j.greenDurationSec,
          yellowDurationSec: j.yellowDurationSec || 5,
          redDurationSec: j.redDurationSec,
          currentPhase: j.currentPhase || 'green',
          isAdaptive: j.isAdaptive || false,
        });
      }
      console.log(`[SmartFlow DB Seed] Seeded ${initialJunctions.length} signalized junctions.`);
    }

    // 4. Seed Traffic Data Points if empty
    const trafficCount = await TrafficDataModel.countDocuments();
    if (trafficCount === 0) {
      for (const p of initialPeakHourData.morning) {
        await TrafficDataModel.create({
          roadId: 'all',
          peakHour: 'morning',
          timestamp: p.timestamp,
          totalVehicles: p.totalVehicles,
          averageSpeedKmh: p.averageSpeedKmh,
          congestedRoadsCount: p.congestedRoadsCount,
          averageDelayMin: p.averageDelayMin,
          trafficDensityVehPerKm: p.trafficDensityVehPerKm || 0,
          roadUtilizationPct: p.roadUtilizationPct || 0,
          flowEfficiencyPct: p.flowEfficiencyPct || 0,
        });
      }
      for (const p of initialPeakHourData.evening) {
        await TrafficDataModel.create({
          roadId: 'all',
          peakHour: 'evening',
          timestamp: p.timestamp,
          totalVehicles: p.totalVehicles,
          averageSpeedKmh: p.averageSpeedKmh,
          congestedRoadsCount: p.congestedRoadsCount,
          averageDelayMin: p.averageDelayMin,
          trafficDensityVehPerKm: p.trafficDensityVehPerKm || 0,
          roadUtilizationPct: p.roadUtilizationPct || 0,
          flowEfficiencyPct: p.flowEfficiencyPct || 0,
        });
      }
      console.log(`[SmartFlow DB Seed] Seeded peak-hour time series datasets.`);
    }

    // 5. Seed Route Alternatives if empty
    const routeCount = await RouteAlternativeModel.countDocuments();
    if (routeCount === 0) {
      for (const r of initialRouteAlternatives) {
        await RouteAlternativeModel.create({
          sourceName: r.sourceName,
          destinationName: r.destinationName,
          currentRoute: r.currentRoute,
          recommendedRoute: r.recommendedRoute,
          diversionPercentage: r.diversionPercentage || 30,
          strategyApplied: r.strategyApplied || false,
        });
      }
      console.log(`[SmartFlow DB Seed] Seeded ${initialRouteAlternatives.length} corridor alternatives.`);
    }

    // 6. Seed Alerts if empty
    const alertCount = await AlertModel.countDocuments();
    if (alertCount === 0) {
      for (const a of initialAlerts) {
        await AlertModel.create({
          type: a.type,
          title: a.title,
          message: a.message,
          location: a.location,
          timestamp: a.timestamp,
          isRead: a.isRead || false,
          actionRequired: a.actionRequired,
        });
      }
      console.log(`[SmartFlow DB Seed] Seeded ${initialAlerts.length} initial incident alerts.`);
    }

    // 7. Seed Recommendations if empty
    const recCount = await RecommendationModel.countDocuments();
    if (recCount === 0) {
      const roads = await RoadModel.find();
      const junctions = await JunctionModel.find();
      const recs = AIRecommendationEngine.generateRecommendations(
        roads.map((r) => r.toJSON()),
        junctions.map((j) => j.toJSON())
      );
      for (const rec of recs) {
        await RecommendationModel.create({
          priority: rec.priority,
          title: rec.title,
          description: rec.description,
          targetType: rec.targetType,
          targetId: rec.targetId,
          targetName: rec.targetName,
          recommendedStrategy: rec.recommendedStrategy,
          projectedImprovement: rec.projectedImprovement,
          confidencePct: rec.confidencePct,
          applied: rec.applied || false,
        });
      }
      console.log(`[SmartFlow DB Seed] Seeded AI recommendations.`);
    }
  } catch (error) {
    console.error('[SmartFlow DB Seed] Error during auto-seeding:', error);
  }
};

export const resetDatabaseToPristine = async (): Promise<void> => {
  await Promise.all([
    RoadModel.deleteMany({}),
    JunctionModel.deleteMany({}),
    TrafficDataModel.deleteMany({}),
    RouteAlternativeModel.deleteMany({}),
    AlertModel.deleteMany({}),
    RecommendationModel.deleteMany({}),
  ]);
  await autoSeedDatabase();
};
