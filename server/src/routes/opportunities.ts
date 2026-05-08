import { Router } from 'express';
import { getOpportunities, createOpportunity, updateOpportunity, deleteOpportunity } from '../controllers/opportunityController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getOpportunities);
router.post('/', createOpportunity);
router.put('/:id', updateOpportunity);
router.delete('/:id', deleteOpportunity);

export default router;
