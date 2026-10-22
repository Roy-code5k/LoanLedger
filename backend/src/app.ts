import express, { Application, Request, Response } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware";
import { authRouter } from "./modules/auth/auth.routes";
import { loansRouter } from "./modules/loans/loans.routes";
import { summaryRouter } from "./modules/summary/summary.routes";

export const createApp = (): Application => {
  const app = express();

  // Basic security and parsing middleware
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      service: "miniledger-api",
      timestamp: new Date().toISOString(),
    });
  });

  // API modules
  app.use("/api/auth", authRouter);
  app.use("/api/loans", loansRouter);
  app.use("/api/summary", summaryRouter);

  // Centralized error handler
  app.use(errorHandler);

  return app;
};
