export const colors = {
  background: "#F8FAFC", // Calm off-white / light neutral
  surface: "#FFFFFF",    // Crisp white card surface
  surfaceHover: "#F1F5F9",
  border: "#E2E8F0",     // Subtle border
  borderFocus: "#10B981",// Emerald border on active input

  textPrimary: "#0F172A", // Deep charcoal navy
  textSecondary: "#64748B", // Medium slate
  textMuted: "#94A3B8",   // Light slate
  textInverse: "#FFFFFF",

  primary: "#10B981",    // Emerald green
  primaryDark: "#059669",
  primaryLight: "#ECFDF5",

  success: "#10B981",
  successLight: "#ECFDF5",
  successText: "#047857",

  warning: "#F59E0B",
  warningLight: "#FFFBEB",
  warningText: "#B45309",

  danger: "#EF4444",     // Coral red for overdue / errors
  dangerLight: "#FEF2F2",
  dangerText: "#B91C1C",

  badgePendingBg: "#FEF3C7",
  badgePendingText: "#92400E",
  badgeRepaidBg: "#ECFDF5",
  badgeRepaidText: "#065F46",
  badgeOverdueBg: "#FEE2E2",
  badgeOverdueText: "#991B1B",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
};
