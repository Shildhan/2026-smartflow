import mongoose, { Schema, Document } from 'mongoose';
import { ISimulationMetrics } from '../types';

export interface ISimulationResultDocument extends Document {
  _id: mongoose.Types.ObjectId;
  simulationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  beforeMetrics: ISimulationMetrics;
  afterMetrics: ISimulationMetrics;
  improvements: {
    speedImprovementPct: number;
    delayReductionPct: number;
    congestionReductionPct: number;
    travelTimeReductionPct: number;
    utilizationBalanceImprovementPct: number;
    efficiencyImprovementPct: number;
    co2ReductionPct: number;
  };
  timelineSteps: any[];
  affectedRoads: {
    roadId: string;
    roadName: string;
    beforeUtilization: number;
    afterUtilization: number;
    beforeSpeed: number;
    afterSpeed: number;
    statusChange: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MetricsSubSchema = new Schema(
  {
    averageSpeedKmh: { type: Number, required: true },
    averageTravelTimeMin: { type: Number, required: true },
    congestedRoadsCount: { type: Number, required: true },
    averageTrafficDelayMin: { type: Number, required: true },
    roadUtilizationPct: { type: Number, required: true },
    trafficDensityVehPerKm: { type: Number, default: 0 },
    totalThroughputVeh: { type: Number, default: 0 },
    flowEfficiencyPct: { type: Number, default: 0 },
    co2EmissionTons: { type: Number, default: 0 },
    unevenDistributionIndex: { type: Number, default: 0 },
  },
  { _id: false }
);

const ImprovementsSubSchema = new Schema(
  {
    speedImprovementPct: { type: Number, default: 0 },
    delayReductionPct: { type: Number, default: 0 },
    congestionReductionPct: { type: Number, default: 0 },
    travelTimeReductionPct: { type: Number, default: 0 },
    utilizationBalanceImprovementPct: { type: Number, default: 0 },
    efficiencyImprovementPct: { type: Number, default: 0 },
    co2ReductionPct: { type: Number, default: 0 },
  },
  { _id: false }
);

const SimulationResultSchema = new Schema<ISimulationResultDocument>(
  {
    simulationId: {
      type: Schema.Types.ObjectId,
      ref: 'Simulation',
      required: [true, 'Simulation ID is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    beforeMetrics: {
      type: MetricsSubSchema,
      required: true,
    },
    afterMetrics: {
      type: MetricsSubSchema,
      required: true,
    },
    improvements: {
      type: ImprovementsSubSchema,
      required: true,
    },
    timelineSteps: [Schema.Types.Mixed],
    affectedRoads: [
      {
        roadId: { type: String, required: true },
        roadName: { type: String, required: true },
        beforeUtilization: { type: Number, required: true },
        afterUtilization: { type: Number, required: true },
        beforeSpeed: { type: Number, required: true },
        afterSpeed: { type: Number, required: true },
        statusChange: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : '';
        ret.simulationId = ret.simulationId ? ret.simulationId.toString() : '';
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const SimulationResultModel =
  mongoose.models.SimulationResult ||
  mongoose.model<ISimulationResultDocument>('SimulationResult', SimulationResultSchema);
