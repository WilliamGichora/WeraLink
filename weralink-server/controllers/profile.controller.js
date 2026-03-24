import prisma from '../config/prisma.js';

const respond = (res, status, data, meta = null, errors = null) => {
    return res.status(status).json({ data, meta, errors });
};


export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const profile = await prisma.profile.findUnique({
            where: { userId },
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
        const { bio, location, availabilityStatus, portfolioUrls } = req.body;

        const updatedProfile = await prisma.profile.update({
            where: { userId },
            data: {
                bio: bio !== undefined ? bio : undefined,
                location: location !== undefined ? location : undefined,
                availabilityStatus: availabilityStatus !== undefined ? availabilityStatus : undefined,
                portfolioUrls: portfolioUrls !== undefined ? portfolioUrls : undefined,
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
