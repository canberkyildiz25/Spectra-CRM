import mongoose, { Document, Schema } from 'mongoose';
import { IOpportunity } from '../../../shared/types';

interface IOpportunityDocument extends IOpportunity, Document {}

const opportunitySchema = new Schema<IOpportunityDocument>(
  {
    title: { type: String, required: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    amount: { type: Number, required: true, min: 0 },
    stage: {
      type: String,
      enum: ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
      default: 'lead',
    },
    probability: { type: Number, min: 0, max: 100, default: 10 },
    expectedCloseDate: { type: Date },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Opportunity = mongoose.model<IOpportunityDocument>('Opportunity', opportunitySchema);
