import { MpesaService } from '../services/mpesa.service.js';
import { AssignmentService } from '../services/assignment.service.js';
import { AnalyticsService } from '../services/analytics.service.js';
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

      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { gig: true }
      });

      if (!assignment) {
        return errorResponse(res, { message: 'Assignment not found', code: 'NOT_FOUND' }, 404);
      }

      if (assignment.gig.status !== 'OPEN') {
        return errorResponse(res, { message: 'This gig has already been assigned to someone else', code: 'GIG_UNAVAILABLE' }, 400);
      }

      const amount = Number(assignment.gig.payAmount);

      // --- ESCROW CREDIT LOGIC ---
      // Check if the gig already has successful deposits (e.g. from a previously cancelled assignment in a dispute)
      const gigBalance = await AnalyticsService.getGigEscrowBalance(assignment.gigId);
      
      if (gigBalance >= amount) {
        console.log(`[Escrow] Gig ${assignment.gigId} already funded (Balance: ${gigBalance}). Bypassing STK push.`);
        
        await prisma.$transaction(async (tx) => {
          // 1. Record transaction intent (Upsert to handle existing failed/pending records)
          await tx.transaction.upsert({
            where: {
              assignmentId_type: { assignmentId, type: 'DEPOSIT_TO_ESCROW' }
            },
            update: {
              amount,
              status: 'SUCCESS',
              mpesaRef: `ESCROW_CREDIT_${assignmentId.slice(0, 8)}`,
              metadata: { source: 'PREV_ESCROW_BALANCE', balanceUsed: amount, updatedAt: new Date() }
            },
            create: {
              assignmentId,
              amount,
              type: 'DEPOSIT_TO_ESCROW',
              status: 'SUCCESS',
              mpesaRef: `ESCROW_CREDIT_${assignmentId.slice(0, 8)}`,
              metadata: { source: 'PREV_ESCROW_BALANCE', balanceUsed: amount }
            }
          });
          
          // 2. Accept assignment immediately (this transitions gig to ASSIGNED)
          await AssignmentService.acceptAssignment(assignmentId);
        });

        return successResponse(res, { 
          status: 'SUCCESS', 
          method: 'ESCROW_CREDIT',
          message: 'Gig was already funded. Assignment accepted immediately using platform credit.' 
        }, 'Assignment activated via Escrow Credit');
      }
      // --- END ESCROW CREDIT LOGIC ---

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
      // ONLY for STK Push (DEPOSIT_TO_ESCROW). B2C has a different query API or should rely on webhooks.
      const elapsedSeconds = (Date.now() - new Date(transaction.initiatedAt).getTime()) / 1000;
      
      if (transaction.type === 'DEPOSIT_TO_ESCROW' && elapsedSeconds > 15) {
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
