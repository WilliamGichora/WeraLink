import prisma from '../config/prisma.js';
import { respond } from '../utils/respond.js';
import { parsePagination } from '../utils/pagination.js';
import {
    VALID_CATEGORIES,
    VALID_WORK_TYPES,
    VALID_GIG_STATUSES,
    VALID_SORT_FIELDS,
    VALID_SORT_ORDERS,
    MAX_SEARCH_LEN,
    validateGigInput,
    verifySkillIds,
} from '../validators/gig.validators.js';

/**
 * POST /api/gigs
 * Protected: requireAuth + requirePermission(GIG_CREATE) — Employer only.
 *
 * Creates the Gig row and associated GigSkill rows atomically via
 * Prisma nested writes (no interactive transaction required).
 */
export const createGig = async (req, res) => {
    try {
        const employerId = req.user.id;

        const validationErrors = validateGigInput(req.body, false);
        if (validationErrors.length > 0) {
            return respond(res, 422, null, null,
                validationErrors.map(e => ({ code: 'VALIDATION_ERROR', field: e.field, message: e.message })),
            );
        }

        const {
            title, description, category, workType,
            payAmount, currency, location, expiresAt,
            evidenceTemplate, skills,
        } = req.body;

        // Verify referenced skills exist
        if (skills && skills.length > 0) {
            const skillErr = await verifySkillIds(skills);
            if (skillErr) {
                return respond(res, 422, null, null, [
                    { code: 'VALIDATION_ERROR', field: 'skills', message: skillErr },
                ]);
            }
        }

        // Build create payload
        const data = {
            employerId,
            title: title.trim(),
            description: description.trim(),
            category,
            workType: workType || 'REMOTE',
            payAmount: Number(payAmount),
            currency: currency || 'KES',
            location: location.trim(),
            evidenceTemplate,
        };

        if (expiresAt) {
            data.expiresAt = new Date(expiresAt);
        }

        if (skills && skills.length > 0) {
            data.skills = {
                create: skills.map(s => ({
                    skillId: s.skillId,
                    requiredLevel: s.requiredLevel || 1,
                })),
            };
        }

        const gig = await prisma.gig.create({
            data,
            include: {
                skills: { include: { skill: { select: { id: true, name: true, category: true } } } },
                employer: { select: { name: true } },
            },
        });

        return respond(res, 201, { gig });
    } catch (error) {
        console.error('Create Gig Error:', error);
        return respond(res, 500, null, null, [
            { code: 'INTERNAL_ERROR', message: 'Failed to create gig.', detail: error.message },
        ]);
    }
};

/**
 * GET /api/gigs
 * Public — no auth required.
 * Serves the Worker marketplace / public browsing.
 *
 * Only OPEN and non-expired gigs are returned.
 *
 * Query params:
 *   category, workType, minPay, maxPay, skills (comma-separated IDs),
 *   search, page, limit, sort (createdAt|payAmount|expiresAt), order (asc|desc)
 */
export const getGigs = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);

        const {
            category, workType, minPay, maxPay,
            skills: skillFilter, search,
            sort = 'createdAt', order = 'desc',
        } = req.query;

        // Build WHERE — AND array combines expiry filter with optional search
        const andClauses = [
            { status: 'OPEN' },
            { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
        ];

        if (category && VALID_CATEGORIES.includes(category.toUpperCase())) {
            andClauses.push({ category: category.toUpperCase() });
        }

        if (workType && VALID_WORK_TYPES.includes(workType.toUpperCase())) {
            andClauses.push({ workType: workType.toUpperCase() });
        }

        if (minPay || maxPay) {
            const payClause = {};
            if (minPay && !isNaN(Number(minPay)) && Number(minPay) > 0) {
                payClause.gte = Number(minPay);
            }
            if (maxPay && !isNaN(Number(maxPay)) && Number(maxPay) > 0) {
                payClause.lte = Number(maxPay);
            }
            if (Object.keys(payClause).length > 0) {
                andClauses.push({ payAmount: payClause });
            }
        }

        // Skill-based filtering (OR logic: gig requires ANY of the listed skills)
        if (skillFilter && typeof skillFilter === 'string') {
            const ids = skillFilter.split(',').map(s => s.trim()).filter(Boolean);
            if (ids.length > 0) {
                andClauses.push({ skills: { some: { skillId: { in: ids } } } });
            }
        }

        // Search across title + description
        if (search && typeof search === 'string') {
            const term = search.trim().slice(0, MAX_SEARCH_LEN);
            if (term) {
                andClauses.push({
                    OR: [
                        { title: { contains: term, mode: 'insensitive' } },
                        { description: { contains: term, mode: 'insensitive' } },
                    ],
                });
            }
        }

        const where = { AND: andClauses };

        const sortField = VALID_SORT_FIELDS.includes(sort) ? sort : 'createdAt';
        const sortOrder = VALID_SORT_ORDERS.includes(order) ? order : 'desc';

        const [gigs, total] = await Promise.all([
            prisma.gig.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortField]: sortOrder },
                relationLoadStrategy: 'join',
                include: {
                    skills: {
                        include: { skill: { select: { id: true, name: true, category: true } } },
                    },
                    employer: { select: { name: true } },
                    _count: { select: { assignments: true } },
                },
            }),
            prisma.gig.count({ where }),
        ]);

        return respond(res, 200, { gigs }, {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Get Gigs Error:', error);
        return respond(res, 500, null, null, [
            { code: 'INTERNAL_ERROR', message: 'Failed to retrieve gigs.' },
        ]);
    }
};

/**
 * GET /api/gigs/mine
 * Protected: requireAuth + requireRole(['EMPLOYER']).
 *
 * Returns ALL gigs (any status) owned by the authenticated employer.
 * Supports pagination and optional status filter.
 */
export const getMyGigs = async (req, res) => {
    try {
        const employerId = req.user.id;
        const { page, limit, skip } = parsePagination(req.query);
        const { status, sort = 'createdAt', order = 'desc' } = req.query;

        const where = { employerId };

        if (status && VALID_GIG_STATUSES.includes(status.toUpperCase())) {
            where.status = status.toUpperCase();
        }

        const sortField = VALID_SORT_FIELDS.includes(sort) ? sort : 'createdAt';
        const sortOrder = VALID_SORT_ORDERS.includes(order) ? order : 'desc';

        const [gigs, total] = await Promise.all([
            prisma.gig.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortField]: sortOrder },
                relationLoadStrategy: 'join',
                include: {
                    skills: {
                        include: { skill: { select: { id: true, name: true, category: true } } },
                    },
                    _count: { select: { assignments: true } },
                },
            }),
            prisma.gig.count({ where }),
        ]);

        return respond(res, 200, { gigs }, {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Get My Gigs Error:', error);
        return respond(res, 500, null, null, [
            { code: 'INTERNAL_ERROR', message: 'Failed to retrieve your gigs.' },
        ]);
    }
};

/**
 * GET /api/gigs/:id
 * Public — no auth required.
 *
 * Returns full gig details including skills, employer name, and assignment count.
 */
export const getGigById = async (req, res) => {
    try {
        const { id } = req.params;

        const gig = await prisma.gig.findUnique({
            where: { id },
            relationLoadStrategy: 'join',
            include: {
                skills: { include: { skill: true } },
                employer: { select: { name: true } },
                _count: { select: { assignments: true } },
            },
        });

        if (!gig) {
            return respond(res, 404, null, null, [
                { code: 'NOT_FOUND', message: 'Gig not found.' },
            ]);
        }

        return respond(res, 200, { gig });
    } catch (error) {
        console.error('Get Gig By ID Error:', error);
        return respond(res, 500, null, null, [
            { code: 'INTERNAL_ERROR', message: 'Failed to retrieve gig.' },
        ]);
    }
};

/**
 * PUT /api/gigs/:id
 * Protected: requireAuth + requirePermission(GIG_EDIT_OWN) — Employer only.
 *
 * Business rules:
 *   1. Ownership check (IDOR prevention)
 *   2. Only OPEN gigs may be edited
 *
 * If `skills` array is provided, existing GigSkill rows are replaced
 * atomically via Prisma nested writes (deleteMany + create).
 */
export const updateGig = async (req, res) => {
    try {
        const { id } = req.params;
        const employerId = req.user.id;

        // Fetch for ownership + status guard
        const existing = await prisma.gig.findUnique({
            where: { id },
            select: { employerId: true, status: true },
        });

        if (!existing) {
            return respond(res, 404, null, null, [
                { code: 'NOT_FOUND', message: 'Gig not found.' },
            ]);
        }

        if (existing.employerId !== employerId) {
            return respond(res, 403, null, null, [
                { code: 'FORBIDDEN', message: 'You can only edit your own gigs.' },
            ]);
        }

        if (existing.status !== 'OPEN') {
            return respond(res, 409, null, null, [
                { code: 'CONFLICT', message: `Cannot edit a gig with status "${existing.status}". Only OPEN gigs can be edited.` },
            ]);
        }

        // Validate input
        const validationErrors = validateGigInput(req.body, true);
        if (validationErrors.length > 0) {
            return respond(res, 422, null, null,
                validationErrors.map(e => ({ code: 'VALIDATION_ERROR', field: e.field, message: e.message })),
            );
        }

        const {
            title, description, category, workType,
            payAmount, currency, location, expiresAt,
            evidenceTemplate, skills,
        } = req.body;

        // Verify referenced skills
        if (skills && skills.length > 0) {
            const skillErr = await verifySkillIds(skills);
            if (skillErr) {
                return respond(res, 422, null, null, [
                    { code: 'VALIDATION_ERROR', field: 'skills', message: skillErr },
                ]);
            }
        }

        // Build update payload (only provided fields)
        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (category !== undefined) updateData.category = category;
        if (workType !== undefined) updateData.workType = workType;
        if (payAmount !== undefined) updateData.payAmount = Number(payAmount);
        if (currency !== undefined) updateData.currency = currency;
        if (location !== undefined) updateData.location = location.trim();
        if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
        if (evidenceTemplate !== undefined) updateData.evidenceTemplate = evidenceTemplate;

        // Replace skill rows atomically via nested writes
        if (skills !== undefined) {
            updateData.skills = {
                deleteMany: {},
                ...(skills.length > 0
                    ? {
                        create: skills.map(s => ({
                            skillId: s.skillId,
                            requiredLevel: s.requiredLevel || 1,
                        })),
                    }
                    : {}),
            };
        }

        const updatedGig = await prisma.gig.update({
            where: { id },
            data: updateData,
            include: {
                skills: { include: { skill: { select: { id: true, name: true, category: true } } } },
                employer: { select: { name: true } },
            },
        });

        return respond(res, 200, { gig: updatedGig });
    } catch (error) {
        console.error('Update Gig Error:', error);
        return respond(res, 500, null, null, [
            { code: 'INTERNAL_ERROR', message: 'Failed to update gig.' },
        ]);
    }
};

/**
 * DELETE /api/gigs/:id
 * Protected: requireAuth + requirePermission(GIG_DELETE_OWN) — Employer only.
 *
 * Soft-deletes by setting status to CANCELLED.
 * Only OPEN gigs may be cancelled. Ownership is enforced.
 */
export const deleteGig = async (req, res) => {
    try {
        const { id } = req.params;
        const employerId = req.user.id;

        const existing = await prisma.gig.findUnique({
            where: { id },
            select: { employerId: true, status: true },
        });

        if (!existing) {
            return respond(res, 404, null, null, [
                { code: 'NOT_FOUND', message: 'Gig not found.' },
            ]);
        }

        if (existing.employerId !== employerId) {
            return respond(res, 403, null, null, [
                { code: 'FORBIDDEN', message: 'You can only cancel your own gigs.' },
            ]);
        }

        if (existing.status !== 'OPEN') {
            return respond(res, 409, null, null, [
                { code: 'CONFLICT', message: `Cannot cancel a gig with status "${existing.status}". Only OPEN gigs can be cancelled.` },
            ]);
        }

        const cancelledGig = await prisma.gig.update({
            where: { id },
            data: { status: 'CANCELLED' },
            select: { id: true, title: true, status: true, updatedAt: true },
        });

        return respond(res, 200, { gig: cancelledGig });
    } catch (error) {
        console.error('Delete Gig Error:', error);
        return respond(res, 500, null, null, [
            { code: 'INTERNAL_ERROR', message: 'Failed to cancel gig.' },
        ]);
    }
};
