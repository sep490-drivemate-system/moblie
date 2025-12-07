import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HeaderList from "@/components/Commons/HeaderList";
import CustomFilter, {
  FilterOptionType,
} from "@/components/Commons/CustomFilter";
import { AppColors } from "@/constants/Colors";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { TransactionViewModel } from "@/viewmodels/transaction/TransactionViewModel";
import {
  StatusFilterOption,
  MonthOption,
} from "@/models/transaction/transaction";
import { TransactionStatus } from "@/models/enum/transactionStatus";
import { RootState } from "@/lib/redux/store";

export default function TransactionScreen() {
  // Use ViewModel to manage state and API calls
  const [transactionState, viewModel] = useViewModel<
    RootState["transaction"],
    TransactionViewModel
  >(TransactionViewModel, (state: RootState) => state.transaction);

  // Local state for re-rendering when filters change
  const [selectedFilter, setSelectedFilter] = useState<
    TransactionStatus | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [selectedMonthValue, setSelectedMonthValue] = useState<string>("all");
  const [selectedAmountValue, setSelectedAmountValue] = useState<string>("");
  const [amountInput, setAmountInput] = useState<string>("");

  // Fetch transactions on mount
  useEffect(() => {
    viewModel.fetchTransactions();
  }, []);

  // Update search text in ViewModel when search query changes
  useEffect(() => {
    viewModel.setSearchText(searchQuery);
  }, [searchQuery]);

  // Sync selected month and amount with ViewModel when modals open
  useEffect(() => {
    if (showMonthModal) {
      setSelectedMonthValue(viewModel.getSelectedMonth());
    }
  }, [showMonthModal]);

  useEffect(() => {
    if (showAmountModal) {
      const currentAmount = viewModel.getSelectedAmount();
      setSelectedAmountValue(currentAmount);
      viewModel.initializeAmountInput();
      setAmountInput(viewModel.getAmountInput());
    }
  }, [showAmountModal]);

  // Get filtered transactions from ViewModel
  const transactions = viewModel.getFilteredTransactions(selectedFilter);

  // Get filter options
  const monthOptions = viewModel.getMonthOptions();

  // Create filter options for CustomFilter
  const filterOptions: FilterOptionType[] = [
    { id: "month", label: "Tháng" },
    { id: "amount", label: "Số tiền" },
  ];

  // Check if any filter is active
  const hasActiveFilter =
    selectedMonthValue !== "all" || selectedAmountValue !== "";

  // Get selected month and amount labels
  const selectedMonthLabel =
    monthOptions.find((m) => m.value === selectedMonthValue)?.label || "Tháng";
  const selectedAmountLabel = viewModel.getAmountLabel();

  // Render filter option item
  const renderFilterOptionItem = ({ item }: { item: FilterOptionType }) => {
    const isActive =
      (item.id === "month" && selectedMonthValue !== "all") ||
      (item.id === "amount" && selectedAmountValue !== "");

    const displayLabel =
      item.id === "month"
        ? selectedMonthValue !== "all"
          ? selectedMonthLabel
          : item.label
        : selectedAmountValue !== ""
        ? selectedAmountLabel
        : item.label;

    return (
      <TouchableOpacity
        style={[
          styles.filterOptionButton,
          isActive && styles.filterOptionButtonActive,
        ]}
        onPress={() => {
          if (item.id === "month") {
            setShowMonthModal(true);
          } else if (item.id === "amount") {
            setShowAmountModal(true);
          }
        }}
      >
        <Text
          style={[
            styles.filterOptionText,
            isActive && styles.filterOptionTextActive,
          ]}
        >
          {displayLabel}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render month item
  const renderMonthItem = ({ item }: { item: MonthOption }) => {
    const isSelected = selectedMonthValue === item.value;
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.modalItem, isSelected && styles.modalItemSelected]}
        onPress={() => {
          viewModel.setSelectedMonth(item.value);
          setSelectedMonthValue(item.value);
        }}
      >
        <Text
          style={[
            styles.modalItemText,
            isSelected && styles.modalItemTextSelected,
          ]}
        >
          {item.label}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark" size={20} color={AppColors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  // Handle amount input change
  const handleAmountInputChange = (text: string) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, "");
    setAmountInput(numericValue);
    viewModel.handleAmountInputChange(numericValue);
  };

  // Handle apply month filter
  const handleApplyMonthFilter = () => {
    setShowMonthModal(false);
  };

  // Handle clear month filter
  const handleClearMonthFilter = () => {
    viewModel.clearMonthFilter();
    setSelectedMonthValue("all");
  };

  // Handle apply amount filter
  const handleApplyAmountFilter = () => {
    viewModel.applyAmountFilter();
    setSelectedAmountValue(viewModel.getSelectedAmount());
    setShowAmountModal(false);
  };

  // Handle clear amount filter
  const handleClearAmountFilter = () => {
    viewModel.clearAmountFilter();
    setSelectedAmountValue("");
    setAmountInput("");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <HeaderList
        title="Lịch sử giao dịch"
        description="Xem và quản lý tất cả các giao dịch của bạn"
        showBackButton={true}
      />

      {/* Search and Filter */}
      <CustomFilter
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        filterHasVehicle={hasActiveFilter}
        showFilter={showFilter}
        onToggleFilter={() => setShowFilter(!showFilter)}
        filterOptions={filterOptions}
        renderFilterOptionItem={renderFilterOptionItem}
        showRoadTypeModal={showMonthModal}
        onCloseRoadTypeModal={() => setShowMonthModal(false)}
        onApplyRoadTypes={handleApplyMonthFilter}
        roadTypes={monthOptions as any}
        renderRoadTypeItem={renderMonthItem as any}
        onClearRoadTypeFilters={handleClearMonthFilter}
        modalTitle="Chọn tháng"
      />

      {/* Amount Input Modal */}
      <Modal
        visible={showAmountModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAmountModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAmountModal(false)}
        >
          <Pressable
            style={styles.amountModalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.amountModalHeader}>
              <Text style={styles.amountModalTitle}>Nhập số tiền</Text>
              <TouchableOpacity
                onPress={() => setShowAmountModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.amountInputContainer}>
              <Text style={styles.amountInputLabel}>
                Nhập số tiền tối thiểu (VNĐ)
              </Text>
              <View style={styles.amountInputWrapper}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  value={amountInput}
                  onChangeText={handleAmountInputChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <Text style={styles.amountUnit}>VNĐ</Text>
              </View>
              <Text style={styles.amountHint}>
                Lọc các giao dịch có số tiền từ mức nhập vào trở lên
              </Text>
            </View>

            <View style={styles.amountModalFooter}>
              <TouchableOpacity
                style={styles.amountClearButton}
                onPress={handleClearAmountFilter}
              >
                <Text style={styles.amountClearButtonText}>Xóa bộ lọc</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.amountApplyButton}
                onPress={handleApplyAmountFilter}
              >
                <Text style={styles.amountApplyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <View style={styles.filterRow}>
            {viewModel
              .getStatusFilterOptions()
              .map((item: StatusFilterOption) => {
                const isSelected = selectedFilter === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => {
                      const newFilter = viewModel.handleStatusFilterSelection(
                        item.key
                      );
                      setSelectedFilter(newFilter);
                    }}
                    activeOpacity={1}
                    style={[
                      styles.filterButtonItem,
                      isSelected
                        ? styles.filterButtonActive
                        : styles.filterButtonInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterButtonTextItem,
                        isSelected
                          ? styles.filterButtonTextActive
                          : styles.filterButtonTextInactive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </View>
        </ScrollView>
      </View>

      {/* Loading Indicator */}
      {transactionState.isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Đang tải giao dịch...</Text>
        </View>
      )}

      {/* Error Message */}
      {transactionState.errorMessage && !transactionState.isLoading && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color={AppColors.error} />
          <Text style={styles.errorText}>{transactionState.errorMessage}</Text>
          <TouchableOpacity
            onPress={() => viewModel.fetchTransactions()}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Transaction List */}
      {!transactionState.isLoading && !transactionState.errorMessage && (
        <View style={styles.transactionList}>
          {/* Using transactions directly since filteredTransactions is commented out */}
          {transactions.map((transaction, index) => {
            const transactionType = viewModel.getTransactionType(transaction);
            const formattedDate = viewModel.getFormattedDate(transaction.date);
            const formattedTime = viewModel.getFormattedTime(transaction.date);
            const statusLabel = viewModel.getStatusLabel(transaction.status);
            const statusColor = viewModel.getStatusColor(transaction.status);

            return (
              <View key={`transaction-${index}`} style={styles.transactionCard}>
                <View style={styles.transactionContent}>
                  {/* Transaction Info */}
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>
                      {transaction.title}
                    </Text>
                    <Text style={styles.transactionTime}>
                      {formattedTime} • {formattedDate}
                    </Text>
                    <Text style={styles.amountText}>
                      {transaction.value.toLocaleString()} VNĐ
                    </Text>
                    <View style={styles.statusContainer}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: `${statusColor}15`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color: statusColor,
                            },
                          ]}
                        >
                          {statusLabel}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Using transactions directly since filteredTransactions is commented out */}
          {transactions.length === 0 && (
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
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  contentContainer: {
    backgroundColor: "#ffffff",
  },
  searchFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
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
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonText: {
    marginLeft: 8,
    color: AppColors.white,
    fontWeight: "600",
  },
  filterButtonActive: {
    backgroundColor: AppColors.primary,
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
    borderColor: AppColors.primary,
  },
  activeFiltersContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeFiltersText: {
    flex: 1,
    marginLeft: 8,
    color: AppColors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: AppColors.primary,
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
    backgroundColor: "#ffffff",
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
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
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
    marginBottom: 8,
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
  amountText: {
    color: AppColors.primary,
    fontWeight: "700",
    fontSize: 20,
    letterSpacing: 0.5,
    marginBottom: 8,
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    color: "#6B7280",
    fontSize: 16,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: "#FEF2F2",
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.error,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    color: AppColors.error,
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: AppColors.error,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  filterOptionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterOptionButtonActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  filterOptionTextActive: {
    color: "white",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalItemSelected: {
    backgroundColor: `${AppColors.primary}15`,
    borderColor: AppColors.primary,
  },
  modalItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  modalItemTextSelected: {
    color: AppColors.primary,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  amountModalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  amountModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  amountModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  amountInputContainer: {
    marginBottom: 20,
  },
  amountInputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    marginBottom: 12,
  },
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  amountUnit: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  amountHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  amountModalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  amountClearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  amountClearButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  amountApplyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  amountApplyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
});
