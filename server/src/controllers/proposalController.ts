import { Request, Response } from 'express';
import { Proposal } from '../models/Proposal';

/* Continues from the highest number issued this year. Counting documents
   and adding one reissued an existing number as soon as a proposal had been
   deleted, and the unique index turned that into a 500 on create. */
const generateProposalNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `PRO-${year}-`;
  const last = await Proposal.findOne({ proposalNumber: { $regex: `^${prefix}` } })
    .sort({ proposalNumber: -1 })
    .select('proposalNumber')
    .lean();
  const next = last ? Number(last.proposalNumber.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
};

export const getProposals = async (req: Request, res: Response) => {
  const proposals = await Proposal.find()
    .populate('customerId', 'firstName lastName company email phone city')
    .populate('opportunityId', 'title')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: proposals });
};

export const getProposalById = async (req: Request, res: Response) => {
  const proposal = await Proposal.findById(req.params.id)
    .populate('customerId', 'firstName lastName company email phone city address')
    .populate('opportunityId', 'title');
  if (!proposal) return res.status(404).json({ success: false, error: 'Proposal not found' });
  res.json({ success: true, data: proposal });
};

export const createProposal = async (req: Request, res: Response) => {
  const proposalNumber = await generateProposalNumber();
  const proposal = new Proposal({ ...req.body, proposalNumber });
  await proposal.save();
  await proposal.populate('customerId', 'firstName lastName company email phone city');
  res.status(201).json({ success: true, data: proposal });
};

export const updateProposal = async (req: Request, res: Response) => {
  const proposal = await Proposal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('customerId', 'firstName lastName company email phone city')
    .populate('opportunityId', 'title');
  if (!proposal) return res.status(404).json({ success: false, error: 'Proposal not found' });
  res.json({ success: true, data: proposal });
};

export const deleteProposal = async (req: Request, res: Response) => {
  const proposal = await Proposal.findByIdAndDelete(req.params.id);
  if (!proposal) return res.status(404).json({ success: false, error: 'Proposal not found' });
  res.json({ success: true, message: 'Proposal deleted' });
};
