import { Request, Response } from 'express';
import { AlertModel } from '../models/Alert';
import { isConnectedToMongo } from '../config/db';
import { dataStore } from '../models/DataStore';
import { IAlert } from '../types';

export const getAlerts = async (_req: Request, res: Response) => {
  try {
    if (isConnectedToMongo) {
      const alerts = await AlertModel.find().sort({ createdAt: -1 });
      const unreadCount = await AlertModel.countDocuments({ isRead: false });
      return res.json({ alerts: alerts.map((a) => a.toJSON()), total: alerts.length, unreadCount });
    }

    const alerts = dataStore.getAlerts();
    return res.json({ alerts, total: alerts.length, unreadCount: alerts.filter((a) => !a.isRead).length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch alerts' });
  }
};

export const markAlertAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isConnectedToMongo) {
      const alert = await AlertModel.findOneAndUpdate(
        { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { title: id }] },
        { $set: { isRead: true } },
        { new: true }
      );
      if (!alert) return res.status(404).json({ error: 'Alert not found' });
      return res.json({ message: 'Alert marked as read', success: true, alert: alert.toJSON() });
    }

    const ok = dataStore.markAlertRead(id);
    if (!ok) return res.status(404).json({ error: 'Alert not found' });
    return res.json({ message: 'Alert marked as read', success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to mark alert as read' });
  }
};

export const createAlert = async (req: Request, res: Response) => {
  try {
    const { type = 'warning', title, message, location, actionRequired } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    if (isConnectedToMongo) {
      const newAlert = await AlertModel.create({
        type,
        title,
        message,
        location: location || 'Nagpur Central Conurbation',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        actionRequired,
      });
      return res.status(201).json({ alert: newAlert.toJSON(), message: 'Alert created successfully' });
    }

    const newAlertData: IAlert = {
      id: `alt-${Date.now()}`,
      type,
      title,
      message,
      location: location || 'Nagpur Central Conurbation',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      actionRequired,
    };

    dataStore.addAlert(newAlertData);
    return res.status(201).json({ alert: newAlertData, message: 'Alert created successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create alert' });
  }
};
