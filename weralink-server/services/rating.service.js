import prisma from '../config/prisma.js';
import NotificationService from './notification.service.js';

/**
 * RatingService
 * Handles bidirectional rating between Workers and Employers
 * after assignment completion (PAID status).
 * 
 * Security: All methods enforce ownership/participation checks (IDOR prevention).
 * Integrity: Unique constraint [assignmentId, raterId] prevents duplicate ratings at DB level.
 */
export class RatingService {

  /**
   * Submit a rating for a completed assignment.
   * - Only participants of a PAID assignment can rate each other.
   * - Employer rates Worker, Worker rates Employer (bidirectional).
   * - Duplicate prevention via unique constraint.
   * 
   * @param {string} assignmentId 
   * @param {string} raterId - The authenticated user submitting the rating
   * @param {{ score: number, dimensions?: object, comment?: string }} ratingData
   * @returns {Promise<object>} The created rating
   */
  static async submitRating(assignmentId, raterId, { score, dimensions, comment }) {
    // 1. Validate score range
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      throw Object.assign(new Error('Score must be an integer between 1 and 5.'), { statusCode: 422 });
    }

    // 2. Validate dimensions if provided
    if (dimensions) {
      const validKeys = ['quality', 'communication', 'timeliness'];
      for (const key of validKeys) {
        if (dimensions[key] !== undefined) {
          const val = dimensions[key];
          if (!Number.isInteger(val) || val < 1 || val > 5) {
            throw Object.assign(
              new Error(`Dimension "${key}" must be an integer between 1 and 5.`),
              { statusCode: 422 }
            );
          }
        }
      }
      // Strip unknown keys
      const sanitized = {};
      for (const key of validKeys) {
        if (dimensions[key] !== undefined) sanitized[key] = dimensions[key];
      }
      dimensions = Object.keys(sanitized).length > 0 ? sanitized : null;
    }

    // 3. Sanitize comment
    const sanitizedComment = comment ? comment.trim().slice(0, 1000) : null;

    // 4. Fetch assignment with participants
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        gig: { select: { employerId: true, title: true } },
        worker: { select: { id: true, name: true } },
      },
    });

    if (!assignment) {
      throw Object.assign(new Error('Assignment not found.'), { statusCode: 404 });
    }

    // 5. Only PAID assignments can be rated
    if (assignment.status !== 'PAID') {
      throw Object.assign(
        new Error('Ratings can only be submitted for completed and paid assignments.'),
        { statusCode: 409 }
      );
    }

    // 6. Determine ratee (the other participant)
    const isWorker = assignment.workerId === raterId;
    const isEmployer = assignment.gig.employerId === raterId;

    if (!isWorker && !isEmployer) {
      throw Object.assign(
        new Error('You are not a participant in this assignment.'),
        { statusCode: 403 }
      );
    }

    const rateeId = isWorker ? assignment.gig.employerId : assignment.workerId;

    // 7. Check for existing rating (application-level check before hitting DB constraint)
    const existingRating = await prisma.rating.findUnique({
      where: { assignmentId_raterId: { assignmentId, raterId } },
    });

    if (existingRating) {
      throw Object.assign(
        new Error('You have already rated this assignment.'),
        { statusCode: 409 }
      );
    }

    // 8. Create rating + notification atomically
    const rating = await prisma.$transaction(async (tx) => {
      const created = await tx.rating.create({
        data: {
          assignmentId,
          raterId,
          rateeId,
          score,
          dimensions: dimensions || undefined,
          comment: sanitizedComment,
        },
        include: {
          rater: { select: { name: true } },
          ratee: { select: { name: true } },
        },
      });

      // Send notification to ratee
      await tx.notification.create({
        data: {
          userId: rateeId,
          title: 'New Rating Received',
          message: `${created.rater.name} rated you ${score}/5 for "${assignment.gig.title}".`,
          type: 'RATING_RECEIVED',
          linkUrl: isWorker ? `/employer/history` : `/worker/history`,
        },
      });

      return created;
    });

    return rating;
  }

  /**
   * Get paginated ratings received by a user.
   * Includes assignment/gig context for display.
   */
  static async getRatingsForUser(userId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where: { rateeId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
        include: {
          rater: { select: { name: true, role: true } },
          assignment: {
            select: {
              gig: { select: { title: true, category: true } },
            },
          },
        },
      }),
      prisma.rating.count({ where: { rateeId: userId } }),
    ]);

    return {
      ratings,
      meta: {
        total,
        page,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  /**
   * Compute aggregate rating summary for a user.
   * Returns: avgScore, avgDimensions, totalRatings, distribution (1-5 star counts).
   * 
   * Performance: Single DB query with groupBy for distribution,
   * aggregate for averages — no N+1.
   */
  static async getUserRatingSummary(userId) {
    const [aggregate, distribution, allRatings] = await Promise.all([
      // Average score
      prisma.rating.aggregate({
        where: { rateeId: userId },
        _avg: { score: true },
        _count: { id: true },
      }),
      // Star distribution (1-5)
      prisma.rating.groupBy({
        by: ['score'],
        where: { rateeId: userId },
        _count: { id: true },
      }),
      // For dimension averages (can't aggregate JSON natively)
      prisma.rating.findMany({
        where: { rateeId: userId, dimensions: { not: null } },
        select: { dimensions: true },
      }),
    ]);

    // Build star distribution map
    const starDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach(d => {
      starDistribution[d.score] = d._count.id;
    });

    // Compute average dimensions
    let avgDimensions = null;
    if (allRatings.length > 0) {
      const sums = { quality: 0, communication: 0, timeliness: 0 };
      const counts = { quality: 0, communication: 0, timeliness: 0 };
      
      allRatings.forEach(r => {
        const dims = r.dimensions;
        if (dims && typeof dims === 'object') {
          for (const key of ['quality', 'communication', 'timeliness']) {
            if (typeof dims[key] === 'number') {
              sums[key] += dims[key];
              counts[key]++;
            }
          }
        }
      });

      avgDimensions = {};
      for (const key of ['quality', 'communication', 'timeliness']) {
        avgDimensions[key] = counts[key] > 0 
          ? Math.round((sums[key] / counts[key]) * 10) / 10 
          : null;
      }
    }

    return {
      avgScore: aggregate._avg.score 
        ? Math.round(aggregate._avg.score * 10) / 10 
        : null,
      totalRatings: aggregate._count.id,
      distribution: starDistribution,
      avgDimensions,
    };
  }

  /**
   * Check if a user has already rated a specific assignment.
   */
  static async checkRating(assignmentId, raterId) {
    const existing = await prisma.rating.findUnique({
      where: { assignmentId_raterId: { assignmentId, raterId } },
      select: { id: true, score: true, createdAt: true },
    });

    return { hasRated: !!existing, rating: existing };
  }

  /**
   * Get all ratings for a specific assignment (both directions).
   * Used in the assignment detail/history view.
   */
  static async getRatingsForAssignment(assignmentId, requesterId) {
    // Verify requester is a participant
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { workerId: true, gig: { select: { employerId: true } } },
    });

    if (!assignment) {
      throw Object.assign(new Error('Assignment not found.'), { statusCode: 404 });
    }

    const isParticipant = assignment.workerId === requesterId || 
                          assignment.gig.employerId === requesterId;
    
    if (!isParticipant) {
      throw Object.assign(
        new Error('You are not a participant in this assignment.'),
        { statusCode: 403 }
      );
    }

    const ratings = await prisma.rating.findMany({
      where: { assignmentId },
      include: {
        rater: { select: { name: true, role: true } },
        ratee: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return ratings;
  }
}
