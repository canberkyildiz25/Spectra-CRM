import { Router } from 'express';
import { getProposals, getProposalById, createProposal, updateProposal, deleteProposal } from '../controllers/proposalController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getProposals);
router.get('/:id', getProposalById);
router.post('/', createProposal);
router.put('/:id', updateProposal);
router.delete('/:id', deleteProposal);

export default router;
