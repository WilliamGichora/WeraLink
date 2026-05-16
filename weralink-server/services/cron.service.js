import prisma from '../config/prisma.js';
import { MpesaService } from './mpesa.service.js';

/**
 * CronService
 * Background task manager for the Work Execution module.
 */
export class CronService {
  /**
   * Starts all scheduled background jobs.
   * Can be hooked into the Express server startup.
   */
  static startJobs() {
    console.log('Starting Execution Cron Jobs...');

    // We use setInterval for simplicity in this Node.js process, 
    // replacing the need for node-cron if it's not installed.
    // Checks every 5 minutes (300000 ms)
    setInterval(async () => {
      try {
        await this.withRetry(() => this.checkGhostWorkers(), 3, 5000);
      } catch (err) {
        console.error('Critical failure in checkGhostWorkers cron interval after retries:', err);
      }
      
      try {
        await this.withRetry(() => this.checkGhostEmployers(), 3, 5000);
      } catch (err) {
        console.error('Critical failure in checkGhostEmployers cron interval after retries:', err);
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Helper to retry database operations to handle serverless cold starts
   */
  static async withRetry(fn, maxRetries = 3, delayMs = 5000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const isConnectionError = error.code === 'ETIMEDOUT' || error.code === 'P1001' || (error.message && error.message.includes("Can't reach database server"));
        if (isConnectionError && i < maxRetries - 1) {
          console.warn(`[Cron] Database connection timeout (Cold start). Retrying in ${delayMs / 1000}s... (Attempt ${i + 1}/${maxRetries})`);
          await new Promise(res => setTimeout(res, delayMs));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  /**
   * Checks for assignments where the worker missed the deadline.
   * Marks them as FAILED and handles potential refunds.
   */
  static async checkGhostWorkers() {
    console.log('[Cron] Checking for Ghost Workers...');
    try {
      const expiredAssignments = await prisma.assignment.findMany({
        where: {
          status: { in: ['ACCEPTED', 'REVISION_REQUESTED'] },
          deadlineAt: { lt: new Date() }
        },
        include: {
          worker: { select: { id: true, name: true, email: true } },
          gig: { select: { id: true, title: true, employerId: true } }
        }
      });

      console.log(`[Cron] Found ${expiredAssignments.length} expired assignments.`);

      for (const assignment of expiredAssignments) {
        try {
          await prisma.$transaction(async (tx) => {
            // 1. Mark as failed
            await tx.assignment.update({
              where: { id: assignment.id },
              data: { status: 'FAILED' }
            });

            // 2. Log and potentially trigger refund logic
            // In a production system, you'd trigger a B2C refund to the Employer's M-Pesa
            await MpesaService.triggerB2CPayout(
              assignment.id,
              /*assignment.worker.phone ||*/ '254708374149',
              assignment.gig.payAmount
            );
            //Ensure all data states are synchronized to be consistent/capture the current state correctly
            //1. Update gig status to AVAILABLE if it has no other pending assignments
            const pendingAssignments = await tx.assignment.count({
              where: {
                gigId: assignment.gigId,
                status: { not: 'FAILED' }
              }
            });
            if (pendingAssignments === 0) {
              await tx.gig.update({
                where: { id: assignment.gigId },
                data: { status: 'AVAILABLE' }
              });
            }
            console.log(`[Cron] Ghost Worker: Assignment ${assignment.id} (${assignment.gig.title}) marked as FAILED.`);
          });
        } catch (error) {
          console.error(`[Cron] Failed to process ghost worker for assignment ${assignment.id}:`, error.message);
        }
      }
    } catch (error) {
      // Re-throw so the retry wrapper can catch it
      throw error;
    }
  }

  /**
   * Checks for assignments where the employer hasn't reviewed in time.
   * Auto-approves them and triggers worker payout.
   */
  static async checkGhostEmployers() {
    console.log('[Cron] Checking for Ghost Employers (Auto-approval)...');
    try {
      const autoApproveAssignments = await prisma.assignment.findMany({
        where: {
          status: 'SUBMITTED',
          autoApproveAt: { lt: new Date() }
        },
        include: {
          worker: { select: { id: true, phone: true } },
          gig: { select: { id: true, payAmount: true, currency: true } }
        }
      });

      console.log(`[Cron] Found ${autoApproveAssignments.length} assignments for auto-approval.`);

      for (const assignment of autoApproveAssignments) {
        try {
          // Idempotency check: Ensure we haven't already initiated a payout for this assignment
          const existingPayout = await prisma.transaction.findFirst({
            where: {
              assignmentId: assignment.id,
              type: 'PAYOUT_TO_WORKER',
              status: { in: ['PENDING', 'COMPLETED'] }
            }
          });

          if (existingPayout) {
            console.log(`[Cron] Payout already exists for assignment ${assignment.id}. Skipping status update.`);
            // If the payout exists but assignment is still SUBMITTED, we might need to sync it.
            // For now, we skip to avoid double approval logic.
            continue;
          }

          // 1. Mark as approved in a transaction
          await prisma.assignment.update({
            where: { id: assignment.id },
            data: {
              status: 'APPROVED',
              approvedAt: new Date(),
              autoApproveAt: null
            }
          });

          console.log(`[Cron] Ghost Employer: Assignment ${assignment.id} auto-approved.`);

          // 2. Queue B2C Payout to worker
          //outside the transaction to avoid long-running locks during external API calls
          try {
            await MpesaService.triggerB2CPayout(
              assignment.id,
              /*assignment.worker.phone ||*/ '254708374149',
              assignment.gig.payAmount
            );
            console.log(`[Cron] Payout initiated for assignment ${assignment.id}`);
          } catch (mpesaError) {
            console.error(`[Cron] Failed to initiate payout for assignment ${assignment.id}:`, mpesaError.message);
            // Note: Assignment is already APPROVED. A separate reconciliation job should 
            // periodically retry PENDING or MISSING payouts for APPROVED assignments.

          }
        } catch (error) {
          console.error(`[Cron] Failed to auto-approve assignment ${assignment.id}:`, error.message);
        }
      }
    } catch (error) {
      throw error;
    }
  }
}
