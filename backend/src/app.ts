import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import type { Request,Response } from "express";
import morgan from "morgan";
import logger from "#config/logger.js";
import connectDB from "#config/db.js";
import { corsOptions } from "#config/cors.config.js";
import authRoutes from "#routes/auth.routes.js";
import userRoutes from "#routes/user.routes.js";
import googleRoutes from "#routes/google.routes.js";
import "#config/passport.js";
import helmet from "helmet";
import passport from "passport";

const app = express();

app.use(helmet());


connectDB();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  })
);


app.get('/', (_req: Request, res: Response) => {
  logger.info('Hello from ChatType!');
  res.status(200).send('Hello from ChatType!');
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'ChatType API is running!' });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/oauth", googleRoutes);



export default app;
