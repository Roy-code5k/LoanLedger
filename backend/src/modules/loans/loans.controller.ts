import { Request, Response, NextFunction } from "express";
import { LoansService } from "./loans.service";
import { AppError } from "../../middleware/error.middleware";

export class LoansController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }

      const loan = await LoansService.createLoan(userId, req.body);
      res.status(201).json(loan);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }

      const status = req.query.status as any;
      const loans = await LoansService.listLoans(userId, status);
      res.status(200).json(loans);
    } catch (error) {
      next(error);
    }
  }

  static async repay(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await LoansService.repayLoan(userId, id as string);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }
}
