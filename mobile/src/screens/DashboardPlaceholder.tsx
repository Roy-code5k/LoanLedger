import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { colors, spacing, radius } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";

export const DashboardPlaceholder = () => {
  const { user, logout } = useAuth();

  return (
    <ScreenContainer style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>AUTHENTICATED</Text>
        </View>

        <Text style={styles.title}>Welcome to MiniLedger!</Text>
        <Text style={styles.subtitle}>
          Logged in as <Text style={styles.phoneHighlight}>{user?.phone}</Text>
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Phase 5 Verified</Text>
          <Text style={styles.infoText}>
            Authentication flow, mock OTP verification, and JWT session persistence via Expo SecureStore are working cleanly.
          </Text>
        </View>

        <Button
          title="Sign Out"
          variant="outline"
          onPress={logout}
          style={styles.logoutButton}
        />
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  card: {
    padding: spacing.xl,
    alignItems: "center",
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  phoneHighlight: {
    fontWeight: "700",
    color: colors.textPrimary,
  },
  infoBox: {
    backgroundColor: "#F8FAFC",
    padding: spacing.md,
    borderRadius: radius.md,
    width: "100%",
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryDark,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  logoutButton: {
    width: "100%",
  },
});
