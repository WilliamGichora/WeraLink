import prisma from '../config/prisma.js';
import { supabase } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { PERMISSIONS, ROLE_PERMISSIONS, ADMIN_IS_SUPERUSER } from '../config/roles.js';

/**
 * @returns {string|null}
 */
function extractToken(req) {
    return (
        req.cookies.access_token ||
        (req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : null)
    );
}

/**
 * @throws {AppError}
 */
async function resolveDbUser(req) {
    if (req.dbUser) return req.dbUser;

    const dbUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, role: true, status: true, email: true },
    });

    if (!dbUser) {
        throw new AppError('User record not found', 401, 'UNAUTHORIZED');
    }

    if (dbUser.status === 'SUSPENDED') {
        throw new AppError(
            'Your account has been suspended by an Administrator.',
            403,
            'SUSPENDED',
        );
    }

    if (dbUser.status === 'PENDING_OTP') {
        throw new AppError(
            'Please verify your account OTP to proceed.',
            403,
            'UNVERIFIED',
        );
    }

    req.dbUser = dbUser;
    return dbUser;
}


export const requireAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return next(
                new AppError('Missing or invalid authentication token', 401, 'UNAUTHORIZED'),
            );
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return next(
                new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'),
            );
        }

        req.user = { id: user.id };
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        next(new AppError('An error occurred during authentication', 500, 'INTERNAL_ERROR'));
    }
};

/**
 * @param {string[]} allowedRoles
 */
export const requireRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user?.id) {
                return next(
                    new AppError('User not authenticated', 401, 'UNAUTHORIZED'),
                );
            }

            const dbUser = await resolveDbUser(req);

            if (!allowedRoles.includes(dbUser.role)) {
                return next(
                    new AppError(
                        `Access denied. Requires one of: ${allowedRoles.join(', ')}`,
                        403,
                        'FORBIDDEN',
                    ),
                );
            }

            next();
        } catch (error) {
            if (error instanceof AppError) return next(error);
            console.error('Role Middleware Error:', error);
            next(new AppError('An error occurred during authorization', 500, 'INTERNAL_ERROR'));
        }
    };
};

/**
 * @param {string} requiredPermission 
 */
export const requirePermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.user?.id) {
                return next(
                    new AppError(
                        'Authentication required. Chain requireAuth before requirePermission.',
                        401,
                        'UNAUTHORIZED',
                    ),
                );
            }

            const dbUser = await resolveDbUser(req);

            const userRole = dbUser.role;
            const hasMasterOverride = ADMIN_IS_SUPERUSER && userRole === 'ADMIN';

            const rolePrivileges = ROLE_PERMISSIONS[userRole] || [];
            const hasPermission = rolePrivileges.includes(requiredPermission);

            if (!hasMasterOverride && !hasPermission) {
                return next(
                    new AppError(
                        `Access denied. Missing required system privilege: ${requiredPermission}`,
                        403,
                        'FORBIDDEN',
                    ),
                );
            }

            next();
        } catch (error) {
            if (error instanceof AppError) return next(error);
            console.error('Permission Middleware Error:', error);
            next(new AppError('An error occurred during secure authorization.', 500, 'INTERNAL_ERROR'));
        }
    };
};
