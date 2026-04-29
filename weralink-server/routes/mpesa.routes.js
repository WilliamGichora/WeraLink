import express from 'express';
import { MpesaController } from '../controllers/mpesa.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/stk-push', requireAuth, MpesaController.triggerSTKPush);
router.get('/status/:checkoutRequestId', requireAuth, MpesaController.getTransactionStatus);

export default router;
