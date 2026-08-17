import { Request, Response } from 'express';
import { RecommendationModel } from '../models/Recommendation';
import { RoadModel } from '../models/Road';
import { JunctionModel } from '../models/Junction';
import { AlertModel } from '../models/Alert';
import { isConnectedToMongo } from '../config/db';
import { dataStore } from '../models/DataStore';

export const getRecommendations = async (_req: Request, res: Response) => {
  try {
    if (isConnectedToMongo) {
      const recommendations = await RecommendationModel.find().sort({ applied: 1, confidencePct: -1 });
      return res.json({ recommendations: recommendations.map((r) => r.toJSON()), total: recommendations.length });
    }

    const recommendations = dataStore.getRecommendations();
    return res.json({ recommendations, total: recommendations.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch recommendations' });
  }
};

export const applyRecommendation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isConnectedToMongo) {
      const rec = await RecommendationModel.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { title: id }],
      });

      if (!rec) return res.status(404).json({ error: 'Recommendation not found' });

      rec.applied = true;
      rec.appliedAt = new Date();
      await rec.save();

      if (rec.targetType === 'junction') {
        const junction = await JunctionModel.findOne({
          $or: [{ code: rec.targetId }, { _id: rec.targetId.match(/^[0-9a-fA-F]{24}$/) ? rec.targetId : null }],
        });
        if (junction) {
          junction.greenDurationSec = Math.min(80, junction.greenDurationSec + 15);
          junction.redDurationSec = Math.max(30, junction.redDurationSec - 15);
          junction.queueLengthVeh = Math.round(junction.queueLengthVeh * 0.6);
          junction.averageWaitingTimeSec = Math.round(junction.averageWaitingTimeSec * 0.65);
          junction.isAdaptive = true;
          await junction.save();
        }
      } else if (rec.targetType === 'road') {
        const road = await RoadModel.findOne({
          $or: [{ code: rec.targetId }, { _id: rec.targetId.match(/^[0-9a-fA-F]{24}$/) ? rec.targetId : null }],
        });
        if (road) {
          road.utilizationPct = Math.max(55, road.utilizationPct - 22);
          road.currentTrafficVeh = Math.round(road.currentTrafficVeh * 0.78);
          road.averageSpeedKmh = Math.round(road.averageSpeedKmh * 1.3);
          road.congestionLevel = 'moderate';
          await road.save();
        }
      }

      await AlertModel.create({
        type: 'success',
        title: `AI Recommendation Executed: ${rec.title}`,
        message: `${rec.recommendedStrategy} activated on ${rec.targetName}. Projected outcome: ${rec.projectedImprovement}`,
        location: rec.targetName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
      });

      return res.json({
        message: `AI Recommendation applied successfully: ${rec.title}`,
        recommendation: rec.toJSON(),
      });
    }

    const applied = dataStore.applyRecommendation(id);
    if (!applied) return res.status(404).json({ error: 'Recommendation not found' });

    return res.json({
      message: `AI Recommendation applied: ${applied.title}`,
      recommendation: applied,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to apply recommendation' });
  }
};
