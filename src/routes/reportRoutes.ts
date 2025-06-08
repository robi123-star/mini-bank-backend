import { Router } from 'express';
import {
  getReport,
  getCustomerBalance,
  getCustomerTransactions,
  getAllTransactions,
} from '../controllers/reportController';

const router = Router();

// Report endpoint with optional date filters
router.get('/report', getReport);

// Get balance of a single customer by ID
router.get('/customers/:customerId/balance', getCustomerBalance);

// Get transactions of a single customer by ID
router.get('/customers/:customerId/transactions', getCustomerTransactions);

// Get all transactions (optionally could support query params for filtering)
router.get('/transactions', getAllTransactions);

export default router;
