import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/error.utils.js';

export class TransactionController {
  /**
   * GET /api/transactions/assignment/:assignmentId
   * Fetches the payout transaction for a specific assignment to display the receipt.
   */
  static async getTransactionByAssignmentId(req, res) {
    try {
      const { assignmentId } = req.params;
      
      const transaction = await prisma.transaction.findFirst({
        where: { 
          assignmentId,
          type: 'PAYOUT_TO_WORKER',
          status: 'SUCCESS'
        },
        include: {
          assignment: {
            include: {
              gig: {
                include: {
                  employer: true
                }
              },
              worker: true
            }
          }
        }
      });

      if (!transaction) {
        return errorResponse(res, { message: 'Successful payout transaction not found', code: 'NOT_FOUND' }, 404);
      }

      return successResponse(res, transaction);
    } catch (error) {
      return errorResponse(res, error, 500);
    }
  }
}
