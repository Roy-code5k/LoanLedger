import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors, radius, spacing } from "../theme/tokens";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) => {
  const getContainerStyle = (): ViewStyle[] => {
    const list: ViewStyle[] = [styles.base];

    // Size
    if (size === "sm") list.push(styles.sizeSm);
    else if (size === "lg") list.push(styles.sizeLg);
    else list.push(styles.sizeMd);

    // Variant
    if (variant === "secondary") list.push(styles.variantSecondary);
    else if (variant === "outline") list.push(styles.variantOutline);
    else if (variant === "danger") list.push(styles.variantDanger);
    else list.push(styles.variantPrimary);

    if (disabled || loading) {
      list.push(styles.disabled);
    }

    if (style) list.push(style);
    return list;
  };

  const getTextStyle = (): TextStyle[] => {
    const list: TextStyle[] = [styles.textBase];

    if (size === "sm") list.push(styles.textSm);
    else if (size === "lg") list.push(styles.textLg);
    else list.push(styles.textMd);

    if (variant === "outline") list.push(styles.textOutline);
    else if (variant === "secondary") list.push(styles.textSecondary);
    else list.push(styles.textWhite);

    if (textStyle) list.push(textStyle);
    return list;
  };

  const spinnerColor =
    variant === "outline" ? colors.primary : variant === "secondary" ? colors.textPrimary : "#FFFFFF";

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sizeMd: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  sizeLg: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  variantPrimary: {
    backgroundColor: colors.primary,
  },
  variantSecondary: {
    backgroundColor: colors.surfaceHover,
  },
  variantOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  variantDanger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontWeight: "700",
  },
  textSm: {
    fontSize: 13,
  },
  textMd: {
    fontSize: 15,
  },
  textLg: {
    fontSize: 17,
  },
  textWhite: {
    color: "#FFFFFF",
  },
  textOutline: {
    color: colors.textPrimary,
  },
  textSecondary: {
    color: colors.textPrimary,
  },
});
