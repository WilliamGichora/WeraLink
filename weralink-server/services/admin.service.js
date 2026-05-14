import prisma from '../config/prisma.js';
import { supabase } from '../config/supabase.js';

/**
 * AdminService
 * Centralized administration logic for user management, platform metrics,
 * dispute oversight, and support ticket workflows.
 */
export class AdminService {

  // ─── User Management ──────────────────────────────────────

  /**
   * Lists users with pagination, search, and role/status filtering.
   */
  static async listUsers({ page = 1, limit = 20, search, role, status, sortBy = 'createdAt', order = 'desc' } = {}) {
    const where = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          profile: { select: { location: true, companyName: true, verified: true, availabilityStatus: true } },
          _count: { select: { assignments: true, postedGigs: true, supportTickets: true } },
        },
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Retrieves full user detail including activity log and assignment summary.
   */
  static async getUserDetail(userId) {
    const [user, recentActivity, assignmentSummary] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          skills: { include: { skill: { select: { name: true, category: true } } } },
          badges: { include: { badge: true } },
          ratingsRecv: {
            select: { score: true, comment: true, createdAt: true, rater: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          supportTickets: { orderBy: { createdAt: 'desc' }, take: 5 },
          _count: {
            select: { assignments: true, postedGigs: true, ratingsRecv: true, completions: true, supportTickets: true },
          },
        },
      }),
      prisma.userActivity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.assignment.groupBy({
        by: ['status'],
        where: { workerId: userId },
        _count: { id: true },
      }),
    ]);

    if (!user) return null;

    const statusMap = {};
    assignmentSummary.forEach(s => { statusMap[s.status] = s._count.id; });

    return { ...user, recentActivity, assignmentStatusSummary: statusMap };
  }

  /**
   * Suspends a user account — updates both Prisma and Supabase auth.
   */
  static async suspendUser(userId, reason, adminId) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');
      if (user.status === 'SUSPENDED') throw new Error('User is already suspended');
      if (user.role === 'ADMIN') throw new Error('Cannot suspend admin accounts');

      // Update Prisma user
      const updated = await tx.user.update({
        where: { id: userId },
        data: { status: 'SUSPENDED' },
      });

      // Update worker availability
      await tx.profile.updateMany({
        where: { userId },
        data: { availabilityStatus: false },
      });

      // Log activity
      await tx.userActivity.create({
        data: {
          userId,
          action: 'ACCOUNT_SUSPENDED',
          metadata: { reason, suspendedBy: adminId },
        },
      });

      // Notify user
      await tx.notification.create({
        data: {
          userId,
          title: 'Account Suspended',
          message: `Your account has been suspended. Reason: ${reason || 'Policy violation'}. Contact support for assistance.`,
          type: 'ACCOUNT_SUSPENDED',
        },
      });

      // Disable in Supabase Auth
      try {
        await supabase.auth.admin.updateUserById(userId, { ban_duration: 'none' });
      } catch (err) {
        console.error('[AdminService] Supabase ban failed (non-blocking):', err.message);
      }

      return updated;
    });
  }

  /**
   * Unsuspends a user account.
   */
  static async unsuspendUser(userId, adminId) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');
      if (user.status !== 'SUSPENDED') throw new Error('User is not suspended');

      const updated = await tx.user.update({
        where: { id: userId },
        data: { status: 'ACTIVE' },
      });

      await tx.profile.updateMany({
        where: { userId },
        data: { availabilityStatus: true },
      });

      await tx.userActivity.create({
        data: {
          userId,
          action: 'ACCOUNT_UNSUSPENDED',
          metadata: { unsuspendedBy: adminId },
        },
      });

      await tx.notification.create({
        data: {
          userId,
          title: 'Account Reactivated',
          message: 'Your account has been reactivated. Welcome back to WeraLink!',
          type: 'ACCOUNT_REACTIVATED',
        },
      });

      // Unban in Supabase Auth
      try {
        await supabase.auth.admin.updateUserById(userId, { ban_duration: 'none' });
      } catch (err) {
        console.error('[AdminService] Supabase unban failed (non-blocking):', err.message);
      }

      return updated;
    });
  }

  /**
   * Admin edits user details (only when requested by the user via support ticket).
   */
  static async editUserDetails(userId, updates, adminId) {
    const { name, email, phone } = updates;

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;

      const updated = await tx.user.update({
        where: { id: userId },
        data: updateData,
        select: { id: true, name: true, email: true, phone: true, role: true, status: true },
      });

      // Sync email changes to Supabase auth
      if (email) {
        try {
          await supabase.auth.admin.updateUserById(userId, { email });
        } catch (err) {
          console.error('[AdminService] Supabase email update failed:', err.message);
        }
      }

      await tx.userActivity.create({
        data: {
          userId,
          action: 'PROFILE_EDITED_BY_ADMIN',
          metadata: { editedBy: adminId, changes: updateData },
        },
      });

      return updated;
    });
  }

  // ─── Platform Stats ───────────────────────────────────────

  /**
   * Aggregates platform-wide KPIs for the admin dashboard.
   * Leverages parallel queries for maximum throughput.
   */
  static async getPlatformStats() {
    const [
      userCounts,
      gigCounts,
      disputeStats,
      ticketStats,
      revenueStats,
      recentUsers,
    ] = await Promise.all([
      prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
      prisma.gig.groupBy({ by: ['status'], _count: { id: true } }),
      Promise.all([
        prisma.dispute.count(),
        prisma.dispute.count({ where: { status: 'OPEN' } }),
      ]),
      Promise.all([
        prisma.supportTicket.count(),
        prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      ]),
      prisma.transaction.aggregate({
        where: { type: 'DEPOSIT_TO_ESCROW', status: { in: ['SUCCESS', 'RELEASED'] } },
        _sum: { amount: true },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
    ]);

    const userMap = {};
    userCounts.forEach(u => { userMap[u.role] = u._count.id; });

    const gigMap = {};
    gigCounts.forEach(g => { gigMap[g.status] = g._count.id; });

    return {
      users: {
        totalWorkers: userMap['WORKER'] || 0,
        totalEmployers: userMap['EMPLOYER'] || 0,
        totalAdmins: userMap['ADMIN'] || 0,
        total: Object.values(userMap).reduce((a, b) => a + b, 0),
      },
      gigs: {
        open: gigMap['OPEN'] || 0,
        assigned: gigMap['ASSIGNED'] || 0,
        completed: gigMap['COMPLETED'] || 0,
        cancelled: gigMap['CANCELLED'] || 0,
        total: Object.values(gigMap).reduce((a, b) => a + b, 0),
      },
      disputes: { total: disputeStats[0], open: disputeStats[1] },
      supportTickets: { total: ticketStats[0], open: ticketStats[1] },
      revenue: { totalGMV: revenueStats._sum.amount || 0 },
      recentUsers,
    };
  }

  // ─── Activity Logging Helper ──────────────────────────────

  /**
   * Logs a user activity event. Called from controllers/services.
   */
  static async logActivity(userId, action, metadata = null, ipAddress = null) {
    try {
      await prisma.userActivity.create({
        data: { userId, action, metadata, ipAddress },
      });
    } catch (err) {
      console.error('[AdminService] Activity log failed (non-blocking):', err.message);
    }
  }
}
