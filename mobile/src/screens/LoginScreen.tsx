import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { colors, spacing, radius } from "../theme/tokens";
import { api } from "../api/client";

export const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    setError(null);
    const cleaned = phone.trim();

    if (!cleaned) {
      setError("Please enter your phone number");
      return;
    }

    if (cleaned.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    // Auto prepend +91 if user provided 10 digits
    const fullPhone = cleaned.startsWith("+")
      ? cleaned
      : cleaned.length === 10
      ? `+91${cleaned}`
      : `+${cleaned}`;

    setLoading(true);
    try {
      await api.requestOtp(fullPhone);
      navigation.navigate("Otp", { phone: fullPhone });
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeText}>₹</Text>
        </View>
        <Text style={styles.appName}>MiniLedger</Text>
        <Text style={styles.tagline}>Track money lent to friends with zero friction.</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Sign In with Phone</Text>
        <Text style={styles.cardSubtitle}>
          We will generate a 6-digit verification code.
        </Text>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        <TextField
          label="PHONE NUMBER"
          prefix="+91"
          placeholder="98765 43210"
          value={phone}
          onChangeText={(val) => {
            setPhone(val);
            if (error) setError(null);
          }}
          keyboardType="phone-pad"
          maxLength={15}
          autoFocus
        />

        <Button
          title="Send OTP"
          onPress={handleSendOtp}
          loading={loading}
          style={styles.submitButton}
        />

        <View style={styles.demoNotice}>
          <Text style={styles.demoNoticeIcon}>ℹ️</Text>
          <Text style={styles.demoNoticeText}>
            <Text style={styles.demoNoticeBold}>Demo Mode: </Text>
            Your 6-digit mock OTP is printed directly in the backend terminal.
          </Text>
        </View>
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  logoBadgeText: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 280,
  },
  card: {
    padding: spacing.xl,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  errorBanner: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    fontSize: 13,
    color: colors.dangerText,
    fontWeight: "500",
  },
  submitButton: {
    marginTop: spacing.xs,
  },
  demoNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F1F5F9",
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  demoNoticeIcon: {
    marginRight: spacing.sm,
    fontSize: 14,
  },
  demoNoticeText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  demoNoticeBold: {
    fontWeight: "700",
    color: colors.textPrimary,
  },
});
