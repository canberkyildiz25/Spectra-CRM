import { Router } from 'express';
import { getStats } from '../controllers/statsController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/', getStats);

export default router;
