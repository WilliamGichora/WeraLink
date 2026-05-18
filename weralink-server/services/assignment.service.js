import prisma from '../config/prisma.js';
import { scoreWorkerForGig } from './matching.service.js';
import NotificationService from './notification.service.js';
import { AnalyticsService } from './analytics.service.js';

/**
 * AssignmentService
 * Manages the state machine and business logic for Work Execution and Escrow.
 */
export class AssignmentService {
  /**
   * Called when a Worker applies for an OPEN Gig.
   * Creates an Assignment in OFFERED status.
   */
  static async applyForGig(gigId, workerId) {
    return await prisma.$transaction(async (tx) => {
      const gig = await tx.gig.findUnique({ where: { id: gigId } });
      if (!gig || gig.status !== 'OPEN') {
        throw new Error('Gig is not available for applications');
      }

      const existing = await tx.assignment.findFirst({
        where: { gigId, workerId, status: { not: 'CANCELLED' } }
      });
      if (existing) {
        throw new Error('You have already applied for this gig');
      }

      return await tx.assignment.create({
        data: {
          gigId,
          workerId,
          status: 'OFFERED',
        }
      });
    });
  }

  /**
   * Retrieves assignments for a worker based on status array
   */
  static async getWorkerAssignments(workerId, statuses = []) {
    const whereClause = { workerId };
    if (statuses.length > 0) {
      whereClause.status = { in: statuses };
    }

    return await prisma.assignment.findMany({
      where: whereClause,
      include: {
        gig: {
          include: { employer: { select: { name: true, profile: { select: { location: true } } } } }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  /**
   * Retrieves a single assignment with worker details and matching score
   */
  static async getAssignmentById(assignmentId) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        gig: {
          include: {
            employer: { select: { name: true, profile: { select: { bio: true } } } },
            skills: { select: { skillId: true, requiredLevel: true } }
          }
        },
        worker: {
          include: {
            profile: { select: { location: true, availabilityStatus: true, bio: true } },
            skills: {
              include: {
                skill: { select: { name: true } }
              }
            },
            badges: { select: { badgeId: true } },
            assignments: {
              select: {
                status: true,
                offeredAt: true,
                acceptedAt: true,
                gig: { select: { category: true } },
              },
            },
            ratingsRecv: { select: { score: true } },
            completions: {
              where: { passed: true },
              select: { id: true },
            },
          }
        },
        evidence: true
      }
    });

    if (!assignment) return null;

    const matchData = this._calculateMatch(assignment.worker, assignment.gig);

    let workerAnalytics = null;
    try {
      workerAnalytics = await AnalyticsService.getWorkerAnalytics(assignment.workerId, { months: 12 });
    } catch (e) {
      console.error('Failed to fetch worker analytics for assignment:', e);
    }

    return {
      ...assignment,
      matchScore: matchData.matchScore,
      matchBreakdown: matchData.breakdown,
      matchTags: matchData.tags,
      matchedSkills: matchData.matchedSkills,
      missingSkills: matchData.missingSkills,
      workerAnalytics,
    };
  }

  /**
   * Internal helper to hydrate and score a worker against a gig
   */
  static _calculateMatch(worker, gig) {
    const hydratedWorker = {
      id: worker.id,
      name: worker.name,
      createdAt: worker.createdAt,
      profile: worker.profile,
      skills: (worker.skills || []).map(ws => ({
        skillId: ws.skillId,
        level: ws.level,
        verified: ws.verified,
        name: ws.skill?.name
      })),
      assignments: (worker.assignments || []).map(wa => ({
        status: wa.status,
        gigCategory: wa.gig?.category || null,
        offeredAt: wa.offeredAt,
        acceptedAt: wa.acceptedAt,
      })),
      ratingsRecv: worker.ratingsRecv || [],
      badgeCount: worker.badges?.length || 0,
      passedModuleCount: worker.completions?.length || 0,
      activeAssignmentCount: (worker.assignments || []).filter(wa => ['ACCEPTED', 'SUBMITTED', 'REVISION_REQUESTED'].includes(wa.status)).length,
    };

    return scoreWorkerForGig(hydratedWorker, gig);
  }
  /**
   * Called when Employer selects a Worker and successfully locks Escrow.
   */
  static async acceptAssignment(assignmentId, transactionMpesaRef) {
    return await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.findUnique({
        where: { id: assignmentId },
        include: { gig: true }
      });

      if (!assignment || assignment.status !== 'OFFERED') {
        throw new Error('Assignment not found or not in OFFERED state');
      }

      if (assignment.gig.status !== 'OPEN') {
        throw new Error('This gig has already been assigned to someone else.');
      }

      const days = assignment.gig.duration || 3;
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + days);

      // Update Gig status to ASSIGNED (Removes from public marketplace)
      await tx.gig.update({
        where: { id: assignment.gigId },
        data: { status: 'ASSIGNED' }
      });

      const updatedAssignment = await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          deadlineAt: deadline
        }
      });

      // Reject all other OFFERED assignments for this gig
      const competitors = await tx.assignment.findMany({
        where: { gigId: assignment.gigId, id: { not: assignmentId }, status: 'OFFERED' }
      });

      if (competitors.length > 0) {
        await tx.assignment.updateMany({
          where: { gigId: assignment.gigId, id: { not: assignmentId }, status: 'OFFERED' },
          data: { status: 'REJECTED' }
        });

        const rejectNotifications = competitors.map(comp => ({
          userId: comp.workerId,
          title: 'Application Update',
          message: `The gig "${assignment.gig.title}" has been assigned to someone else. Your application was not selected.`,
          type: 'REJECTED',
          linkUrl: `/worker/history`
        }));
        await tx.notification.createMany({ data: rejectNotifications });
      }

      // Notify the accepted worker
      await tx.notification.create({
        data: {
          userId: assignment.workerId,
          title: 'You got the gig!',
          message: `You have been hired for "${assignment.gig.title}". Escrow is funded and you can now begin work.`,
          type: 'ACCEPTED',
          linkUrl: `/worker/assignments/${assignment.id}/submit`
        }
      });

      return updatedAssignment;
    });
  }

  /**
   * Called when an Employer rejects a worker's application.
   */
  static async rejectApplication(assignmentId, employerId, reason = null) {
    return await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.findUnique({
        where: { id: assignmentId },
        include: { gig: true }
      });

      if (!assignment || assignment.status !== 'OFFERED') {
        throw new Error('Assignment not found or not in a state that can be rejected');
      }

      if (assignment.gig.employerId !== employerId) {
        throw new Error('Unauthorized: You are not the employer for this gig');
      }

      // Update status to REJECTED
      const updated = await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          status: 'REJECTED'
        }
      });

      // Notify the worker
      await tx.notification.create({
        data: {
          userId: assignment.workerId,
          title: 'Application Update',
          message: `Your application for "${assignment.gig.title}" has been declined. ${reason ? `Reason: ${reason}` : 'Thank you for your interest.'}`,
          type: 'REJECTED',
          linkUrl: `/worker/applications`
        }
      });

      return updated;
    });
  }

  /**
   * Called when Worker submits work.
   */
  static async submitWork(assignmentId, workerId, evidenceData = [], completionNotes = null) {
    return await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.findFirst({
        where: { id: assignmentId, workerId },
        include: { gig: true, worker: true }
      });

      if (!assignment || !['ACCEPTED', 'REVISION_REQUESTED'].includes(assignment.status)) {
        throw new Error('Invalid assignment state for submission');
      }

      const autoApprove = new Date();
      autoApprove.setHours(autoApprove.getHours() + 72);

      // --- NEW: Robust Validation against Gig's Evidence Template ---
      const template = assignment.gig.evidenceTemplate;
      if (template && Array.isArray(template)) {
        for (const req of template) {
          const submission = evidenceData.find(ev => ev.requirementTag === req.tag || ev.requirementTag === req.id);
          
          // 1. Check for required missing items
          if (req.required && (!submission || !submission.fileUrl)) {
            throw new Error(`Requirement "${req.label}" is mandatory but was not provided.`);
          }

          if (submission && submission.fileUrl) {
            // 2. Validate Type consistency
            //req.type vs submission.evidenceType (from client)
            const submissionType = submission.evidenceType;
            
            // File Extension Validation
            if (req.accept && Array.isArray(req.accept) && req.accept.length > 0) {
              const extension = '.' + submission.fileUrl.split('.').pop()?.toLowerCase().split('?')[0]; // Handle query params if any
              if (!req.accept.includes(extension)) {
                throw new Error(`Invalid file format for "${req.label}". Expected: ${req.accept.join(', ')}`);
              }
            }

            // Link Pattern Validation (Social/Drive)
            if (req.type === 'GOOGLE_DRIVE' && !submission.fileUrl.includes('drive.google.com')) {
              throw new Error(`Requirement "${req.label}" must be a valid Google Drive link.`);
            }
            if (req.type === 'GITHUB' && !submission.fileUrl.includes('github.com')) {
              throw new Error(`Requirement "${req.label}" must be a valid GitHub link.`);
            }
            if (req.type === 'TWITTER' && !submission.fileUrl.includes('twitter.com') && !submission.fileUrl.includes('x.com')) {
              throw new Error(`Requirement "${req.label}" must be a valid Twitter/X link.`);
            }
            if (req.type === 'INSTAGRAM' && !submission.fileUrl.includes('instagram.com')) {
              throw new Error(`Requirement "${req.label}" must be a valid Instagram link.`);
            }
          }
        }
      }
      // --- END VALIDATION ---

      // Delete existing evidence to replace with the new list (Clean Slate for resubmission)
      await tx.evidence.deleteMany({
        where: { assignmentId }
      });

      if (evidenceData.length > 0) {
        await tx.evidence.createMany({
          data: evidenceData.map(ev => ({
            assignmentId,
            fileUrl: ev.fileUrl,
            evidenceType: ev.evidenceType,
            requirementTag: ev.requirementTag
          }))
        });
      }

      // Notify employer
      const isResubmission = assignment.status === 'REVISION_REQUESTED';
      await tx.notification.create({
        data: {
          userId: assignment.gig.employerId,
          title: isResubmission ? 'Work Resubmitted' : 'Work Submitted',
          message: `${assignment.worker.name} has ${isResubmission ? 'resubmitted' : 'submitted'} work for "${assignment.gig.title}". Please review it.`,
          type: 'SUBMITTED',
          linkUrl: `/employer/assignments/review/${assignmentId}`
        }
      });

      return await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
          autoApproveAt: autoApprove,
          completionNotes
        }
      });
    });
  }

  /**
   * Called by Employer to review submission
   */
  static async reviewSubmission(assignmentId, action, reason) {
    return await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.findUnique({
        where: { id: assignmentId },
        include: { gig: true }
      });

      if (!assignment || assignment.status !== 'SUBMITTED') {
        throw new Error('Assignment is not pending review');
      }

      let updatedAssignment;

      switch (action) {
        case 'APPROVE':
          await tx.gig.update({
            where: { id: assignment.gigId },
            data: { status: 'COMPLETED' }
          });

          updatedAssignment = await tx.assignment.update({
            where: { id: assignmentId },
            data: {
              status: 'APPROVED',
              approvedAt: new Date(),
              autoApproveAt: null
            },
            include: { worker: true }
          });

          // Trigger M-Pesa B2C Payout
          const phoneToUse = '254708374149'
          try {
            const { MpesaService } = await import('./mpesa.service.js');
            await MpesaService.triggerB2CPayout(
              assignmentId,
              phoneToUse,
              Number(assignment.gig.payAmount)
            );
          } catch (paymentError) {
            console.error('[B2C Payout Error]:', paymentError);
          }

          await tx.notification.create({
            data: {
              userId: assignment.workerId,
              title: 'Work Approved!',
              message: `Your work for "${assignment.gig.title}" has been approved. Payment has been initiated via M-Pesa.`,
              type: 'APPROVED',
              linkUrl: `/worker/history`
            }
          });
          break;

        case 'REVISE':
          const newDeadline = new Date();
          newDeadline.setHours(newDeadline.getHours() + 24);

          updatedAssignment = await tx.assignment.update({
            where: { id: assignmentId },
            data: {
              status: 'REVISION_REQUESTED',
              deadlineAt: newDeadline,
              autoApproveAt: null,
              revisionNotes: reason
            }
          });

          await tx.notification.create({
            data: {
              userId: assignment.workerId,
              title: 'Revision Requested',
              message: `The employer has requested revisions for "${assignment.gig.title}". Please check the notes and resubmit.`,
              type: 'REVISION_REQUESTED',
              linkUrl: `/worker/assignments/${assignmentId}/submit`
            }
          });
          break;

        case 'DISPUTE':
          updatedAssignment = await tx.assignment.update({
            where: { id: assignmentId },
            data: {
              status: 'DISPUTED',
              autoApproveAt: null
            }
          });
          break;

        default:
          throw new Error('Invalid review action');
      }

      return updatedAssignment;
    });
  }

  /**
   * Retrieves all applicants for a specific Gig.
   * Includes Match Scores and detailed worker data.
   */
  static async getGigApplicants(gigId, employerId) {
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: {
        skills: { select: { skillId: true, requiredLevel: true } },
        _count: { select: { assignments: true } }
      }
    });

    if (!gig) throw new Error('Gig not found');
    if (gig.employerId !== employerId) throw new Error('Unauthorized');

    const assignments = await prisma.assignment.findMany({
      where: { gigId, status: 'OFFERED' },
      include: {
        worker: {
          include: {
            profile: { select: { location: true, availabilityStatus: true, bio: true } },
            skills: { select: { skillId: true, level: true, verified: true } },
            badges: { select: { badgeId: true } },
            assignments: {
              select: {
                status: true,
                offeredAt: true,
                acceptedAt: true,
                gig: { select: { category: true } },
              },
            },
            ratingsRecv: { select: { score: true } },
            completions: {
              where: { passed: true },
              select: { id: true },
            },
          }
        }
      }
    });

    // Score each applicant
    const applicants = assignments.map(a => {
      const worker = a.worker;
      const hydratedWorker = {
        id: worker.id,
        name: worker.name,
        createdAt: worker.createdAt,
        profile: worker.profile,
        skills: worker.skills || [],
        assignments: (worker.assignments || []).map(wa => ({
          status: wa.status,
          gigCategory: wa.gig?.category || null,
          offeredAt: wa.offeredAt,
          acceptedAt: wa.acceptedAt,
        })),
        ratingsRecv: worker.ratingsRecv || [],
        badgeCount: worker.badges?.length || 0,
        passedModuleCount: worker.completions?.length || 0,
        activeAssignmentCount: (worker.assignments || []).filter(wa => ['ACCEPTED', 'SUBMITTED', 'REVISION_REQUESTED'].includes(wa.status)).length,
      };

      const matchData = scoreWorkerForGig(hydratedWorker, gig);

      return {
        ...a,
        matchScore: matchData.matchScore,
        matchBreakdown: matchData.breakdown,
        matchTags: matchData.tags,
        matchedSkills: matchData.matchedSkills,
        missingSkills: matchData.missingSkills
      };
    });

    // Sort by match score descending
    return applicants.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Retrieves ALL applicants for ALL gigs owned by an employer.
   * Supports robust filtering and search.
   */
  static async getEmployerApplicants(employerId, filters = {}) {
    const { search, minScore, maxScore, sortBy = 'score', order = 'desc' } = filters;

    const gigs = await prisma.gig.findMany({
      where: { employerId },
      include: {
        skills: { select: { skillId: true, requiredLevel: true } }
      }
    });

    const gigIds = gigs.map(g => g.id);

    // Build where clause for assignments
    const where = {
      gigId: { in: gigIds },
      status: 'OFFERED'
    };

    if (search) {
      where.OR = [
        { worker: { name: { contains: search, mode: 'insensitive' } } },
        { gig: { title: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        gig: { select: { id: true, title: true, category: true, payAmount: true, currency: true } },
        worker: {
          include: {
            profile: { select: { location: true, availabilityStatus: true, bio: true } },
            skills: { include: { skill: { select: { name: true } } } },
            badges: { select: { badgeId: true } },
            assignments: {
              select: {
                status: true,
                offeredAt: true,
                acceptedAt: true,
                gig: { select: { category: true } },
              },
            },
            ratingsRecv: { select: { score: true } },
            completions: {
              where: { passed: true },
              select: { id: true },
            },
          }
        }
      },
      orderBy: { offeredAt: 'desc' }
    });

    let applicants = assignments.map(a => {
      const gig = gigs.find(g => g.id === a.gigId);

      // Re-hydrate worker for scoring (same logic as getGigApplicants)
      const worker = a.worker;
      const hydratedWorker = {
        id: worker.id,
        name: worker.name,
        profile: worker.profile,
        skills: worker.skills || [],
        assignments: (worker.assignments || []).map(wa => ({
          status: wa.status,
          gigCategory: wa.gig?.category || null,
          offeredAt: wa.offeredAt,
          acceptedAt: wa.acceptedAt,
        })),
        ratingsRecv: worker.ratingsRecv || [],
        badgeCount: worker.badges?.length || 0,
        passedModuleCount: worker.completions?.length || 0,
        activeAssignmentCount: (worker.assignments || []).filter(wa => ['ACCEPTED', 'SUBMITTED', 'REVISION_REQUESTED'].includes(wa.status)).length,
      };

      const matchData = scoreWorkerForGig(hydratedWorker, gig);
      return {
        ...a,
        matchScore: matchData.matchScore,
        matchBreakdown: matchData.breakdown,
        matchTags: matchData.tags,
        matchedSkills: matchData.matchedSkills,
        missingSkills: matchData.missingSkills
      };
    });

    // Score Filtering
    if (minScore !== undefined) {
      applicants = applicants.filter(a => a.matchScore >= minScore);
    }
    if (maxScore !== undefined) {
      applicants = applicants.filter(a => a.matchScore <= maxScore);
    }

    // Sorting
    if (sortBy === 'score') {
      applicants.sort((a, b) => order === 'desc' ? b.matchScore - a.matchScore : a.matchScore - b.matchScore);
    } else {
      // offeredAt is already handled by orderBy in findMany, but we might want to override
      applicants.sort((a, b) => {
        const dateA = new Date(a.offeredAt).getTime();
        const dateB = new Date(b.offeredAt).getTime();
        return order === 'desc' ? dateB - dateA : dateA - dateB;
      });
    }

    return applicants;
  }

  /**
   * Retrieves ALL assignments pending review for an employer.
   */
  static async getEmployerPendingReviews(employerId) {
    return await prisma.assignment.findMany({
      where: {
        gig: { employerId },
        status: 'SUBMITTED'
      },
      include: {
        gig: { select: { id: true, title: true, category: true, payAmount: true, currency: true } },
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: { select: { location: true } }
          }
        },
        evidence: { select: { id: true } }
      },
      orderBy: { submittedAt: 'desc' }
    });
  }

  /**
   * Retrieves a distinct list of workers who have had assignments with an employer.
   * Used for dropdowns and reporting where employers need to select a specific worker.
   */
  static async getEmployerHiredWorkers(employerId) {
    const assignments = await prisma.assignment.findMany({
      where: {
        gig: { employerId },
        // Consider a worker 'hired' if they reached at least ACCEPTED status
        status: { in: ['ACCEPTED', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'DISPUTED', 'PAID'] }
      },
      select: {
        worker: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                bio: true,
                location: true
              }
            }
          }
        }
      },
      distinct: ['workerId']
    });

    return assignments.map(a => a.worker);
  }

  /**
   * Retrieves assignments related to an employer's gigs, with status filtering.
   * Useful for hiring history and specific status tracking.
   */
  static async getEmployerAssignments(employerId, statuses = []) {
    const whereClause = {
      gig: { employerId }
    };

    if (statuses.length > 0) {
      whereClause.status = { in: statuses };
    }

    return await prisma.assignment.findMany({
      where: whereClause,
      include: {
        gig: {
          select: {
            id: true,
            title: true,
            category: true,
            payAmount: true,
            currency: true,
            location: true,
            status: true,
            createdAt: true
          }
        },
        worker: {
          select: {
            id: true,
            name: true,
            profile: { select: { location: true } }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  /**
   * Reconciliation: Finds APPROVED assignments without a payout transaction and triggers them.
   * Handles stale PENDING transactions by deleting them and re-triggering.
   */
  static async syncOrphanPayouts() {
    console.log('[Reconciliation] Starting payout sync for orphan assignments...');

    // Find assignments that are APPROVED
    const approvedAssignments = await prisma.assignment.findMany({
      where: {
        status: 'APPROVED'
      },
      include: {
        gig: true,
        worker: true,
        transactions: {
          where: { type: 'PAYOUT_TO_WORKER' }
        }
      }
    });

    const results = {
      processed: 0,
      skipped: 0,
      failed: 0,
      details: []
    };

    const { MpesaService } = await import('./mpesa.service.js');
    const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

    for (const assignment of approvedAssignments) {
      try {
        const existingPayout = assignment.transactions[0];

        // Case 1: Already has a SUCCESSFUL payout
        if (existingPayout && existingPayout.status === 'SUCCESS') {
          results.skipped++;
          continue;
        }

        // Case 2: Has a PENDING payout
        if (existingPayout && existingPayout.status === 'PENDING') {
          const isStale = (Date.now() - new Date(existingPayout.initiatedAt).getTime()) > STALE_THRESHOLD_MS;

          if (!isStale) {
            console.log(`[Reconciliation] Assignment ${assignment.id} has a fresh PENDING payout. Skipping.`);
            results.skipped++;
            continue;
          }

          console.log(`[Reconciliation] Assignment ${assignment.id} has a STALE PENDING payout. Deleting and re-triggering...`);
          await prisma.transaction.delete({ where: { id: existingPayout.id } });
        }

        // Case 3: No payout (or stale one deleted) - Trigger new payout
        console.log(`[Reconciliation] Triggering payout for Assignment ${assignment.id} (${assignment.gig.title})`);

        const phone = "254708374149";
        if (!phone) {
          throw new Error(`Worker ${assignment.workerId} has no phone number`);
        }

        await MpesaService.triggerB2CPayout(
          assignment.id,
          phone,
          Number(assignment.gig.payAmount)
        );

        results.processed++;
        results.details.push({ id: assignment.id, status: 'TRIGGERED', phone });
      } catch (error) {
        console.error(`[Reconciliation] Failed to process Assignment ${assignment.id}:`, error.message);
        results.failed++;
        results.details.push({ id: assignment.id, status: 'FAILED', error: error.message });
      }
    }

    console.log(`[Reconciliation] Finished. Processed: ${results.processed}, Skipped: ${results.skipped}, Failed: ${results.failed}`);
    return results;
  }
}

