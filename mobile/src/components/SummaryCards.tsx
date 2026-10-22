import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Summary } from "../types/api";
import { colors, radius, shadows, spacing } from "../theme/tokens";
import { formatINR } from "../utils/format";

interface SummaryCardsProps {
  summary: Summary | null;
  loading?: boolean;
}

export const SummaryCards = ({ summary, loading }: SummaryCardsProps) => {
  const totalLent = summary?.totalLent || "0.00";
  const totalRepaid = summary?.totalRepaid || "0.00";
  const overdueAmount = summary?.overdueAmount || "0.00";
  const hasOverdue = parseFloat(overdueAmount) > 0;

  return (
    <View style={styles.container}>
      {/* Primary metric: Total Lent */}
      <View style={[styles.card, styles.primaryCard, shadows.md]}>
        <View style={styles.headerRow}>
          <Text style={styles.primaryLabel}>TOTAL LENT</Text>
          <View style={styles.iconCirclePrimary}>
            <Text style={styles.iconTextPrimary}>₹</Text>
          </View>
        </View>
        <Text style={styles.primaryValue} numberOfLines={1} adjustsFontSizeToFit>
          {loading ? "..." : formatINR(totalLent)}
        </Text>
        <Text style={styles.primarySubtext}>All lending records</Text>
      </View>

      {/* Row with Total Repaid and Overdue Amount */}
      <View style={styles.subRow}>
        {/* Total Repaid Card */}
        <View style={[styles.card, styles.repaidCard, shadows.sm]}>
          <Text style={styles.subLabel}>TOTAL REPAID</Text>
          <Text style={styles.repaidValue} numberOfLines={1} adjustsFontSizeToFit>
            {loading ? "..." : formatINR(totalRepaid)}
          </Text>
          <Text style={styles.subHint}>Cleared loans</Text>
        </View>

        {/* Overdue Card */}
        <View
          style={[
            styles.card,
            hasOverdue ? styles.overdueActiveCard : styles.overdueNormalCard,
            shadows.sm,
          ]}
        >
          <View style={styles.overdueHeader}>
            <Text
              style={[
                styles.subLabel,
                hasOverdue ? styles.overdueActiveLabel : null,
              ]}
            >
              OVERDUE
            </Text>
            {hasOverdue ? <Text style={styles.overdueAlertBadge}>!</Text> : null}
          </View>
          <Text
            style={[
              styles.overdueValue,
              hasOverdue ? styles.overdueActiveValue : null,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {loading ? "..." : formatINR(overdueAmount)}
          </Text>
          <Text style={styles.subHint}>
            {hasOverdue ? "Past due date" : "No overdue loans"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    marginBottom: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  primaryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  iconCirclePrimary: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  iconTextPrimary: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "800",
  },
  primaryValue: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginVertical: spacing.xs,
  },
  primarySubtext: {
    fontSize: 12,
    color: colors.textMuted,
  },
  subRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  repaidCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  subLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  repaidValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.successText,
    marginBottom: 2,
  },
  subHint: {
    fontSize: 11,
    color: colors.textMuted,
  },
  overdueNormalCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  overdueActiveCard: {
    flex: 1,
    backgroundColor: "#FFF5F5",
    borderColor: "#FECACA",
  },
  overdueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  overdueActiveLabel: {
    color: colors.dangerText,
  },
  overdueAlertBadge: {
    color: colors.danger,
    fontWeight: "900",
    fontSize: 12,
    backgroundColor: "#FEE2E2",
    width: 18,
    height: 18,
    borderRadius: radius.full,
    textAlign: "center",
    lineHeight: 18,
  },
  overdueValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  overdueActiveValue: {
    color: colors.danger,
  },
});
