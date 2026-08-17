import mongoose, { Schema, Document } from 'mongoose';

export interface ISimulationDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  simulationDate: string;
  startTime: Date;
  endTime?: Date;
  peakHour: 'morning' | 'evening';
  trafficVolume: 'low' | 'medium' | 'high' | 'custom';
  volumeMultiplier: number;
  durationMin: number;
  weather: 'normal' | 'rain' | 'fog' | 'severe_rain';
  strategies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const SimulationSchema = new Schema<ISimulationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Simulation name is required'],
      trim: true,
      default: 'SmartFlow Scenario Simulation',
    },
    simulationDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
      index: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    peakHour: {
      type: String,
      enum: ['morning', 'evening'],
      required: true,
      default: 'morning',
    },
    trafficVolume: {
      type: String,
      enum: ['low', 'medium', 'high', 'custom'],
      required: true,
      default: 'medium',
    },
    volumeMultiplier: {
      type: Number,
      required: true,
      min: 0.1,
      max: 5.0,
      default: 1.0,
    },
    durationMin: {
      type: Number,
      enum: [15, 30, 60, 120, 180],
      required: true,
      default: 60,
    },
    weather: {
      type: String,
      enum: ['normal', 'rain', 'fog', 'severe_rain'],
      required: true,
      default: 'normal',
    },
    strategies: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'At least one optimization strategy must be selected',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : '';
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const SimulationModel =
  mongoose.models.Simulation || mongoose.model<ISimulationDocument>('Simulation', SimulationSchema);
