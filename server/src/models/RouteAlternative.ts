import mongoose, { Schema, Document } from 'mongoose';
import { IRouteAlternative } from '../types';

export interface IRouteAlternativeDocument extends Document, Omit<IRouteAlternative, 'id'> {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RouteSegmentSubSchema = new Schema(
  {
    name: { type: String, required: true },
    roadCodes: [{ type: String }],
    distanceKm: { type: Number, required: true },
    estimatedTravelTimeMin: { type: Number, required: true },
    congestionLevel: { type: String, required: true },
    vehicleCount: { type: Number, required: true },
    delayMin: { type: Number, required: true },
    timeSavedMin: { type: Number },
  },
  { _id: false }
);

const RouteAlternativeSchema = new Schema<IRouteAlternativeDocument>(
  {
    sourceName: {
      type: String,
      required: true,
      trim: true,
    },
    destinationName: {
      type: String,
      required: true,
      trim: true,
    },
    currentRoute: {
      type: RouteSegmentSubSchema,
      required: true,
    },
    recommendedRoute: {
      type: RouteSegmentSubSchema,
      required: true,
    },
    diversionPercentage: {
      type: Number,
      default: 30,
      min: 5,
      max: 80,
    },
    strategyApplied: {
      type: Boolean,
      default: false,
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

export const RouteAlternativeModel =
  mongoose.models.RouteAlternative ||
  mongoose.model<IRouteAlternativeDocument>('RouteAlternative', RouteAlternativeSchema);
