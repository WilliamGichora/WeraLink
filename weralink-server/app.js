import express from "express";
import cors from "cors";
import helmet from "helmet"
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { PORT } from "./config/env.js";

import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import skillRoutes from './routes/skill.routes.js';
import gigRoutes from './routes/gig.routes.js';
import matchingRoutes from './routes/matching.routes.js';
import executionRoutes from './routes/execution.routes.js';
import mpesaRoutes from './routes/mpesa.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import webhookRoutes from './routes/webhooks.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import ratingRoutes from './routes/rating.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import reportRoutes from './routes/report.routes.js';
import trainingRoutes from './routes/training.routes.js';
import discoveryRoutes from './routes/discovery.routes.js';
import adminRoutes from './routes/admin.routes.js';
import disputeRoutes from './routes/dispute.routes.js';
import supportRoutes from './routes/support.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { CronService } from './services/cron.service.js';
const app = express();

// Global Request Logger for Debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.url.includes('webhook')) {
        console.log('Webhook Request Headers:', JSON.stringify(req.headers, null, 2));
    }
    next();
});

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || function (origin, callback) {
        if (!origin || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/matches', matchingRoutes);
app.use('/api', executionRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/support', supportRoutes);

app.get("/", (req, res) => {
    res.send("WeraLink API is active!");
});

app.use(errorHandler);

const serverPort = parseInt(PORT, 10) || 5500;
app.listen(serverPort, () => {
    console.log(`🚀 Server is running on port ${serverPort}`);
    CronService.startJobs();
});
