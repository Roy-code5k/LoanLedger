import { Router } from "express";
import { SummaryController } from "./summary.controller";
import { authenticateUser } from "../../middleware/auth.middleware";

export const summaryRouter = Router();

summaryRouter.use(authenticateUser);

summaryRouter.get("/", SummaryController.getSummary);
