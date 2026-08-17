import mongoose, { Schema, Document } from 'mongoose';
import { IPasswordResetToken } from '../types';

export interface IPasswordResetTokenDocument extends Document, Omit<IPasswordResetToken, 'id'> {}

const PasswordResetTokenSchema = new Schema(
  {
    userId: { type: String, required: true },
    userEmail: { type: String, required: true, lowercase: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const PasswordResetTokenModel =
  mongoose.models.PasswordResetToken ||
  mongoose.model<IPasswordResetTokenDocument>('PasswordResetToken', PasswordResetTokenSchema);
