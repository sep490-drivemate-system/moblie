import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { CreditCard, CheckCircle, Circle, Shield, AlertTriangle } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";

interface Step4Props {
  packageId?: string;
  selectedDate: string | null;
  selectedStartTime: string;
  selectedDuration: number;
  pickupLocation: string;
  bookingCost: number;
  userCoins: number;
  instructorName?: string;
  packageName?: string;
  selectedVehicle?: { id: string | number; name: string; price?: number } | null;
  vehicleId?: string;
  packageBasePrice?: number;
  onConfirmBooking?: () => void;
  onPoliciesAcceptedChange?: (allAccepted: boolean) => void;
}

// Policy items that user must accept
const policies = [
  {
    id: "cancellation",
    title: "Chính sách hủy lịch",
    content: "Có thể hủy lịch trước 24h với phí 20% học phí. Hủy trong 24h hoặc không đến sẽ mất 100% phí.",
  },
  {
    id: "safety",
    title: "Cam kết an toàn",
    content: "Đảm bảo xe và người hướng dẫn được kiểm tra an toàn. Học viên phải tuân thủ luật giao thông.",
  },
  {
    id: "payment",
    title: "Chính sách thanh toán",
    content: "Thanh toán được thực hiện ngay sau khi đặt lịch thành công. Hoàn tiền chỉ áp dụng theo chính sách hủy.",
  },
  {
    id: "responsibility",
    title: "Trách nhiệm",
    content: "Học viên phải có giấy phép lái xe hợp lệ và chịu trách nhiệm về hành vi của mình trong quá trình học.",
  },
];

const calculateEndTime = (startTime: string, duration: number): string => {
  if (!startTime) return "00:00";
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration * 60;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

export default function Step4({
  packageId,
  selectedDate,
  selectedStartTime,
  selectedDuration,
  pickupLocation,
  bookingCost,
  userCoins,
  instructorName,
  packageName,
  selectedVehicle,
  vehicleId,
  packageBasePrice = 0,
  onConfirmBooking,
  onPoliciesAcceptedChange,
}: Step4Props) {
  const [acceptedPolicies, setAcceptedPolicies] = useState<Set<string>>(new Set());

  const togglePolicyAcceptance = (policyId: string) => {
    const newAccepted = new Set(acceptedPolicies);
    if (newAccepted.has(policyId)) {
      newAccepted.delete(policyId);
    } else {
      newAccepted.add(policyId);
    }
    setAcceptedPolicies(newAccepted);
  };

  const allPoliciesAccepted = acceptedPolicies.size === policies.length;

  // Calculate vehicle cost
  const vehicleCost = selectedVehicle && selectedVehicle.price && selectedDuration > 0
    ? selectedVehicle.price * selectedDuration
    : 0;

  // Notify parent when policies acceptance changes
  useEffect(() => {
    if (onPoliciesAcceptedChange) {
      onPoliciesAcceptedChange(allPoliciesAccepted);
    }
  }, [allPoliciesAccepted]);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Xác nhận đặt lịch</Text>
      </View>

      {/* Booking Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Thông tin đặt lịch</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryValue}>Gói thuê: {packageName || "Chưa chọn gói"}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryValue}>
           Ngày: {selectedDate ? new Date(selectedDate).toLocaleDateString('vi-VN') : "Chưa chọn"}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryValue}>Thời gian: {selectedStartTime && selectedDuration > 0
              ? `${selectedStartTime} - ${calculateEndTime(selectedStartTime, selectedDuration)} (${selectedDuration}h)`
              : "Chưa chọn thời gian"}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryValue}>Địa điểm đón: {pickupLocation || "Chưa chọn địa điểm"}</Text>
        </View>

        <View style={styles.summaryDivider} />

      </View>

      {/* Policy Confirmation */}
      <View style={styles.policyCard}>
        <View style={styles.policyHeader}>
          <AlertTriangle size={20} color={AppColors.primary} strokeWidth={2} />
          <Text style={styles.policyTitle}>Xác nhận chính sách</Text>
        </View>
        <Text style={styles.policySubtitle}>
          Vui lòng đọc và chấp nhận các chính sách sau để tiếp tục đặt lịch:
        </Text>

        <ScrollView style={styles.policyScroll} showsVerticalScrollIndicator={false}>
          {policies.map((policy) => (
            <View key={policy.id} style={styles.policyItem}>
              <TouchableOpacity
                style={[
                  styles.policyCheckbox,
                  acceptedPolicies.has(policy.id) && styles.policyCheckboxActive
                ]}
                onPress={() => togglePolicyAcceptance(policy.id)}
                activeOpacity={0.7}
              >
                {acceptedPolicies.has(policy.id) ? (
                  <CheckCircle size={20} color="#ffffff" strokeWidth={2.5} />
                ) : (
                  <Circle size={20} color="#cbd5e1" strokeWidth={2} />
                )}
              </TouchableOpacity>

              <View style={styles.policyContent}>
                <Text style={styles.policyItemTitle}>{policy.title}</Text>
                <Text style={styles.policyItemContent}>{policy.content}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Accept All Policies Button */}
        {!allPoliciesAccepted && (
          <TouchableOpacity
            style={styles.acceptAllButton}
            onPress={() => {
              const allPolicyIds = policies.map(p => p.id);
              setAcceptedPolicies(new Set(allPolicyIds));
              // Force update parent immediately
              if (onPoliciesAcceptedChange) {
                onPoliciesAcceptedChange(true);
              }
            }}
          >
            <CheckCircle size={18} color="#ffffff" strokeWidth={2} />
            <Text style={styles.acceptAllButtonText}>
              Chấp nhận tất cả điều khoản
            </Text>
          </TouchableOpacity>
        )}

        {/* Policy Status */}
        <View style={[
          styles.policyStatus,
          allPoliciesAccepted ? styles.policyStatusAccepted : styles.policyStatusPending
        ]}>
          {allPoliciesAccepted ? (
            <>
              <CheckCircle size={16} color="#16a34a" strokeWidth={2} />
              <Text style={styles.policyStatusTextAccepted}>
                Đã chấp nhận tất cả chính sách
              </Text>
            </>
          ) : (
            <>
              <Circle size={16} color="#f59e0b" strokeWidth={2} />
              <Text style={styles.policyStatusTextPending}>
                Chưa chấp nhận {policies.length - acceptedPolicies.size} chính sách
              </Text>
            </>
          )}
        </View>
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  summaryCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
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
  costBreakdown: {
    gap: 8,
  },
  costDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 8,
  },
  summaryPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e293b",
  },
  summaryPriceTotal: {
    fontSize: 18,
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
  policyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 16,
  },
  policyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  policyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  policySubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 20,
  },
  policyScroll: {
    maxHeight: 200,
  },
  policyItem: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  policyCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  policyCheckboxActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  policyContent: {
    flex: 1,
    gap: 4,
  },
  policyItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
  policyItemContent: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
  acceptAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  acceptAllButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  policyStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  policyStatusAccepted: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#86efac",
  },
  policyStatusPending: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  policyStatusTextAccepted: {
    fontSize: 14,
    fontWeight: "600",
    color: "#16a34a",
  },
  policyStatusTextPending: {
    fontSize: 14,
    fontWeight: "600",
    color: "#d97706",
  },
  blockWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  blockWarningText: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "600",
    flex: 1,
    lineHeight: 20,
  },
});
