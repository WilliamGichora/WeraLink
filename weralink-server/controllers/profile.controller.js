import prisma from '../config/prisma.js';
import { respond } from '../utils/respond.js';


export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const profile = await prisma.profile.findUnique({
            where: { userId },
            relationLoadStrategy: 'join',
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        status: true,
                        skills: { include: { skill: true } },
                        badges: { include: { badge: true } },
                        ratingsRecv: { 
                            select: { score: true, comment: true, createdAt: true, rater: { select: { name: true } } },
                            orderBy: { createdAt: 'desc' },
                            take: 5
                        }
                    }
                }
            }
        });

        if (!profile) {
            return respond(res, 404, null, null, [{ code: "NOT_FOUND", message: "Profile not found." }]);
        }

        return respond(res, 200, { profile });
    } catch (error) {
        console.error("Get Profile Error:", error);
        return respond(res, 500, null, null, [{ code: "INTERNAL_ERROR", message: "Failed to retrieve profile." }]);
    }
};


export const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio, location, availabilityStatus, portfolio, name, phone,
                companyName, companyDescription, companyLogo, industry, website } = req.body;

        const profileData = {};
        if (bio !== undefined) profileData.bio = bio;
        if (location !== undefined) profileData.location = location;
        if (availabilityStatus !== undefined) profileData.availabilityStatus = availabilityStatus;
        if (portfolio !== undefined) profileData.portfolio = portfolio;
        // Employer-specific fields
        if (companyName !== undefined) profileData.companyName = companyName;
        if (companyDescription !== undefined) profileData.companyDescription = companyDescription;
        if (companyLogo !== undefined) profileData.companyLogo = companyLogo;
        if (industry !== undefined) profileData.industry = industry;
        if (website !== undefined) profileData.website = website;

        const updatedProfile = await prisma.profile.update({
            where: { userId },
            data: {
                ...profileData,
                user: (name !== undefined || phone !== undefined) ? {
                    update: {
                        ...(name !== undefined && { name }),
                        ...(phone !== undefined && { phone })
                    }
                } : undefined
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        status: true
                    }
                }
            }
        });

        return respond(res, 200, { profile: updatedProfile });
    } catch (error) {
        console.error("Update Profile Error:", error);
        
        if (error.code === 'P2025') {
            return respond(res, 404, null, null, [{ code: "NOT_FOUND", message: "Profile not found to update." }]);
        }
        
        return respond(res, 500, null, null, [{ code: "INTERNAL_ERROR", message: "Failed to update profile." }]);
    }
};

export const addMySkill = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skillId, level, skills } = req.body;
        
        let skillsToAdd = [];
        if (skills && Array.isArray(skills)) {
            skillsToAdd = skills.map(s => ({ userId, skillId: s.skillId, level: s.level || 1 }));
        } else if (skillId) {
            skillsToAdd = [{ userId, skillId, level: level || 1 }];
        } else {
            return respond(res, 400, null, null, [{ code: "VALIDATION_ERROR", message: "skillId or skills array is required." }]);
        }

        const result = await prisma.userSkill.createMany({
            data: skillsToAdd,
            skipDuplicates: true
        });

        return respond(res, 201, { addedCount: result.count });
    } catch (error) {
        console.error("Add Skill Error:", error);
        if (error.code === 'P2002') return respond(res, 409, null, null, [{ code: "CONFLICT", message: "Skill already added." }]);
        return respond(res, 500, null, null, [{ code: "INTERNAL_ERROR", message: "Failed to add skills." }]);
    }
};

export const removeMySkill = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skillId } = req.params;

        await prisma.userSkill.delete({
            where: { userId_skillId: { userId, skillId } }
        });

        return respond(res, 200, { success: true });
    } catch (error) {
        console.error("Remove Skill Error:", error);
        return respond(res, 500, null, null, [{ code: "INTERNAL_ERROR", message: "Failed to remove skill." }]);
    }
};

/**
 * Public employer profile — used in GigDetailView to show employer info.
 */
export const getPublicEmployerProfile = async (req, res) => {
    try {
        const { id: userId } = req.params;

        const profile = await prisma.profile.findUnique({
            where: { userId },
            select: {
                companyName: true,
                companyDescription: true,
                companyLogo: true,
                industry: true,
                website: true,
                location: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        createdAt: true,
                        _count: { select: { postedGigs: true } },
                        ratingsRecv: {
                            select: { score: true },
                        },
                    },
                },
            },
        });

        if (!profile || profile.user.role !== 'EMPLOYER') {
            return respond(res, 404, null, null, [{ code: "NOT_FOUND", message: "Employer profile not found." }]);
        }

        // Calculate avg rating
        const ratings = profile.user.ratingsRecv || [];
        const avgRating = ratings.length > 0
            ? Math.round(ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length * 10) / 10
            : null;

        return respond(res, 200, {
            profile: {
                ...profile,
                user: {
                    ...profile.user,
                    avgRating,
                    totalRatings: ratings.length,
                    ratingsRecv: undefined,
                },
            },
        });
    } catch (error) {
        console.error("Get Public Employer Profile Error:", error);
        return respond(res, 500, null, null, [{ code: "INTERNAL_ERROR", message: "Failed to retrieve employer profile." }]);
    }
};
