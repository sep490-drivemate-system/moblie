import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CreditCard } from "lucide-react-native";
import { BookingMode, Shift, ShiftType } from "@/models/booking/booking";

interface Step5Props {
  packageId?: string;
  bookingMode: BookingMode;
  selectedDates: string[];
  selectedStartTime: string;
  pickupLocation: string;
  bookingCost: number;
  userCoins: number;
}

const shifts = [
  { id: "morning" as ShiftType, label: "Ca sáng", time: "6:00 - 10:00" },
  { id: "afternoon" as ShiftType, label: "Ca chiều", time: "14:00 - 18:00" },
  { id: "evening" as ShiftType, label: "Ca tối", time: "18:00 - 22:00" },
];

export default function Step5({
  packageId,
  bookingMode,
  selectedDates,
  selectedStartTime,
  pickupLocation,
  bookingCost,
  userCoins,
}: Step5Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        ✅ Xác nhận thông tin đặt lịch
      </Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>📦 Gói thuê:</Text>
          <Text style={styles.summaryValue}>
            {packageId ? "Đã chọn gói học" : "Chưa chọn gói"}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>📅 Phương thức:</Text>
          <Text style={styles.summaryValue}>
            {bookingMode === "daily"
              ? "Theo ca trong ngày"
              : "Theo chu kỳ"}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>⏰ Thời gian:</Text>
          <Text style={styles.summaryValue}>
            {selectedDates.length === 1 
              ? `${selectedDates[0]} - ${selectedStartTime}`
              : `${selectedDates.length} ngày - ${selectedStartTime}`}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>📍 Địa điểm:</Text>
          <Text style={styles.summaryValue}>{pickupLocation}</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>💰 Chi phí:</Text>
          <Text style={styles.summaryPrice}>{bookingCost} xu</Text>
        </View>
      </View>

      {/* Payment Section */}
      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <CreditCard size={24} color="#667eea" strokeWidth={2} />
          <Text style={styles.paymentTitle}>Thanh toán</Text>
        </View>

        <View style={styles.walletInfo}>
          <View style={styles.walletRow}>
            <Text style={styles.walletLabel}>Số dư hiện tại:</Text>
            <Text style={styles.walletAmount}>{userCoins} xu</Text>
          </View>
          <View style={styles.walletRow}>
            <Text style={styles.walletLabel}>Chi phí đặt lịch:</Text>
            <Text style={styles.walletCost}>-{bookingCost} xu</Text>
          </View>
          <View style={styles.walletDivider} />
          <View style={styles.walletRow}>
            <Text style={styles.walletLabelBold}>
              Số dư sau thanh toán:
            </Text>
            <Text
              style={[
                styles.walletRemaining,
                userCoins >= bookingCost
                  ? styles.walletRemainingSuccess
                  : styles.walletRemainingError,
              ]}
            >
              {userCoins - bookingCost} xu
            </Text>
          </View>
        </View>

        {userCoins < bookingCost && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              ❌ Số dư không đủ! Vui lòng nạp thêm{" "}
              {bookingCost - userCoins} xu
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  summaryRow: {
    gap: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    lineHeight: 20,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 8,
  },
  summaryPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#667eea",
  },
  paymentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  walletInfo: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
  },
  walletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  walletLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  walletLabelBold: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "800",
  },
  walletAmount: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "800",
  },
  walletCost: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "800",
  },
  walletDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 8,
  },
  walletRemaining: {
    fontSize: 16,
    fontWeight: "800",
  },
  walletRemainingSuccess: {
    color: "#10b981",
  },
  walletRemainingError: {
    color: "#ef4444",
  },
  errorCard: {
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  errorText: {
    fontSize: 13,
    color: "#dc2626",
    fontWeight: "600",
    lineHeight: 18,
  },
});
