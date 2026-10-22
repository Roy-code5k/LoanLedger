import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/error.middleware";
import { CreateLoanInput } from "./loans.schemas";

export class LoansService {
  /**
   * Helper to format a loan object consistently for JSON responses
   */
  static formatLoan(loan: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const loanDueDate = new Date(loan.dueDate);
    loanDueDate.setHours(0, 0, 0, 0);

    const isOverdue = loan.status === "PENDING" && loanDueDate < today;

    return {
      id: loan.id,
      userId: loan.userId,
      friendName: loan.friendName,
      amount: new Prisma.Decimal(loan.amount).toFixed(2),
      dueDate: loan.dueDate instanceof Date ? loan.dueDate.toISOString().split("T")[0] : String(loan.dueDate),
      status: loan.status,
      isOverdue,
      repaidAt: loan.repaidAt ? loan.repaidAt.toISOString() : null,
      createdAt: loan.createdAt.toISOString(),
      updatedAt: loan.updatedAt.toISOString(),
    };
  }

  /**
   * Create a new loan for the authenticated user
   */
  static async createLoan(userId: string, input: CreateLoanInput) {
    // Parse date ensuring it's treated as UTC date boundary
    const [year, month, day] = input.dueDate.split("-").map(Number);
    const dueDate = new Date(Date.UTC(year, month - 1, day));

    const loan = await prisma.loan.create({
      data: {
        userId,
        friendName: input.friendName,
        amount: new Prisma.Decimal(input.amount),
        dueDate,
      },
    });

    return this.formatLoan(loan);
  }

  /**
   * List all loans for the authenticated user with deterministic ordering
   */
  static async listLoans(userId: string, statusFilter?: "ALL" | "PENDING" | "REPAID" | "OVERDUE") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const whereClause: Prisma.LoanWhereInput = {
      userId,
    };

    if (statusFilter === "PENDING") {
      whereClause.status = "PENDING";
    } else if (statusFilter === "REPAID") {
      whereClause.status = "REPAID";
    } else if (statusFilter === "OVERDUE") {
      whereClause.status = "PENDING";
      whereClause.dueDate = {
        lt: today,
      };
    }

    const loans = await prisma.loan.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    return loans.map(this.formatLoan);
  }

  /**
   * Mark a pending loan as repaid
   */
  static async repayLoan(userId: string, loanId: string) {
    const loan = await prisma.loan.findFirst({
      where: {
        id: loanId,
        userId,
      },
    });

    if (!loan) {
      throw new AppError("Loan not found or does not belong to you.", 404, "RESOURCE_NOT_FOUND");
    }

    if (loan.status === "REPAID") {
      throw new AppError("Loan is already marked as repaid.", 409, "ALREADY_REPAID");
    }

    const updated = await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: "REPAID",
        repaidAt: new Date(),
      },
    });

    return this.formatLoan(updated);
  }
}
