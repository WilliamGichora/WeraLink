import prisma from '../config/prisma.js';
import { respond } from '../utils/respond.js';
import { validateGigId, parseMatchLimit } from '../validators/matching.validators.js';
import {
    scoreWorkerForGig,
    scoreGigForWorker,
    rankCandidates,
} from '../services/matching.service.js';

// ─── Direction A: Employer → Find Workers for a Gig ─────────────────────────

/**
 * GET /api/gigs/:gigId/matches?limit=20
 *
 * Protected: requireAuth + requirePermission(MATCH_VIEW) — Employer only.
 * Ownership: Only the gig's employer can view matches (IDOR prevention).
 * Guard: Only OPEN gigs can be matched against.
 */
export const getMatchesForGig = async (req, res) => {
    const startTime = Date.now();

    try {
        const { gigId } = req.params;
        const employerId = req.user.id;

        // Input validation
        const idError = validateGigId(gigId);
        if (idError) {
            return respond(res, 400, null, null, [
                { code: 'VALIDATION_ERROR', message: idError },
            ]);
        }

        const limit = parseMatchLimit(req.query.limit);

        // Fetch gig with ownership + status check
        const gig = await prisma.gig.findUnique({
            where: { id: gigId },
            relationLoadStrategy: 'join',
            include: {
                skills: { select: { skillId: true, requiredLevel: true } },
                employer: { select: { name: true } },
            },
        });

        if (!gig) {
            return respond(res, 404, null, null, [
                { code: 'NOT_FOUND', message: 'Gig not found.' },
            ]);
        }

        if (gig.employerId !== employerId) {
            return respond(res, 403, null, null, [
                { code: 'FORBIDDEN', message: 'You can only view matches for your own gigs.' },
            ]);
        }

        if (gig.status !== 'OPEN') {
            return respond(res, 409, null, null, [
                { code: 'CONFLICT', message: `Cannot match workers for a gig with status "${gig.status}". Only OPEN gigs can be matched.` },
            ]);
        }

        const existingAssignments = await prisma.assignment.findMany({
            where: { gigId },
            select: { workerId: true },
        });
        const excludedWorkerIds = new Set(existingAssignments.map(a => a.workerId));

        const workers = await prisma.user.findMany({
            where: {
                role: 'WORKER',
                status: 'ACTIVE',
                id: { notIn: [...excludedWorkerIds] },
            },
            relationLoadStrategy: 'join',
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
            },
        });

        const eligible = workers.filter(w => w.profile?.availabilityStatus !== false);

        const scored = eligible.map(worker => {
            const hydrated = hydrateWorkerForScoring(worker);
            return scoreWorkerForGig(hydrated, gig);
        });

        // Rank and limit
        const ranked = rankCandidates(scored).slice(0, limit);

        // Resolve skill names for the response
        const allSkillIds = new Set();
        ranked.forEach(r => {
            r.matchedSkills.forEach(id => allSkillIds.add(id));
            r.missingSkills.forEach(id => allSkillIds.add(id));
        });
        const skillNames = await getSkillNameMap([...allSkillIds]);

        // Replace skill IDs with names in the response
        for (const match of ranked) {
            match.matchedSkills = match.matchedSkills.map(id => skillNames.get(id) || id);
            match.missingSkills = match.missingSkills.map(id => skillNames.get(id) || id);
            match.matchReason = buildWorkerMatchReason(match, skillNames);
        }

        return respond(res, 200, {
            matches: ranked,
            gigId,
            totalCandidates: eligible.length,
            matchedCandidates: ranked.length,
        }, {
            algorithm: 'v1.0',
            computeTimeMs: Date.now() - startTime,
        });

    } catch (error) {
        console.error('Get Matches For Gig Error:', error);
        return respond(res, 500, null, null, [
            { code: 'INTERNAL_ERROR', message: 'Failed to compute matches.' },
        ]);
    }
};

// ─── Direction B: Worker → Find Recommended Gigs ────────────────────────────

/**
 * GET /api/matches/gigs?limit=20
 *
 * Protected: requireAuth + requirePermission(ASSIGNMENT_APPLY) — Worker only.
 * Uses req.user.id directly — no IDOR surface.
 */
export const getRecommendedGigs = async (req, res) => {
    const startTime = Date.now();

    try {
        const workerId = req.user.id;
        const limit = parseMatchLimit(req.query.limit);

        // Fetch the worker's full profile
        const worker = await prisma.user.findUnique({
            where: { id: workerId },
            relationLoadStrategy: 'join',
            include: {
                profile: { select: { location: true, availabilityStatus: true, bio: true } },
                skills: { select: { skillId: true, level: true, verified: true } },
                badges: { select: { badgeId: true } },
                assignments: {
                    select: {
                        status: true,
                        gigId: true,
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
            },
        });

        if (!worker) {
            return respond(res, 404, null, null, [
                { code: 'NOT_FOUND', message: 'Worker profile not found.' },
            ]);
        }

        // Get gig IDs the worker already has assignments for
        const appliedGigIds = new Set((worker.assignments || []).map(a => a.gigId));

        // Fetch all OPEN, non-expired gigs
        const gigs = await prisma.gig.findMany({
            where: {
                status: 'OPEN',
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
                id: { notIn: [...appliedGigIds] },
            },
            relationLoadStrategy: 'join',
            include: {
                skills: {
                    include: { skill: { select: { id: true, name: true, category: true } } },
                },
                employer: { select: { name: true } },
                _count: { select: { assignments: true } },
            },
        });

        // Hard filter: work type / location for ON_SITE gigs
        const eligible = gigs.filter(gig => {
            if (gig.workType === 'REMOTE') return true;
            // For ON_SITE/HYBRID, check basic location overlap
            const wLoc = (worker.profile?.location || '').toLowerCase();
            const gLoc = (gig.location || '').toLowerCase();
            if (!wLoc || !gLoc) return true; // Let scoring handle unknowns
            // Only hard-exclude if totally different AND on-site
            return true; // Let scoring weight handle this — don't hard-exclude
        });

        // Score each gig
        const hydratedWorker = hydrateWorkerForScoring(worker);
        const scored = eligible.map(gig => {
            return scoreGigForWorker(gig, hydratedWorker);
        });

        // Rank and limit
        const ranked = scored
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);

        // Enrich skill names in matched/missing arrays
        for (const rec of ranked) {
            const gigSkillMap = new Map();
            (rec.gig.skills || []).forEach(gs => {
                const name = gs.skill?.name || gs.skillId;
                const id = gs.skillId || gs.skill?.id;
                if (id) gigSkillMap.set(id, name);
            });
            rec.matchedSkills = rec.matchedSkills.map(id => gigSkillMap.get(id) || id);
            rec.missingSkills = rec.missingSkills.map(id => gigSkillMap.get(id) || id);
        }

        return respond(res, 200, {
            recommendations: ranked,
            totalEligibleGigs: eligible.length,
            returnedCount: ranked.length,
        }, {
            algorithm: 'v1.0',
            computeTimeMs: Date.now() - startTime,
        });

    } catch (error) {
        console.error('Get Recommended Gigs Error:', error);
        return respond(res, 500, null, null, [
            { code: 'INTERNAL_ERROR', message: 'Failed to compute recommendations.' },
        ]);
    }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Transforms a Prisma worker record into the flat shape the scoring
 * service expects. Keeps DB-specific logic out of pure functions.
 */
function hydrateWorkerForScoring(worker) {
    const activeStatuses = new Set(['OFFERED', 'ACCEPTED']);
    const activeCount = (worker.assignments || []).filter(a => activeStatuses.has(a.status)).length;

    return {
        id: worker.id,
        name: worker.name,
        createdAt: worker.createdAt,
        profile: worker.profile,
        skills: worker.skills || [],
        assignments: (worker.assignments || []).map(a => ({
            status: a.status,
            gigCategory: a.gig?.category || null,
            offeredAt: a.offeredAt,
            acceptedAt: a.acceptedAt,
        })),
        ratingsRecv: worker.ratingsRecv || [],
        badgeCount: worker.badges?.length || 0,
        passedModuleCount: worker.completions?.length || 0,
        activeAssignmentCount: activeCount,
    };
}

/**
 * Fetches skill names for a list of skill IDs.
 * Returns a Map<skillId, skillName>.
 */
async function getSkillNameMap(skillIds) {
    if (!skillIds || skillIds.length === 0) return new Map();
    const skills = await prisma.skill.findMany({
        where: { id: { in: skillIds } },
        select: { id: true, name: true },
    });
    return new Map(skills.map(s => [s.id, s.name]));
}

/**
 * Builds a one-line human-readable match reason for the employer view.
 */
function buildWorkerMatchReason(match, skillNames) {
    const parts = [];

    if (match.matchedSkills.length > 0) {
        parts.push(`Strong ${match.matchedSkills.slice(0, 2).join(' & ')} skills`);
    }

    if (match.profile.avgRating >= 4.0) {
        parts.push(`${match.profile.avgRating}★ avg rating`);
    }

    if (match.profile.completedGigs > 0) {
        parts.push(`${match.profile.completedGigs} gig${match.profile.completedGigs > 1 ? 's' : ''} completed`);
    }

    return parts.join(' with ') || 'Potential match based on availability';
}
