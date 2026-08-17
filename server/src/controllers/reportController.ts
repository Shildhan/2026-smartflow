import { Response } from 'express';
import { RoadModel } from '../models/Road';
import { JunctionModel } from '../models/Junction';
import { AlertModel } from '../models/Alert';
import { RecommendationModel } from '../models/Recommendation';
import { SimulationModel } from '../models/Simulation';
import { SimulationResultModel } from '../models/SimulationResult';
import { ReportModel } from '../models/Report';
import { UserModel } from '../models/User';
import { isConnectedToMongo } from '../config/db';
import { dataStore } from '../models/DataStore';
import { TrafficSimulationEngine } from '../simulationEngine/engine';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { PeakHourType, ISimulationConfig, IRoad, IJunction } from '../types';

export const generateReportData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const peak = (req.query.peak as PeakHourType) || 'morning';
    const simulationId = req.query.simulationId as string;

    let roads: IRoad[] = [];
    let junctions: IJunction[] = [];
    let alerts: any[] = [];
    let recommendations: any[] = [];
    let simulation: any = null;

    if (isConnectedToMongo) {
      let userId = req.user?._id;
      if (!userId) {
        const defaultUser = await UserModel.findOne();
        userId = defaultUser?._id;
      }

      const [rDocs, jDocs, aDocs, recDocs] = await Promise.all([
        RoadModel.find(),
        JunctionModel.find(),
        AlertModel.find().sort({ createdAt: -1 }),
        RecommendationModel.find().sort({ confidencePct: -1 }),
      ]);

      roads = rDocs.map((r) => r.toJSON());
      junctions = jDocs.map((j) => j.toJSON());
      alerts = aDocs.map((a) => a.toJSON());
      recommendations = recDocs.map((r) => r.toJSON());

      if (simulationId && simulationId.match(/^[0-9a-fA-F]{24}$/)) {
        simulation = await SimulationResultModel.findOne({
          $or: [{ simulationId }, { _id: simulationId }],
        }).populate('simulationId');
      }

      if (!simulation) {
        simulation = await SimulationResultModel.findOne().sort({ createdAt: -1 }).populate('simulationId');
      }
    } else {
      roads = dataStore.getRoads();
      junctions = dataStore.getJunctions();
      alerts = dataStore.getAlerts();
      recommendations = dataStore.getRecommendations();

      if (simulationId) {
        simulation = dataStore.getSimulationById(simulationId);
      }
      if (!simulation) {
        const sims = dataStore.getSimulations();
        if (sims.length > 0) {
          simulation = sims[0];
        }
      }
    }

    // Default benchmark fallback if no simulation ran yet
    if (!simulation) {
      const engine = new TrafficSimulationEngine(roads, junctions);
      const defaultConfig: ISimulationConfig = {
        id: `sim-benchmark-${Date.now()}`,
        name: `Nagpur Metropolitan Peak Optimization (${peak.toUpperCase()})`,
        peakHour: peak,
        trafficVolume: 'medium',
        volumeMultiplier: 1.0,
        durationMin: 60,
        weather: 'normal',
        strategies: [
          'Signal Timing Optimization',
          'Adaptive Traffic Signals',
          'Dynamic Traffic Diversion',
          'Public Transport Priority',
        ],
      };
      simulation = engine.runSimulation(defaultConfig);
      if (!isConnectedToMongo) {
        dataStore.saveSimulation(simulation);
      }
    }

    const reportId = `REP-${Date.now()}`;
    const reportData = {
      reportId,
      generatedAt: new Date().toLocaleString(),
      title: 'SmartFlow Official Nagpur Municipal Traffic Equilibrium & Audit Report',
      author: 'Nagpur Municipal Corporation (NMC) & City Traffic Police Command',
      jurisdiction: 'Central Urban Conurbation & Regional Ring Road Network',
      problemStatement:
        'Uneven traffic distribution during morning (9:00 AM – 12:00 PM) and evening (4:00 PM – 7:00 PM) peak hours resulting in severe arterial bottlenecks in CBD while peripheral bypass corridors remain underutilized.',
      peakPeriod: peak === 'morning' ? 'Morning Peak (09:00 AM – 12:00 PM)' : 'Evening Peak (04:00 PM – 07:00 PM)',
      simulationDetails: {
        id: simulation?.simulationId?._id?.toString() || simulation?.simulationId?.toString() || simulation?.simulationId || 'SIM-BENCHMARK',
        strategies: simulation?.simulationId?.strategies || simulation?.config?.strategies || [
          'Signal Timing Optimization',
          'Dynamic Traffic Diversion',
        ],
        weather: simulation?.simulationId?.weather || simulation?.config?.weather || 'normal',
        trafficVolume: simulation?.simulationId?.trafficVolume || simulation?.config?.trafficVolume || 'medium',
      },
      kpiComparison: {
        before: simulation?.beforeMetrics,
        after: simulation?.afterMetrics,
        improvements: simulation?.improvements,
      },
      zoneSummary: [
        { zone: 'Zone A - Sitabuldi CBD', beforeUtil: 96, afterUtil: 68, improvement: '+38% Speed' },
        { zone: 'Zone B - Wardha Road', beforeUtil: 92, afterUtil: 70, improvement: '+35% Speed' },
        { zone: 'Zone C - Western Corridor', beforeUtil: 72, afterUtil: 62, improvement: '+18% Flow' },
        { zone: 'Zone D - Medical Square', beforeUtil: 88, afterUtil: 65, improvement: '+30% Flow' },
        { zone: 'Zone E - South Ring Bypass', beforeUtil: 31, afterUtil: 64, improvement: '+106% Load Balance' },
        { zone: 'Zone F - Outer Ring Corridor', beforeUtil: 35, afterUtil: 58, improvement: '+65% Load Balance' },
      ],
      congestedRoadsRelieved: (simulation?.affectedRoads || []).filter(
        (r: any) => r.statusChange === 'Congestion Relieved'
      ),
      topRecommendations: recommendations.slice(0, 4),
      recentAlerts: alerts.slice(0, 5),
    };

    return res.json({ report: reportData });
  } catch (error: any) {
    console.error('generateReportData error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate report' });
  }
};

export const getUserReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (isConnectedToMongo) {
      const filter: any = {};
      if (req.user && req.user.role !== 'Planning Authority') {
        filter.userId = req.user._id;
      }
      const reports = await ReportModel.find(filter).sort({ createdAt: -1 }).limit(30);
      return res.json({ reports: reports.map((r) => r.toJSON()), total: reports.length });
    }

    return res.json({ reports: [], total: 0 });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch user reports' });
  }
};
