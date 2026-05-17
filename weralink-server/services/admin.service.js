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
  static async listUsers({ page = 1, limit = 20, search, role, status, sortBy = 'createdAt', order = 'desc', startDate, endDate } = {}) {
    const where = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }
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
          linkUrl: `/worker/support`,
        },
      });

      // NOTE: We intentionally do NOT ban in Supabase Auth here.
      // Suspended users must still authenticate to access the Support page.
      // Enforcement is handled by requireAuth middleware + frontend ProtectedRoute.

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

  // ─── Gig Management ────────────────────────────────────────

  /**
   * Lists all gigs on the platform with pagination and filters.
   */
  static async listGigs({
    page = 1,
    limit = 20,
    search,
    status,
    difficulty,
    category,
    employerId,
    workerId,
    startDate,
    endDate,
    sortBy = 'createdAt',
    order = 'desc',
  } = {}) {
    const where = {};

    if (status) where.status = status;
    if (difficulty) where.difficulty = difficulty;
    if (category) where.category = category;
    if (employerId) where.employerId = employerId;
    if (workerId) {
      where.assignments = {
        some: { workerId },
      };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [gigs, total] = await Promise.all([
      prisma.gig.findMany({
        where,
        include: {
          employer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profile: {
                select: {
                  companyName: true,
                  companyLogo: true,
                },
              },
            },
          },
          _count: { select: { assignments: true } },
        },
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.gig.count({ where }),
    ]);

    return {
      gigs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Retrieves full details of a specific gig, including all assignments, evidence, and transactions.
   */
  static async getGigDetail(gigId) {
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profile: true,
          },
        },
        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
        assignments: {
          include: {
            worker: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            evidence: true,
            transactions: true,
            ratings: true,
            dispute: true,
          },
        },
        _count: {
          select: { assignments: true },
        },
      },
    });

    return gig;
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

  // ─── LMS & Learning Hub Management ────────────────────────

  /**
   * Lists all training modules with pagination and extensive filters.
   */
  static async listLmsModules({
    page = 1,
    limit = 20,
    search,
    category,
    skillId,
    isActive,
    startDate,
    endDate,
    sortBy = 'createdAt',
    order = 'desc',
  } = {}) {
    const where = {};

    if (skillId) where.skillId = skillId;
    if (category) {
      where.skill = {
        category: category,
      };
    }
    if (isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true' || isActive === true;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [modules, total] = await Promise.all([
      prisma.trainingModule.findMany({
        where,
        include: {
          skill: {
            select: { id: true, name: true, category: true },
          },
          _count: {
            select: { questions: true, completions: true },
          },
        },
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.trainingModule.count({ where }),
    ]);

    // Gather completions stats per module in parallel
    const modulesWithStats = await Promise.all(
      modules.map(async (mod) => {
        const completionsStats = await prisma.moduleCompletion.aggregate({
          where: { moduleId: mod.id },
          _avg: { score: true },
        });

        const passedCount = await prisma.moduleCompletion.count({
          where: { moduleId: mod.id, passed: true },
        });

        return {
          ...mod,
          stats: {
            totalCompletions: mod._count.completions,
            passedCompletions: passedCount,
            avgScore: completionsStats._avg.score || 0,
            passRate: mod._count.completions > 0 ? (passedCount / mod._count.completions) * 100 : 0,
          },
        };
      })
    );

    return {
      modules: modulesWithStats,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Retrieves full details for a single training module.
   */
  static async getLmsModuleDetail(id) {
    const module = await prisma.trainingModule.findUnique({
      where: { id },
      include: {
        skill: {
          select: { id: true, name: true, category: true },
        },
        questions: {
          include: {
            options: {
              select: { id: true, text: true, isCorrect: true },
            },
          },
        },
        completions: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { completedAt: 'desc' },
        },
      },
    });

    if (!module) return null;

    // Gather aggregate stats
    const completionsStats = await prisma.moduleCompletion.aggregate({
      where: { moduleId: id },
      _avg: { score: true },
    });

    const totalCompletions = module.completions.length;
    const passedCount = module.completions.filter((c) => c.passed).length;

    return {
      ...module,
      stats: {
        totalCompletions,
        passedCompletions: passedCount,
        avgScore: completionsStats._avg.score || 0,
        passRate: totalCompletions > 0 ? (passedCount / totalCompletions) * 100 : 0,
      },
    };
  }

  /**
   * Creates a new training module atomically inside a transaction.
   */
  static async createLmsModule(data, adminId) {
    const { title, skillId, videoUrl, docUrl, passScore, isActive, questions } = data;

    return await prisma.$transaction(async (tx) => {
      // 1. Create Training Module
      const module = await tx.trainingModule.create({
        data: {
          title,
          skillId,
          videoUrl,
          docUrl,
          passScore: passScore !== undefined ? parseInt(passScore) : 80,
          isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
        },
      });

      // 2. Create questions and options if provided
      if (questions && Array.isArray(questions) && questions.length > 0) {
        for (const q of questions) {
          const question = await tx.question.create({
            data: {
              moduleId: module.id,
              text: q.text,
            },
          });

          if (q.options && Array.isArray(q.options) && q.options.length > 0) {
            await tx.option.createMany({
              data: q.options.map((opt) => ({
                questionId: question.id,
                text: opt.text,
                isCorrect: opt.isCorrect === true || opt.isCorrect === 'true',
              })),
            });
          }
        }
      }

      // Log admin activity
      await tx.userActivity.create({
        data: {
          userId: adminId,
          action: 'LMS_MODULE_CREATED',
          metadata: { moduleId: module.id, title: module.title },
        },
      });

      return module;
    });
  }

  /**
   * Updates an existing training module atomically inside a transaction.
   */
  static async updateLmsModule(id, data, adminId) {
    const { title, skillId, videoUrl, docUrl, passScore, isActive, questions } = data;

    return await prisma.$transaction(async (tx) => {
      // Check if module exists
      const existing = await tx.trainingModule.findUnique({ where: { id } });
      if (!existing) throw new Error('Training module not found');

      // 1. Update Training Module fields
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (skillId !== undefined) updateData.skillId = skillId;
      if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
      if (docUrl !== undefined) updateData.docUrl = docUrl;
      if (passScore !== undefined) updateData.passScore = parseInt(passScore);
      if (isActive !== undefined) updateData.isActive = (isActive === 'true' || isActive === true);

      const module = await tx.trainingModule.update({
        where: { id },
        data: updateData,
      });

      // 2. Re-create questions and options if provided
      if (questions && Array.isArray(questions)) {
        // Cascade delete existing questions (Prisma onDelete: Cascade will take care of options!)
        await tx.question.deleteMany({
          where: { moduleId: id },
        });

        // Insert new ones
        for (const q of questions) {
          const question = await tx.question.create({
            data: {
              moduleId: id,
              text: q.text,
            },
          });

          if (q.options && Array.isArray(q.options) && q.options.length > 0) {
            await tx.option.createMany({
              data: q.options.map((opt) => ({
                questionId: question.id,
                text: opt.text,
                isCorrect: opt.isCorrect === true || opt.isCorrect === 'true',
              })),
            });
          }
        }
      }

      // Log admin activity
      await tx.userActivity.create({
        data: {
          userId: adminId,
          action: 'LMS_MODULE_UPDATED',
          metadata: { moduleId: id, title: module.title },
        },
      });

      return module;
    });
  }

  /**
   * Cascade deletes a training module.
   */
  static async deleteLmsModule(id, adminId) {
    return await prisma.$transaction(async (tx) => {
      const module = await tx.trainingModule.findUnique({ where: { id } });
      if (!module) throw new Error('Training module not found');

      await tx.trainingModule.delete({ where: { id } });

      // Log admin activity
      await tx.userActivity.create({
        data: {
          userId: adminId,
          action: 'LMS_MODULE_DELETED',
          metadata: { moduleId: id, title: module.title },
        },
      });

      return { success: true };
    });
  }

  /**
   * Lists all platform skills for LMS skill selection dropdowns.
   */
  static async listAllSkills() {
    return await prisma.skill.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
