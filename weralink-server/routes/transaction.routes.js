import express from 'express';
import { TransactionController } from '../controllers/transaction.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/assignment/:assignmentId', requireAuth, TransactionController.getTransactionByAssignmentId);

export default router;
