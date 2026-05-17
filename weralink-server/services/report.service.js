import prisma from '../config/prisma.js';

/**
 * ReportService
 * Provides pre-formatted data for client-side PDF report generation.
 * 
 * Architecture:
 * - Heavy reports (financial, platform) are also stored in Supabase Storage
 * - Light reports (performance cards, skills certs) are client-side only
 * - Date range filtering with sanitized inputs
 */
export class ReportService {

  // ─── Worker Reports ─────────────────────────────────────────

  /** W1: Earnings Statement */
  static async getWorkerEarningsData(workerId, { startDate, endDate } = {}) {
    const dateFilter = ReportService._buildDateFilter(startDate, endDate, 'completedAt');

    const [worker, transactions, aggregate] = await Promise.all([
      prisma.user.findUnique({
        where: { id: workerId },
        select: { name: true, email: true, phone: true }
      }),
      prisma.transaction.findMany({
        where: {
          assignment: { workerId },
          type: 'PAYOUT_TO_WORKER',
          status: 'SUCCESS',
          ...dateFilter,
        },
        orderBy: { completedAt: 'desc' },
        include: {
          assignment: {
            select: {
              gig: { select: { title: true, category: true, payAmount: true, currency: true, employer: { select: { name: true } } } },
            },
          },
        },
      }),
      prisma.transaction.aggregate({
        where: {
          assignment: { workerId },
          type: 'PAYOUT_TO_WORKER',
          status: 'SUCCESS',
          ...dateFilter,
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    return {
      reportType: 'EARNINGS',
      period: { startDate, endDate },
      workerInfo: worker ? { name: worker.name, email: worker.email, phone: worker.phone } : null,
      summary: {
        totalEarnings: (aggregate._sum.amount || 0),
        totalPayouts: aggregate._count.id,
        currency: 'KES',
      },
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        date: t.completedAt,
        mpesaRef: t.mpesaRef,
        receiptNumber: t.receiptNumber,
        gigTitle: t.assignment.gig.title,
        category: t.assignment.gig.category,
        employerName: t.assignment.gig.employer.name,
      })),
    };
  }

  /** W2: Gig Completion History */
  static async getWorkerCompletionHistory(workerId, { startDate, endDate } = {}) {
    const dateFilter = ReportService._buildDateFilter(startDate, endDate, 'paidAt');

    const [worker, assignments] = await Promise.all([
      prisma.user.findUnique({
        where: { id: workerId },
        select: { name: true, email: true, phone: true }
      }),
      prisma.assignment.findMany({
        where: {
          workerId,
          status: 'PAID',
          ...dateFilter,
        },
        orderBy: { paidAt: 'desc' },
        include: {
          gig: {
            select: { title: true, category: true, payAmount: true, currency: true, employer: { select: { name: true } } },
          },
          ratings: {
            where: { rateeId: workerId },
            select: { score: true, dimensions: true, comment: true },
          },
          evidence: {
            select: { evidenceType: true, requirementTag: true },
          },
        },
      })
    ]);

    return {
      reportType: 'HISTORY',
      period: { startDate, endDate },
      workerInfo: worker ? { name: worker.name, email: worker.email, phone: worker.phone } : null,
      totalCompleted: assignments.length,
      assignments: assignments.map(a => ({
        id: a.id,
        gigTitle: a.gig.title,
        category: a.gig.category,
        payAmount: Number(a.gig.payAmount),
        currency: a.gig.currency,
        employerName: a.gig.employer.name,
        acceptedAt: a.acceptedAt,
        submittedAt: a.submittedAt,
        paidAt: a.paidAt,
        rating: a.ratings[0] || null,
        evidenceCount: a.evidence.length,
      })),
    };
  }

  /** W3: Performance Report Card */
  static async getWorkerPerformanceData(workerId) {
    const [
      worker,
      ratingsSummary,
      completionRate,
      totalAssignments,
      badges,
      skills,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: workerId },
        select: { name: true, email: true, phone: true }
      }),
      prisma.rating.aggregate({
        where: { rateeId: workerId },
        _avg: { score: true },
        _count: { id: true },
      }),
      prisma.assignment.count({ where: { workerId, status: 'PAID' } }),
      prisma.assignment.count({ where: { workerId } }),
      prisma.userBadge.findMany({
        where: { userId: workerId },
        include: { badge: true },
      }),
      prisma.userSkill.findMany({
        where: { userId: workerId },
        include: { skill: true },
      }),
    ]);

    return {
      reportType: 'PERFORMANCE',
      workerInfo: worker ? { name: worker.name, email: worker.email, phone: worker.phone } : null,
      avgRating: ratingsSummary._avg.score ? Math.round(ratingsSummary._avg.score * 10) / 10 : null,
      totalRatings: ratingsSummary._count.id,
      gigsCompleted: completionRate,
      totalAssignments,
      completionRate: totalAssignments > 0 ? Math.round(completionRate / totalAssignments * 100) : 0,
      badges: badges.map(b => ({ name: b.badge.name, description: b.badge.description, awardedAt: b.awardedAt })),
      skills: skills.map(s => ({ name: s.skill.name, category: s.skill.category, level: s.level, verified: s.verified })),
    };
  }

  /** W4: Skills & Training Certificate */
  static async getWorkerSkillsData(workerId) {
    const user = await prisma.user.findUnique({
      where: { id: workerId },
      include: {
        profile: true,
        skills: { include: { skill: true } },
        badges: { include: { badge: true } },
        completions: { include: { module: true } }
      }
    });

    if (!user) throw new Error("Worker not found");

    return {
      reportType: 'SKILLS_CERTIFICATE',
      workerInfo: {
        name: user.name,
        joinedAt: user.createdAt,
        verified: user.profile?.verified || false
      },
      skills: user.skills.map(s => ({
        name: s.skill.name,
        category: s.skill.category,
        level: s.level,
        verified: s.verified,
        verifiedAt: s.verifiedAt
      })),
      badges: user.badges.map(b => ({
        name: b.badge.name,
        description: b.badge.description,
        awardedAt: b.awardedAt
      })),
      training: user.completions.map(c => ({
        moduleTitle: c.module.title,
        completedAt: c.completedAt,
        score: c.score,
        passed: c.passed
      }))
    };
  }

  // ─── Employer Reports ───────────────────────────────────────

  /** E1: Spending Summary */
  static async getEmployerSpendingData(employerId, { startDate, endDate } = {}) {
    const dateFilter = ReportService._buildDateFilter(startDate, endDate, 'completedAt');

    const [employer, transactions, aggregate] = await Promise.all([
      prisma.user.findUnique({
        where: { id: employerId },
        select: { name: true, email: true, phone: true, profile: { select: { companyName: true } } }
      }),
      prisma.transaction.findMany({
        where: {
          assignment: { gig: { employerId } },
          type: 'DEPOSIT_TO_ESCROW',
          status: { in: ['SUCCESS', 'RELEASED'] },
          ...dateFilter,
        },
        orderBy: { completedAt: 'desc' },
        include: {
          assignment: {
            select: {
              worker: { select: { name: true } },
              gig: { select: { title: true, category: true, payAmount: true } },
            },
          },
        },
      }),
      prisma.transaction.aggregate({
        where: {
          assignment: { gig: { employerId } },
          type: 'DEPOSIT_TO_ESCROW',
          status: { in: ['SUCCESS', 'RELEASED'] },
          ...dateFilter,
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    return {
      reportType: 'SPENDING',
      period: { startDate, endDate },
      employerInfo: employer ? { name: employer.name, email: employer.email, phone: employer.phone, companyName: employer.profile?.companyName } : null,
      summary: {
        totalSpending: (aggregate._sum.amount || 0),
        totalTransactions: aggregate._count.id,
      },
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        date: t.completedAt,
        mpesaRef: t.mpesaRef,
        receiptNumber: t.receiptNumber,
        gigTitle: t.assignment.gig.title,
        category: t.assignment.gig.category,
        workerName: t.assignment.worker.name,
      })),
    };
  }

  /** E2: Gig Activity Report */
  static async getEmployerGigActivity(employerId, { startDate, endDate } = {}) {
    const dateFilter = ReportService._buildDateFilter(startDate, endDate, 'createdAt');

    const [employer, gigs] = await Promise.all([
      prisma.user.findUnique({
        where: { id: employerId },
        select: { name: true, email: true, phone: true, profile: { select: { companyName: true } } }
      }),
      prisma.gig.findMany({
        where: { employerId, ...dateFilter },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { assignments: true } },
          assignments: {
            select: { status: true, paidAt: true, acceptedAt: true },
          },
        },
      })
    ]);

    return {
      reportType: 'GIG_ACTIVITY',
      period: { startDate, endDate },
      employerInfo: employer ? { name: employer.name, email: employer.email, phone: employer.phone, companyName: employer.profile?.companyName } : null,
      totalGigs: gigs.length,
      gigs: gigs.map(g => {
        const statusCounts = {};
        g.assignments.forEach(a => {
          statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
        });

        return {
          id: g.id,
          title: g.title,
          category: g.category,
          status: g.status,
          payAmount: Number(g.payAmount),
          createdAt: g.createdAt,
          totalApplicants: g._count.assignments,
          assignmentStatuses: statusCounts,
        };
      }),
    };
  }

  /** E3: Worker Performance Review */
  static async getWorkerPerformanceReview(employerId, workerId) {
    const [employer, assignments, totalRevisions, worker] = await Promise.all([
      prisma.user.findUnique({
        where: { id: employerId },
        select: { name: true, email: true, phone: true, profile: { select: { companyName: true } } }
      }),
      prisma.assignment.findMany({
        where: {
          workerId,
          gig: { employerId },
          status: 'PAID'
        },
        include: {
          gig: { select: { title: true, category: true, payAmount: true } },
          ratings: { where: { raterId: employerId }, select: { score: true, dimensions: true, comment: true } }
        },
        orderBy: { paidAt: 'desc' }
      }),
      prisma.assignment.count({
        where: {
          workerId,
          gig: { employerId },
          status: 'REVISION_REQUESTED'
        }
      }),
      prisma.user.findUnique({
        where: { id: workerId },
        select: { name: true }
      })
    ]);

    return {
      reportType: 'WORKER_REVIEW',
      workerName: worker?.name || 'Unknown Worker',
      employerInfo: employer ? { name: employer.name, email: employer.email, phone: employer.phone, companyName: employer.profile?.companyName } : null,
      totalGigs: assignments.length,
      totalSpend: assignments.reduce((acc, a) => acc + Number(a.gig.payAmount), 0),
      totalRevisions,
      reliabilityScore: assignments.length > 0 ? Math.round((assignments.length / (assignments.length + totalRevisions)) * 100) : 0,
      history: assignments.map(a => ({
        id: a.id,
        gigTitle: a.gig.title,
        category: a.gig.category,
        payAmount: Number(a.gig.payAmount),
        paidAt: a.paidAt,
        rating: a.ratings[0] || null
      }))
    };
  }

  /** E4: Payment Ledger */
  static async getEmployerPaymentLedger(employerId, { startDate, endDate } = {}) {
    const dateFilter = ReportService._buildDateFilter(startDate, endDate, 'initiatedAt');

    const [employer, transactions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: employerId },
        select: { name: true, email: true, phone: true, profile: { select: { companyName: true } } }
      }),
      prisma.transaction.findMany({
        where: {
          assignment: { gig: { employerId } },
          ...dateFilter,
        },
        orderBy: { initiatedAt: 'desc' },
        include: {
          assignment: {
            select: {
              worker: { select: { name: true } },
              gig: { select: { title: true } },
            },
          },
        },
      })
    ]);

    return {
      reportType: 'PAYMENT_LEDGER',
      period: { startDate, endDate },
      employerInfo: employer ? { name: employer.name, email: employer.email, phone: employer.phone, companyName: employer.profile?.companyName } : null,
      totalTransactions: transactions.length,
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        status: t.status,
        amount: t.amount,
        currency: t.currency,
        mpesaRef: t.mpesaRef,
        receiptNumber: t.receiptNumber,
        initiatedAt: t.initiatedAt,
        completedAt: t.completedAt,
        gigTitle: t.assignment.gig.title,
        workerName: t.assignment.worker.name,
      })),
    };
  }

  /** E5: Hiring Efficiency Report */
  static async getHiringEfficiency(employerId, { startDate, endDate } = {}) {
    const dateFilter = ReportService._buildDateFilter(startDate, endDate, 'createdAt');

    const [employer, gigs] = await Promise.all([
      prisma.user.findUnique({
        where: { id: employerId },
        select: { name: true, email: true, phone: true, profile: { select: { companyName: true } } }
      }),
      prisma.gig.findMany({
        where: { employerId, ...dateFilter },
        include: {
          _count: { select: { assignments: true } },
          assignments: {
            where: { status: { in: ['ACCEPTED', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'PAID'] } },
            select: { offeredAt: true, acceptedAt: true, workerId: true }
          }
        }
      })
    ]);

    let totalApplicants = 0;
    let totalHires = 0;
    let timeToHireSum = 0;
    let timeToHireCount = 0;
    const categoryStats = {};

    gigs.forEach(g => {
      totalApplicants += g._count.assignments;
      const hired = g.assignments.length;
      totalHires += hired;
      
      if (!categoryStats[g.category]) {
        categoryStats[g.category] = { gigs: 0, hires: 0 };
      }
      categoryStats[g.category].gigs++;
      categoryStats[g.category].hires += hired;

      g.assignments.forEach(a => {
        if (a.offeredAt && a.acceptedAt) {
          const diffMs = a.acceptedAt.getTime() - a.offeredAt.getTime();
          timeToHireSum += diffMs;
          timeToHireCount++;
        }
      });
    });

    const avgTimeToHireHours = timeToHireCount > 0 ? (timeToHireSum / timeToHireCount) / (1000 * 60 * 60) : 0;
    const hireRatio = gigs.length > 0 ? (totalHires / gigs.length).toFixed(1) : 0;

    return {
      reportType: 'HIRING_EFFICIENCY',
      period: { startDate, endDate },
      employerInfo: employer ? { name: employer.name, email: employer.email, phone: employer.phone, companyName: employer.profile?.companyName } : null,
      totalGigs: gigs.length,
      totalApplicants,
      totalHires,
      avgApplicantsPerGig: gigs.length > 0 ? Math.round(totalApplicants / gigs.length) : 0,
      hireRatio: `${hireRatio} hires/gig`,
      avgTimeToHireHours: Math.round(avgTimeToHireHours),
      topCategories: Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        gigs: stats.gigs,
        hires: stats.hires
      })).sort((a, b) => b.hires - a.hires)
    };
  }

  // ─── Admin Reports ──────────────────────────────────────────

  /** A1: Platform Activity Report */
  static async getAdminPlatformActivity({ startDate, endDate } = {}) {
    const dateFilter = ReportService._buildDateFilter(startDate, endDate, 'createdAt');

    const [userCounts, gigCounts, transactionStats, ratingStats] = await Promise.all([
      Promise.all([
        prisma.user.count({ where: { role: 'WORKER', ...dateFilter } }),
        prisma.user.count({ where: { role: 'EMPLOYER', ...dateFilter } }),
        prisma.user.count(),
      ]),
      Promise.all([
        prisma.gig.count({ where: dateFilter }),
        prisma.gig.count({ where: { status: 'COMPLETED', ...dateFilter } }),
        prisma.gig.count(),
      ]),
      prisma.transaction.aggregate({
        where: { status: { in: ['SUCCESS', 'RELEASED'] }, ...ReportService._buildDateFilter(startDate, endDate, 'completedAt') },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.rating.aggregate({
        where: dateFilter,
        _avg: { score: true },
        _count: { id: true },
      }),
    ]);

    return {
      reportType: 'PLATFORM_ACTIVITY',
      period: { startDate, endDate },
      users: { newWorkers: userCounts[0], newEmployers: userCounts[1], totalUsers: userCounts[2] },
      gigs: { newGigs: gigCounts[0], completed: gigCounts[1], totalGigs: gigCounts[2] },
      transactions: {
        gmv: (transactionStats._sum.amount || 0),
        count: transactionStats._count.id,
      },
      ratings: {
        avgScore: ratingStats._avg.score ? Math.round(ratingStats._avg.score * 10) / 10 : null,
        count: ratingStats._count.id,
      },
    };
  }

  /** A2: Financial Reconciliation */
  static async getAdminFinancialRecon({ startDate, endDate } = {}) {
    const dateFilter = ReportService._buildDateFilter(startDate, endDate, 'initiatedAt');

    const transactions = await prisma.transaction.findMany({
      where: dateFilter,
      orderBy: { initiatedAt: 'desc' },
      include: {
        assignment: {
          select: {
            worker: { select: { name: true } },
            gig: { select: { title: true, employer: { select: { name: true } } } },
          },
        },
      },
    });

    // Summary by type and status
    const summary = {};
    transactions.forEach(t => {
      const key = `${t.type}_${t.status}`;
      if (!summary[key]) summary[key] = { type: t.type, status: t.status, count: 0, total: 0 };
      summary[key].count++;
      summary[key].total += t.amount;
    });

    return {
      reportType: 'FINANCIAL_RECON',
      period: { startDate, endDate },
      summary: Object.values(summary),
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        status: t.status,
        amount: t.amount,
        currency: t.currency,
        mpesaRef: t.mpesaRef,
        receiptNumber: t.receiptNumber,
        initiatedAt: t.initiatedAt,
        completedAt: t.completedAt,
        gigTitle: t.assignment.gig.title,
        employerName: t.assignment.gig.employer.name,
        workerName: t.assignment.worker.name,
      })),
    };
  }

  /** A3: User & Trust Report */
  static async getAdminUserTrust({ startDate, endDate } = {}) {
    const dateFilter = ReportService._buildDateFilter(startDate, endDate, 'createdAt');

    const [disputes, userGrowth, ratingsSummary] = await Promise.all([
      prisma.dispute.findMany({
        where: dateFilter,
        include: {
          assignment: { select: { gig: { select: { title: true } } } },
          raisedBy: { select: { name: true, role: true } }
        }
      }),
      prisma.user.groupBy({
        by: ['role'],
        where: dateFilter,
        _count: { id: true }
      }),
      prisma.rating.aggregate({
        where: dateFilter,
        _avg: { score: true },
        _count: { id: true }
      })
    ]);

    const resolvedDisputes = disputes.filter(d => d.status.startsWith('RESOLVED'));
    
    let avgResolutionTime = 0;
    let resolvedCount = 0;
    resolvedDisputes.forEach(d => {
      if (d.createdAt && d.resolvedAt) {
        avgResolutionTime += (d.resolvedAt.getTime() - d.createdAt.getTime());
        resolvedCount++;
      }
    });

    return {
      reportType: 'USER_TRUST',
      period: { startDate, endDate },
      trustMetrics: {
        avgPlatformRating: ratingsSummary._avg.score ? Math.round(ratingsSummary._avg.score * 10) / 10 : null,
        totalRatings: ratingsSummary._count.id,
      },
      userGrowth: userGrowth.reduce((acc, curr) => {
        acc[curr.role] = curr._count.id;
        return acc;
      }, {}),
      disputeStats: {
        total: disputes.length,
        resolved: resolvedDisputes.length,
        resolutionRate: disputes.length > 0 ? Math.round((resolvedDisputes.length / disputes.length) * 100) : 0,
        avgResolutionHours: resolvedCount > 0 ? Math.round(avgResolutionTime / resolvedCount / (1000 * 60 * 60)) : 0
      },
      recentDisputes: disputes.slice(0, 10).map(d => ({
        id: d.id,
        gigTitle: d.assignment.gig.title,
        raisedBy: d.raisedBy.name,
        role: d.raisedBy.role,
        reason: d.reason,
        status: d.status,
        date: d.createdAt
      }))
    };
  }

  // ─── Gig Completion Reports ─────────────────────────────────

  /**
   * W5: Worker Gig Completion Report
   * Detailed single-gig performance report for the worker.
   */
  static async getWorkerGigCompletionReport(assignmentId, workerId) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        gig: {
          select: {
            id: true, title: true, category: true, description: true,
            payAmount: true, currency: true, workType: true, difficulty: true,
            createdAt: true, expiresAt: true,
            employer: { select: { id: true, name: true, profile: { select: { companyName: true, companyLogo: true } } } },
          },
        },
        worker: { select: { id: true, name: true } },
        evidence: {
          select: { id: true, evidenceType: true, requirementTag: true, submittedAt: true, validated: true, validatorNotes: true },
        },
        ratings: {
          where: { rateeId: workerId },
          select: { score: true, dimensions: true, comment: true, createdAt: true, rater: { select: { name: true } } },
        },
        transactions: {
          where: { type: 'PAYOUT_TO_WORKER', status: 'SUCCESS' },
          select: { amount: true, completedAt: true, receiptNumber: true },
        },
        dispute: { select: { id: true, status: true, reason: true, resolution: true } },
      },
    });

    if (!assignment) throw new Error('Assignment not found');
    if (assignment.workerId !== workerId) throw new Error('Access denied');

    // Calculate performance metrics
    const timeline = {
      offered: assignment.offeredAt,
      accepted: assignment.acceptedAt,
      submitted: assignment.submittedAt,
      approved: assignment.approvedAt,
      paid: assignment.paidAt,
    };

    const timeToAccept = timeline.accepted && timeline.offered
      ? Math.round((new Date(timeline.accepted) - new Date(timeline.offered)) / (1000 * 60 * 60))
      : null;
    
    const timeToComplete = timeline.submitted && timeline.accepted
      ? Math.round((new Date(timeline.submitted) - new Date(timeline.accepted)) / (1000 * 60 * 60))
      : null;

    const deadlineMet = assignment.deadlineAt && timeline.submitted
      ? new Date(timeline.submitted) <= new Date(assignment.deadlineAt)
      : null;

    const hadRevisions = assignment.revisionNotes !== null;

    return {
      reportType: 'GIG_COMPLETION',
      gig: {
        title: assignment.gig.title,
        category: assignment.gig.category,
        description: assignment.gig.description,
        payAmount: Number(assignment.gig.payAmount),
        currency: assignment.gig.currency,
        difficulty: assignment.gig.difficulty,
        workType: assignment.gig.workType,
        employer: {
          name: assignment.gig.employer.name,
          companyName: assignment.gig.employer.profile?.companyName,
          companyLogo: assignment.gig.employer.profile?.companyLogo,
        },
      },
      worker: {
        name: assignment.worker.name,
      },
      timeline,
      metrics: {
        timeToAcceptHours: timeToAccept,
        timeToCompleteHours: timeToComplete,
        deadlineMet,
        hadRevisions,
        revisionNotes: assignment.revisionNotes,
        completionNotes: assignment.completionNotes,
      },
      evidence: assignment.evidence,
      rating: assignment.ratings[0] || null,
      payment: assignment.transactions[0] || null,
      dispute: assignment.dispute || null,
    };
  }

  /**
   * E6: Employer Assignment Review Report
   * Detailed report of a worker's interaction with a gig after assignment completion.
   */
  static async getEmployerAssignmentReport(assignmentId, employerId) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        gig: {
          select: {
            id: true, title: true, category: true, payAmount: true, currency: true,
            difficulty: true, employerId: true, createdAt: true,
          },
        },
        worker: {
          select: {
            id: true, name: true, email: true, phone: true,
            profile: { select: { bio: true, location: true, verified: true } },
            skills: { include: { skill: { select: { name: true, category: true } } }, take: 10 },
            ratingsRecv: { select: { score: true }, take: 50 },
            _count: { select: { assignments: true } },
          },
        },
        evidence: {
          select: { id: true, evidenceType: true, requirementTag: true, submittedAt: true, validated: true, validatorNotes: true, fileUrl: true },
        },
        ratings: {
          select: { score: true, dimensions: true, comment: true, createdAt: true, rater: { select: { name: true } } },
        },
        transactions: {
          select: { type: true, status: true, amount: true, completedAt: true, receiptNumber: true },
        },
        dispute: { select: { id: true, status: true, reason: true, resolution: true } },
      },
    });

    if (!assignment) throw new Error('Assignment not found');
    if (assignment.gig.employerId !== employerId) throw new Error('Access denied');

    // Worker performance summary
    const workerRatings = assignment.worker.ratingsRecv || [];
    const avgWorkerRating = workerRatings.length > 0
      ? Math.round(workerRatings.reduce((sum, r) => sum + r.score, 0) / workerRatings.length * 10) / 10
      : null;

    const timeline = {
      offered: assignment.offeredAt,
      accepted: assignment.acceptedAt,
      submitted: assignment.submittedAt,
      approved: assignment.approvedAt,
      paid: assignment.paidAt,
    };

    const timeToAccept = timeline.accepted && timeline.offered
      ? Math.round((new Date(timeline.accepted) - new Date(timeline.offered)) / (1000 * 60 * 60))
      : null;
    
    const timeToComplete = timeline.submitted && timeline.accepted
      ? Math.round((new Date(timeline.submitted) - new Date(timeline.accepted)) / (1000 * 60 * 60))
      : null;

    const deadlineMet = assignment.deadlineAt && timeline.submitted
      ? new Date(timeline.submitted) <= new Date(assignment.deadlineAt)
      : null;

    const payoutTx = assignment.transactions.find(t => t.type === 'PAYOUT_TO_WORKER' && t.status === 'SUCCESS');

    return {
      reportType: 'EMPLOYER_ASSIGNMENT_REVIEW',
      gig: {
        title: assignment.gig.title,
        category: assignment.gig.category,
        payAmount: Number(assignment.gig.payAmount),
        currency: assignment.gig.currency,
        difficulty: assignment.gig.difficulty,
      },
      workerProfile: {
        name: assignment.worker.name,
        email: assignment.worker.email,
        phone: assignment.worker.phone,
        bio: assignment.worker.profile?.bio,
        location: assignment.worker.profile?.location,
        verified: assignment.worker.profile?.verified,
        skills: assignment.worker.skills.map(s => ({ name: s.skill.name, category: s.skill.category, level: s.level })),
        avgRating: avgWorkerRating,
        totalRatings: workerRatings.length,
        totalAssignments: assignment.worker._count.assignments,
      },
      timeline,
      metrics: {
        timeToAcceptHours: timeToAccept,
        timeToCompleteHours: timeToComplete,
        deadlineMet,
        hadRevisions: assignment.revisionNotes !== null,
        revisionNotes: assignment.revisionNotes,
        completionNotes: assignment.completionNotes,
      },
      evidence: assignment.evidence,
      ratings: assignment.ratings,
      transactions: assignment.transactions,
      payment: payoutTx || null,
      dispute: assignment.dispute || null,
    };
  }

  // ─── Helpers ────────────────────────────────────────────────

  static _buildDateFilter(startDate, endDate, field) {
    const filter = {};
    if (startDate || endDate) {
      filter[field] = {};
      if (startDate) filter[field].gte = new Date(startDate);
      if (endDate) filter[field].lte = new Date(endDate);
    }
    return filter;
  }
}
