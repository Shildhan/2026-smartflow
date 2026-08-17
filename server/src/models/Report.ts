import mongoose, { Schema, Document } from 'mongoose';

export interface IReportDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  simulationId?: mongoose.Types.ObjectId;
  reportId: string;
  reportTitle: string;
  generatedDate: Date;
  peakPeriod: string;
  reportData: any;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReportDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    simulationId: {
      type: Schema.Types.ObjectId,
      ref: 'Simulation',
    },
    reportId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reportTitle: {
      type: String,
      required: true,
      trim: true,
    },
    generatedDate: {
      type: Date,
      default: Date.now,
    },
    peakPeriod: {
      type: String,
      required: true,
    },
    reportData: {
      type: Schema.Types.Mixed,
      required: true,
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

export const ReportModel =
  mongoose.models.Report || mongoose.model<IReportDocument>('Report', ReportSchema);
