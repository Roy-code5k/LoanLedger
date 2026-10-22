import React, { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, radius, shadows, spacing } from "../theme/tokens";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: "elevated" | "flat" | "bordered";
}

export const Card = ({ children, style, variant = "elevated" }: CardProps) => {
  return (
    <View
      style={[
        styles.card,
        variant === "elevated" && shadows.md,
        variant === "bordered" && styles.bordered,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bordered: {
    borderWidth: 1.5,
    borderColor: colors.border,
  },
});
