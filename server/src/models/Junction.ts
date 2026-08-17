import mongoose, { Schema, Document } from 'mongoose';
import { IJunction } from '../types';

export interface IJunctionDocument extends Document, Omit<IJunction, 'id'> {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JunctionSchema = new Schema<IJunctionDocument>(
  {
    code: {
      type: String,
      required: [true, 'Junction code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Junction name is required'],
      trim: true,
    },
    location: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: -180,
        max: 180,
      },
    },
    zone: {
      type: String,
      required: [true, 'Zone is required'],
      trim: true,
      index: true,
    },
    incomingRoadIds: {
      type: [String],
      default: [],
    },
    vehicleCount: {
      type: Number,
      required: true,
      min: [0, 'Vehicle count cannot be negative'],
      default: 0,
    },
    queueLengthVeh: {
      type: Number,
      required: true,
      min: [0, 'Queue length cannot be negative'],
      default: 0,
    },
    averageWaitingTimeSec: {
      type: Number,
      required: true,
      min: [0, 'Waiting time cannot be negative'],
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
    signalCycleSec: {
      type: Number,
      required: true,
      min: [30, 'Signal cycle must be at least 30 seconds'],
      max: [300, 'Signal cycle cannot exceed 300 seconds'],
      default: 90,
    },
    greenDurationSec: {
      type: Number,
      required: true,
      min: [10, 'Green phase must be at least 10 seconds'],
      max: [200, 'Green phase cannot exceed 200 seconds'],
      default: 45,
    },
    yellowDurationSec: {
      type: Number,
      required: true,
      min: [3, 'Yellow clearance must be at least 3 seconds'],
      max: [15, 'Yellow clearance cannot exceed 15 seconds'],
      default: 5,
    },
    redDurationSec: {
      type: Number,
      required: true,
      min: [10, 'Red phase must be at least 10 seconds'],
      max: [200, 'Red phase cannot exceed 200 seconds'],
      default: 40,
    },
    currentPhase: {
      type: String,
      enum: ['green', 'yellow', 'red'],
      default: 'green',
    },
    isAdaptive: {
      type: Boolean,
      default: false,
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

export const JunctionModel = mongoose.models.Junction || mongoose.model<IJunctionDocument>('Junction', JunctionSchema);
