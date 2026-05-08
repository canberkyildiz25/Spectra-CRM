import mongoose, { Document, Schema } from 'mongoose';

export interface IProposalItem {
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface IProposal {
  _id?: string;
  proposalNumber: string;
  customerId: string;
  opportunityId?: string;
  title: string;
  validUntil: Date;
  items: IProposalItem[];
  taxRate: number;
  notes?: string;
  paymentTerms?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

interface IProposalDocument extends IProposal, Document {}

const proposalSchema = new Schema<IProposalDocument>(
  {
    proposalNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity' },
    title: { type: String, required: true, trim: true },
    validUntil: { type: Date, required: true },
    items: [
      {
        name: { type: String, required: true },
        description: { type: String },
        quantity: { type: Number, required: true, min: 0 },
        unit: { type: String, default: 'Adet' },
        unitPrice: { type: Number, required: true, min: 0 },
      },
    ],
    taxRate: { type: Number, default: 20, min: 0, max: 100 },
    notes: { type: String },
    paymentTerms: { type: String },
    status: { type: String, enum: ['draft', 'sent', 'accepted', 'rejected'], default: 'draft' },
  },
  { timestamps: true }
);

export const Proposal = mongoose.model<IProposalDocument>('Proposal', proposalSchema);
