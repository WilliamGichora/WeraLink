import prisma from '../config/prisma.js';
import { scoreWorkerForGig } from './matching.service.js';

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
        where: { gigId, workerId }
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

    return {
      ...assignment,
      matchScore: matchData.matchScore,
      matchBreakdown: matchData.breakdown,
      matchTags: matchData.tags,
      matchedSkills: matchData.matchedSkills,
      missingSkills: matchData.missingSkills
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
      activeAssignmentCount: (worker.assignments || []).filter(wa => ['OFFERED', 'ACCEPTED'].includes(wa.status)).length,
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

      const days = assignment.gig.duration || 3;
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + days);

      return await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          deadlineAt: deadline
        }
      });
    });
  }

  /**
   * Called by the Worker when submitting evidence
   */
  static async submitWork(assignmentId, workerId, evidenceData = []) {
    return await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.findFirst({
        where: { id: assignmentId, workerId }
      });

      if (!assignment || !['ACCEPTED', 'REVISION_REQUESTED'].includes(assignment.status)) {
        throw new Error('Invalid assignment state for submission');
      }

      const autoApprove = new Date();
      autoApprove.setHours(autoApprove.getHours() + 72);

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

      return await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
          autoApproveAt: autoApprove
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
        where: { id: assignmentId }
      });

      if (!assignment || assignment.status !== 'SUBMITTED') {
        throw new Error('Assignment is not pending review');
      }

      switch (action) {
        case 'APPROVE':
          return await tx.assignment.update({
            where: { id: assignmentId },
            data: {
              status: 'APPROVED',
              approvedAt: new Date(),
              autoApproveAt: null
            }
          });
        case 'REVISE':
          const newDeadline = new Date();
          newDeadline.setHours(newDeadline.getHours() + 24);

          return await tx.assignment.update({
            where: { id: assignmentId },
            data: {
              status: 'REVISION_REQUESTED',
              deadlineAt: newDeadline,
              autoApproveAt: null
            }
          });
        case 'DISPUTE':
          return await tx.assignment.update({
            where: { id: assignmentId },
            data: {
              status: 'DISPUTED',
              autoApproveAt: null
            }
          });
        default:
          throw new Error('Invalid review action');
      }
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
        activeAssignmentCount: (worker.assignments || []).filter(wa => ['OFFERED', 'ACCEPTED'].includes(wa.status)).length,
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
   */
  static async getEmployerApplicants(employerId) {
    const gigs = await prisma.gig.findMany({
      where: { employerId },
      include: {
        skills: { select: { skillId: true, requiredLevel: true } }
      }
    });

    const gigIds = gigs.map(g => g.id);

    const assignments = await prisma.assignment.findMany({
      where: { gigId: { in: gigIds }, status: 'OFFERED' },
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

    return assignments.map(a => {
      const gig = gigs.find(g => g.id === a.gigId);
      const matchData = this._calculateMatch(a.worker, gig);
      return {
        ...a,
        matchScore: matchData.matchScore,
        matchBreakdown: matchData.breakdown,
        matchTags: matchData.tags,
        matchedSkills: matchData.matchedSkills,
        missingSkills: matchData.missingSkills
      };
    });
  }
}

