import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface FilterState {
  timeRange: string;
  amount: string;
  status: string;
}

export default function FilterTransactionScreen() {
  const [filters, setFilters] = useState<FilterState>({
    timeRange: "all",
    amount: "",
    status: "all",
  });

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Generate time range options
  const generateTimeRanges = () => {
    const ranges = [{ key: "all", label: "Tất cả" }];

    // Current year months
    for (let month = currentMonth; month >= 1; month--) {
      ranges.push({
        key: `${month}/${currentYear}`,
        label: `${month}/${currentYear}`,
      });
    }

    // Previous year months (from December to October)
    for (let month = 12; month >= 10; month--) {
      ranges.push({
        key: `${month}/${currentYear - 1}`,
        label: `${month}/${currentYear - 1}`,
      });
    }

    return ranges;
  };

  const timeRanges = generateTimeRanges();

  const statusOptions = [
    { key: "all", label: "Tất cả" },
    { key: "success", label: "Thành công" },
    { key: "processing", label: "Đang xử lý" },
    { key: "failed", label: "Thất bại" },
  ];

  const handleTimeRangeSelect = (timeRange: string) => {
    setFilters((prev) => ({ ...prev, timeRange }));
  };

  const handleStatusSelect = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const handleAmountChange = (amount: string) => {
    // Only allow numbers and limit to 10 million
    const numericValue = amount.replace(/[^0-9]/g, "");
    const numValue = parseInt(numericValue);

    if (numericValue === "" || (numValue >= 0 && numValue <= 10000000)) {
      setFilters((prev) => ({ ...prev, amount: numericValue }));
    }
  };

  const clearFilters = () => {
    setFilters({
      timeRange: "all",
      amount: "",
      status: "all",
    });
  };

  const applyFilters = () => {
    // Pass the filters back to the transaction screen via router params
    router.back();
    // In a real app, you might use AsyncStorage, Context API, or Redux
    // For now, we'll use a simple approach with global state simulation
    setTimeout(() => {
      // Simulate passing filter data back
      if (typeof window !== "undefined") {
        (window as any).appliedFilters = filters;
      }
    }, 100);
  };

  const formatAmount = (amount: string) => {
    if (!amount) return "";
    return parseInt(amount).toLocaleString();
  };

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
          <Text style={styles.headerTitle}>Bộ lọc giao dịch</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Range Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theo thời gian</Text>
          <View style={styles.optionsContainer}>
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range.key}
                onPress={() => handleTimeRangeSelect(range.key)}
                activeOpacity={0.7}
                style={[
                  styles.optionButton,
                  filters.timeRange === range.key
                    ? styles.optionButtonActive
                    : styles.optionButtonInactive,
                ]}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    filters.timeRange === range.key
                      ? styles.optionButtonTextActive
                      : styles.optionButtonTextInactive,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theo số tiền</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>
              Nhập số tiền (tối đa 10.000.000 GF)
            </Text>
            <View style={styles.amountInputContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                value={formatAmount(filters.amount)}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                maxLength={8}
              />
              <Text style={styles.amountUnit}>GF</Text>
            </View>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theo trạng thái</Text>
          <View style={styles.optionsContainer}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status.key}
                onPress={() => handleStatusSelect(status.key)}
                activeOpacity={0.7}
                style={[
                  styles.optionButton,
                  filters.status === status.key
                    ? styles.optionButtonActive
                    : styles.optionButtonInactive,
                ]}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    filters.status === status.key
                      ? styles.optionButtonTextActive
                      : styles.optionButtonTextInactive,
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={clearFilters}
            activeOpacity={0.7}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={applyFilters}
            activeOpacity={0.8}
            style={styles.applyButton}
          >
            <Text style={styles.applyButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 10,
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
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButtonActive: {
    backgroundColor: "#70E000",
    shadowColor: "#70E000",
    shadowOpacity: 0.2,
  },
  optionButtonInactive: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  optionButtonTextActive: {
    color: "white",
  },
  optionButtonTextInactive: {
    color: "#374151",
  },
  amountContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    color: "#111827",
  },
  amountUnit: {
    color: "#6B7280",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  bottomContainer: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 16,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#70E000",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#70E000",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#70E000",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#70E000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
