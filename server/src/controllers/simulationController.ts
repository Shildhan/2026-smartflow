import { Response } from 'express';
import { TrafficSimulationEngine } from '../simulationEngine/engine';
import { RoadModel } from '../models/Road';
import { JunctionModel } from '../models/Junction';
import { SimulationModel } from '../models/Simulation';
import { SimulationResultModel } from '../models/SimulationResult';
import { AlertModel } from '../models/Alert';
import { UserModel } from '../models/User';
import { isConnectedToMongo } from '../config/db';
import { dataStore } from '../models/DataStore';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ISimulationConfig, ISimulationResult, IRoad, IJunction } from '../types';

export const runSimulation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      peakHour = 'morning',
      trafficVolume = 'medium',
      volumeMultiplier = 1.0,
      durationMin = 60,
      weather = 'normal',
      strategies = ['Signal Timing Optimization', 'Dynamic Traffic Diversion'],
      name,
    } = req.body;

    const simId = `sim-${Date.now()}`;
    const simName = name || `${peakHour.toUpperCase()} Peak Optimization (${strategies.length} strategies)`;

    let roads: IRoad[] = [];
    let junctions: IJunction[] = [];

    if (isConnectedToMongo) {
      const [rDocs, jDocs] = await Promise.all([RoadModel.find(), JunctionModel.find()]);
      roads = rDocs.map((r) => r.toJSON());
      junctions = jDocs.map((j) => j.toJSON());
    } else {
      roads = dataStore.getRoads();
      junctions = dataStore.getJunctions();
    }

    const engine = new TrafficSimulationEngine(roads, junctions);

    const config: ISimulationConfig = {
      id: simId,
      name: simName,
      peakHour,
      trafficVolume,
      volumeMultiplier: Number(volumeMultiplier) || 1.0,
      durationMin: Number(durationMin) as any,
      weather,
      strategies,
      createdAt: new Date().toISOString(),
    };

    const result = engine.runSimulation(config);

    if (isConnectedToMongo) {
      let userId = req.user?._id;
      if (!userId) {
        const defaultUser = await UserModel.findOne();
        userId = defaultUser?._id;
      }

      if (userId) {
        const simDoc = await SimulationModel.create({
          userId,
          name: simName,
          simulationDate: new Date().toISOString().split('T')[0],
          startTime: new Date(),
          peakHour,
          trafficVolume,
          volumeMultiplier: Number(volumeMultiplier) || 1.0,
          durationMin: Number(durationMin) as any,
          weather,
          strategies,
          status: 'completed',
        });

        await SimulationResultModel.create({
          simulationId: simDoc._id,
          userId,
          beforeMetrics: result.beforeMetrics,
          afterMetrics: result.afterMetrics,
          improvements: result.improvements,
          timelineSteps: result.timelineSteps,
          affectedRoads: result.affectedRoads,
        });

        result.simulationId = simDoc._id.toString();
        result.config.id = simDoc._id.toString();
      }
    } else {
      dataStore.saveSimulation(result);
    }

    return res.status(201).json({
      message: 'Simulation executed and persisted successfully in database',
      result,
    });
  } catch (error: any) {
    console.error('runSimulation error:', error);
    return res.status(500).json({ error: error.message || 'Simulation execution failed' });
  }
};

export const getSimulationHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (isConnectedToMongo) {
      const filter: any = {};
      if (req.user && req.user.role !== 'Planning Authority') {
        filter.userId = req.user._id;
      }

      const simulations = await SimulationModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('userId', 'name email agency');

      const simIds = simulations.map((s) => s._id);
      const results = await SimulationResultModel.find({ simulationId: { $in: simIds } });

      const resultMap = new Map<string, any>();
      results.forEach((r) => {
        resultMap.set(r.simulationId.toString(), r);
      });

      const historyItems = simulations.map((sim) => {
        const resData = resultMap.get(sim._id.toString());
        return {
          simulationId: sim._id.toString(),
          name: sim.name,
          simulationDate: sim.simulationDate,
          createdAt: sim.createdAt,
          config: {
            id: sim._id.toString(),
            name: sim.name,
            peakHour: sim.peakHour,
            trafficVolume: sim.trafficVolume,
            volumeMultiplier: sim.volumeMultiplier,
            durationMin: sim.durationMin,
            weather: sim.weather,
            strategies: sim.strategies,
          },
          beforeMetrics: resData?.beforeMetrics,
          afterMetrics: resData?.afterMetrics,
          improvements: resData?.improvements || {
            speedImprovementPct: 0,
            delayReductionPct: 0,
            congestionReductionPct: 0,
          },
          status: sim.status,
          user: sim.userId,
        };
      });

      return res.json({ simulations: historyItems, total: historyItems.length });
    }

    const sims = dataStore.getSimulations();
    const historyItems = sims.map((s) => ({
      simulationId: s.simulationId,
      name: s.config.name || s.simulationId,
      simulationDate: new Date(s.createdAt).toISOString().split('T')[0],
      createdAt: s.createdAt,
      config: s.config,
      beforeMetrics: s.beforeMetrics,
      afterMetrics: s.afterMetrics,
      improvements: s.improvements,
      status: 'completed',
      user: { name: 'Dr. Rajesh Sharma (IAS)', email: 'commissioner@nmcnagpur.gov.in', agency: 'Nagpur Municipal Corporation (NMC)' },
    }));

    return res.json({ simulations: historyItems, total: historyItems.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch simulation history' });
  }
};

export const getSimulationById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isConnectedToMongo) {
      const sim = await SimulationModel.findById(id).populate('userId', 'name email agency');
      if (!sim) {
        return res.status(404).json({ error: 'Simulation not found' });
      }

      const resultDoc = await SimulationResultModel.findOne({ simulationId: sim._id });

      const result: ISimulationResult = {
        simulationId: sim._id.toString(),
        config: {
          id: sim._id.toString(),
          name: sim.name,
          peakHour: sim.peakHour as any,
          trafficVolume: sim.trafficVolume as any,
          volumeMultiplier: sim.volumeMultiplier,
          durationMin: sim.durationMin as any,
          weather: sim.weather as any,
          strategies: sim.strategies as any,
        },
        beforeMetrics: resultDoc?.beforeMetrics || ({} as any),
        afterMetrics: resultDoc?.afterMetrics || ({} as any),
        improvements: resultDoc?.improvements || ({} as any),
        timelineSteps: resultDoc?.timelineSteps || [],
        affectedRoads: resultDoc?.affectedRoads || [],
        createdAt: sim.createdAt.toISOString(),
      };

      return res.json({ simulation: result });
    }

    const sim = dataStore.getSimulationById(id);
    if (!sim) return res.status(404).json({ error: 'Simulation not found' });
    return res.json({ simulation: sim });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch simulation' });
  }
};

export const deleteSimulation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isConnectedToMongo) {
      await Promise.all([
        SimulationModel.findByIdAndDelete(id),
        SimulationResultModel.deleteMany({ simulationId: id }),
      ]);
    } else {
      dataStore.deleteSimulation(id);
    }

    return res.json({ message: 'Simulation deleted successfully', success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete simulation' });
  }
};

export const applySimulationToLive = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isConnectedToMongo) {
      const resultDoc = await SimulationResultModel.findOne({
        $or: [{ simulationId: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });

      if (!resultDoc) return res.status(404).json({ error: 'Simulation result not found' });

      for (const ar of resultDoc.affectedRoads) {
        const road = await RoadModel.findOne({
          $or: [{ code: ar.roadId }, { _id: ar.roadId.match(/^[0-9a-fA-F]{24}$/) ? ar.roadId : null }],
        });
        if (road) {
          road.utilizationPct = ar.afterUtilization;
          road.averageSpeedKmh = ar.afterSpeed;
          road.currentTrafficVeh = Math.round((road.capacityVehPerHour * ar.afterUtilization) / 100);
          road.congestionLevel =
            ar.afterUtilization >= 88
              ? 'severe'
              : ar.afterUtilization >= 75
              ? 'heavy'
              : ar.afterUtilization >= 50
              ? 'moderate'
              : 'low';
          await road.save();
        }
      }

      await AlertModel.create({
        type: 'success',
        title: `Simulation Strategy Deployed to Live Network`,
        message: `Live traffic parameters optimized across Nagpur corridors. Average speed improved by +${resultDoc.improvements.speedImprovementPct}%, delay reduced by -${resultDoc.improvements.delayReductionPct}%.`,
        location: 'Nagpur Central & Ring Corridors',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
      });

      return res.json({
        message: 'Simulation optimization successfully applied to live traffic database!',
        result: resultDoc.toJSON(),
      });
    }

    const sim = dataStore.getSimulationById(id);
    if (!sim) return res.status(404).json({ error: 'Simulation not found' });

    sim.affectedRoads.forEach((ar) => {
      const road = dataStore.getRoadById(ar.roadId);
      if (road) {
        road.utilizationPct = ar.afterUtilization;
        road.averageSpeedKmh = ar.afterSpeed;
        road.currentTrafficVeh = Math.round((road.capacityVehPerHour * ar.afterUtilization) / 100);
        road.congestionLevel = ar.afterUtilization >= 88 ? 'severe' : ar.afterUtilization >= 75 ? 'heavy' : ar.afterUtilization >= 50 ? 'moderate' : 'low';
      }
    });

    dataStore.addAlert({
      id: `alt-applied-${Date.now()}`,
      type: 'success',
      title: `Simulation Strategy Deployed: ${sim.config.name || sim.simulationId}`,
      message: `Live traffic parameters optimized. Average speed increased by +${sim.improvements.speedImprovementPct}%, delay reduced by -${sim.improvements.delayReductionPct}%.`,
      location: 'Nagpur Jurisdiction Wide',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    });

    return res.json({
      message: 'Simulation optimization successfully applied to live traffic network!',
      result: sim,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to apply strategy' });
  }
};
