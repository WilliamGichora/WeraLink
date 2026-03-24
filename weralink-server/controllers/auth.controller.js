import prisma from '../config/prisma.js';
import { supabase } from '../config/supabase.js';
const respond = (res, status, data, meta = null, errors = null) => {
    return res.status(status).json({ data, meta, errors });
};

export const register = async (req, res) => {
    try {
        const { email, password, phone, name, role } = req.body;

        if (!email || !password || !phone || !name || !role) {
            return respond(res, 400, null, null, [{ code: "VALIDATION_ERROR", message: "Missing required fields: email, password, phone, name, role" }]);
        }

        if (role === 'ADMIN') {
            return respond(res, 403, null, null, [{ code: "FORBIDDEN", message: "Admin registration is restricted. Contact support." }]);
        }

        if (!['WORKER', 'EMPLOYER'].includes(role)) {
            return respond(res, 400, null, null, [{ code: "VALIDATION_ERROR", message: "Invalid role specified." }]);
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [ { email }, { phone } ]
            }
        });

        if (existingUser) {
            return respond(res, 409, null, null, [{ code: "CONFLICT", message: "Email or phone already exists in the system." }]);
        }

        // 1. Create User in Supabase using Admin API to bypass public restrictions and queue OTP
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: false, // OTP is handled separately or via this if auto-confirm is off
            user_metadata: { name, phone, role }
        });

        if (authError) {
            console.error("Supabase Auth Error:", authError);
            return respond(res, 400, null, null, [{ code: "AUTH_ERROR", message: authError.message }]);
        }

        const supabaseUserId = authData.user.id;

        try {
            // 2. Create User in Prisma matching Supabase UUID
            await prisma.user.create({
                data: {
                    id: supabaseUserId,
                    email,
                    phone,
                    name,
                    role,
                    status: 'PENDING_OTP'
                }
            });

            // 3. Create basic profile placeholder
            await prisma.profile.create({
                data: {
                    userId: supabaseUserId
                }
            });

            // 4. Manually trigger the OTP email dispatch since admin.createUser suppresses it
            const { error: resendError } = await supabase.auth.resend({
                type: 'signup',
                email: email
            });

            if (resendError) {
                console.warn("Soft Error: OTP could not be dispatched automatically:", resendError.message);
            }
        } catch (dbError) {
            console.error("Database Transaction Error, rolling back Supabase user:", dbError);
            await supabase.auth.admin.deleteUser(supabaseUserId).catch(err => console.error("FATAL: Rollback failure for user", supabaseUserId, err));
            throw dbError;
        }

        return respond(res, 201, { message: "Registration successful. OTP sent to email for verification." });

    } catch (error) {
        console.error("Register Error:", error);
         if (error.code === 'P2002') {
             return respond(res, 409, null, null, [{ code: "CONFLICT", message: "Email or phone already exists in the system." }]);
         }
        return respond(res, 500, null, null, [{ code: "INTERNAL_ERROR", message: "An unexpected error occurred during registration" }]);
    }
};


export const verifyOTP = async (req, res) => {
    try {
        const { email, token, type } = req.body;

        if (!email || !token) {
             return respond(res, 400, null, null, [{ code: "VALIDATION_ERROR", message: "Email and OTP token are required." }]);
        }

        const verificationType = type || 'signup';

        const { data: authData, error: authError } = await supabase.auth.verifyOtp({
            email,
            token,
            type: verificationType
        });

        if (authError || !authData.session) {
            return respond(res, 401, null, null, [{ code: "UNAUTHORIZED", message: "Invalid or expired OTP." }]);
        }

        const supabaseUserId = authData.user.id;

        const updatedUser = await prisma.user.update({
            where: { id: supabaseUserId },
            data: { status: 'ACTIVE' },
            select: { id: true, email: true, name: true, role: true, status: true }
        });

        
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        };
        
        
        res.cookie('access_token', authData.session.access_token, {
            ...cookieOptions,
            maxAge: (authData.session.expires_in || 3600) * 1000
        });
        
        res.cookie('refresh_token', authData.session.refresh_token, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        return respond(res, 200, {
            user: updatedUser,
            message: "Authentication successful."
        });

    } catch (error) {
         console.error("Verify OTP Error:", error);
         return respond(res, 500, null, null, [{ code: "INTERNAL_ERROR", message: "An error occurred during OTP verification." }]);
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
             return respond(res, 400, null, null, [{ code: "VALIDATION_ERROR", message: "Email and password are required." }]);
        }

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
             return respond(res, 401, null, null, [{ code: "UNAUTHORIZED", message: "Invalid email or password." }]);
        }

        const { error: otpError } = await supabase.auth.signInWithOtp({ email });

        if (otpError) {
             return respond(res, 400, null, null, [{ code: "AUTH_ERROR", message: "Failed to send verification code." }]);
        }

        return respond(res, 200, { message: "Credentials verified. Please enter the verification code sent to your email." });

    } catch (error) {
        console.error("Login Error:", error);
         return respond(res, 500, null, null, [{ code: "INTERNAL_ERROR", message: "An error occurred while logging in." }]);
    }
};


export const checkAuth = async (req, res) => {
    try {
        const token = req.cookies.access_token;
        if (!token) {
            return respond(res, 401, null, null, [{ code: "UNAUTHORIZED", message: "No active session found." }]);
        }

        const { data, error } = await supabase.auth.getUser(token);
        
        if (error || !data.user) {
            return respond(res, 401, null, null, [{ code: "UNAUTHORIZED", message: "Invalid or expired session." }]);
        }

        const user = await prisma.user.findUnique({
            where: { id: data.user.id },
            select: { id: true, email: true, name: true, role: true, status: true }
        });

        if (!user) {
            return respond(res, 401, null, null, [{ code: "UNAUTHORIZED", message: "User profile not found." }]);
        }

        return respond(res, 200, { user });

    } catch (error) {
        console.error("Check Auth Error:", error);
        return respond(res, 500, null, null, [{ code: "INTERNAL_ERROR", message: "Error verifying active session." }]);
    }
};


export const logout = async (req, res) => {
    try {
        const token = req.cookies.access_token;
        if (token) {
            await supabase.auth.admin.signOut(token).catch(err => console.error("Supabase signout soft fail:", err));
        }
    } catch (err) {
        console.error("Logout process error:", err);
    } finally {
        res.clearCookie('access_token', { path: '/' });
        res.clearCookie('refresh_token', { path: '/' });
        return respond(res, 200, { message: "Logged out successfully" });
    }
};

export const resendOTP = async (req, res) => {
    try {
        const { email, type } = req.body;
        
        if (!email) {
            return respond(res, 400, null, null, [{ code: "VALIDATION_ERROR", message: "Email is required to resend OTP." }]);
        }

        let authError;
        
        if (type === 'magiclink') {
            const { error } = await supabase.auth.signInWithOtp({ email });
            authError = error;
        } else {
            const { error } = await supabase.auth.resend({ type: 'signup', email });
            authError = error;
        }

        if (authError) {
            return respond(res, 400, null, null, [{ code: "AUTH_ERROR", message: authError.message }]);
        }

        return respond(res, 200, { message: "Verification code sent effectively." });
    } catch (err) {
        console.error("Resend OTP Error:", err);
        return respond(res, 500, null, null, [{ code: "INTERNAL_ERROR", message: "An error occurred while resending OTP." }]);
    }
};
