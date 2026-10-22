import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { colors, spacing, radius } from "../theme/tokens";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export const OtpScreen = ({ route, navigation }: any) => {
  const { phone } = route.params || { phone: "" };
  const { login } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleVerifyOtp = async () => {
    setError(null);
    const cleanedOtp = otp.trim();

    if (cleanedOtp.length !== 6) {
      setError("Please enter the 6-digit OTP code");
      return;
    }

    setLoading(true);
    try {
      const response = await api.verifyOtp(phone, cleanedOtp);
      await login(response.token, response.user);
      // Navigation happens reactively based on token presence in AuthContext
    } catch (err: any) {
      setError(err.message || "Invalid OTP code. Please check your backend terminal.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setError(null);
    setResending(true);
    try {
      await api.requestOtp(phone);
      setResendCooldown(30);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  // Mask phone for privacy (e.g. +91 98*** **210)
  const maskPhone = (num: string): string => {
    if (num.length < 8) return num;
    const start = num.slice(0, 5);
    const end = num.slice(-3);
    return `${start} •••• ${end}`;
  };

  return (
    <ScreenContainer style={styles.container}>
      <Card style={styles.card}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Change Phone</Text>
        </TouchableOpacity>

        <Text style={styles.cardTitle}>Enter 6-Digit OTP</Text>
        <Text style={styles.cardSubtitle}>
          Sent to <Text style={styles.phoneHighlight}>{maskPhone(phone)}</Text>
        </Text>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        <TextField
          label="VERIFICATION CODE"
          placeholder="123456"
          value={otp}
          onChangeText={(val) => {
            setOtp(val.replace(/\D/g, ""));
            if (error) setError(null);
          }}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          style={styles.otpInput}
        />

        <Button
          title="Verify & Sign In"
          onPress={handleVerifyOtp}
          loading={loading}
          style={styles.submitButton}
        />

        <View style={styles.resendRow}>
          {resendCooldown > 0 ? (
            <Text style={styles.cooldownText}>
              Resend code in {resendCooldown}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOtp} disabled={resending}>
              <Text style={styles.resendAction}>
                {resending ? "Sending..." : "Resend OTP"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.terminalReminder}>
          <Text style={styles.terminalReminderTitle}>Backend Terminal</Text>
          <Text style={styles.terminalReminderBody}>
            Look at the terminal where `npm run dev` is running to find your mock OTP.
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
  card: {
    padding: spacing.xl,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  backButtonText: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  phoneHighlight: {
    color: colors.textPrimary,
    fontWeight: "700",
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
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: "center",
    fontWeight: "700",
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  resendRow: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  cooldownText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "500",
  },
  resendAction: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "700",
  },
  terminalReminder: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: "#F8FAFC",
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  terminalReminderTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  terminalReminderBody: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
