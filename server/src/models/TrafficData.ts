import mongoose, { Schema, Document } from 'mongoose';
import { ITrafficDataPoint, PeakHourType } from '../types';

export interface ITrafficDataDocument extends Document {
  _id: mongoose.Types.ObjectId;
  roadId: string;
  peakHour: PeakHourType;
  timestamp: string;
  totalVehicles: number;
  averageSpeedKmh: number;
  congestedRoadsCount: number;
  averageDelayMin: number;
  trafficDensityVehPerKm: number;
  roadUtilizationPct: number;
  flowEfficiencyPct: number;
  recordedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TrafficDataSchema = new Schema<ITrafficDataDocument>(
  {
    roadId: {
      type: String,
      default: 'all',
      index: true,
    },
    peakHour: {
      type: String,
      enum: ['morning', 'evening'],
      required: true,
      index: true,
    },
    timestamp: {
      type: String,
      required: true,
    },
    totalVehicles: {
      type: Number,
      required: true,
      min: 0,
    },
    averageSpeedKmh: {
      type: Number,
      required: true,
      min: 0,
    },
    congestedRoadsCount: {
      type: Number,
      required: true,
      min: 0,
    },
    averageDelayMin: {
      type: Number,
      required: true,
      min: 0,
    },
    trafficDensityVehPerKm: {
      type: Number,
      default: 0,
    },
    roadUtilizationPct: {
      type: Number,
      default: 0,
    },
    flowEfficiencyPct: {
      type: Number,
      default: 0,
    },
    recordedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const TrafficDataModel =
  mongoose.models.TrafficData || mongoose.model<ITrafficDataDocument>('TrafficData', TrafficDataSchema);
