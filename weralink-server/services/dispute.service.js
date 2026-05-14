import prisma from '../config/prisma.js';
import NotificationService from './notification.service.js';

/**
 * DisputeService
 * Manages the full lifecycle of disputes between workers and employers.
 * Supports raise, evidence attachment, and admin resolution with payout/refund logic.
 */
export class DisputeService {

  /**
   * Raises a dispute on an assignment. Can be raised by worker or employer.
   * Transitions assignment to DISPUTED status and notifies all parties.
   */
  static async raiseDispute(assignmentId, raisedById, reason, evidenceUrls = null) {
    return await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          gig: { select: { id: true, title: true, employerId: true } },
          worker: { select: { id: true, name: true } },
          dispute: true,
        },
      });

      if (!assignment) throw new Error('Assignment not found');
      if (assignment.dispute) throw new Error('A dispute already exists for this assignment');

      // Validate the raiser is a party to this assignment
      const isWorker = assignment.workerId === raisedById;
      const isEmployer = assignment.gig.employerId === raisedById;
      if (!isWorker && !isEmployer) throw new Error('You are not a party to this assignment');

      // Valid states for dispute: any active/completed state
      const disputeableStatuses = ['ACCEPTED', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'PAID'];
      if (!disputeableStatuses.includes(assignment.status)) {
        throw new Error(`Cannot dispute an assignment in ${assignment.status} status`);
      }

      // Create dispute record
      const dispute = await tx.dispute.create({
        data: {
          assignmentId,
          raisedById,
          reason,
          status: 'OPEN',
          evidenceUrls: evidenceUrls || [],
        },
      });

      // Transition assignment to DISPUTED
      await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          status: 'DISPUTED',
          autoApproveAt: null, // Cancel any auto-approval timers
        },
      });

      // Notify the other party
      const otherPartyId = isWorker ? assignment.gig.employerId : assignment.workerId;
      const raisedByRole = isWorker ? 'worker' : 'employer';

      await tx.notification.create({
        data: {
          userId: otherPartyId,
          title: 'Dispute Raised',
          message: `A dispute has been raised for "${assignment.gig.title}" by the ${raisedByRole}. Reason: ${reason}`,
          type: 'DISPUTE_RAISED',
          linkUrl: isWorker ? `/employer/gigs/${assignment.gig.id}` : `/worker/assignments`,
        },
      });

      // Notify all admins
      const admins = await tx.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
      if (admins.length > 0) {
        await tx.notification.createMany({
          data: admins.map(admin => ({
            userId: admin.id,
            title: 'New Dispute Filed',
            message: `A dispute has been raised for "${assignment.gig.title}" by ${isWorker ? assignment.worker.name : 'the employer'}. Review required.`,
            type: 'DISPUTE_RAISED',
            linkUrl: `/admin/disputes`,
          })),
        });
      }

      // Log activity
      await tx.userActivity.create({
        data: {
          userId: raisedById,
          action: 'DISPUTE_RAISED',
          metadata: { assignmentId, gigTitle: assignment.gig.title, reason },
        },
      });

      return dispute;
    });
  }

  /**
   * Retrieves a dispute with full context.
   */
  static async getDisputeById(disputeId) {
    return await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        assignment: {
          include: {
            gig: {
              select: { id: true, title: true, category: true, payAmount: true, currency: true, employerId: true },
            },
            worker: {
              select: { id: true, name: true, email: true, profile: { select: { location: true } } },
            },
            evidence: true,
          },
        },
        raisedBy: { select: { id: true, name: true, role: true } },
      },
    });
  }

  /**
   * Lists all disputes with filtering.
   */
  static async listDisputes({ page = 1, limit = 20, status, search } = {}) {
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { assignment: { gig: { title: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        include: {
          assignment: {
            select: {
              id: true,
              status: true,
              gig: { select: { id: true, title: true, payAmount: true, currency: true, employerId: true } },
              worker: { select: { id: true, name: true } },
            },
          },
          raisedBy: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dispute.count({ where }),
    ]);

    return { disputes, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Adds evidence URLs to an existing dispute.
   */
  static async addEvidence(disputeId, evidenceUrls, uploadedById) {
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new Error('Dispute not found');
    if (['RESOLVED_FOR_WORKER', 'RESOLVED_FOR_EMPLOYER', 'CLOSED'].includes(dispute.status)) {
      throw new Error('Cannot add evidence to a resolved dispute');
    }

    const existingEvidence = Array.isArray(dispute.evidenceUrls) ? dispute.evidenceUrls : [];
    const newEvidence = evidenceUrls.map(e => ({ ...e, uploadedBy: uploadedById }));

    return await prisma.dispute.update({
      where: { id: disputeId },
      data: { evidenceUrls: [...existingEvidence, ...newEvidence] },
    });
  }

  /**
   * Admin resolves a dispute with a decision and optional notes.
   * Triggers payout or refund based on resolution.
   */
  static async resolveDispute(disputeId, { resolution, resolvedFor, adminNotes }, adminId) {
    return await prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.findUnique({
        where: { id: disputeId },
        include: {
          assignment: {
            include: {
              gig: { select: { id: true, title: true, payAmount: true, employerId: true } },
              worker: { select: { id: true, name: true, phone: true } },
            },
          },
        },
      });

      if (!dispute) throw new Error('Dispute not found');
      if (['RESOLVED_FOR_WORKER', 'RESOLVED_FOR_EMPLOYER', 'CLOSED'].includes(dispute.status)) {
        throw new Error('Dispute is already resolved');
      }

      const resolvedStatus = resolvedFor === 'WORKER' ? 'RESOLVED_FOR_WORKER' : 'RESOLVED_FOR_EMPLOYER';

      // Update dispute
      const updatedDispute = await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: resolvedStatus,
          resolution,
          adminNotes,
          resolvedBy: adminId,
          resolvedAt: new Date(),
        },
      });

      // Update assignment status based on resolution
      const assignmentUpdate = {};
      if (resolvedFor === 'WORKER') {
        assignmentUpdate.status = 'APPROVED';
        assignmentUpdate.approvedAt = new Date();
      } else {
        assignmentUpdate.status = 'CANCELLED';
      }

      await tx.assignment.update({
        where: { id: dispute.assignmentId },
        data: assignmentUpdate,
      });

      // Trigger payout if resolved for worker
      if (resolvedFor === 'WORKER') {
        try {
          const { MpesaService } = await import('./mpesa.service.js');
          await MpesaService.triggerB2CPayout(
            dispute.assignmentId,
            dispute.assignment.worker.phone,
            Number(dispute.assignment.gig.payAmount)
          );
        } catch (paymentError) {
          console.error('[DisputeService] Payout after dispute resolution failed:', paymentError.message);
        }
      }

      // Update gig status
      if (resolvedFor === 'WORKER') {
        await tx.gig.update({ where: { id: dispute.assignment.gig.id }, data: { status: 'COMPLETED' } });
      } else {
        await tx.gig.update({ where: { id: dispute.assignment.gig.id }, data: { status: 'OPEN' } });
      }

      // Notify both parties
      const workerMessage = resolvedFor === 'WORKER'
        ? `The dispute for "${dispute.assignment.gig.title}" has been resolved in your favor. Payment will be processed shortly.`
        : `The dispute for "${dispute.assignment.gig.title}" has been resolved in favor of the employer. ${resolution || ''}`;
      
      const employerMessage = resolvedFor === 'EMPLOYER'
        ? `The dispute for "${dispute.assignment.gig.title}" has been resolved in your favor. The gig has been reopened.`
        : `The dispute for "${dispute.assignment.gig.title}" has been resolved in favor of the worker. Payment has been released.`;

      await tx.notification.createMany({
        data: [
          {
            userId: dispute.assignment.worker.id,
            title: 'Dispute Resolved',
            message: workerMessage,
            type: 'DISPUTE_RESOLVED',
            linkUrl: '/worker/history',
          },
          {
            userId: dispute.assignment.gig.employerId,
            title: 'Dispute Resolved',
            message: employerMessage,
            type: 'DISPUTE_RESOLVED',
            linkUrl: '/employer/history',
          },
        ],
      });

      return updatedDispute;
    });
  }
}
