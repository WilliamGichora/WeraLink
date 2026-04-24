/**
 * Matching Service — Core Algorithm Engine
 *
 * Pure, testable functions that implement WeraLink's bidirectional
 * rule-based matching algorithm. No HTTP or Prisma dependencies;
 * all data is passed in as arguments.
 *
 * Scoring Weights:
 *   Skill Match:       45%
 *   Category Affinity: 25%
 *   Availability:      15%
 *   Location:          15%
 *
 * Performance Adjustments:
 *   Rating:          ×0.90 – ×1.10
 *   Completion Rate: ×0.95 – ×1.05
 *   Response Time:   ×0.95 – ×1.05
 *   Badge Bonus:     +0.01/badge  (cap +0.05)
 *   Training Bonus:  +0.01/module (cap +0.03)
 */

// ─── Weight Constants ────────────────────────────────────────────────────────

const WEIGHTS = {
    SKILL: 0.45,
    CATEGORY_AFFINITY: 0.25,
    AVAILABILITY: 0.15,
    LOCATION: 0.15,
};

const COLD_START = {
    NEWCOMER_FLOOR: 35,       // 0 completed assignments
    EARLY_CAREER_FLOOR: 25,   // 1–2 completed assignments
    MERIT_THRESHOLD: 3,       // 3+ → pure merit
};

const VERIFIED_SKILL_MULTIPLIER = 1.2;
const CATEGORY_AFFINITY_BASELINE = 0.3;     // First-timers in a category
const MAX_ACTIVE_ASSIGNMENTS_PENALTY = 5;   // Beyond this, availability tanks

const BADGE_BONUS_PER = 0.01;
const BADGE_BONUS_CAP = 0.05;
const TRAINING_BONUS_PER = 0.01;
const TRAINING_BONUS_CAP = 0.03;

// ─── Scoring Functions ───────────────────────────────────────────────────────

/**
 * Computes how well a worker's skills cover a gig's requirements.
 *
 * For each required skill:
 *   - If worker has it: min(workerLevel, requiredLevel) / requiredLevel
 *   - If worker's skill is verified: multiply by 1.2 (capped at 1.0 per skill)
 *   - If worker lacks it: 0
 *
 * If the gig has no required skills, all workers score 1.0.
 *
 * @param {Array<{skillId: string, level: number, verified: boolean}>} workerSkills
 * @param {Array<{skillId: string, requiredLevel: number}>} gigSkills
 * @returns {{ score: number, matched: string[], missing: string[] }}
 */
export function computeSkillScore(workerSkills, gigSkills) {
    if (!gigSkills || gigSkills.length === 0) {
        return { score: 1.0, matched: [], missing: [] };
    }

    const workerMap = new Map();
    for (const ws of (workerSkills || [])) {
        workerMap.set(ws.skillId, { level: ws.level || 1, verified: ws.verified || false });
    }

    let totalScore = 0;
    const matched = [];
    const missing = [];

    for (const gs of gigSkills) {
        const worker = workerMap.get(gs.skillId);
        if (worker) {
            const levelScore = Math.min(worker.level, gs.requiredLevel) / gs.requiredLevel;
            const verifiedBoost = worker.verified ? VERIFIED_SKILL_MULTIPLIER : 1.0;
            totalScore += Math.min(levelScore * verifiedBoost, 1.0);
            matched.push(gs.skillId);
        } else {
            missing.push(gs.skillId);
        }
    }

    return {
        score: totalScore / gigSkills.length,
        matched,
        missing,
    };
}

/**
 * Computes category affinity — how experienced the worker is in the gig's category.
 *
 * Counts completed (APPROVED/PAID) assignments in the same GigCategory,
 * normalized against a reasonable ceiling (10 gigs = max affinity).
 * Workers with 0 history in the category get a baseline of 0.3.
 *
 * @param {Array<{status: string, gigCategory: string}>} workerAssignments
 * @param {string} gigCategory
 * @returns {number} 0.0–1.0
 */
export function computeCategoryAffinity(workerAssignments, gigCategory) {
    if (!workerAssignments || workerAssignments.length === 0) {
        return CATEGORY_AFFINITY_BASELINE;
    }

    const completedStatuses = new Set(['APPROVED', 'PAID']);
    const categoryCount = workerAssignments.filter(
        a => completedStatuses.has(a.status) && a.gigCategory === gigCategory
    ).length;

    if (categoryCount === 0) return CATEGORY_AFFINITY_BASELINE;

    // Normalize: 10 completed gigs in category = 1.0
    return Math.min(categoryCount / 10, 1.0);
}

/**
 * Computes availability score based on whether the worker is available
 * and how many active assignments they currently have.
 *
 * Workers with more active assignments score lower (capacity signal).
 *
 * @param {boolean} isAvailable
 * @param {number} activeAssignmentCount - Assignments with status OFFERED or ACCEPTED
 * @returns {number} 0.0–1.0
 */
export function computeAvailabilityScore(isAvailable, activeAssignmentCount) {
    if (!isAvailable) return 0.0;
    if (activeAssignmentCount <= 0) return 1.0;

    // Linear decay: 0 active → 1.0, MAX_ACTIVE → 0.2
    const penalty = Math.min(activeAssignmentCount / MAX_ACTIVE_ASSIGNMENTS_PENALTY, 1.0);
    return Math.max(1.0 - (penalty * 0.8), 0.2);
}

/**
 * Computes location alignment score.
 *
 * REMOTE gigs: everyone scores 1.0 (location irrelevant).
 * ON_SITE / HYBRID: case-insensitive substring matching.
 *   - Exact or contained match → 1.0
 *   - Partial overlap (shared words) → 0.5
 *   - No overlap → 0.0
 *
 * @param {string} workerLocation
 * @param {string} gigLocation
 * @param {string} workType - REMOTE | ON_SITE | HYBRID
 * @returns {number} 0.0–1.0
 */
export function computeLocationScore(workerLocation, gigLocation, workType) {
    if (workType === 'REMOTE') return 1.0;

    const wLoc = (workerLocation || '').toLowerCase().trim();
    const gLoc = (gigLocation || '').toLowerCase().trim();

    if (!wLoc || !gLoc) return 0.5; // Unknown location — neutral

    // Direct containment
    if (wLoc.includes(gLoc) || gLoc.includes(wLoc)) return 1.0;

    // Word overlap (e.g., "Nairobi, Kenya" vs "Westlands, Nairobi")
    const wWords = new Set(wLoc.split(/[\s,]+/).filter(Boolean));
    const gWords = gLoc.split(/[\s,]+/).filter(Boolean);
    const overlap = gWords.some(word => wWords.has(word));

    return overlap ? 0.5 : 0.0;
}

/**
 * Computes performance adjustment multipliers from historical data.
 *
 * @param {Array<{score: number}>} ratings - Ratings received
 * @param {Array<{status: string, offeredAt: Date|string, acceptedAt: Date|string|null}>} assignments
 * @returns {{ ratingMult: number, completionMult: number, responseMult: number }}
 */
export function computePerformanceMultipliers(ratings, assignments) {
    // --- Rating multiplier (±10%) ---
    let ratingMult = 1.0;
    if (ratings && ratings.length > 0) {
        const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
        // Maps avg 1→0.93, avg 3→1.0, avg 5→1.07
        ratingMult = 1.0 + ((avg - 3.0) / 3.0) * 0.10;
        ratingMult = clamp(ratingMult, 0.90, 1.10);
    }

    // --- Completion rate multiplier (±5%) ---
    let completionMult = 1.0;
    const completedStatuses = new Set(['APPROVED', 'PAID']);
    const countable = (assignments || []).filter(a => a.status !== 'OFFERED');
    if (countable.length >= 3) {
        const completed = countable.filter(a => completedStatuses.has(a.status)).length;
        const rate = completed / countable.length;
        completionMult = 1.0 + ((rate - 0.5) * 0.10);
        completionMult = clamp(completionMult, 0.95, 1.05);
    }

    // --- Response time multiplier (±5%) ---
    let responseMult = 1.0;
    const responded = (assignments || []).filter(a => a.acceptedAt && a.offeredAt);
    if (responded.length >= 2) {
        const avgHours = responded.reduce((sum, a) => {
            const diff = new Date(a.acceptedAt) - new Date(a.offeredAt);
            return sum + diff / (1000 * 60 * 60); // hours
        }, 0) / responded.length;

        // < 2 hours avg → +5%, > 48 hours → -5%
        if (avgHours <= 2) responseMult = 1.05;
        else if (avgHours <= 12) responseMult = 1.02;
        else if (avgHours <= 24) responseMult = 1.0;
        else if (avgHours <= 48) responseMult = 0.98;
        else responseMult = 0.95;
    }

    return { ratingMult, completionMult, responseMult };
}

/**
 * Computes flat bonus scores for badges and training modules.
 *
 * @param {number} badgeCount
 * @param {number} passedModuleCount
 * @returns {{ badgeBonus: number, trainingBonus: number }}
 */
export function computeBonuses(badgeCount, passedModuleCount) {
    return {
        badgeBonus: Math.min((badgeCount || 0) * BADGE_BONUS_PER, BADGE_BONUS_CAP),
        trainingBonus: Math.min((passedModuleCount || 0) * TRAINING_BONUS_PER, TRAINING_BONUS_CAP),
    };
}

/**
 * Applies cold start compensation rules.
 *
 * @param {number} score - The computed adjusted score
 * @param {number} completedCount - Total completed (APPROVED/PAID) assignments
 * @returns {{ score: number, tags: string[] }}
 */
export function applyColdStart(score, completedCount) {
    const tags = [];

    if (completedCount === 0) {
        tags.push('fresh-talent');
        return { score: Math.max(score, COLD_START.NEWCOMER_FLOOR), tags };
    }

    if (completedCount <= 2) {
        tags.push('early-career');
        return { score: Math.max(score, COLD_START.EARLY_CAREER_FLOOR), tags };
    }

    return { score, tags };
}

// ─── Composite Scoring ───────────────────────────────────────────────────────

/**
 * Full scoring pipeline for a single worker against a single gig.
 *
 * @param {object} worker - Hydrated worker data
 * @param {object} gig - Hydrated gig data (with skills, category, workType, location)
 * @returns {object} Scored result with breakdown
 */
export function scoreWorkerForGig(worker, gig) {
    const gigSkills = (gig.skills || []).map(gs => ({
        skillId: gs.skillId,
        requiredLevel: gs.requiredLevel || 1,
    }));

    const workerSkills = (worker.skills || []).map(us => ({
        skillId: us.skillId,
        level: us.level || 1,
        verified: us.verified || false,
    }));

    // Phase 4: Weighted Scoring
    const { score: skillScore, matched, missing } = computeSkillScore(workerSkills, gigSkills);
    const categoryAffinity = computeCategoryAffinity(worker.assignments || [], gig.category);
    const availabilityScore = computeAvailabilityScore(
        worker.profile?.availabilityStatus ?? true,
        worker.activeAssignmentCount || 0,
    );
    const locationScore = computeLocationScore(
        worker.profile?.location || '',
        gig.location || '',
        gig.workType || 'REMOTE',
    );

    const baseScore = (
        skillScore * WEIGHTS.SKILL +
        categoryAffinity * WEIGHTS.CATEGORY_AFFINITY +
        availabilityScore * WEIGHTS.AVAILABILITY +
        locationScore * WEIGHTS.LOCATION
    ) * 100;

    // Phase 5: Performance Adjustments
    const { ratingMult, completionMult, responseMult } = computePerformanceMultipliers(
        worker.ratingsRecv || [],
        worker.assignments || [],
    );
    const { badgeBonus, trainingBonus } = computeBonuses(
        worker.badgeCount || 0,
        worker.passedModuleCount || 0,
    );

    let adjustedScore = baseScore * ratingMult * completionMult * responseMult
        + (badgeBonus * 100) + (trainingBonus * 100);

    // Phase 6: Cold Start
    const completedStatuses = new Set(['APPROVED', 'PAID']);
    const completedCount = (worker.assignments || []).filter(a => completedStatuses.has(a.status)).length;
    const { score: finalScore, tags } = applyColdStart(adjustedScore, completedCount);

    // Extra tags
    const avgRating = worker.ratingsRecv?.length > 0
        ? worker.ratingsRecv.reduce((s, r) => s + r.score, 0) / worker.ratingsRecv.length
        : 0;
    if (avgRating >= 4.5) tags.push('top-rated');
    if (workerSkills.some(s => s.verified)) tags.push('verified-skills');

    return {
        workerId: worker.id,
        workerName: worker.name,
        matchScore: Math.round(finalScore * 10) / 10,
        tags,
        breakdown: {
            skillScore: round(skillScore),
            categoryAffinity: round(categoryAffinity),
            availabilityScore: round(availabilityScore),
            locationScore: round(locationScore),
            ratingMultiplier: round(ratingMult),
            completionMultiplier: round(completionMult),
            responseTimeMultiplier: round(responseMult),
        },
        matchedSkills: matched,
        missingSkills: missing,
        profile: {
            location: worker.profile?.location || null,
            bio: worker.profile?.bio || null,
            avgRating: round(avgRating),
            completedGigs: completedCount,
            badges: worker.badgeCount || 0,
        },
    };
}

/**
 * Full scoring pipeline for a single gig against a single worker (reverse direction).
 *
 * @param {object} gig - Hydrated gig data
 * @param {object} worker - Hydrated worker data
 * @returns {object} Scored result with breakdown and human-readable reasons
 */
export function scoreGigForWorker(gig, worker) {
    const result = scoreWorkerForGig(worker, gig);

    // Generate human-readable match reasons
    const reasons = generateMatchReasons(result, gig, worker);

    // Additional gig-specific tags
    const gigTags = [...result.tags];
    if (result.matchScore >= 80) gigTags.push('perfect-match');
    if (Number(gig.payAmount) >= 5000) gigTags.push('high-pay');

    return {
        gig: {
            id: gig.id,
            title: gig.title,
            status: gig.status,
            category: gig.category,
            workType: gig.workType,
            payAmount: gig.payAmount,
            currency: gig.currency,
            location: gig.location,
            expiresAt: gig.expiresAt,
            employer: gig.employer,
            skills: gig.skills,
            _count: gig._count,
        },
        matchScore: result.matchScore,
        matchReasons: reasons,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        tags: gigTags,
        breakdown: result.breakdown,
    };
}

/**
 * Generates human-readable match reason strings.
 */
export function generateMatchReasons(scoreResult, gig, worker) {
    const reasons = [];
    const gigSkillCount = gig.skills?.length || 0;
    const matchedCount = scoreResult.matchedSkills?.length || 0;

    // Skill match reason
    if (gigSkillCount === 0) {
        reasons.push('No specific skills required');
    } else if (matchedCount === gigSkillCount) {
        reasons.push(`Matches all ${gigSkillCount} required skills`);
    } else if (matchedCount > 0) {
        reasons.push(`Matches ${matchedCount} of ${gigSkillCount} required skills`);
    }

    // Category affinity reason
    const completedStatuses = new Set(['APPROVED', 'PAID']);
    const categoryGigCount = (worker.assignments || []).filter(
        a => completedStatuses.has(a.status) && a.gigCategory === gig.category
    ).length;
    if (categoryGigCount > 0) {
        const catLabel = gig.category.replace('_', ' ').toLowerCase();
        reasons.push(`You've completed ${categoryGigCount} ${catLabel} gig${categoryGigCount > 1 ? 's' : ''}`);
    }

    // Location reason
    if (gig.workType === 'REMOTE') {
        reasons.push('Remote — available from your location');
    } else if (scoreResult.breakdown.locationScore >= 0.5) {
        reasons.push('Near your location');
    }

    // Rating reason
    if (scoreResult.breakdown.ratingMultiplier > 1.03) {
        reasons.push('Your high rating gives you a boost');
    }

    return reasons;
}

/**
 * Ranks an array of scored candidates by matchScore descending.
 * Tie-breaks: fewer active assignments → older account.
 *
 * @param {Array} scored
 * @returns {Array} Sorted
 */
export function rankCandidates(scored) {
    return scored.sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        // Tie-break: fewer active assignments first
        const aActive = a.activeAssignmentCount || 0;
        const bActive = b.activeAssignmentCount || 0;
        if (aActive !== bActive) return aActive - bActive;
        // Tie-break: older account first (fairness)
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function round(val, decimals = 2) {
    return Math.round(val * 10 ** decimals) / 10 ** decimals;
}
