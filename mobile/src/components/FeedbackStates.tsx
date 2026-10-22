import React from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { colors, spacing, radius } from "../theme/tokens";
import { Button } from "./Button";

export const LoadingState = ({ message = "Loading..." }: { message?: string }) => (
  <View style={styles.centerContainer}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.loadingMessage}>{message}</Text>
  </View>
);

export const ErrorState = ({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <View style={styles.centerContainer}>
    <View style={styles.errorIconCircle}>
      <Text style={styles.errorIconText}>!</Text>
    </View>
    <Text style={styles.errorTitle}>Error</Text>
    <Text style={styles.errorMessage}>{message}</Text>
    {onRetry ? (
      <Button
        title="Try Again"
        onPress={onRetry}
        variant="outline"
        size="sm"
        style={styles.retryButton}
      />
    ) : null}
  </View>
);

export const EmptyState = ({
  title = "No Loans Yet",
  description = "Record your first loan to keep track of money lent to friends.",
  actionTitle,
  onAction,
}: {
  title?: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
}) => (
  <View style={styles.centerContainer}>
    <View style={styles.emptyIconCircle}>
      <Text style={styles.emptyIconText}>₹</Text>
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyDescription}>{description}</Text>
    {actionTitle && onAction ? (
      <Button
        title={actionTitle}
        onPress={onAction}
        variant="primary"
        size="md"
        style={styles.actionButton}
      />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    marginVertical: spacing.lg,
  },
  loadingMessage: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  errorIconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  errorIconText: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.danger,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 280,
    marginBottom: spacing.md,
  },
  retryButton: {
    marginTop: spacing.xs,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyIconText: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  actionButton: {
    minWidth: 160,
  },
});
