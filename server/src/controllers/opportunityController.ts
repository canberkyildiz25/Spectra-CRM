import { Request, Response } from 'express';
import { Opportunity } from '../models/Opportunity';

export const getOpportunities = async (req: Request, res: Response) => {
  const { stage } = req.query;
  const filter: any = {};
  if (stage) filter.stage = stage;

  const opportunities = await Opportunity.find(filter)
    .populate('customerId', 'firstName lastName company')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: opportunities });
};

export const createOpportunity = async (req: Request, res: Response) => {
  const opportunity = new Opportunity(req.body);
  await opportunity.save();
  await opportunity.populate('customerId', 'firstName lastName company');
  res.status(201).json({ success: true, data: opportunity });
};

export const updateOpportunity = async (req: Request, res: Response) => {
  const opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('customerId', 'firstName lastName company');

  if (!opportunity) return res.status(404).json({ success: false, error: 'Fırsat bulunamadı' });
  res.json({ success: true, data: opportunity });
};

export const deleteOpportunity = async (req: Request, res: Response) => {
  const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
  if (!opportunity) return res.status(404).json({ success: false, error: 'Fırsat bulunamadı' });
  res.json({ success: true, message: 'Fırsat silindi' });
};
