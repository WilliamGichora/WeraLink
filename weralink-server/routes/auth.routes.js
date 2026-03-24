import { Router } from 'express';
import { register, verifyOTP, login, checkAuth, logout, resendOTP } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/check-auth', checkAuth);
router.post('/logout', logout);

export default router;
