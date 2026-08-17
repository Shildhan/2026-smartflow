import mongoose from 'mongoose';
import { autoSeedDatabase } from '../services/seedService';

export let isConnectedToMongo = false;

export const connectDB = async (): Promise<boolean> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartflow';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnectedToMongo = true;
    console.log(`[SmartFlow] MongoDB Connected: ${conn.connection.host}`);
    await autoSeedDatabase();
    return true;
  } catch (error) {
    console.warn('[SmartFlow] MongoDB connection error:', error);
    isConnectedToMongo = false;
    return false;
  }
};

