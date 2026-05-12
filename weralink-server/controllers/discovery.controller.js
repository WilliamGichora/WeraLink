import * as DiscoveryService from '../services/discovery.service.js';
import { respond } from '../utils/respond.js';

/**
 * GET /api/discovery/stats
 * Public: Returns platform-wide statistics for the landing page.
 */
export const getLandingStats = async (req, res) => {
    try {
        const stats = await DiscoveryService.getPlatformStats();
        return respond(res, 200, stats);
    } catch (error) {
        console.error('Get Landing Stats Error:', error);
        return respond(res, 500, null, null, [
            { code: 'INTERNAL_ERROR', message: 'Failed to retrieve platform statistics.' }
        ]);
    }
};

/**
 * GET /api/discovery/featured
 * Public: Returns featured workers and employers for the showcase.
 */
export const getFeatured = async (req, res) => {
    try {
        const featured = await DiscoveryService.getFeaturedContent();
        return respond(res, 200, featured);
    } catch (error) {
        console.error('Get Featured Content Error:', error);
        return respond(res, 500, null, null, [
            { code: 'INTERNAL_ERROR', message: 'Failed to retrieve featured content.' }
        ]);
    }
};

/**
 * GET /api/discovery/profile/:userId
 * Public (Optional Auth): Returns a redacted public profile of a worker.
 */
export const getPublicProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await DiscoveryService.getPublicProfile(userId);
        
        if (!profile) {
            return respond(res, 404, null, null, [
                { code: 'NOT_FOUND', message: 'Professional profile not found.' }
            ]);
        }

        return respond(res, 200, { profile });
    } catch (error) {
        console.error('Get Public Profile Error:', error);
        return respond(res, 500, null, null, [
            { code: 'INTERNAL_ERROR', message: 'Failed to retrieve professional profile.' }
        ]);
    }
};
