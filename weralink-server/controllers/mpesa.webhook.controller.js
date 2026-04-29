import prisma from '../config/prisma.js';
import { errorResponse } from '../utils/error.utils.js';

/**
 * MpesaWebhookController
 * Listens for callbacks from Daraja API and updates Assignment/Transaction states.
 */
export class MpesaWebhookController {

  /**
   * POST /api/webhooks/mpesa/stkpush
   */
  static async handleSTKPushCallback(req, res) {
    try {
      const { Body } = req.body;
      const stkCallback = Body.stkCallback;

      const checkoutRequestId = stkCallback.CheckoutRequestID;
      const resultCode = stkCallback.ResultCode;

      const transaction = await prisma.transaction.findUnique({
        where: { checkoutRequestId }
      });

      if (!transaction) {
        console.error(`[Webhook] Transaction not found for CheckoutRequestID: ${checkoutRequestId}`);
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (resultCode === 0) {
        const items = stkCallback.CallbackMetadata.Item;
        const receiptNumber = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value;

        await prisma.$transaction(async (tx) => {
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: 'SUCCESS',
              receiptNumber,
              completedAt: new Date(),
              metadata: stkCallback
            }
          });

          const { AssignmentService } = await import('../services/assignment.service.js');
          await AssignmentService.acceptAssignment(transaction.assignmentId, receiptNumber);
        });
        console.log(`[Webhook] STK Push Success: Transaction ${transaction.id} completed.`);
      } else {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'FAILED',
            metadata: stkCallback
          }
        });
        console.warn(`[Webhook] STK Push Failed: Transaction ${transaction.id} with ResultCode ${resultCode}.`);
      }
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (error) {
      console.error('STK Push Callback Error:', error);
      return res.status(500).json({ ResultCode: 1, ResultDesc: "Internal Server Error" });
    }
  }

  /**
   * POST /api/webhooks/mpesa/b2c/v3/paymentrequest 
   */
  static async handleB2CCallback(req, res) {
    try {
      const { Result } = req.body;
      const conversationId = Result.ConversationID;
      const resultCode = Result.ResultCode;

      const transaction = await prisma.transaction.findFirst({
        where: { checkoutRequestId: conversationId }
      });

      if (!transaction) {
        console.error(`[Webhook] Transaction not found for ConversationID: ${conversationId}`);
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (resultCode === 0) {
        const resultParams = Result.ResultParameters?.ResultParameter || [];
        const receipt = resultParams.find(p => p.Key === 'B2CReceiptNumber')?.Value;

        await prisma.$transaction(async (tx) => {
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: 'SUCCESS',
              receiptNumber: receipt,
              completedAt: new Date(),
              metadata: Result
            }
          });

          await tx.assignment.update({
            where: { id: transaction.assignmentId },
            data: { status: 'PAID', paidAt: new Date() }
          });
        });
        console.log(`[Webhook] B2C Success: Transaction ${transaction.id} completed.`);
      } else {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'FAILED', metadata: Result }
        });
        console.warn(`[Webhook] B2C Failed: Transaction ${transaction.id} with ResultCode ${resultCode}.`);
      }

      return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (error) {
      console.error('B2C Callback Error:', error);
      return res.status(500).json({ ResultCode: 1, ResultDesc: "Internal Server Error" });
    }
  }
}
