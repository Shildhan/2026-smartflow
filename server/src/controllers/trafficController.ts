import { Request, Response } from 'express';
import { RoadModel } from '../models/Road';
import { JunctionModel } from '../models/Junction';
import { TrafficDataModel } from '../models/TrafficData';
import { isConnectedToMongo } from '../config/db';
import { dataStore } from '../models/DataStore';
import { resetDatabaseToPristine } from '../services/seedService';
import { PeakHourType, IZoneData, IRoad, IJunction } from '../types';

export const getRoads = async (req: Request, res: Response) => {
  try {
    const { zone, congestion, minUtilization } = req.query;

    if (isConnectedToMongo) {
      const filter: any = {};
      if (zone) filter.zone = new RegExp(`^${zone}`, 'i');
      if (congestion) filter.congestionLevel = congestion;
      if (minUtilization) filter.utilizationPct = { $gte: Number(minUtilization) };

      const roads = await RoadModel.find(filter).sort({ code: 1 });
      return res.json({ roads: roads.map((r) => r.toJSON()), total: roads.length });
    }

    let roads = dataStore.getRoads();
    if (zone) roads = roads.filter((r) => r.zone.toLowerCase().includes(String(zone).toLowerCase()));
    if (congestion) roads = roads.filter((r) => r.congestionLevel === congestion);
    if (minUtilization) roads = roads.filter((r) => r.utilizationPct >= Number(minUtilization));

    return res.json({ roads, total: roads.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch roads' });
  }
};

export const getRoadById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isConnectedToMongo) {
      const road = await RoadModel.findOne({
        $or: [{ code: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });
      if (!road) return res.status(404).json({ error: 'Road corridor not found' });
      return res.json({ road: road.toJSON() });
    }

    const road = dataStore.getRoadById(id);
    if (!road) return res.status(404).json({ error: 'Road corridor not found' });
    return res.json({ road });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch road' });
  }
};

export const updateRoad = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isConnectedToMongo) {
      const road = await RoadModel.findOneAndUpdate(
        { $or: [{ code: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        { $set: updates },
        { new: true, runValidators: true }
      );
      if (!road) return res.status(404).json({ error: 'Road corridor not found' });
      return res.json({ road: road.toJSON(), message: 'Road corridor updated successfully' });
    }

    const updated = dataStore.updateRoad(id, updates);
    if (!updated) return res.status(404).json({ error: 'Road corridor not found' });
    return res.json({ road: updated, message: 'Road corridor updated successfully' });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to update road corridor' });
  }
};

export const getJunctions = async (_req: Request, res: Response) => {
  try {
    if (isConnectedToMongo) {
      const junctions = await JunctionModel.find().sort({ code: 1 });
      return res.json({ junctions: junctions.map((j) => j.toJSON()), total: junctions.length });
    }

    const junctions = dataStore.getJunctions();
    return res.json({ junctions, total: junctions.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch junctions' });
  }
};

export const getJunctionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isConnectedToMongo) {
      const junction = await JunctionModel.findOne({
        $or: [{ code: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });
      if (!junction) return res.status(404).json({ error: 'Junction not found' });
      return res.json({ junction: junction.toJSON() });
    }

    const junction = dataStore.getJunctionById(id);
    if (!junction) return res.status(404).json({ error: 'Junction not found' });
    return res.json({ junction });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch junction' });
  }
};

export const getPeakHourStats = async (req: Request, res: Response) => {
  try {
    const peak = (req.query.peak as PeakHourType) || 'morning';

    if (isConnectedToMongo) {
      const dataPoints = await TrafficDataModel.find({ peakHour: peak }).sort({ timestamp: 1 });
      return res.json({
        peak,
        timeSpan: peak === 'morning' ? '09:00 AM – 12:00 PM' : '04:00 PM – 07:00 PM',
        dataPoints: dataPoints.map((dp) => dp.toJSON()),
      });
    }

    const dataPoints = dataStore.getPeakHourData(peak);
    return res.json({
      peak,
      timeSpan: peak === 'morning' ? '09:00 AM – 12:00 PM' : '04:00 PM – 07:00 PM',
      dataPoints,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch peak stats' });
  }
};

export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    const peak = (req.query.peak as PeakHourType) || 'morning';

    let roads: IRoad[] = [];
    let junctions: IJunction[] = [];
    let peakPoints: any[] = [];

    if (isConnectedToMongo) {
      const [rDocs, jDocs, pDocs] = await Promise.all([
        RoadModel.find(),
        JunctionModel.find(),
        TrafficDataModel.find({ peakHour: peak }).sort({ timestamp: 1 }),
      ]);
      roads = rDocs.map((r) => r.toJSON());
      junctions = jDocs.map((j) => j.toJSON());
      peakPoints = pDocs.map((p) => p.toJSON());
    } else {
      roads = dataStore.getRoads();
      junctions = dataStore.getJunctions();
      peakPoints = dataStore.getPeakHourData(peak);
    }

    const totalVehicles = roads.reduce((acc, r) => acc + r.currentTrafficVeh, 0);
    const avgSpeed = Number(
      (
        roads.reduce((acc, r) => acc + r.currentTrafficVeh * r.averageSpeedKmh, 0) /
        Math.max(1, totalVehicles)
      ).toFixed(1)
    );
    const congestedRoads = roads.filter((r) => r.congestionLevel === 'heavy' || r.congestionLevel === 'severe').length;
    const totalCapacity = roads.reduce((acc, r) => acc + r.capacityVehPerHour, 0);
    const networkUtilization = Number(((totalVehicles / Math.max(1, totalCapacity)) * 100).toFixed(1));
    const avgTravelTime = Number(
      (roads.reduce((acc, r) => acc + r.estimatedTravelTimeMin, 0) / Math.max(1, roads.length)).toFixed(1)
    );
    const avgDelay = Number(
      (roads.reduce((acc, r) => acc + r.estimatedDelayMin, 0) / Math.max(1, roads.length)).toFixed(1)
    );

    // Gini calculation
    const zoneMap: Record<string, { totalVeh: number; totalCap: number }> = {};
    roads.forEach((r) => {
      const z = r.zone;
      if (!zoneMap[z]) zoneMap[z] = { totalVeh: 0, totalCap: 0 };
      zoneMap[z].totalVeh += r.currentTrafficVeh;
      zoneMap[z].totalCap += r.capacityVehPerHour;
    });

    const zoneUtils = Object.values(zoneMap).map((z) => (z.totalVeh / Math.max(1, z.totalCap)) * 100);
    let gini = 0.64;
    if (zoneUtils.length > 1) {
      zoneUtils.sort((a, b) => a - b);
      const n = zoneUtils.length;
      let sumDiff = 0;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          sumDiff += Math.abs(zoneUtils[i] - zoneUtils[j]);
        }
      }
      const mean = zoneUtils.reduce((a, b) => a + b, 0) / n;
      gini = Number((sumDiff / (2 * n * n * Math.max(1, mean))).toFixed(2));
    }

    return res.json({
      peak,
      metrics: {
        totalVehicles,
        averageSpeedKmh: avgSpeed,
        congestedRoadsCount: congestedRoads,
        totalRoadsCount: roads.length,
        networkUtilizationPct: networkUtilization,
        averageTravelTimeMin: avgTravelTime,
        averageDelayMin: avgDelay,
        trafficDensityVehPerKm: Math.round(totalVehicles / 85),
        giniCoefficient: gini,
        imbalanceRating: gini > 0.5 ? 'Severe Imbalance' : gini > 0.35 ? 'Moderate' : 'Balanced',
      },
      roads,
      junctions,
      timeSeries: peakPoints,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch dashboard overview' });
  }
};

export const getZoneDistribution = async (_req: Request, res: Response) => {
  try {
    let roads: IRoad[] = [];
    if (isConnectedToMongo) {
      const rDocs = await RoadModel.find();
      roads = rDocs.map((r) => r.toJSON());
    } else {
      roads = dataStore.getRoads();
    }

    const zoneNames: Record<string, string> = {
      'Zone A': 'Central Commercial & Sitabuldi CBD',
      'Zone B': 'Wardha Road Corridor & IT Hub',
      'Zone C': 'Western Industrial & Dharampeth',
      'Zone D': 'Medical Square & Government Sector',
      'Zone E': 'South Bypass & Ring Road Outskirts',
      'Zone F': 'Outer Ring Road & Logistics Park',
    };

    const zoneGroups: Record<string, IRoad[]> = {};
    ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F'].forEach((z) => {
      zoneGroups[z] = [];
    });

    roads.forEach((r) => {
      const z = r.zone.split(' - ')[0] || r.zone;
      if (!zoneGroups[z]) zoneGroups[z] = [];
      zoneGroups[z].push(r);
    });

    const zones: IZoneData[] = Object.entries(zoneGroups).map(([zoneId, zRoads]) => {
      const totalVehicles = zRoads.reduce((acc, r) => acc + r.currentTrafficVeh, 0);
      const totalCapacity = zRoads.reduce((acc, r) => acc + r.capacityVehPerHour, 0);
      const avgUtil = totalCapacity > 0 ? Math.round((totalVehicles / totalCapacity) * 100) : 0;
      const avgSpeed = zRoads.length > 0
        ? Number((zRoads.reduce((acc, r) => acc + r.averageSpeedKmh, 0) / zRoads.length).toFixed(1))
        : 0;
      const congested = zRoads.filter((r) => r.congestionLevel === 'heavy' || r.congestionLevel === 'severe').length;
      const underutilized = zRoads.filter((r) => r.utilizationPct < 50).length;

      return {
        zoneId,
        zoneName: zoneNames[zoneId] || zoneId,
        totalVehicles,
        totalCapacity,
        averageUtilizationPct: avgUtil,
        averageSpeedKmh: avgSpeed,
        congestedRoads: congested,
        underutilizedRoads: underutilized,
        distributionScore: avgUtil > 80 ? 30 : avgUtil < 40 ? 45 : 85,
        status: avgUtil > 80 ? 'Choked' : avgUtil < 45 ? 'Underutilized' : 'Optimal',
        roads: zRoads,
      };
    });

    const utils = zones.map((z) => z.averageUtilizationPct);
    const n = utils.length;
    let diffSum = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        diffSum += Math.abs(utils[i] - utils[j]);
      }
    }
    const mean = utils.reduce((a, b) => a + b, 0) / Math.max(1, n);
    const gini = Number((diffSum / (2 * n * n * Math.max(1, mean))).toFixed(2));

    return res.json({
      zones,
      congestedZones: zones.filter((z) => z.averageUtilizationPct >= 75),
      underutilizedZones: zones.filter((z) => z.averageUtilizationPct < 50),
      giniCoefficient: gini,
      imbalanceRating: gini >= 0.55 ? 'Severe Imbalance' : gini >= 0.35 ? 'Moderate Unevenness' : 'Balanced',
      recommendationSummary: 'Divert through-traffic from Zone A (CBD 96% load) to Zone E & F (Outer Ring 31% load) via Besa-Manewada bypass.',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch zone distribution' });
  }
};

export const resetDemoData = async (_req: Request, res: Response) => {
  try {
    if (isConnectedToMongo) {
      await resetDatabaseToPristine();
    } else {
      dataStore.resetToSeedData();
    }
    return res.json({ message: 'Simulation and traffic data successfully reset to pristine baseline.', success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to reset demo data' });
  }
};
