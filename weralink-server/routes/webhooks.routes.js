import express from 'express';
import { MpesaWebhookController } from '../controllers/mpesa.webhook.controller.js';

const router = express.Router();

// Daraja STK Push Callback (C2B)
router.post('/mpesa/stkpush', MpesaWebhookController.handleSTKPushCallback);

// Daraja B2C Callback (Payout to Worker)
router.post('/mpesa/b2c', MpesaWebhookController.handleB2CCallback);

export default router;
