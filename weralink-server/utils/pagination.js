export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

/**
 * Parses and clamps pagination values from Express query params.
 *
 * @param {{ page?: string, limit?: string }} query
 * @returns {{ page: number, limit: number, skip: number }}
 */
export function parsePagination(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(
        MAX_PAGE_SIZE,
        Math.max(1, parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE),
    );
    return { page, limit, skip: (page - 1) * limit };
}
