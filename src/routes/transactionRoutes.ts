import { Router } from 'express';
import { deposit, withdraw } from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/customers/:id/deposit', deposit);
router.post('/customers/:id/withdraw', withdraw);

export default router;
