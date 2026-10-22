import { Router } from "express";
import { LoansController } from "./loans.controller";
import { authenticateUser } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { createLoanSchema } from "./loans.schemas";

export const loansRouter = Router();

// All loan routes require authentication
loansRouter.use(authenticateUser);

loansRouter.post("/", validateRequest(createLoanSchema), LoansController.create);
loansRouter.get("/", LoansController.list);
loansRouter.patch("/:id/repay", LoansController.repay);
