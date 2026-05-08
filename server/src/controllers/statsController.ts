import { Request, Response } from 'express';
import { Customer } from '../models/Customer';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { Opportunity } from '../models/Opportunity';
import { Proposal } from '../models/Proposal';

interface AuthRequest extends Request {
  userId?: string;
}

export const getStats = async (req: AuthRequest, res: Response) => {
  const [
    totalCustomers,
    activeCustomers,
    totalTasks,
    pendingTasks,
    completedTasks,
    totalUsers,
    totalOpportunities,
    wonOpportunities,
    totalProposals,
    acceptedProposals,
  ] = await Promise.all([
    Customer.countDocuments(),
    Customer.countDocuments({ status: 'customer' }),
    Task.countDocuments({ assignedTo: req.userId }),
    Task.countDocuments({ assignedTo: req.userId, status: { $in: ['pending', 'in-progress'] } }),
    Task.countDocuments({ assignedTo: req.userId, status: 'completed' }),
    User.countDocuments({ isActive: true }),
    Opportunity.countDocuments(),
    Opportunity.countDocuments({ stage: 'closed-won' }),
    Proposal.countDocuments(),
    Proposal.countDocuments({ status: 'accepted' }),
  ]);

  const [pipelineAgg, wonAgg, proposalAgg] = await Promise.all([
    Opportunity.aggregate([
      { $match: { stage: { $nin: ['closed-lost'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Opportunity.aggregate([
      { $match: { stage: 'closed-won' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Proposal.aggregate([
      { $match: { status: 'accepted' } },
      {
        $project: {
          total: {
            $multiply: [
              { $sum: { $map: { input: '$items', as: 'i', in: { $multiply: ['$$i.quantity', '$$i.unitPrice'] } } } },
              { $add: [1, { $divide: ['$taxRate', 100] }] },
            ],
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ]);

  const recentTasks = await Task.find({ assignedTo: req.userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title status priority dueDate');

  const recentCustomers = await Customer.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('firstName lastName company status');

  res.json({
    success: true,
    data: {
      customers: { total: totalCustomers, active: activeCustomers },
      tasks: { total: totalTasks, pending: pendingTasks, completed: completedTasks },
      users: { total: totalUsers },
      opportunities: {
        total: totalOpportunities,
        won: wonOpportunities,
        pipelineValue: pipelineAgg[0]?.total ?? 0,
        wonValue: wonAgg[0]?.total ?? 0,
      },
      proposals: {
        total: totalProposals,
        accepted: acceptedProposals,
        acceptedValue: proposalAgg[0]?.total ?? 0,
      },
      recentTasks,
      recentCustomers,
    },
  });
};
