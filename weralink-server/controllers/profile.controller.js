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
        const { bio, location, availabilityStatus, portfolio, name, phone } = req.body;

        const updatedProfile = await prisma.profile.update({
            where: { userId },
            data: {
                bio: bio !== undefined ? bio : undefined,
                location: location !== undefined ? location : undefined,
                availabilityStatus: availabilityStatus !== undefined ? availabilityStatus : undefined,
                portfolio: portfolio !== undefined ? portfolio : undefined,
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
