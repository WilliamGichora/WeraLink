import prisma from '../config/prisma.js';
import { respond } from '../utils/respond.js';

/**
 * GET /api/skills
 *
 * Public endpoint — returns all predefined skills.
 * Optional query: ?category=Translation (case-sensitive match against DB)
 *
 * Ordered alphabetically within each category for consistent dropdown rendering.
 */
export const getAllSkills = async (req, res) => {
    try {
        const { category } = req.query;

        const where = {};
        if (category && typeof category === 'string' && category.trim()) {
            where.category = category.trim();
        }

        const skills = await prisma.skill.findMany({
            where,
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });

        return respond(res, 200, { skills });
    } catch (error) {
        console.error('Get Skills Error:', error);
        return respond(res, 500, null, null, [
            { code: 'INTERNAL_ERROR', message: 'Failed to retrieve skills.' },
        ]);
    }
};
