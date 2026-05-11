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
   * POST /api/webhooks/mpesa/b2c
   */
  static async handleB2CCallback(req, res) {
    try {
      console.log('--- B2C Webhook Received ---');
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      console.log('Body:', JSON.stringify(req.body, null, 2));

      const { Result } = req.body;
      if (!Result) {
        console.error('[Webhook] Missing Result object in B2C callback body');
        return res.status(400).json({ error: 'Invalid callback payload' });
      }

      const conversationId = Result.ConversationID;
      const resultCode = Result.ResultCode;
      const resultDesc = Result.ResultDesc;

      console.log(`[Webhook] Processing B2C Callback for ConversationID: ${conversationId}, ResultCode: ${resultCode} (${resultDesc})`);

      const transaction = await prisma.transaction.findFirst({
        where: { checkoutRequestId: conversationId }
      });

      if (!transaction) {
        console.error(`[Webhook] Transaction not found in database for ConversationID: ${conversationId}`);
        // Log all pending B2C transactions to help debug
        const pendingTransactions = await prisma.transaction.findMany({
          where: { type: 'PAYOUT_TO_WORKER', status: 'PENDING' },
          select: { checkoutRequestId: true, id: true }
        });
        console.log('[Webhook] Current Pending B2C Transactions:', JSON.stringify(pendingTransactions));
        
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (resultCode === 0) {
        const resultParams = Result.ResultParameters?.ResultParameter || [];
        // Try multiple possible keys for the receipt number
        const receipt = resultParams.find(p => p.Key === 'B2CReceiptNumber' || p.Key === 'TransactionReceipt' || p.Key === 'TransactionID')?.Value;

        console.log(`[Webhook] B2C Success for Transaction ${transaction.id}. Receipt: ${receipt}`);

        await prisma.$transaction(async (tx) => {
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: 'SUCCESS',
              receiptNumber: receipt || Result.TransactionID,
              completedAt: new Date(),
              metadata: Result
            }
          });

          await tx.assignment.update({
            where: { id: transaction.assignmentId },
            data: { status: 'PAID', paidAt: new Date() }
          });

          // Fetch the assignment again with relations for notification
          const updatedAssignment = await tx.assignment.findUnique({
            where: { id: transaction.assignmentId },
            include: { gig: true }
          });

          await tx.notification.create({
            data: {
              userId: updatedAssignment.workerId,
              title: 'Payment Successful!',
              message: `Your payment for "${updatedAssignment.gig.title}" has been processed successfully. M-Pesa Receipt: ${receipt || Result.TransactionID}`,
              type: 'PAID',
              linkUrl: `/worker/history`
            }
          });
        });
        console.log(`[Webhook] B2C Success: Transaction ${transaction.id} and Assignment ${transaction.assignmentId} updated to PAID.`);
      } else {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { 
            status: 'FAILED', 
            metadata: Result 
          }
        });
        console.warn(`[Webhook] B2C Failed: Transaction ${transaction.id} with ResultCode ${resultCode}. Reason: ${resultDesc}`);
      }

      return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (error) {
      console.error('B2C Callback Error:', error);
      return res.status(500).json({ ResultCode: 1, ResultDesc: "Internal Server Error" });
    }
  }
}
