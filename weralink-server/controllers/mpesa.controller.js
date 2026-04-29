import { MpesaService } from '../services/mpesa.service.js';
import { AssignmentService } from '../services/assignment.service.js';
import { successResponse, errorResponse } from '../utils/error.utils.js';
import prisma from '../config/prisma.js';

export class MpesaController {
  /**
   * POST /api/mpesa/stk-push
   * Initiates the payment process for hiring a worker.
   */
  static async triggerSTKPush(req, res) {
    try {
      const { assignmentId, phoneNumber } = req.body;
      
      if (!assignmentId || !phoneNumber) {
        return errorResponse(res, { message: 'Assignment ID and Phone Number are required', code: 'BAD_REQUEST' }, 400);
      }

      // Fetch assignment and gig to get the amount
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { gig: true }
      });

      if (!assignment) {
        return errorResponse(res, { message: 'Assignment not found', code: 'NOT_FOUND' }, 404);
      }

      const amount = assignment.gig.payAmount;

      const result = await MpesaService.triggerSTKPush(assignmentId, phoneNumber, amount);
      return successResponse(res, result, 'STK Push initiated successfully');
    } catch (error) {
      return errorResponse(res, error, 500);
    }
  }

  /**
   * GET /api/mpesa/status/:checkoutRequestId
   * Checks the status of a transaction with dual-layer verification (Local DB + Safaricom Query)
   */
  static async getTransactionStatus(req, res) {
    try {
      const { checkoutRequestId } = req.params;
      
      let transaction = await prisma.transaction.findUnique({
        where: { checkoutRequestId }
      });

      if (!transaction) {
        return errorResponse(res, { message: 'Transaction record not found', code: 'NOT_FOUND' }, 404);
      }

      // Layer 1: If local DB already has a terminal status, return it immediately
      if (transaction.status !== 'PENDING') {
        return successResponse(res, {
          status: transaction.status,
          receiptNumber: transaction.receiptNumber,
          completedAt: transaction.completedAt
        });
      }

      // Layer 2: If still PENDING locally, check if we should query Safaricom
      // Threshold: 15 seconds since initiation
      const elapsedSeconds = (Date.now() - new Date(transaction.initiatedAt).getTime()) / 1000;
      
      if (elapsedSeconds > 15) {
        console.log(`[STK Query] Still pending after ${Math.floor(elapsedSeconds)}s. Querying Safaricom for ${checkoutRequestId}...`);
        
        try {
          const safaricomStatus = await MpesaService.querySTKPushStatus(checkoutRequestId);
         
          if (safaricomStatus.ResultCode === "0") {
            console.log(`[STK Query] Safaricom confirms SUCCESS for ${checkoutRequestId}. Syncing state...`);
            
            await prisma.$transaction(async (tx) => {
              transaction = await tx.transaction.update({
                where: { id: transaction.id },
                data: {
                  status: 'SUCCESS',
                  completedAt: new Date(),
                  metadata: { ...transaction.metadata, safaricomSync: safaricomStatus }
                }
              });

              // Trigger the business logic for accepting the assignment (same as webhook)
              await AssignmentService.acceptAssignment(transaction.assignmentId);
            });

            return successResponse(res, {
              status: 'SUCCESS',
              syncSource: 'SAFARICOM_QUERY'
            });
          } else if (safaricomStatus.ResultCode && safaricomStatus.ResultCode !== "0") {
            // Safaricom confirms failure
             await prisma.transaction.update({
              where: { id: transaction.id },
              data: { status: 'FAILED', metadata: { ...transaction.metadata, safaricomSync: safaricomStatus } }
            });
            return successResponse(res, { status: 'FAILED' });
          }
        } catch (queryError) {
          console.error('[STK Query Fallback Error]:', queryError.message);
          // Don't fail the request, just return the current pending status from DB
        }
      }

      // Default: Return the current status from our DB
      return successResponse(res, {
        status: transaction.status,
        elapsedSeconds: Math.floor(elapsedSeconds)
      });
    } catch (error) {
      return errorResponse(res, error, 500);
    }
  }
}
