import { Request, Response, NextFunction } from "express";
import { SummaryService } from "./summary.service";
import { AppError } from "../../middleware/error.middleware";

export class SummaryController {
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
      }

      const summary = await SummaryService.getSummary(userId);
      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }
}
