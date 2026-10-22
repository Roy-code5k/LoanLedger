import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { Loan, Summary } from "../types/api";
import { SummaryCards } from "../components/SummaryCards";
import { LoanCard } from "../components/LoanCard";
import { FilterChips, FilterStatus } from "../components/FilterChips";
import { LoadingState, ErrorState, EmptyState } from "../components/FeedbackStates";
import { colors, radius, spacing } from "../theme/tokens";

export const DashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>("ALL");
  const [repayingId, setRepayingId] = useState<string | null>(null);

  // Load summary and loans concurrently
  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      const [summaryData, loansData] = await Promise.all([
        api.getSummary(),
        api.getLoans(),
      ]);
      setSummary(summaryData);
      setLoans(loansData);
    } catch (err: any) {
      setError(err.message || "Failed to load ledger data. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Re-fetch when navigating back from AddLoanScreen
    const unsubscribe = navigation.addListener("focus", () => {
      loadData(true);
    });

    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleRepay = async (loanId: string) => {
    setRepayingId(loanId);
    try {
      await api.repayLoan(loanId);
      // Immediately refresh data
      await loadData(true);
    } catch (err: any) {
      Alert.alert("Repayment Failed", err.message || "Unable to mark loan as repaid.");
    } finally {
      setRepayingId(null);
    }
  };

  // Calculate filter counts
  const counts = {
    all: loans.length,
    pending: loans.filter((l) => l.status === "PENDING" && !l.isOverdue).length,
    repaid: loans.filter((l) => l.status === "REPAID").length,
    overdue: loans.filter((l) => l.isOverdue).length,
  };

  // Filter loans for display
  const filteredLoans = loans.filter((loan) => {
    if (selectedFilter === "PENDING") {
      return loan.status === "PENDING";
    }
    if (selectedFilter === "REPAID") {
      return loan.status === "REPAID";
    }
    if (selectedFilter === "OVERDUE") {
      return loan.isOverdue;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredLoans}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <View>
                <Text style={styles.brandTitle}>MiniLedger</Text>
                <Text style={styles.userPhone}>{user?.phone}</Text>
              </View>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={logout}
                activeOpacity={0.7}
              >
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>

            {/* Primary Action Button: Add Loan */}
            <TouchableOpacity
              style={styles.addLoanButton}
              onPress={() => navigation.navigate("AddLoan")}
              activeOpacity={0.8}
            >
              <Text style={styles.addLoanIcon}>+</Text>
              <Text style={styles.addLoanText}>Add Loan</Text>
            </TouchableOpacity>

            {/* Financial Summary */}
            <SummaryCards summary={summary} loading={loading} />

            {/* Section Header & Filter Chips */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Loan History</Text>
              <Text style={styles.recordCountText}>
                {filteredLoans.length} {filteredLoans.length === 1 ? "entry" : "entries"}
              </Text>
            </View>

            <FilterChips
              selected={selectedFilter}
              onSelect={setSelectedFilter}
              counts={counts}
            />

            {error ? <ErrorState message={error} onRetry={() => loadData()} /> : null}
            {loading && !refreshing ? <LoadingState message="Loading your loans..." /> : null}
          </View>
        }
        renderItem={({ item }) => (
          <LoanCard
            loan={item}
            onRepay={handleRepay}
            isRepaying={repayingId === item.id}
          />
        )}
        ListEmptyComponent={
          !loading && !error ? (
            <EmptyState
              title={
                selectedFilter === "OVERDUE"
                  ? "No Overdue Loans"
                  : selectedFilter === "REPAID"
                  ? "No Repaid Loans"
                  : "No Loans Yet"
              }
              description={
                selectedFilter === "ALL"
                  ? "You haven't recorded any loans yet. Tap '+ Add Loan' to record your first loan."
                  : `There are no loans matching the "${selectedFilter.toLowerCase()}" filter.`
              }
              actionTitle={selectedFilter === "ALL" ? "+ Add First Loan" : undefined}
              onAction={
                selectedFilter === "ALL"
                  ? () => navigation.navigate("AddLoan")
                  : undefined
              }
            />
          ) : undefined
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  userPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  signOutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signOutText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  addLoanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  addLoanIcon: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginRight: spacing.xs,
    lineHeight: 22,
  },
  addLoanText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  recordCountText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
});
