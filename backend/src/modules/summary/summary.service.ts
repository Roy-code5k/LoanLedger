import { prisma } from "../../lib/prisma";

export class SummaryService {
  /**
   * Computes financial summaries for the authenticated user:
   * - totalLent: sum of all loans regardless of status
   * - totalRepaid: sum of repaid loans
   * - overdueAmount: sum of pending loans with dueDate strictly before today
   */
  static async getSummary(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Run parallel aggregates with Decimal safety
    const [totalLentAgg, totalRepaidAgg, overdueAgg] = await Promise.all([
      prisma.loan.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.loan.aggregate({
        where: { userId, status: "REPAID" },
        _sum: { amount: true },
      }),
      prisma.loan.aggregate({
        where: {
          userId,
          status: "PENDING",
          dueDate: {
            lt: today,
          },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalLent = totalLentAgg._sum.amount ? totalLentAgg._sum.amount.toFixed(2) : "0.00";
    const totalRepaid = totalRepaidAgg._sum.amount ? totalRepaidAgg._sum.amount.toFixed(2) : "0.00";
    const overdueAmount = overdueAgg._sum.amount ? overdueAgg._sum.amount.toFixed(2) : "0.00";

    return {
      totalLent,
      totalRepaid,
      overdueAmount,
      currency: "INR",
    };
  }
}
