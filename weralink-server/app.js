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
import webhookRoutes from './routes/webhooks.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { CronService } from './services/cron.service.js';
const app = express();

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
app.use('/api/webhooks', webhookRoutes);

app.get("/", (req, res) => {
    res.send("WeraLink API is active!");
});

app.use(errorHandler);

const serverPort = parseInt(PORT, 10) || 5500;
app.listen(serverPort, () => {
    console.log(`🚀 Server is running on port ${serverPort}`);
    CronService.startJobs();
});
