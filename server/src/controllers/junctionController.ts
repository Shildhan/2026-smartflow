import { Request, Response } from 'express';
import { JunctionModel } from '../models/Junction';
import { AlertModel } from '../models/Alert';
import { isConnectedToMongo } from '../config/db';
import { dataStore } from '../models/DataStore';

export const updateJunctionSignal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { greenDurationSec, yellowDurationSec = 5, redDurationSec, isAdaptive } = req.body;

    if (isConnectedToMongo) {
      const junction = await JunctionModel.findOne({
        $or: [{ code: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });

      if (!junction) return res.status(404).json({ error: 'Junction not found' });

      const green = Number(greenDurationSec) || junction.greenDurationSec;
      const yellow = Number(yellowDurationSec) || junction.yellowDurationSec;
      const red = Number(redDurationSec) || junction.redDurationSec;
      const totalCycle = green + yellow + red;

      const lambda = green / Math.max(1, totalCycle);
      const estimatedWait = Math.round(
        Math.max(12, (totalCycle * Math.pow(1 - lambda, 2)) / (2 * (1 - lambda * 0.85)))
      );
      const estimatedQueue = Math.round(
        Math.max(8, (junction.vehicleCount / 3600) * estimatedWait)
      );

      junction.greenDurationSec = green;
      junction.yellowDurationSec = yellow;
      junction.redDurationSec = red;
      junction.signalCycleSec = totalCycle;
      junction.averageWaitingTimeSec = estimatedWait;
      junction.queueLengthVeh = estimatedQueue;
      junction.congestionLevel =
        estimatedQueue > 75 ? 'severe' : estimatedQueue > 50 ? 'heavy' : estimatedQueue > 25 ? 'moderate' : 'low';
      if (isAdaptive !== undefined) junction.isAdaptive = Boolean(isAdaptive);

      await junction.save();

      await AlertModel.create({
        type: 'info',
        title: `Signal Timing Modified: ${junction.name}`,
        message: `New cycle: ${totalCycle}s (Green: ${green}s, Yellow: ${yellow}s, Red: ${red}s). Expected waiting time: ${estimatedWait}s.`,
        location: junction.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
      });

      return res.json({
        message: 'Signal timings updated successfully in database',
        junction: junction.toJSON(),
      });
    }

    const junction = dataStore.getJunctionById(id);
    if (!junction) return res.status(404).json({ error: 'Junction not found' });

    const green = Number(greenDurationSec) || junction.greenDurationSec;
    const yellow = Number(yellowDurationSec) || junction.yellowDurationSec;
    const red = Number(redDurationSec) || junction.redDurationSec;
    const totalCycle = green + yellow + red;

    const lambda = green / Math.max(1, totalCycle);
    const estimatedWait = Math.round(
      Math.max(12, (totalCycle * Math.pow(1 - lambda, 2)) / (2 * (1 - lambda * 0.85)))
    );
    const estimatedQueue = Math.round(
      Math.max(8, (junction.vehicleCount / 3600) * estimatedWait)
    );

    const updated = dataStore.updateJunction(id, {
      greenDurationSec: green,
      yellowDurationSec: yellow,
      redDurationSec: red,
      signalCycleSec: totalCycle,
      averageWaitingTimeSec: estimatedWait,
      queueLengthVeh: estimatedQueue,
      congestionLevel: estimatedQueue > 75 ? 'severe' : estimatedQueue > 50 ? 'heavy' : estimatedQueue > 25 ? 'moderate' : 'low',
      isAdaptive: isAdaptive !== undefined ? Boolean(isAdaptive) : junction.isAdaptive,
    });

    dataStore.addAlert({
      id: `alt-junc-${Date.now()}`,
      type: 'info',
      title: `Signal Timing Modified: ${junction.name}`,
      message: `New cycle: ${totalCycle}s (Green: ${green}s, Yellow: ${yellow}s, Red: ${red}s). Expected waiting time: ${estimatedWait}s.`,
      location: junction.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    });

    return res.json({
      message: 'Signal timings updated successfully',
      junction: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update signal timings' });
  }
};

export const autoOptimizeJunction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isConnectedToMongo) {
      const junction = await JunctionModel.findOne({
        $or: [{ code: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });

      if (!junction) return res.status(404).json({ error: 'Junction not found' });

      const lostTimeL = 12;
      const flowRatioY = Math.min(0.85, junction.vehicleCount / 3200);
      const optimalCycle = Math.min(140, Math.max(70, Math.round((1.5 * lostTimeL + 5) / (1 - flowRatioY))));
      const optimalGreen = Math.round(optimalCycle * 0.55);
      const yellow = 5;
      const optimalRed = optimalCycle - optimalGreen - yellow;

      const simulatedWait = Math.round(junction.averageWaitingTimeSec * 0.62);
      const simulatedQueue = Math.round(junction.queueLengthVeh * 0.58);

      junction.signalCycleSec = optimalCycle;
      junction.greenDurationSec = optimalGreen;
      junction.yellowDurationSec = yellow;
      junction.redDurationSec = optimalRed;
      junction.averageWaitingTimeSec = simulatedWait;
      junction.queueLengthVeh = simulatedQueue;
      junction.congestionLevel = simulatedQueue > 70 ? 'heavy' : simulatedQueue > 30 ? 'moderate' : 'low';
      junction.isAdaptive = true;

      await junction.save();

      return res.json({
        message: `Webster's Optimal Timing applied to ${junction.name}`,
        junction: junction.toJSON(),
        improvement: {
          waitingTimeReductionSec: junction.averageWaitingTimeSec - simulatedWait,
          queueReductionVeh: junction.queueLengthVeh - simulatedQueue,
          cycleOptimizedSec: optimalCycle,
        },
      });
    }

    const junction = dataStore.getJunctionById(id);
    if (!junction) return res.status(404).json({ error: 'Junction not found' });

    const lostTimeL = 12;
    const flowRatioY = Math.min(0.85, junction.vehicleCount / 3200);
    const optimalCycle = Math.min(140, Math.max(70, Math.round((1.5 * lostTimeL + 5) / (1 - flowRatioY))));
    const optimalGreen = Math.round(optimalCycle * 0.55);
    const yellow = 5;
    const optimalRed = optimalCycle - optimalGreen - yellow;

    const simulatedWait = Math.round(junction.averageWaitingTimeSec * 0.62);
    const simulatedQueue = Math.round(junction.queueLengthVeh * 0.58);

    const updated = dataStore.updateJunction(id, {
      signalCycleSec: optimalCycle,
      greenDurationSec: optimalGreen,
      yellowDurationSec: yellow,
      redDurationSec: optimalRed,
      averageWaitingTimeSec: simulatedWait,
      queueLengthVeh: simulatedQueue,
      congestionLevel: simulatedQueue > 70 ? 'heavy' : simulatedQueue > 30 ? 'moderate' : 'low',
      isAdaptive: true,
    });

    return res.json({
      message: `Webster's Optimal Timing applied to ${junction.name}`,
      junction: updated,
      improvement: {
        waitingTimeReductionSec: junction.averageWaitingTimeSec - simulatedWait,
        queueReductionVeh: junction.queueLengthVeh - simulatedQueue,
        cycleOptimizedSec: optimalCycle,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Auto optimization failed' });
  }
};
