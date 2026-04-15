/**
 * Gig-domain validation logic.
 *
 * All validation is extracted here to keep the gig controller focused
 * purely on request handling. These are mostly pure functions except
 * for verifySkillIds which checks the DB for skill existence.
 */

import prisma from '../config/prisma.js';

// ─── Domain Constants ────────────────────────────────────────────────────────
// These mirror the Prisma schema enums. If a new enum value is added to the
// schema, it must also be added here.

export const VALID_CATEGORIES = [
    'TRANSLATION', 'MARKETING', 'DATA_ENTRY',
    'BUG_HUNTING', 'AI_LABELING', 'RESEARCH',
];

export const VALID_WORK_TYPES = ['REMOTE', 'ON_SITE', 'HYBRID'];

export const VALID_EVIDENCE_TYPES = ['FILE', 'LINK', 'TEXT', 'IMAGE', 'VIDEO_LINK'];

export const VALID_GIG_STATUSES = [
    'OPEN', 'ASSIGNED', 'COMPLETED', 'CLOSED', 'CANCELLED',
];

export const VALID_SORT_FIELDS = ['createdAt', 'payAmount', 'expiresAt'];
export const VALID_SORT_ORDERS = ['asc', 'desc'];

export const MAX_TITLE_LEN = 200;
export const MAX_DESC_LEN = 5000;
export const MAX_LOCATION_LEN = 200;
export const MAX_EVIDENCE_ITEMS = 10;
export const MAX_SKILLS_PER_GIG = 10;
export const MAX_PAY = 1_000_000;
export const MAX_SEARCH_LEN = 200;

// ─── Evidence Template Validation ────────────────────────────────────────────

/**
 * Validates the evidenceTemplate JSON array against the WeraLink contract.
 *
 * Each item must have:
 *   tag (unique string), label (string), type (enum),
 *   min (int >= 0), required (boolean)
 *
 * Optional fields: accept (string[]), maxSizeMB (positive number)
 *
 * @param {any} template
 * @returns {string|null} Error message, or null if valid
 */
export function validateEvidenceTemplate(template) {
    if (!Array.isArray(template)) {
        return 'evidenceTemplate must be an array';
    }
    if (template.length === 0) {
        return 'evidenceTemplate must contain at least one requirement';
    }
    if (template.length > MAX_EVIDENCE_ITEMS) {
        return `evidenceTemplate cannot exceed ${MAX_EVIDENCE_ITEMS} items`;
    }

    const tags = new Set();

    for (let i = 0; i < template.length; i++) {
        const item = template[i];

        if (!item.tag || typeof item.tag !== 'string' || !item.tag.trim()) {
            return `evidenceTemplate[${i}].tag is required and must be a non-empty string`;
        }
        if (tags.has(item.tag)) {
            return `evidenceTemplate contains duplicate tag: "${item.tag}"`;
        }
        tags.add(item.tag);

        if (!item.label || typeof item.label !== 'string' || !item.label.trim()) {
            return `evidenceTemplate[${i}].label is required and must be a non-empty string`;
        }

        if (!item.type || !VALID_EVIDENCE_TYPES.includes(item.type)) {
            return `evidenceTemplate[${i}].type must be one of: ${VALID_EVIDENCE_TYPES.join(', ')}`;
        }

        if (typeof item.min !== 'number' || item.min < 0 || !Number.isInteger(item.min)) {
            return `evidenceTemplate[${i}].min must be a non-negative integer`;
        }

        if (typeof item.required !== 'boolean') {
            return `evidenceTemplate[${i}].required must be a boolean`;
        }

        if (item.accept !== undefined) {
            if (!Array.isArray(item.accept) || item.accept.some(a => typeof a !== 'string')) {
                return `evidenceTemplate[${i}].accept must be an array of file-extension strings`;
            }
        }

        if (item.maxSizeMB !== undefined) {
            if (typeof item.maxSizeMB !== 'number' || item.maxSizeMB <= 0) {
                return `evidenceTemplate[${i}].maxSizeMB must be a positive number`;
            }
        }
    }

    return null;
}

// ─── Gig Input Validation ────────────────────────────────────────────────────

/**
 * Validates the request body for creating or updating a gig.
 *
 * @param {object} body - req.body
 * @param {boolean} isUpdate - If true, only validates fields that are present
 * @returns {{ field: string, message: string }[]} Array of errors (empty = valid)
 */
export function validateGigInput(body, isUpdate = false) {
    const errors = [];
    const {
        title, description, category, workType,
        payAmount, location, expiresAt, evidenceTemplate, skills,
    } = body;

    // Required-field presence (create only)
    if (!isUpdate) {
        if (!title || typeof title !== 'string')
            errors.push({ field: 'title', message: 'Title is required' });
        if (!description || typeof description !== 'string')
            errors.push({ field: 'description', message: 'Description is required' });
        if (!category)
            errors.push({ field: 'category', message: 'Category is required' });
        if (payAmount === undefined || payAmount === null)
            errors.push({ field: 'payAmount', message: 'Pay amount is required' });
        if (!location || typeof location !== 'string')
            errors.push({ field: 'location', message: 'Location is required' });
        if (!evidenceTemplate)
            errors.push({ field: 'evidenceTemplate', message: 'Evidence template is required' });
    }

    // Value validation (both create and update)
    if (title !== undefined) {
        if (typeof title !== 'string' || !title.trim()) {
            errors.push({ field: 'title', message: 'Title must be a non-empty string' });
        } else if (title.trim().length > MAX_TITLE_LEN) {
            errors.push({ field: 'title', message: `Title cannot exceed ${MAX_TITLE_LEN} characters` });
        }
    }

    if (description !== undefined) {
        if (typeof description !== 'string' || !description.trim()) {
            errors.push({ field: 'description', message: 'Description must be a non-empty string' });
        } else if (description.trim().length > MAX_DESC_LEN) {
            errors.push({ field: 'description', message: `Description cannot exceed ${MAX_DESC_LEN} characters` });
        }
    }

    if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
        errors.push({ field: 'category', message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    if (workType !== undefined && !VALID_WORK_TYPES.includes(workType)) {
        errors.push({ field: 'workType', message: `Work type must be one of: ${VALID_WORK_TYPES.join(', ')}` });
    }

    if (payAmount !== undefined) {
        const amount = Number(payAmount);
        if (isNaN(amount) || amount <= 0) {
            errors.push({ field: 'payAmount', message: 'Pay amount must be a positive number' });
        } else if (amount > MAX_PAY) {
            errors.push({ field: 'payAmount', message: `Pay amount cannot exceed ${MAX_PAY.toLocaleString()}` });
        }
    }

    if (location !== undefined) {
        if (typeof location !== 'string' || !location.trim()) {
            errors.push({ field: 'location', message: 'Location must be a non-empty string' });
        } else if (location.trim().length > MAX_LOCATION_LEN) {
            errors.push({ field: 'location', message: `Location cannot exceed ${MAX_LOCATION_LEN} characters` });
        }
    }

    if (expiresAt !== undefined && expiresAt !== null) {
        const d = new Date(expiresAt);
        if (isNaN(d.getTime())) {
            errors.push({ field: 'expiresAt', message: 'Expiry date must be a valid ISO date' });
        } else if (d <= new Date()) {
            errors.push({ field: 'expiresAt', message: 'Expiry date must be in the future' });
        }
    }

    if (evidenceTemplate !== undefined) {
        const templateErr = validateEvidenceTemplate(evidenceTemplate);
        if (templateErr) {
            errors.push({ field: 'evidenceTemplate', message: templateErr });
        }
    }

    if (skills !== undefined) {
        if (!Array.isArray(skills)) {
            errors.push({ field: 'skills', message: 'Skills must be an array' });
        } else if (skills.length > MAX_SKILLS_PER_GIG) {
            errors.push({ field: 'skills', message: `Cannot attach more than ${MAX_SKILLS_PER_GIG} skills` });
        } else {
            for (let i = 0; i < skills.length; i++) {
                const s = skills[i];
                if (!s.skillId || typeof s.skillId !== 'string') {
                    errors.push({ field: `skills[${i}].skillId`, message: 'Each skill must have a valid skillId' });
                }
                if (s.requiredLevel !== undefined) {
                    const lvl = Number(s.requiredLevel);
                    if (!Number.isInteger(lvl) || lvl < 1 || lvl > 5) {
                        errors.push({ field: `skills[${i}].requiredLevel`, message: 'Required level must be 1–5' });
                    }
                }
            }
        }
    }

    return errors;
}

// ─── Skill Existence Check ───────────────────────────────────────────────────

/**
 * Verifies that every skillId in the array exists in the Skill table.
 * Also rejects duplicate IDs.
 *
 * @param {{ skillId: string }[]} skills
 * @returns {Promise<string|null>} Error message, or null if all valid
 */
export async function verifySkillIds(skills) {
    if (!skills || skills.length === 0) return null;

    const ids = skills.map(s => s.skillId);
    const unique = [...new Set(ids)];

    if (unique.length !== ids.length) {
        return 'Duplicate skill IDs are not allowed';
    }

    const existing = await prisma.skill.findMany({
        where: { id: { in: unique } },
        select: { id: true },
    });

    if (existing.length !== unique.length) {
        const found = new Set(existing.map(s => s.id));
        const missing = unique.filter(id => !found.has(id));
        return `Unknown skill IDs: ${missing.join(', ')}`;
    }

    return null;
}
