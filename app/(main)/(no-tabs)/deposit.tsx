import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { AppColors } from "@/constants/Colors";
import { WalletViewModel } from "@/viewmodels/wallet/WalletViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { RootState } from "@/lib/redux/store";
import { IDeposit } from "@/models/wallet/deposit.type";
import { BankType } from "@/models/wallet/bank-type.enum";
import { ClientPlatform } from "@/models/wallet/client-platform.enum";
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  Check,
  Activity,
  Building2,
  Smartphone,
} from "lucide-react-native";
import HeaderList from "@/components/Commons/HeaderList";
import { ROUTES } from "@/constants/routes";


export default function DepositScreen() {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(
    null
  );
  const [selectedPayment, setSelectedPayment] = useState<BankType>(BankType.VNPAY);
  const [customAmount, setCustomAmount] = useState("");
  const [currentBalance] = useState(150000);
  const [isProcessing, setIsProcessing] = useState(false);
  const walletSelector = (state: RootState) => state.wallet;
  const [, walletViewModel] = useViewModel(WalletViewModel, walletSelector);

  const topUpAmounts: number[] = [
    100000,
    200000,
    500000,
    1000000,
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  // Helper function để lấy icon và màu cho payment method
  const getPaymentMethodInfo = (method: string) => {
    switch (method) {
      case BankType.VNPAY:
        return {
          icon: Building2,
          color: "#1976D2", // Blue
          description: "Thanh toán qua VNPay",
        };
      case BankType.ZALOPAY:
        return {
          icon: Wallet,
          color: "#0068FF", // ZaloPay blue
          description: "Ví điện tử ZaloPay",
        };
      case BankType.PAYOS:
        return {
          icon: Smartphone,
          color: "#D82D8B", // Pink
          description: "Ví điện tử PayOs",
        };
      default:
        return {
          icon: CreditCard,
          color: AppColors.primary,
          description: "Phương thức thanh toán",
        };
    }
  };

  const getTotalAmount = () => {
    if (selectedAmount) {
      return selectedAmount;
    }
    if (customAmount) {
      const amount = parseInt(customAmount.replace(/[^0-9]/g, ""));
      return amount || 0;
    }
    return 0;
  };

  const handlePayment = async () => {
    const total = getTotalAmount();
    if (total < 10000) {
      Alert.alert("Lỗi", "Số tiền nạp tối thiểu là 10.000 VNĐ");
      return;
    }

    Alert.alert(
      "Xác nhận thanh toán",
      `Bạn sẽ nạp ${formatCurrency(total)} VNĐ vào tài khoản?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            try {
              setIsProcessing(true);

              // ClientPlatform chỉ có Mobile = 2
              const clientPlatform = ClientPlatform.Mobile;

              // Tạo deposit payload
              const depositPayload: IDeposit = {
                amount: total.toString(),
                paymentMethod: selectedPayment,
                clientPlatform: clientPlatform,
              };

              // Gọi WalletViewModel để tạo deposit và nhận payment URL
              const paymentUrl = await walletViewModel.deposit(depositPayload);

              if (paymentUrl) {
                // Mở payment URL trong browser
                // Payment gateway sẽ redirect về backend sau khi thanh toán
                // Backend sẽ verify và redirect về deep link của app
                const canOpen = await Linking.canOpenURL(paymentUrl);
                if (canOpen) {
                  await Linking.openURL(paymentUrl);
                } else {
                  throw new Error('Cannot open payment URL');
                }
              } else {
                throw new Error('No payment URL received from server');
              }
            } catch (error) {
              Alert.alert("Lỗi", "Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.");
              console.error("Payment error:", error);
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setCustomAmount(formattedValue);
    setSelectedAmount(null);
  };



  return (
    <View style={styles.container}>
      <HeaderList title="Nạp tiền" actionReturnScreen={ROUTES.BACK} />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.balanceCardContainer}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <View style={styles.balanceIconContainer}>
                <Wallet size={22} color={AppColors.primary} strokeWidth={2} />
              </View>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => router.push(ROUTES.MAIN_NO_TABS_HISTORY)}
              >
                <Activity size={16} color={AppColors.primary} strokeWidth={2} />
                <Text style={styles.historyButtonText}>Lịch sử</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.balanceContent}>
              <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
              <View style={styles.balanceAmountContainer}>
                <Text style={styles.balanceAmount}>
                  {formatCurrency(currentBalance)}
                </Text>
                <View style={styles.balanceUnitContainer}>
                  <Text style={styles.balanceUnit}>đ</Text>
                </View>
              </View>
            </View>

          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn số tiền nạp</Text>
          <View style={styles.amountGrid}>
            {topUpAmounts.map((amount, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                style={[
                  styles.amountCard,
                  selectedAmount === amount && styles.amountCardSelected,
                ]}
                onPress={() => handleAmountSelect(amount)}
              >
                <Text
                  style={[
                    styles.amountValue,
                    selectedAmount === amount && styles.amountValueSelected,
                  ]}
                >
                  {formatCurrency(amount)} đ
                </Text>
                {selectedAmount === amount && (
                  <View style={styles.selectedIndicator}>
                    <Check size={14} color="#ffffff" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Amount Input */}
          <View style={styles.customAmountSection}>
            <Text style={styles.customAmountLabel}>Hoặc nhập số tiền khác</Text>
            <View style={styles.customAmountContainer}>
              <TextInput
                style={[
                  styles.customAmountInput,
                  customAmount && styles.customAmountInputActive,
                ]}
                placeholder="Nhập số tiền"
                value={customAmount}
                onChangeText={handleCustomAmountChange}
                keyboardType="numeric"
                placeholderTextColor={AppColors.gray400}
              />
              <Text style={styles.customAmountSuffix}>VNĐ</Text>
            </View>
            <Text style={styles.customAmountNote}>
              Số tiền tối thiểu: 10.000 VNĐ
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={styles.paymentMethods}>
            {Object.values(BankType).map((method) => {
              const methodInfo = getPaymentMethodInfo(method);
              const IconComponent = methodInfo.icon;

              return (
                <TouchableOpacity
                  key={method}
                  activeOpacity={0.7}
                  style={[
                    styles.paymentMethod,
                    selectedPayment === method && styles.paymentMethodSelected,
                  ]}
                  onPress={() => setSelectedPayment(method)}
                >
                  <View style={styles.paymentMethodLeft}>
                    <View
                      style={[
                        styles.paymentIcon,
                        { backgroundColor: methodInfo.color },
                      ]}
                    >
                      <IconComponent size={20} color="#ffffff" strokeWidth={2} />
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentName}>{method}</Text>
                      <Text style={styles.paymentDescription}>
                        {methodInfo.description}
                      </Text>
                    </View>
                  </View>
                  {selectedPayment === method && (
                    <View style={styles.paymentSelectedIndicator}>
                      <Check size={18} color={AppColors.primary} strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Summary */}
        {getTotalAmount() > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tóm tắt giao dịch</Text>
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Số tiền nạp:</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(getTotalAmount())} VNĐ
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Tổng nhận được:</Text>
                <Text style={styles.summaryTotalValue}>
                  {formatCurrency(getTotalAmount())} VNĐ
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Payment Button */}
      {getTotalAmount() > 0 && (
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity
            style={[styles.paymentButton, isProcessing && styles.paymentButtonDisabled]}
            onPress={handlePayment}
            activeOpacity={0.8}
            disabled={isProcessing}
          >
            <LinearGradient
              colors={[AppColors.primary, AppColors.gradientStart]}
              style={styles.paymentButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isProcessing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={AppColors.white} size="small" />
                  <Text style={styles.paymentButtonText}>Đang xử lý...</Text>
                </View>
              ) : (
                <Text style={styles.paymentButtonText}>
                  Thanh toán {formatCurrency(getTotalAmount())} VNĐ
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: "relative",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: AppColors.white,
  },
  headerCurve: {
    position: "absolute",
    bottom: -20,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  balanceCardContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  balanceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${AppColors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  balanceContent: {
    alignItems: "center",
    paddingVertical: 6,
  },
  balanceLabel: {
    fontSize: 12,
    color: AppColors.gray500,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  balanceAmountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  balanceAmount: {
    fontSize: 25,
    fontWeight: "600",
    color: AppColors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  balanceUnitContainer: {
    backgroundColor: `${AppColors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${AppColors.primary}30`,
  },
  balanceUnit: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.primary,
    letterSpacing: 0.5,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.gray100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  historyButtonText: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amountCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: AppColors.gray50,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: AppColors.gray200,
    position: "relative",
    alignItems: "center",
  },
  amountCardSelected: {
    borderColor: AppColors.primary,
    backgroundColor: `${AppColors.primary}10`,
  },
  amountCardPopular: {
    borderColor: AppColors.info,
  },
  popularBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: AppColors.info,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    shadowColor: AppColors.info,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  popularText: {
    fontSize: 10,
    color: AppColors.white,
    fontWeight: "700",
  },
  amountValue: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  amountValueSelected: {
    color: AppColors.primary,
  },
  amountSubtext: {
    fontSize: 12,
    color: AppColors.gray500,
    fontWeight: "500",
  },
  selectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: AppColors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  customAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.gray50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.gray200,
    paddingHorizontal: 16,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 16,
    color: AppColors.textPrimary,
    paddingVertical: 14,
    fontWeight: "600",
  },
  customAmountInputActive: {
    color: AppColors.primary,
  },
  customAmountSuffix: {
    fontSize: 14,
    color: AppColors.gray500,
    fontWeight: "600",
    marginLeft: 8,
  },
  customAmountNote: {
    fontSize: 12,
    color: AppColors.gray500,
    marginLeft: 4,
  },
  customAmountSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: AppColors.gray200,
  },
  customAmountLabel: {
    fontSize: 14,
    color: AppColors.gray600,
    fontWeight: "600",
    marginBottom: 12,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: AppColors.gray50,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: AppColors.gray200,
  },
  paymentMethodSelected: {
    borderColor: AppColors.primary,
    backgroundColor: `${AppColors.primary}10`,
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 13,
    color: AppColors.gray500,
  },
  paymentSelectedIndicator: {
    marginLeft: 8,
  },
  summaryContent: {
    backgroundColor: AppColors.gray50,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: AppColors.gray600,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.textPrimary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: AppColors.gray200,
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textPrimary,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: AppColors.primary,
  },
  bottomSpacing: {
    height: 100,
  },
  paymentButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AppColors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  paymentButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  paymentButtonDisabled: {
    opacity: 0.6,
  },
  paymentButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.white,
  },
});
