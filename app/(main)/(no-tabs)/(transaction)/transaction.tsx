import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "receive";
  title: string;
  bankName?: string;
  time: string;
  date: string;
  amount: number;
  balance: number;
  status: "success" | "processing" | "failed";
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "deposit",
    title: "Nạp tiền vào ví từ NAM A BANK",
    bankName: "NAM A BANK",
    time: "14:30",
    date: "15/01/2025",
    amount: 250000,
    balance: 281000,
    status: "success",
  },
  {
    id: "2",
    type: "withdraw",
    title: "Rút tiền từ ví",
    time: "09:15",
    date: "14/01/2025",
    amount: 100000,
    balance: 311000,
    status: "success",
  },
  {
    id: "3",
    type: "receive",
    title: "Nhận tiền từ Nguyễn Văn A",
    time: "16:45",
    date: "13/01/2025",
    amount: 50000,
    balance: 411000,
    status: "success",
  },
  {
    id: "4",
    type: "deposit",
    title: "Nạp tiền vào ví từ VIETCOMBANK",
    bankName: "VIETCOMBANK",
    time: "11:20",
    date: "12/01/2025",
    amount: 500000,
    balance: 361000,
    status: "success",
  },
  {
    id: "5",
    type: "withdraw",
    title: "Rút tiền từ ví",
    time: "08:30",
    date: "11/01/2025",
    amount: 200000,
    balance: 411000,
    status: "processing",
  },
  {
    id: "6",
    type: "receive",
    title: "Nhận tiền từ Trần Thị B",
    time: "19:15",
    date: "10/01/2025",
    amount: 150000,
    balance: 611000,
    status: "success",
  },
  {
    id: "7",
    type: "deposit",
    title: "Nạp tiền vào ví từ TECHCOMBANK",
    bankName: "TECHCOMBANK",
    time: "15:45",
    date: "09/01/2025",
    amount: 300000,
    balance: 461000,
    status: "failed",
  },
  {
    id: "8",
    type: "withdraw",
    title: "Rút tiền từ ví",
    time: "13:20",
    date: "08/01/2025",
    amount: 75000,
    balance: 461000,
    status: "success",
  },
];

interface FilterState {
  timeRange: string;
  amount: string;
  status: string;
}

export default function TransactionScreen() {
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    timeRange: "all",
    amount: "",
    status: "all",
  });

  // Listen for filter parameters from filter-transaction screen
  useEffect(() => {
    const handleFilterUpdate = () => {
      // Check if filters were applied from filter screen
      if (typeof window !== "undefined" && (window as any).appliedFilters) {
        const newFilters = (window as any).appliedFilters;
        setAppliedFilters(newFilters);
        // Clear the global state
        (window as any).appliedFilters = null;
      }
    };

    // Check for filter updates when component mounts or when returning from filter screen
    const interval = setInterval(handleFilterUpdate, 500);

    return () => clearInterval(interval);
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return "arrow-down-circle";
      case "withdraw":
        return "arrow-up-circle";
      case "receive":
        return "person-add";
      default:
        return "card";
    }
  };

  const getTransactionIconColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "#70E000";
      case "withdraw":
        return "#FF6B6B";
      case "receive":
        return "#4ECDC4";
      default:
        return "#70E000";
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const sign = type === "deposit" || type === "receive" ? "+" : "-";
    return `${sign} ${amount.toLocaleString()} GF`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "Thành công";
      case "processing":
        return "Đang xử lý";
      case "failed":
        return "Thất bại";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "#70E000";
      case "processing":
        return "#FFA500";
      case "failed":
        return "#FF6B6B";
      default:
        return "#70E000";
    }
  };

  // Helper function to check if transaction matches time range filter
  const matchesTimeRange = (transaction: Transaction, timeRange: string) => {
    if (timeRange === "all") return true;

    const transactionDate = new Date(
      transaction.date.split("/").reverse().join("-")
    );
    const [month, year] = timeRange.split("/").map(Number);

    return (
      transactionDate.getMonth() + 1 === month &&
      transactionDate.getFullYear() === year
    );
  };

  // Helper function to check if transaction matches amount filter
  const matchesAmount = (transaction: Transaction, amount: string) => {
    if (!amount) return true;

    const filterAmount = parseInt(amount);
    return transaction.amount >= filterAmount;
  };

  // Helper function to check if transaction matches status filter
  const matchesStatus = (transaction: Transaction, status: string) => {
    if (status === "all") return true;
    return transaction.status === status;
  };

  // Function to clear all applied filters
  const clearAllFilters = () => {
    setAppliedFilters({
      timeRange: "all",
      amount: "",
      status: "all",
    });
  };

  // Check if any filters are applied
  const hasActiveFilters = () => {
    return (
      appliedFilters.timeRange !== "all" ||
      appliedFilters.amount !== "" ||
      appliedFilters.status !== "all"
    );
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesTypeFilter =
      selectedFilter === "all" || transaction.type === selectedFilter;
    const matchesTimeFilter = matchesTimeRange(
      transaction,
      appliedFilters.timeRange
    );
    const matchesAmountFilter = matchesAmount(
      transaction,
      appliedFilters.amount
    );
    const matchesStatusFilter = matchesStatus(
      transaction,
      appliedFilters.status
    );

    return (
      matchesSearch &&
      matchesTypeFilter &&
      matchesTimeFilter &&
      matchesAmountFilter &&
      matchesStatusFilter
    );
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search and Filter Row */}
        <View style={styles.searchFilterRow}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm giao dịch..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => router.push("./filter-transaction")}
            activeOpacity={0.8}
            style={[styles.filterButtonPage]}
          >
            <Ionicons name="filter" size={20} color="white" />
            <Text style={styles.filterButtonText}>Bộ lọc</Text>
            {hasActiveFilters() && (
              <View style={styles.filterIndicator}>
                <Text style={styles.filterIndicatorText}>!</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filters Indicator */}
        {hasActiveFilters() && (
          <View style={styles.activeFiltersContainer}>
            <View style={styles.activeFiltersContent}>
              <Ionicons name="checkmark-circle" size={16} color="#70E000" />
              <Text style={styles.activeFiltersText}>Đã áp dụng bộ lọc</Text>
              <TouchableOpacity
                onPress={clearAllFilters}
                activeOpacity={0.7}
                style={styles.clearFiltersButton}
              >
                <Text style={styles.clearFiltersText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Transaction Type Filter */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <View style={styles.filterRow}>
            {[
              { key: "all", label: "Tất cả" },
              { key: "deposit", label: "Nạp tiền vào ví" },
              { key: "withdraw", label: "Rút tiền" },
              { key: "receive", label: "Nhận tiền" },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => setSelectedFilter(item.key)}
                activeOpacity={0.7}
                style={[
                  styles.filterButtonItem,
                  selectedFilter === item.key
                    ? styles.filterButtonActive
                    : styles.filterButtonInactive,
                ]}
              >
                <Text
                  style={[
                    styles.filterButtonTextItem,
                    selectedFilter === item.key
                      ? styles.filterButtonTextActive
                      : styles.filterButtonTextInactive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Transaction List */}
      <ScrollView
        style={styles.transactionList}
        showsVerticalScrollIndicator={false}
      >
        {filteredTransactions.map((transaction, index) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionContent}>
              {/* Icon */}
              <View
                style={[
                  styles.transactionIcon,
                  {
                    backgroundColor: `${getTransactionIconColor(
                      transaction.type
                    )}15`,
                  },
                ]}
              >
                <Ionicons
                  name={getTransactionIcon(transaction.type) as any}
                  size={24}
                  color={getTransactionIconColor(transaction.type)}
                />
              </View>

              {/* Transaction Info */}
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text style={styles.transactionTime}>
                  {transaction.time} • {transaction.date}
                </Text>
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: `${getStatusColor(
                          transaction.status
                        )}15`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(transaction.status) },
                      ]}
                    >
                      {getStatusText(transaction.status)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Amount and Balance */}
              <View style={styles.amountContainer}>
                <Text
                  style={[
                    styles.amountText,
                    {
                      color:
                        transaction.type === "deposit" ||
                        transaction.type === "receive"
                          ? "#70E000"
                          : "#FF6B6B",
                    },
                  ]}
                >
                  {formatAmount(transaction.amount, transaction.type)}
                </Text>
                <Text style={styles.balanceText}>
                  Số dư: {transaction.balance.toLocaleString()} GF
                </Text>
              </View>
            </View>
          </View>
        ))}

        {filteredTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>Không có giao dịch nào</Text>
            <Text style={styles.emptyMessage}>
              Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm thấy giao
              dịch bạn cần
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  searchFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#111827",
  },
  filterButtonPage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#70E000",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#70E000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonText: {
    marginLeft: 8,
    color: "white",
    fontWeight: "600",
  },
  filterButtonActive: {
    backgroundColor: "#70E000",
  },
  filterButtonInactive: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  filterIndicatorText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  activeFiltersContainer: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#70E000",
  },
  activeFiltersContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeFiltersText: {
    flex: 1,
    marginLeft: 8,
    color: "#70E000",
    fontSize: 14,
    fontWeight: "500",
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#70E000",
    borderRadius: 6,
  },
  clearFiltersText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  filterContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "white",
  },
  filterScrollContent: {
    paddingHorizontal: 0,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
  },
  filterButtonItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 0,
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonTextItem: {
    fontSize: 14,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "white",
  },
  filterButtonTextInactive: {
    color: "#374151",
  },
  transactionList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  transactionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  transactionContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  transactionIcon: {
    marginRight: 16,
    padding: 12,
    borderRadius: 25,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 8,
  },
  transactionTime: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 25,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amountText: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  balanceText: {
    color: "#6B7280",
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    padding: 24,
    borderRadius: 50,
    backgroundColor: "#F3F4F6",
    marginBottom: 24,
  },
  emptyTitle: {
    color: "#6B7280",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMessage: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
