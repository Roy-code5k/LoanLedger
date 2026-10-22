import React from "react";
import { StyleSheet, View, Text, ViewStyle } from "react-native";
import { colors, radius, spacing } from "../theme/tokens";

interface StatusBadgeProps {
  status: "PENDING" | "REPAID";
  isOverdue?: boolean;
  style?: ViewStyle;
}

export const StatusBadge = ({ status, isOverdue = false, style }: StatusBadgeProps) => {
  if (status === "REPAID") {
    return (
      <View style={[styles.badge, styles.repaidBadge, style]}>
        <Text style={[styles.text, styles.repaidText]}>✓ REPAID</Text>
      </View>
    );
  }

  if (isOverdue) {
    return (
      <View style={[styles.badge, styles.overdueBadge, style]}>
        <Text style={[styles.text, styles.overdueText]}>⚠ OVERDUE</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.pendingBadge, style]}>
      <Text style={[styles.text, styles.pendingText]}>● PENDING</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  repaidBadge: {
    backgroundColor: colors.badgeRepaidBg,
  },
  repaidText: {
    color: colors.badgeRepaidText,
  },
  overdueBadge: {
    backgroundColor: colors.badgeOverdueBg,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  overdueText: {
    color: colors.badgeOverdueText,
  },
  pendingBadge: {
    backgroundColor: colors.badgePendingBg,
  },
  pendingText: {
    color: colors.badgePendingText,
  },
});
