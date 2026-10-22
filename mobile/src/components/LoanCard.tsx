import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Loan } from "../types/api";
import { colors, radius, shadows, spacing } from "../theme/tokens";
import { formatINR, formatDate } from "../utils/format";
import { StatusBadge } from "./StatusBadge";

interface LoanCardProps {
  loan: Loan;
  onRepay: (id: string) => void;
  isRepaying?: boolean;
}

export const LoanCard = ({ loan, onRepay, isRepaying = false }: LoanCardProps) => {
  const isPending = loan.status === "PENDING";
  const isOverdue = loan.isOverdue;

  // Extract avatar initial from friend's name
  const initial = loan.friendName.trim().charAt(0).toUpperCase() || "?";

  return (
    <View
      style={[
        styles.card,
        isOverdue ? styles.overdueCard : null,
        shadows.sm,
      ]}
    >
      <View style={styles.topRow}>
        {/* Avatar circle + Friend Name */}
        <View style={styles.friendInfo}>
          <View
            style={[
              styles.avatar,
              isOverdue
                ? styles.avatarOverdue
                : loan.status === "REPAID"
                ? styles.avatarRepaid
                : styles.avatarPending,
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                isOverdue
                  ? styles.avatarTextOverdue
                  : loan.status === "REPAID"
                  ? styles.avatarTextRepaid
                  : styles.avatarTextPending,
              ]}
            >
              {initial}
            </Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.friendName} numberOfLines={1}>
              {loan.friendName}
            </Text>
            <Text style={styles.dueDateText}>
              {loan.status === "REPAID"
                ? `Repaid on ${formatDate(loan.repaidAt || loan.updatedAt)}`
                : isOverdue
                ? `Overdue since ${formatDate(loan.dueDate)}`
                : `Due on ${formatDate(loan.dueDate)}`}
            </Text>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.amountContainer}>
          <Text
            style={[
              styles.amountText,
              loan.status === "REPAID" ? styles.amountRepaid : null,
            ]}
            numberOfLines={1}
          >
            {formatINR(loan.amount)}
          </Text>
        </View>
      </View>

      {/* Bottom Row: Badge and Repay Action */}
      <View style={styles.bottomRow}>
        <StatusBadge status={loan.status} isOverdue={isOverdue} />

        {isPending ? (
          <TouchableOpacity
            style={styles.repayButton}
            onPress={() => onRepay(loan.id)}
            disabled={isRepaying}
            activeOpacity={0.7}
          >
            {isRepaying ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.repayButtonText}>Mark Repaid</Text>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overdueCard: {
    borderColor: "#FECACA",
    backgroundColor: "#FFFBFB",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  avatarPending: {
    backgroundColor: "#EFF6FF",
  },
  avatarRepaid: {
    backgroundColor: colors.primaryLight,
  },
  avatarOverdue: {
    backgroundColor: "#FEE2E2",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "800",
  },
  avatarTextPending: {
    color: "#2563EB",
  },
  avatarTextRepaid: {
    color: colors.primaryDark,
  },
  avatarTextOverdue: {
    color: colors.danger,
  },
  nameContainer: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  dueDateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  amountRepaid: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: spacing.sm,
  },
  repayButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  repayButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primaryDark,
  },
});
