"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController");
const router = (0, express_1.Router)();
// Report endpoint with optional date filters
router.get('/report', reportController_1.getReport);
// Get balance of a single customer by ID
router.get('/customers/:customerId/balance', reportController_1.getCustomerBalance);
// Get transactions of a single customer by ID
router.get('/customers/:customerId/transactions', reportController_1.getCustomerTransactions);
// Get all transactions (optionally could support query params for filtering)
router.get('/transactions', reportController_1.getAllTransactions);
exports.default = router;
