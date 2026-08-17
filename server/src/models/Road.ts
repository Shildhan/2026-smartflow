import mongoose, { Schema, Document } from 'mongoose';
import { IRoad } from '../types';

export interface IRoadDocument extends Document, Omit<IRoad, 'id'> {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RoadSchema = new Schema<IRoadDocument>(
  {
    code: {
      type: String,
      required: [true, 'Road code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Road name is required'],
      trim: true,
    },
    zone: {
      type: String,
      required: [true, 'Zone identifier is required'],
      trim: true,
      index: true,
    },
    zoneName: {
      type: String,
      required: [true, 'Zone descriptive name is required'],
      trim: true,
    },
    startJunctionId: {
      type: String,
      required: [true, 'Start junction ID is required'],
    },
    endJunctionId: {
      type: String,
      required: [true, 'End junction ID is required'],
    },
    coordinates: {
      type: [[Number]],
      required: [true, 'Road geographic polyline coordinates are required'],
      validate: {
        validator: (v: number[][]) => Array.isArray(v) && v.length >= 2,
        message: 'Road must have at least 2 coordinate pairs',
      },
    },
    lengthKm: {
      type: Number,
      required: [true, 'Length in km is required'],
      min: [0.05, 'Road length must be at least 0.05 km'],
    },
    lanes: {
      type: Number,
      required: [true, 'Number of lanes is required'],
      min: [1, 'Must have at least 1 lane'],
      max: [8, 'Lanes cannot exceed 8'],
      default: 4,
    },
    speedLimitKmh: {
      type: Number,
      required: [true, 'Speed limit is required'],
      min: [10, 'Speed limit must be at least 10 km/h'],
      max: [120, 'Speed limit cannot exceed 120 km/h'],
      default: 50,
    },
    capacityVehPerHour: {
      type: Number,
      required: [true, 'Capacity veh/hour is required'],
      min: [100, 'Capacity must be at least 100 veh/hour'],
    },
    currentTrafficVeh: {
      type: Number,
      required: [true, 'Current traffic volume is required'],
      min: [0, 'Current traffic cannot be negative'],
      default: 0,
    },
    averageSpeedKmh: {
      type: Number,
      required: [true, 'Average speed is required'],
      min: [1, 'Average speed must be at least 1 km/h'],
    },
    utilizationPct: {
      type: Number,
      required: [true, 'Utilization percentage is required'],
      min: [0, 'Utilization cannot be less than 0%'],
      max: [100, 'Utilization cannot exceed 100%'],
      default: 0,
    },
    congestionLevel: {
      type: String,
      enum: {
        values: ['low', 'moderate', 'heavy', 'severe'],
        message: '{VALUE} is not a valid congestion level',
      },
      required: true,
      default: 'low',
    },
    estimatedTravelTimeMin: {
      type: Number,
      required: true,
      min: [0.1, 'Travel time must be positive'],
    },
    estimatedDelayMin: {
      type: Number,
      required: true,
      min: [0, 'Delay cannot be negative'],
      default: 0,
    },
    isAlternativeRoute: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: 'normal',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret.code;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const RoadModel = mongoose.models.Road || mongoose.model<IRoadDocument>('Road', RoadSchema);
