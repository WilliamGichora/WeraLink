import { AssignmentService } from '../services/assignment.service.js';
import { EvidenceService } from '../services/evidence.service.js';
import prisma from '../config/prisma.js';
import { errorResponse, successResponse } from '../utils/error.utils.js';

/**
 * ExecutionController
 * HTTP handlers for Assignment workflow (worker submission, employer review, evidence urls).
 */
export class ExecutionController {

  /**
   * POST /api/gigs/:id/apply
   * Called when a worker applies for a gig
   */
  static async applyForGig(req, res) {
    try {
      const gigId = req.params.id;
      const workerId = req.user?.id || req.body.workerId;

      if (!workerId) {
        return errorResponse(res, { message: 'Authentication required to apply for gigs', code: 'AUTH_REQUIRED' }, 401);
      }

      const assignment = await AssignmentService.applyForGig(gigId, workerId);
      return successResponse(res, assignment, 'Successfully applied for gig');
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  /**
   * GET /api/assignments/worker
   * Get assignments for the logged-in worker, optionally filtered by status
   */
  static async getWorkerAssignments(req, res) {
    try {
      const workerId = req.user?.id || req.query.workerId;
      if (!workerId) {
        return errorResponse(res, { message: 'User ID is required', code: 'MISSING_PARAM' }, 400);
      }

      const statuses = req.query.statuses ? req.query.statuses.split(',') : [];

      const assignments = await AssignmentService.getWorkerAssignments(workerId, statuses);
      return successResponse(res, assignments);
    } catch (error) {
      return errorResponse(res, error, 500);
    }
  }

  /**
   * GET /api/assignments/:id
   */
  static async getAssignmentById(req, res) {
    try {
      const { id } = req.params;
      const assignment = await AssignmentService.getAssignmentById(id);
      
      if (!assignment) {
        return errorResponse(res, { message: 'Assignment not found', code: 'NOT_FOUND' }, 404);
      }
      
      return successResponse(res, assignment);
    } catch (error) {
      return errorResponse(res, error, 500);
    }
  }

  /**
   * POST /api/evidence/presigned-url
   * Generate an upload URL for evidence files
   */
  static async getPresignedUrl(req, res) {
    try {
      const { assignmentId, fileName } = req.body;
      const userId = req.user?.id;

      // Security: Verify user is the assigned worker
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId }
      });

      if (!assignment) {
        return errorResponse(res, { message: 'Assignment not found', code: 'NOT_FOUND' }, 404);
      }

      if (userId && assignment.workerId !== userId) {
        return errorResponse(res, { message: 'Unauthorized: You are not the assigned worker', code: 'FORBIDDEN' }, 403);
      }

      const result = await EvidenceService.getPresignedUploadUrl(assignmentId, fileName);
      return res.json(result);
    } catch (error) {
      return errorResponse(res, error, 500);
    }
  }

  /**
   * POST /api/evidence/download-url
   * Generate a temporary signed URL for viewing/downloading evidence
   */
  static async getPresignedDownloadUrl(req, res) {
    try {
      const { assignmentId, filePath } = req.body;
      const userId = req.user?.id;

      if (!assignmentId || !filePath) {
        return errorResponse(res, { message: 'Assignment ID and File Path are required', code: 'MISSING_PARAM' }, 400);
      }

      // Security: Verify user is either the assigned worker or the employer
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { gig: true }
      });

      if (!assignment) {
        return errorResponse(res, { message: 'Assignment not found', code: 'NOT_FOUND' }, 404);
      }

      const isWorker = userId === assignment.workerId;
      const isEmployer = userId === assignment.gig.employerId;

      if (!isWorker && !isEmployer) {
        return errorResponse(res, { message: 'Unauthorized access to evidence', code: 'FORBIDDEN' }, 403);
      }

      const result = await EvidenceService.getPresignedDownloadUrl(filePath);
      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error, 500);
    }
  }

  /**
   * POST /api/assignments/:id/submit
   * Called by worker when they finalize their evidence upload
   */
  static async submitWork(req, res) {
    try {
      const { id } = req.params;
      const workerId = req.user?.id || req.body.workerId;
      const { evidenceData, completionNotes } = req.body;

      if (!evidenceData || !Array.isArray(evidenceData) || evidenceData.length === 0) {
        return errorResponse(res, { message: 'At least one piece of evidence is required', code: 'MISSING_EVIDENCE' });
      }

      await AssignmentService.submitWork(id, workerId, evidenceData, completionNotes);

      return successResponse(res, null, 'Work submitted successfully');
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  /**
   * POST /api/assignments/:id/review
   * Called by employer to approve, revise, or dispute
   */
  static async reviewWork(req, res) {
    try {
      const { id } = req.params;
      const { action, reason } = req.body;
      const employerId = req.user?.id;

      if (!['APPROVE', 'REVISE', 'DISPUTE'].includes(action)) {
        return errorResponse(res, { message: 'Invalid review action', code: 'INVALID_ACTION' });
      }

      const assignment = await prisma.assignment.findUnique({
        where: { id },
        include: { gig: true }
      });

      if (!assignment) {
        return errorResponse(res, { message: 'Assignment not found', code: 'NOT_FOUND' }, 404);
      }

      if (employerId && assignment.gig.employerId !== employerId) {
        return errorResponse(res, { message: 'Unauthorized: You are not the employer for this gig', code: 'FORBIDDEN' }, 403);
      }

      if (action === 'APPROVE') {
        const { MpesaService } = await import('../services/mpesa.service.js');
        const assignmentToApprove = await prisma.assignment.findUnique({
          where: { id },
          include: { worker: true, gig: true }
        });

        try {
          await MpesaService.triggerB2CPayout(
            id,
            /* assignmentToApprove.worker.phone || */ '+254768172782',
            assignmentToApprove.gig.payAmount
          );
        } catch (mpesaError) {
          console.error('[Payout Error] Failed to trigger B2C during manual approval:', mpesaError);
          // Abort the approval process because we couldn't lock/initiate the payout
          return errorResponse(res, { 
            message: mpesaError.message || 'Failed to initiate M-Pesa payout. Approval aborted.', 
            code: 'PAYOUT_INIT_FAILED' 
          }, 400);
        }
      }

      await AssignmentService.reviewSubmission(id, action, reason);

      return successResponse(res, { action }, `Assignment review processed: ${action}`);
    } catch (error) {
      return errorResponse(res, error);
    }
  }
  /**
   * GET /api/gigs/:id/applicants
   * Retrieves all workers who have applied for a specific gig
   */
  static async getGigApplicants(req, res) {
    try {
      const gigId = req.params.id;
      const employerId = req.user?.id;

      if (!employerId) {
        return errorResponse(res, { message: 'Authentication required', code: 'AUTH_REQUIRED' }, 401);
      }

      const applicants = await AssignmentService.getGigApplicants(gigId, employerId);
      return successResponse(res, applicants);
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  /**
   * GET /api/assignments/employer
   * Retrieves all active applicants across all gigs for an employer
   */
  static async getEmployerApplicants(req, res) {
    try {
      const employerId = req.user?.id;

      if (!employerId) {
        return errorResponse(res, { message: 'Authentication required', code: 'AUTH_REQUIRED' }, 401);
      }

      const applicants = await AssignmentService.getEmployerApplicants(employerId);
      return successResponse(res, applicants);
    } catch (error) {
      return errorResponse(res, error);
    }
  }
  /**
   * GET /api/assignments/employer/reviews
   * Retrieves all submissions pending review for an employer
   */
  static async getEmployerPendingReviews(req, res) {
    try {
      const employerId = req.user?.id;

      if (!employerId) {
        return errorResponse(res, { message: 'Authentication required', code: 'AUTH_REQUIRED' }, 401);
      }

      const reviews = await AssignmentService.getEmployerPendingReviews(employerId);
      return successResponse(res, reviews);
    } catch (error) {
      return errorResponse(res, error);
    }
  }
}

