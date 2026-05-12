import prisma from '../config/prisma.js';
import { AnalyticsService } from './analytics.service.js';

/**
 * DiscoveryService
 * Handles public data fetching for guest users and the landing page.
 */
/**
 * Aggregates platform statistics for the landing page masterpiece.
 */
export const getPlatformStats = async () => {
    const [adminAnalytics, totalCategories] = await Promise.all([
        AnalyticsService.getAdminAnalytics({ months: 12 }),
        prisma.gig.groupBy({
            by: ['category'],
            _count: { id: true }
        })
    ]);

    return {
        totalGigs: adminAnalytics.kpis.activeGigs,
        totalWorkers: adminAnalytics.kpis.verifiedWorkers,
        totalEarnings: adminAnalytics.kpis.totalGMV,
        completedGigs: adminAnalytics.kpis.completedGigs,
        avgRating: adminAnalytics.kpis.avgPlatformRating || 4.8,
        activeCategories: totalCategories.length,
        growth: adminAnalytics.userGrowth
    };
};

/**
 * Fetches featured workers and employers for landing page showcase.
 */
export const getFeaturedContent = async () => {
    let [topWorkers, topEmployers] = await Promise.all([
        // Workers with high verified skill count and high ratings
        prisma.user.findMany({
            where: { 
                role: 'WORKER', 
                status: 'ACTIVE',
                OR: [
                    { profile: { verified: true } },
                    { skills: { some: { verified: true } } }
                ]
            },
            take: 5,
            select: {
                id: true,
                name: true,
                profile: {
                    select: {
                        bio: true,
                        location: true,
                        verified: true
                    }
                },
                skills: {
                    where: { verified: true },
                    take: 3,
                    include: { skill: { select: { name: true } } }
                },
                badges: {
                    take: 2,
                    include: { badge: { select: { name: true } } }
                },
                _count: {
                    select: { assignments: { where: { status: 'PAID' } } }
                }
            },
            orderBy: [
                { assignments: { _count: 'desc' } }
            ]
        }),

        // Employers who have posted many gigs and have good reputation
        prisma.user.findMany({
            where: { role: 'EMPLOYER', status: 'ACTIVE' },
            take: 5,
            select: {
                id: true,
                name: true,
                profile: {
                    select: {
                        bio: true,
                        location: true
                    }
                },
                _count: {
                    select: { postedGigs: true }
                }
            },
            orderBy: [
                { postedGigs: { _count: 'desc' } }
            ]
        })
    ]);

    // Fallback: If no verified workers, get any active workers with assignments
    if (topWorkers.length === 0) {
        topWorkers = await prisma.user.findMany({
            where: { role: 'WORKER', status: 'ACTIVE' },
            take: 5,
            select: {
                id: true,
                name: true,
                profile: { select: { bio: true, location: true, verified: true } },
                skills: { take: 3, include: { skill: { select: { name: true } } } },
                badges: { take: 2, include: { badge: { select: { name: true } } } },
                _count: { select: { assignments: { where: { status: 'PAID' } } } }
            },
            orderBy: { assignments: { _count: 'desc' } }
        });
    }

    // Fallback: If no top employers, get any active employers
    if (topEmployers.length === 0) {
        topEmployers = await prisma.user.findMany({
            where: { role: 'EMPLOYER', status: 'ACTIVE' },
            take: 5,
            select: {
                id: true,
                name: true,
                profile: { select: { bio: true, location: true } },
                _count: { select: { postedGigs: true } }
            }
        });
    }

    return {
        featuredWorkers: topWorkers.map(w => ({
            id: w.id,
            name: w.name,
            bio: w.profile?.bio,
            location: w.profile?.location,
            verified: w.profile?.verified,
            skills: w.skills.map(s => s.skill.name),
            badges: w.badges.map(b => b.badge.name),
            completions: w._count.assignments
        })),
        featuredEmployers: topEmployers.map(e => ({
            id: e.id,
            name: e.name,
            bio: e.profile?.bio,
            location: e.profile?.location,
            gigCount: e._count.postedGigs
        }))
    };
};

/**
 * Fetches a public profile with strict data redaction for security.
 */
export const getPublicProfile = async (userId) => {
    const profile = await prisma.profile.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    skills: {
                        include: { skill: { select: { name: true, category: true } } }
                    },
                    badges: {
                        include: { badge: { select: { name: true, description: true } } }
                    },
                    ratingsRecv: {
                        select: {
                            score: true,
                            comment: true,
                            createdAt: true,
                            rater: { select: { name: true } }
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    },
                    _count: {
                        select: {
                            assignments: { where: { status: 'PAID' } },
                            postedGigs: true
                        }
                    }
                }
            }
        }
    });

    if (!profile) return null;

    // If employer, fetch a few public-safe gigs
    let postedGigs = [];
    if (profile.user.role === 'EMPLOYER') {
        postedGigs = await prisma.gig.findMany({
            where: { employerId: userId, status: 'OPEN' },
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                category: true,
                payAmount: true,
                currency: true,
                location: true,
                workType: true
            }
        });
    }

    return {
        id: profile.userId,
        name: profile.user.name,
        role: profile.user.role,
        bio: profile.bio,
        location: profile.location,
        verified: profile.verified,
        joinedAt: profile.user.createdAt,
        skills: profile.user.skills.map(s => ({
            name: s.skill.name,
            category: s.skill.category,
            level: s.level,
            verified: s.verified
        })),
        badges: profile.user.badges.map(b => ({
            name: b.badge.name,
            description: b.badge.description
        })),
        ratings: profile.user.ratingsRecv,
        stats: {
            completions: profile.user._count.assignments,
            gigsPosted: profile.user._count.postedGigs
        },
        activeGigs: postedGigs
    };
};
