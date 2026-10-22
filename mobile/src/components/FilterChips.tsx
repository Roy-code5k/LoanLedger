import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { colors, radius, spacing } from "../theme/tokens";

export type FilterStatus = "ALL" | "PENDING" | "REPAID" | "OVERDUE";

interface FilterChipsProps {
  selected: FilterStatus;
  onSelect: (filter: FilterStatus) => void;
  counts?: {
    all: number;
    pending: number;
    repaid: number;
    overdue: number;
  };
}

export const FilterChips = ({ selected, onSelect, counts }: FilterChipsProps) => {
  const filters: { key: FilterStatus; label: string; count?: number }[] = [
    { key: "ALL", label: "All", count: counts?.all },
    { key: "PENDING", label: "Pending", count: counts?.pending },
    { key: "REPAID", label: "Repaid", count: counts?.repaid },
    { key: "OVERDUE", label: "Overdue", count: counts?.overdue },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((item) => {
          const isSelected = selected === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipNormal,
              ]}
              onPress={() => onSelect(item.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextNormal,
                ]}
              >
                {item.label}
                {typeof item.count === "number" ? ` (${item.count})` : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipNormal: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  chipTextNormal: {
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
});
