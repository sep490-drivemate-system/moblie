import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { CheckCircle, Circle, Shield, AlertTriangle, Coins } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";

interface IPolicy {
  id: string;
  title: string;
  detail: string;
}

interface Step4Props {
  policies?: IPolicy[];
  acceptedPolicies?: Record<string, boolean>;
  onPolicyAccept?: (policyId: string, accepted: boolean) => void;
  bookingCost: number;
  userCoins: number;
  isLoading?: boolean;
  vehicleId?: string | null; // Car ID - if null, no payment section
  carPrice?: number; // Price per hour for the car
  selectedDuration?: number; // Duration in hours
  sessionNote?: string; // Note for the session
  onSessionNoteChange?: (note: string) => void; // Callback when note changes
}

// Mock policies for fallback
const mockPolicies = [
  {
    id: "cancellation",
    title: "Chính sách hủy lịch",
    detail: "Có thể hủy lịch trước 24h với phí 20% học phí. Hủy trong 24h hoặc không đến sẽ mất 100% phí.",
  },
  {
    id: "safety",
    title: "Cam kết an toàn",
    detail: "Đảm bảo xe và người hướng dẫn được kiểm tra an toàn. Học viên phải tuân thủ luật giao thông.",
  },
  {
    id: "payment",
    title: "Chính sách thanh toán",
    detail: "Thanh toán được thực hiện ngay sau khi đặt lịch thành công. Hoàn tiền chỉ áp dụng theo chính sách hủy.",
  },
  {
    id: "responsibility",
    title: "Trách nhiệm",
    detail: "Học viên phải có giấy phép lái xe hợp lệ và chịu trách nhiệm về hành vi của mình trong quá trình học.",
  },
];

export default function Step4({
  policies: apiPolicies = [],
  acceptedPolicies = {},
  onPolicyAccept,
  bookingCost,
  userCoins,
  isLoading = false,
  vehicleId = null,
  carPrice = 0,
  selectedDuration = 0,
  sessionNote = "",
  onSessionNoteChange,
}: Step4Props) {
  // Use API policies if available, otherwise fallback to mock data
  const displayPolicies = apiPolicies.length > 0 ? apiPolicies : mockPolicies;

  const togglePolicyAcceptance = (policyId: string) => {
    if (onPolicyAccept) {
      const currentValue = acceptedPolicies[policyId] || false;
      onPolicyAccept(policyId, !currentValue);
    }
  };

  const allPoliciesAccepted = displayPolicies.every(
    (policy) => acceptedPolicies[policy.id] === true
  );

  // Handle "Select All" toggle
  const handleSelectAll = () => {
    if (!onPolicyAccept) return;
    
    // If all are already accepted, uncheck all. Otherwise, check all.
    const shouldAcceptAll = !allPoliciesAccepted;
    displayPolicies.forEach((policy) => {
      onPolicyAccept(policy.id, shouldAcceptAll);
    });
  };

  // Calculate vehicle cost if vehicle is selected
  const vehicleCost = vehicleId && carPrice && selectedDuration > 0 
    ? carPrice * selectedDuration 
    : 0;

  const hasEnoughCoins = userCoins >= bookingCost;

  return (
    <View style={styles.container}>
      {/* Policies Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={24} color={AppColors.primary} strokeWidth={2} />
          <Text style={styles.sectionTitle}>Chính sách đặt lịch</Text>
          {isLoading && (
            <ActivityIndicator size="small" color={AppColors.primary} style={{ marginLeft: 8 }} />
          )}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.loadingText}>Đang tải chính sách...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionSubtitle}>
              Vui lòng đọc và chấp nhận các chính sách sau:
            </Text>

            {/* Select All Button */}
            <TouchableOpacity
              style={[
                styles.selectAllButton,
                allPoliciesAccepted && styles.selectAllButtonActive,
              ]}
              onPress={handleSelectAll}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.selectAllCheckbox,
                  allPoliciesAccepted && styles.selectAllCheckboxActive,
                ]}
              >
                {allPoliciesAccepted ? (
                  <CheckCircle size={20} color="#ffffff" strokeWidth={2.5} />
                ) : (
                  <Circle size={20} color="#cbd5e1" strokeWidth={2} />
                )}
              </View>
              <Text
                style={[
                  styles.selectAllText,
                  allPoliciesAccepted && styles.selectAllTextActive,
                ]}
              >
                {allPoliciesAccepted ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </Text>
            </TouchableOpacity>

            <ScrollView style={styles.policiesScroll} showsVerticalScrollIndicator={false}>
              {displayPolicies.map((policy) => (
                <TouchableOpacity
                  key={policy.id}
                  style={styles.policyItem}
                  onPress={() => togglePolicyAcceptance(policy.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      acceptedPolicies[policy.id] && styles.checkboxActive,
                    ]}
                  >
                    {acceptedPolicies[policy.id] ? (
                      <CheckCircle size={20} color="#ffffff" strokeWidth={2.5} />
                    ) : (
                      <Circle size={20} color="#cbd5e1" strokeWidth={2} />
                    )}
                  </View>

                  <View style={styles.policyContent}>
                    <Text style={styles.policyTitle}>{policy.title}</Text>
                    <Text style={styles.policyDetail}>{policy.detail}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Policy Status */}
            <View
              style={[
                styles.statusBanner,
                allPoliciesAccepted ? styles.statusBannerSuccess : styles.statusBannerWarning,
              ]}
            >
              {allPoliciesAccepted ? (
                <>
                  <CheckCircle size={16} color="#16a34a" strokeWidth={2} />
                  <Text style={styles.statusTextSuccess}>
                    Đã chấp nhận tất cả chính sách
                  </Text>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} color="#f59e0b" strokeWidth={2} />
                  <Text style={styles.statusTextWarning}>
                    Vui lòng chấp nhận tất cả chính sách để tiếp tục
                  </Text>
                </>
              )}
            </View>
          </>
        )}
      </View>

      {/* Payment Section - Only show if vehicle is selected */}
      {vehicleId && vehicleCost > 0 && (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Coins size={24} color={AppColors.primary} strokeWidth={2} />
          <Text style={styles.sectionTitle}>Thanh toán</Text>
        </View>

        <View style={styles.paymentCard}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Số dư hiện tại:</Text>
            <Text style={styles.paymentValue}>{userCoins.toLocaleString()} xu</Text>
          </View>

          <View style={styles.paymentDivider} />

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Chi phí thuê xe:</Text>
            <Text style={[styles.paymentValue, styles.paymentCost]}>
              {vehicleCost.toLocaleString()} xu
            </Text>
          </View>
          <Text style={styles.paymentNote}>
            ({carPrice?.toLocaleString()} xu/giờ × {selectedDuration} giờ)
          </Text>

          <View style={styles.paymentDivider} />

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabelBold}>Số dư sau khi đặt:</Text>
            <Text
              style={[
                styles.paymentValueBold,
                !hasEnoughCoins && styles.paymentValueError,
              ]}
            >
              {(userCoins - vehicleCost).toLocaleString()} xu
            </Text>
          </View>
        </View>

        {/* Balance Warning */}
        {userCoins < vehicleCost && (
          <View style={styles.warningBanner}>
            <AlertTriangle size={16} color="#dc2626" strokeWidth={2} />
            <Text style={styles.warningText}>
              Số dư không đủ. Vui lòng nạp thêm {(vehicleCost - userCoins).toLocaleString()} xu
            </Text>
          </View>
        )}
      </View>
      )}

      {/* Session Note Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ghi chú buổi học</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Thêm ghi chú cho buổi học (không bắt buộc)
        </Text>
        <TextInput
          style={styles.noteInput}
          value={sessionNote}
          onChangeText={onSessionNoteChange}
          placeholder="VD: Muốn tập lái trên đường cao tốc, cần luyện kỹ năng đỗ xe..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={styles.noteHint}>
          {sessionNote.length}/500 ký tự
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 20,
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  selectAllButtonActive: {
    backgroundColor: AppColors.primary + "10",
    borderColor: AppColors.primary,
  },
  selectAllCheckbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  selectAllCheckboxActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  selectAllText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748b",
    flex: 1,
  },
  selectAllTextActive: {
    color: AppColors.primary,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
  policiesScroll: {
    maxHeight: 300,
    marginBottom: 16,
  },
  policyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  checkboxActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  policyContent: {
    flex: 1,
  },
  policyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  policyDetail: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBannerSuccess: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  statusBannerWarning: {
    backgroundColor: "#fef3c7",
    borderColor: "#fcd34d",
  },
  statusTextSuccess: {
    fontSize: 13,
    fontWeight: "600",
    color: "#16a34a",
    flex: 1,
  },
  statusTextWarning: {
    fontSize: 13,
    fontWeight: "600",
    color: "#f59e0b",
    flex: 1,
  },
  paymentCard: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  paymentLabelBold: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  paymentValueBold: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.primary,
  },
  paymentCost: {
    color: "#ef4444",
  },
  paymentNote: {
    fontSize: 12,
    color: "#94a3b8",
    fontStyle: "italic",
    marginTop: 4,
    marginLeft: 16,
  },
  paymentValueError: {
    color: "#dc2626",
  },
  paymentDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 8,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  warningText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#dc2626",
    flex: 1,
  },
  noteInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#1e293b",
    minHeight: 100,
    marginTop: 12,
  },
  noteHint: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 8,
    textAlign: "right",
  },
});
