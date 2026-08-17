import mongoose, { Schema, Document } from 'mongoose';
import { IAIRecommendation } from '../types';

export interface IRecommendationDocument extends Document, Omit<IAIRecommendation, 'id'> {
  _id: mongoose.Types.ObjectId;
  appliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendationDocument>(
  {
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      required: true,
      default: 'medium',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    targetType: {
      type: String,
      enum: ['road', 'junction', 'corridor', 'zone'],
      required: true,
    },
    targetId: {
      type: String,
      required: true,
    },
    targetName: {
      type: String,
      required: true,
    },
    recommendedStrategy: {
      type: String,
      required: true,
    },
    projectedImprovement: {
      type: String,
      required: true,
    },
    confidencePct: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    applied: {
      type: Boolean,
      default: false,
      index: true,
    },
    appliedAt: {
      type: Date,
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

export const RecommendationModel =
  mongoose.models.Recommendation ||
  mongoose.model<IRecommendationDocument>('Recommendation', RecommendationSchema);
