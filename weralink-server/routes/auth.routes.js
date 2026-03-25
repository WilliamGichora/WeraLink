import { Router } from 'express';
import { register, verifyOTP, login, checkAuth, logout, resendOTP, refreshSession, forgotPassword, updatePassword } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/check-auth', checkAuth);
router.post('/refresh', refreshSession);
router.post('/forgot-password', forgotPassword);
router.post('/update-password', requireAuth, updatePassword);

export default router;
