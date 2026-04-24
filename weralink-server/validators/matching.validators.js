/**
 * Matching-domain input validation.
 *
 * Validates query parameters for the matching endpoints.
 * Keeps the controller focused purely on request handling.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const MAX_MATCH_LIMIT = 50;
export const DEFAULT_MATCH_LIMIT = 20;

/**
 * Validates the gig ID parameter for the employer-side matches endpoint.
 *
 * @param {string} gigId
 * @returns {string|null} Error message if invalid, null if valid
 */
export function validateGigId(gigId) {
    if (!gigId || typeof gigId !== 'string') {
        return 'Gig ID is required';
    }
    if (!UUID_REGEX.test(gigId.trim())) {
        return 'Gig ID must be a valid UUID';
    }
    return null;
}

/**
 * Parses and validates the limit query parameter.
 *
 * @param {any} limitParam
 * @returns {number} Validated limit value
 */
export function parseMatchLimit(limitParam) {
    if (limitParam === undefined || limitParam === null) {
        return DEFAULT_MATCH_LIMIT;
    }

    const limit = Number(limitParam);
    if (isNaN(limit) || !Number.isInteger(limit) || limit < 1) {
        return DEFAULT_MATCH_LIMIT;
    }

    return Math.min(limit, MAX_MATCH_LIMIT);
}
