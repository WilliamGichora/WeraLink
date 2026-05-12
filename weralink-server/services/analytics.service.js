import prisma from '../config/prisma.js';

/**
 * AnalyticsService
 * Aggregates performance data for Workers, Employers, and Platform Admin.
 * 
 * Performance Strategy:
 * - Uses Prisma aggregate/groupBy (single SQL queries, no N+1)
 * - All methods return pre-computed, chart-ready data structures
 * - Parallel Promise.all for independent aggregations
 * - Date-filtered by default to limit scan range
 */
export class AnalyticsService {

  // ─── Worker Analytics ───────────────────────────────────────

  /**
   * Aggregate all worker metrics in a single call.
   * Parallelizes independent queries for maximum throughput.
   */
  static async getWorkerAnalytics(workerId, { months = 6 } = {}) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const [
      earningsAggregate,
      earningsTrend,
      assignmentStats,
      statusDistribution,
      ratingAggregate,
      categoryBreakdown,
      recentAssignments,
    ] = await Promise.all([
      // Total Earnings (all-time + period)
      Promise.all([
        prisma.transaction.aggregate({
          where: { assignment: { workerId }, type: 'PAYOUT_TO_WORKER', status: 'SUCCESS' },
          _sum: { amount: true },
          _count: { id: true },
        }),
        prisma.transaction.aggregate({
          where: { assignment: { workerId }, type: 'PAYOUT_TO_WORKER', status: 'SUCCESS', completedAt: { gte: since } },
          _sum: { amount: true },
          _count: { id: true },
        }),
      ]),

      // Earnings Trend (monthly)
      AnalyticsService._getMonthlyTrend(
        'transaction',
        { assignment: { workerId }, type: 'PAYOUT_TO_WORKER', status: 'SUCCESS' },
        'completedAt',
        months
      ),

      // Assignment counts
      prisma.assignment.count({ where: { workerId, status: 'PAID' } }),

      // Status distribution
      prisma.assignment.groupBy({
        by: ['status'],
        where: { workerId },
        _count: { id: true },
      }),

      // Rating aggregate
      prisma.rating.aggregate({
        where: { rateeId: workerId },
        _avg: { score: true },
        _count: { id: true },
      }),

      // Category breakdown (completed gigs)
      prisma.assignment.findMany({
        where: { workerId, status: 'PAID' },
        select: { gig: { select: { category: true, payAmount: true } } },
      }),

      // Recent completed
      prisma.assignment.findMany({
        where: { workerId, status: 'PAID' },
        orderBy: { paidAt: 'desc' },
        take: 5,
        select: {
          id: true,
          paidAt: true,
          gig: { select: { title: true, category: true, payAmount: true, currency: true } },
        },
      }),
    ]);

    // Process category breakdown
    const categoryMap = {};
    categoryBreakdown.forEach(a => {
      const cat = a.gig.category;
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, earnings: 0 };
      categoryMap[cat].count++;
      categoryMap[cat].earnings += Number(a.gig.payAmount);
    });

    // Process status distribution
    const statusMap = {};
    statusDistribution.forEach(s => {
      statusMap[s.status] = s._count.id;
    });

    return {
      kpis: {
        totalEarnings: (earningsAggregate[0]._sum.amount || 0), // Already in KES
        periodEarnings: (earningsAggregate[1]._sum.amount || 0),
        totalGigsCompleted: assignmentStats,
        periodGigsCompleted: earningsAggregate[1]._count.id,
        avgRating: ratingAggregate._avg.score ? Math.round(ratingAggregate._avg.score * 10) / 10 : null,
        totalRatings: ratingAggregate._count.id,
      },
      earningsTrend,
      statusDistribution: statusMap,
      categoryBreakdown: Object.entries(categoryMap).map(([category, data]) => ({
        category,
        ...data,
      })),
      recentAssignments,
    };
  }

  // ─── Employer Analytics ─────────────────────────────────────

  static async getEmployerAnalytics(employerId, { months = 6 } = {}) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const [
      spendingAggregate,
      spendingTrend,
      gigStats,
      gigStatusDistribution,
      assignmentStatusDistribution,
      applicantStats,
      workerRatings,
    ] = await Promise.all([
      // Total Spending (all-time + period)
      Promise.all([
        prisma.transaction.aggregate({
          where: { assignment: { gig: { employerId } }, type: 'DEPOSIT_TO_ESCROW', status: { in: ['SUCCESS', 'RELEASED'] } },
          _sum: { amount: true },
          _count: { id: true },
        }),
        prisma.transaction.aggregate({
          where: { assignment: { gig: { employerId } }, type: 'DEPOSIT_TO_ESCROW', status: { in: ['SUCCESS', 'RELEASED'] }, completedAt: { gte: since } },
          _sum: { amount: true },
          _count: { id: true },
        }),
      ]),

      // Spending Trend
      AnalyticsService._getMonthlyTrend(
        'transaction',
        { assignment: { gig: { employerId } }, type: 'DEPOSIT_TO_ESCROW', status: { in: ['SUCCESS', 'RELEASED'] } },
        'completedAt',
        months
      ),

      // Gig counts
      Promise.all([
        prisma.gig.count({ where: { employerId } }),
        prisma.gig.count({ where: { employerId, status: 'COMPLETED' } }),
      ]),

      // Gig status distribution
      prisma.gig.groupBy({
        by: ['status'],
        where: { employerId },
        _count: { id: true },
      }),

      // Assignment status distribution
      prisma.assignment.groupBy({
        by: ['status'],
        where: { gig: { employerId } },
        _count: { id: true },
      }),

      // Applicants per gig average
      prisma.gig.findMany({
        where: { employerId },
        select: {
          id: true,
          title: true,
          category: true,
          _count: { select: { assignments: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Ratings employer has given to workers
      prisma.rating.findMany({
        where: { raterId: employerId },
        select: { score: true },
      }),
    ]);

    // Process distributions
    const gigStatusMap = {};
    gigStatusDistribution.forEach(s => { gigStatusMap[s.status] = s._count.id; });

    const assignmentStatusMap = {};
    assignmentStatusDistribution.forEach(s => { assignmentStatusMap[s.status] = s._count.id; });

    // Average rating given
    const avgRatingGiven = workerRatings.length > 0
      ? Math.round(workerRatings.reduce((sum, r) => sum + r.score, 0) / workerRatings.length * 10) / 10
      : null;

    return {
      kpis: {
        totalSpending: (spendingAggregate[0]._sum.amount || 0),
        periodSpending: (spendingAggregate[1]._sum.amount || 0),
        totalGigsPosted: gigStats[0],
        totalGigsCompleted: gigStats[1],
        avgApplicantsPerGig: applicantStats.length > 0
          ? Math.round(applicantStats.reduce((sum, g) => sum + g._count.assignments, 0) / applicantStats.length * 10) / 10
          : 0,
        avgRatingGiven,
        revisionRate: assignmentStatusMap['REVISION_REQUESTED']
          ? Math.round(assignmentStatusMap['REVISION_REQUESTED'] / Object.values(assignmentStatusMap).reduce((a, b) => a + b, 0) * 100)
          : 0,
      },
      spendingTrend,
      gigStatusDistribution: gigStatusMap,
      assignmentStatusDistribution: assignmentStatusMap,
      applicantStats: applicantStats.map(g => ({
        title: g.title,
        category: g.category,
        applicants: g._count.assignments,
      })),
    };
  }

  // ─── Admin Analytics ────────────────────────────────────────

  static async getAdminAnalytics({ months = 6 } = {}) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const [
      gmvAggregate,
      transactionTrend,
      userCounts,
      userGrowth,
      gigVolume,
      categoryDistribution,
      platformRating,
      escrowBalance,
      disputeStats,
    ] = await Promise.all([
      // Platform GMV (Total money processed through the system)
      // Includes both deposits and direct payouts if any
      prisma.transaction.aggregate({
        where: {
          type: { in: ['DEPOSIT_TO_ESCROW', 'PAYOUT_TO_WORKER'] },
          status: { in: ['SUCCESS', 'RELEASED'] }
        },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Transaction trend
      AnalyticsService._getMonthlyTrend(
        'transaction',
        { status: { in: ['SUCCESS', 'RELEASED'] } },
        'completedAt',
        months
      ),

      // User counts (Verified workers vs All)
      Promise.all([
        prisma.user.count({ 
          where: { 
            role: 'WORKER', 
            OR: [
              { profile: { verified: true } },
              { skills: { some: { verified: true } } }
            ]
          } 
        }),
        prisma.user.groupBy({
          by: ['role'],
          _count: { id: true },
        })
      ]),

      // User growth over time
      AnalyticsService._getMonthlyTrend('user', {}, 'createdAt', months),

      // Gig volume (Active vs All)
      Promise.all([
        prisma.gig.count({ where: { status: { in: ['OPEN', 'ASSIGNED'] } } }),
        prisma.gig.count(),
        prisma.gig.count({ where: { status: 'COMPLETED' } }),
      ]),

      // Category distribution
      prisma.gig.groupBy({
        by: ['category'],
        _count: { id: true },
      }),

      // Platform avg rating
      prisma.rating.aggregate({
        _avg: { score: true },
        _count: { id: true },
      }),

      // Escrow balance (PENDING deposits - completed payouts)
      Promise.all([
        prisma.transaction.aggregate({
          where: { type: 'DEPOSIT_TO_ESCROW', status: 'SUCCESS' },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { type: 'PAYOUT_TO_WORKER', status: 'SUCCESS' },
          _sum: { amount: true },
        }),
      ]),

      // Dispute stats
      Promise.all([
        prisma.dispute.count(),
        prisma.dispute.count({ where: { status: 'OPEN' } }),
        prisma.assignment.count(),
      ]),
    ]);

    // Process user counts
    const verifiedWorkersCount = userCounts[0];
    const userCountMap = {};
    userCounts[1].forEach(u => { userCountMap[u.role] = u._count.id; });

    // Process category distribution
    const categories = categoryDistribution.map(c => ({
      category: c.category,
      count: c._count.id,
    }));

    return {
      kpis: {
        totalGMV: (gmvAggregate._sum.amount || 0),
        totalTransactions: gmvAggregate._count.id,
        totalWorkers: userCountMap['WORKER'] || 0, // Restored to total for Admin compatibility
        verifiedWorkers: verifiedWorkersCount, // New field for Discovery
        totalEmployers: userCountMap['EMPLOYER'] || 0,
        totalGigs: gigVolume[1], // Restored to total for Admin compatibility
        activeGigs: gigVolume[0], // New field for Discovery
        completedGigs: gigVolume[2],
        avgPlatformRating: platformRating._avg.score
          ? Math.round(platformRating._avg.score * 10) / 10
          : null,
        totalRatings: platformRating._count.id,
        escrowBalance: ((escrowBalance[0]._sum.amount || 0) - (escrowBalance[1]._sum.amount || 0)),
        totalDisputes: disputeStats[0],
        openDisputes: disputeStats[1],
        disputeRate: disputeStats[2] > 0
          ? Math.round(disputeStats[0] / disputeStats[2] * 100 * 10) / 10
          : 0,
      },
      transactionTrend,
      userGrowth,
      categoryDistribution: categories,
    };
  }

  // ─── Helper: Monthly Trend ──────────────────────────────────

  /**
   * Generates monthly trend data for any model.
   * Uses date-bounded queries for each month (performant with indexes).
   * 
   * @param {string} model - Prisma model name ('transaction', 'user', etc.)
   * @param {object} baseWhere - Base where conditions
   * @param {string} dateField - The date field to group by
   * @param {number} months - Number of months to look back
   */
  static async _getMonthlyTrend(model, baseWhere, dateField, months) {
    const now = new Date();
    const monthPromises = [];

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const label = start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      if (model === 'transaction') {
        monthPromises.push(
          prisma.transaction.aggregate({
            where: { ...baseWhere, [dateField]: { gte: start, lte: end } },
            _sum: { amount: true },
            _count: { id: true },
          }).then(result => ({
            month: label,
            amount: (result._sum.amount || 0),
            count: result._count.id,
          }))
        );
      } else {
        monthPromises.push(
          prisma[model].count({
            where: { ...baseWhere, [dateField]: { gte: start, lte: end } },
          }).then(count => ({
            month: label,
            count,
          }))
        );
      }
    }

    return Promise.all(monthPromises);
  }
}
