import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { ScreenContainer } from "../components/ScreenContainer";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { colors, radius, spacing } from "../theme/tokens";
import { api } from "../api/client";
import { formatDate } from "../utils/format";

export const AddLoanScreen = ({ navigation }: any) => {
  const [friendName, setFriendName] = useState("");
  const [amount, setAmount] = useState("");

  // Default due date to 14 days from today
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 14);
  const [dueDate, setDueDate] = useState<Date>(defaultDate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    friendName?: string;
    amount?: string;
    dueDate?: string;
  }>({});

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleSave = async () => {
    setError(null);
    setFieldErrors({});

    const trimmedName = friendName.trim();
    const trimmedAmount = amount.trim();

    const errors: { friendName?: string; amount?: string; dueDate?: string } = {};

    if (!trimmedName) {
      errors.friendName = "Please enter your friend's name";
    }

    if (!trimmedAmount) {
      errors.amount = "Please enter the loan amount";
    } else {
      const num = parseFloat(trimmedAmount);
      if (isNaN(num) || num <= 0) {
        errors.amount = "Amount must be greater than zero";
      } else if (!/^\d+(\.\d{1,2})?$/.test(trimmedAmount)) {
        errors.amount = "Amount can have at most 2 decimal places";
      }
    }

    // Validate that due date is not earlier than today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDue = new Date(dueDate);
    selectedDue.setHours(0, 0, 0, 0);

    if (selectedDue < today) {
      errors.dueDate = "Due date cannot be earlier than today";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Format date as ISO YYYY-MM-DD
    const year = dueDate.getFullYear();
    const month = String(dueDate.getMonth() + 1).padStart(2, "0");
    const day = String(dueDate.getDate()).padStart(2, "0");
    const isoDate = `${year}-${month}-${day}`;

    setLoading(true);
    try {
      await api.createLoan({
        friendName: trimmedName,
        amount: trimmedAmount,
        dueDate: isoDate,
      });

      // Navigate back to Dashboard; screen will reload updated list and summary
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || "Failed to create loan. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Loan</Text>
        <Text style={styles.headerSubtitle}>
          Record money lent to a friend and set a repayment due date.
        </Text>
      </View>

      <Card style={styles.card}>
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        <TextField
          label="FRIEND'S NAME"
          placeholder="e.g. Aman Sharma"
          value={friendName}
          onChangeText={(val) => {
            setFriendName(val);
            if (fieldErrors.friendName) {
              setFieldErrors((prev) => ({ ...prev, friendName: undefined }));
            }
          }}
          error={fieldErrors.friendName}
          maxLength={100}
          autoFocus
        />

        <TextField
          label="AMOUNT IN RUPEES"
          prefix="₹"
          placeholder="1500"
          value={amount}
          onChangeText={(val) => {
            setAmount(val);
            if (fieldErrors.amount) {
              setFieldErrors((prev) => ({ ...prev, amount: undefined }));
            }
          }}
          error={fieldErrors.amount}
          keyboardType="decimal-pad"
        />

        {/* Due Date Selector */}
        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>DUE DATE</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.dateValue}>
              {formatDate(dueDate.toISOString().split("T")[0])}
            </Text>
            <Text style={styles.changeDateAction}>Change Date</Text>
          </TouchableOpacity>
          {fieldErrors.dueDate ? (
            <Text style={styles.dateErrorText}>{fieldErrors.dueDate}</Text>
          ) : null}
        </View>

        {showDatePicker ? (
          <View style={styles.pickerWrapper}>
            {Platform.OS === "web" ? (
              <View style={styles.webDateWrapper}>
                <input
                  type="date"
                  value={dueDate.toISOString().split("T")[0]}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e: any) => {
                    if (e.target.value) {
                      const [y, m, d] = e.target.value.split("-").map(Number);
                      setDueDate(new Date(y, m - 1, d));
                    }
                    setShowDatePicker(false);
                  }}
                  style={{
                    padding: "10px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    border: `1.5px solid ${colors.border}`,
                    fontFamily: "inherit",
                    width: "100%",
                  }}
                />
              </View>
            ) : (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
            {Platform.OS === "ios" ? (
              <Button
                title="Done"
                size="sm"
                variant="secondary"
                onPress={() => setShowDatePicker(false)}
                style={styles.doneButton}
              />
            ) : null}
          </View>
        ) : null}

        <View style={styles.buttonRow}>
          <Button
            title="Save Loan"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.cancelButton}
          />
        </View>
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  header: {
    marginBottom: spacing.lg,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  card: {
    padding: spacing.xl,
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
  dateSection: {
    marginBottom: spacing.xl,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
    letterSpacing: 0.2,
  },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  changeDateAction: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primaryDark,
  },
  dateErrorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
    fontWeight: "500",
  },
  pickerWrapper: {
    marginBottom: spacing.md,
  },
  webDateWrapper: {
    width: "100%",
    marginVertical: spacing.xs,
  },
  doneButton: {
    alignSelf: "flex-end",
    marginTop: spacing.xs,
  },
  buttonRow: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  saveButton: {
    width: "100%",
  },
  cancelButton: {
    width: "100%",
  },
});
