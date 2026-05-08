import { Request, Response } from 'express';
import { Proposal } from '../models/Proposal';

const generateProposalNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await Proposal.countDocuments();
  return `TKL-${year}-${String(count + 1).padStart(3, '0')}`;
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
  if (!proposal) return res.status(404).json({ success: false, error: 'Teklif bulunamadı' });
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
  if (!proposal) return res.status(404).json({ success: false, error: 'Teklif bulunamadı' });
  res.json({ success: true, data: proposal });
};

export const deleteProposal = async (req: Request, res: Response) => {
  const proposal = await Proposal.findByIdAndDelete(req.params.id);
  if (!proposal) return res.status(404).json({ success: false, error: 'Teklif bulunamadı' });
  res.json({ success: true, message: 'Teklif silindi' });
};
