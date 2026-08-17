import mongoose, { Schema, Document } from 'mongoose';
import { IAlert } from '../types';

export interface IAlertDocument extends Document, Omit<IAlert, 'id'> {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlertDocument>(
  {
    type: {
      type: String,
      enum: ['critical', 'warning', 'info', 'success'],
      default: 'warning',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    actionRequired: {
      type: String,
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

export const AlertModel =
  mongoose.models.Alert || mongoose.model<IAlertDocument>('Alert', AlertSchema);
