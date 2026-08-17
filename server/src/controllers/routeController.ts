import { Request, Response } from 'express';
import { RouteAlternativeModel } from '../models/RouteAlternative';
import { RoadModel } from '../models/Road';
import { AlertModel } from '../models/Alert';
import { isConnectedToMongo } from '../config/db';
import { dataStore } from '../models/DataStore';

export const getRouteAlternatives = async (_req: Request, res: Response) => {
  try {
    if (isConnectedToMongo) {
      const routes = await RouteAlternativeModel.find();
      return res.json({ routes: routes.map((r) => r.toJSON()), total: routes.length });
    }

    const routes = dataStore.getRouteAlternatives();
    return res.json({ routes, total: routes.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch routes' });
  }
};

export const applyDiversion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isConnectedToMongo) {
      const routeAlt = await RouteAlternativeModel.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { 'currentRoute.name': id }],
      });

      if (!routeAlt) return res.status(404).json({ error: 'Route alternative not found' });

      routeAlt.strategyApplied = true;
      await routeAlt.save();

      if (routeAlt.currentRoute.roadCodes && routeAlt.currentRoute.roadCodes.length > 0) {
        const code = routeAlt.currentRoute.roadCodes[0];
        const congestedRoad = await RoadModel.findOne({ code });
        if (congestedRoad) {
          congestedRoad.utilizationPct = Math.max(50, congestedRoad.utilizationPct - 25);
          congestedRoad.currentTrafficVeh = Math.round(congestedRoad.currentTrafficVeh * 0.75);
          congestedRoad.averageSpeedKmh = Math.round(congestedRoad.averageSpeedKmh * 1.35);
          congestedRoad.congestionLevel = congestedRoad.utilizationPct > 75 ? 'heavy' : 'moderate';
          await congestedRoad.save();
        }
      }

      await AlertModel.create({
        type: 'success',
        title: `Diversion Strategy Applied: ${routeAlt.sourceName} → ${routeAlt.destinationName}`,
        message: `Reallocated ${routeAlt.diversionPercentage}% traffic flow from choked corridor to peripheral bypass. Estimated ${routeAlt.recommendedRoute.timeSavedMin} min travel time saved.`,
        location: routeAlt.sourceName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
      });

      return res.json({
        message: 'Diversion strategy successfully applied and persisted in database!',
        route: routeAlt.toJSON(),
      });
    }

    const applied = dataStore.applyRouteDiversion(id);
    if (!applied) return res.status(404).json({ error: 'Route alternative not found' });

    return res.json({
      message: 'Diversion strategy successfully applied to corridor!',
      route: applied,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to apply diversion' });
  }
};
