import prisma from '../config/prisma.js';
import { supabase } from '../config/supabase.js';

export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                data: null,
                meta: null,
                errors: [{ code: "UNAUTHORIZED", message: "Missing or invalid authorization header" }]
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({
                data: null,
                meta: null,
                errors: [{ code: "UNAUTHORIZED", message: "Invalid or expired token" }]
            });
        }

        // Attach Supabase user ID to request
        req.user = { id: user.id };
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(500).json({
            data: null,
            meta: null,
            errors: [{ code: "INTERNAL_ERROR", message: "An error occurred during authentication" }]
        });
    }
};

/**
 * Middleware to restrict routes to specific roles
 * @param {string[]} allowedRoles - Array of allowed roles (e.g., ['WORKER', 'EMPLOYER', 'ADMIN'])
 */
export const requireRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    data: null,
                    meta: null,
                    errors: [{ code: "UNAUTHORIZED", message: "User not authenticated" }]
                });
            }

            // Fetch user from database to verify role
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: { role: true, status: true }
            });

            if (!user) {
                return res.status(401).json({
                    data: null,
                    meta: null,
                    errors: [{ code: "UNAUTHORIZED", message: "User record not found" }]
                });
            }

            if (user.status !== 'ACTIVE') {
                 return res.status(403).json({
                    data: null,
                    meta: null,
                    errors: [{ code: "FORBIDDEN", message: "User account is not active" }]
                });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    data: null,
                    meta: null,
                    errors: [{ code: "FORBIDDEN", message: `Access denied. Requires one of: ${allowedRoles.join(', ')}` }]
                });
            }

            // Optional: attach full DB user details to req
            req.dbUser = user;
            next();
        } catch (error) {
             console.error("Role Middleware Error:", error);
             return res.status(500).json({
                data: null,
                meta: null,
                errors: [{ code: "INTERNAL_ERROR", message: "An error occurred during authorization" }]
            });
        }
    };
};
