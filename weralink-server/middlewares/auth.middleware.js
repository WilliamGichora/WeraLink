import prisma from '../config/prisma.js';
import { supabase } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { PERMISSIONS, ROLE_PERMISSIONS, ADMIN_IS_SUPERUSER } from '../config/roles.js';

export const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies.access_token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

        if (!token) {
            return res.status(401).json({
                data: null,
                meta: null,
                errors: [{ code: "UNAUTHORIZED", message: "Missing or invalid authentication token" }]
            });
        }
        
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
             return res.status(401).json({
                data: null,
                meta: null,
                errors: [{ code: "UNAUTHORIZED", message: "Invalid or expired token" }]
            });
        }

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
 * @param {string[]} allowedRoles 
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

/**
 * @param {string} requiredPermission 
 */
export const requirePermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies.access_token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

            if (!token) {
                 return next(new AppError("Missing or invalid authentication token", 401, "UNAUTHORIZED"));
            }
            
            const { data: { user }, error } = await supabase.auth.getUser(token);
            
            if (error || !user) {
                 return next(new AppError("Invalid or expired token", 401, "UNAUTHORIZED"));
            }

            const dbUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { id: true, role: true, status: true, email: true }
            });

            if (!dbUser) {
                 return next(new AppError("User record not found", 401, "UNAUTHORIZED"));
            }

            if (dbUser.status === 'SUSPENDED') {
                 return next(new AppError("Your account has been suspended by an Administrator.", 403, "SUSPENDED"));
            }
            
            if (dbUser.status === 'PENDING_OTP') {
                 return next(new AppError("Please verify your account OTP to proceed.", 403, "UNVERIFIED"));
            }

            const userRole = dbUser.role;
            const hasMasterOverride = ADMIN_IS_SUPERUSER && userRole === 'ADMIN';
            
            const rolePrivileges = ROLE_PERMISSIONS[userRole] || [];
            const hasPermission = rolePrivileges.includes(requiredPermission);

            if (!hasMasterOverride && !hasPermission) {
                return next(new AppError(`Access denied. Missing required system privilege: ${requiredPermission}`, 403, "FORBIDDEN"));
            }

            req.user = { id: dbUser.id, role: dbUser.role };
            req.dbUser = dbUser;
            next();
        } catch (error) {
            console.error("Permission Middleware Error:", error);
            next(new AppError("An error occurred during secure authorization.", 500, "INTERNAL_ERROR"));
        }
    };
};
