import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter, useFocusEffect, usePathname, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { AppColors } from "@/constants/Colors";
import { WalletViewModel } from "@/viewmodels/wallet/WalletViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { RootState } from "@/lib/redux/store";
import { IDeposit } from "@/models/wallet/deposit.type";
import { BankType } from "@/models/wallet/bank-type.enum";
import { ClientPlatform } from "@/models/wallet/client-platform.enum";
import {
  Wallet,
  Check,
  Activity,
  ArrowDownCircle,
} from "lucide-react-native";
import HeaderList from "@/components/Commons/HeaderList";
import { ROUTES } from "@/constants/routes";
import { AppAlert, AlertVariant } from "@/components/Commons/AppAlert";
import { clearPaymentCallback } from "@/features/wallet/walletSlice";
import { useDispatch } from "react-redux";
import { AuthViewModel } from "@/viewmodels/auth/AuthViewModel";
import { UserRole } from "@/models/enum/UserRole.enum";
const zalopayLogo = require("@/assets/images/zalopay_logo.png");
const payosLogo = require("@/assets/images/payos_logo.png");
const vnpayLogo = require("@/assets/images/vnpay_logo.png");

export default function DepositScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const params = useLocalSearchParams();
  const [showDepositForm, setShowDepositForm] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<BankType>();
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [confirmAmount, setConfirmAmount] = useState(0);
  const walletSelector = (state: RootState) => state.wallet;
  const [walletState, walletViewModel] = useViewModel(
    WalletViewModel,
    walletSelector
  );

  const topUpAmounts: number[] = [100000, 200000, 500000, 1000000];

  useFocusEffect(
    useCallback(() => {

      if (pathname?.includes('wallet') && walletState.paymentCallback) {
        const callback = walletState.paymentCallback;

        dispatch(clearPaymentCallback());

        setTimeout(() => {
          router.replace({
            pathname: ROUTES.PAYMENT_SUCCESS,
            params: callback.params as any,
          });
        }, 200);
      }
    }, [walletState.paymentCallback, router, dispatch, pathname])
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const getPaymentMethodInfo = (method: BankType) => {
    switch (method) {
      case BankType.VnPay:
        return {
          logo: vnpayLogo,
          isImage: true,
          color: "#1976D2",
          description: "Thanh toán qua VnPay",
        };
      case BankType.ZaloPay:
        return {
          logo: zalopayLogo,
          isImage: true,
          color: "#0068FF",
          description: "Thanh toán qua ZaloPay",
        };
      case BankType.PayOs:
        return {
          logo: payosLogo,
          isImage: true,
          color: "#D82D8B",
          description: "Thanh toán qua PayOs",
        };
      default:
        return {
          logo: null,
          isImage: false,
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
      setErrorMessage("Số tiền nạp tối thiểu là 10.000 đ");
      setShowErrorAlert(true);
      return;
    }
    setConfirmAmount(total);
    setShowConfirmAlert(true);
  };

  const handleConfirmPayment = async () => {
    setShowConfirmAlert(false);
    try {
      setIsProcessing(true);
      const depositPayload: IDeposit = {
        amount: confirmAmount,
        paymentMethod: selectedPayment as BankType,
        platform: ClientPlatform.Mobile,
      };
      const success = await walletViewModel.deposit(depositPayload);

      if (!success) {
        throw new Error("Không thể mở URL thanh toán");
      }
    } catch (error: any) {
      const errorMsg =
        error?.message ||
        error?.toString() ||
        "Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.";
      setErrorMessage(errorMsg);
      setShowErrorAlert(true);
    } finally {
      setIsProcessing(false);
    }
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



  const [authState, authViewModel] = useViewModel(AuthViewModel, (state) => state.auth);

  // Luôn mở form nạp tiền
  useFocusEffect(
    useCallback(() => {
      setShowDepositForm(true);
    }, [])
  );

  return (
    <View style={styles.container}>
      <HeaderList title="Ví của tôi" actionReturnScreen={ROUTES.BACK} />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.balanceCardContainer}>
          <LinearGradient
            colors={[AppColors.primary, AppColors.primaryDark || AppColors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.balanceHeader}>
              <View style={styles.balanceIconContainer}>
                <Wallet size={22} color={AppColors.textWhite} strokeWidth={2} />
              </View>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => router.push(ROUTES.MAIN_NO_TABS_HISTORY)}
              >
                <Activity size={16} color={AppColors.textWhite} strokeWidth={2} />
                <Text style={styles.historyButtonText}>Lịch sử</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.balanceContent}>
              <View style={styles.balanceAmountContainer}>
                <Text style={styles.balanceAmount}>
                  {formatCurrency(walletState.balance)} đ
                </Text>
              </View>

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setShowDepositForm(true);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionButtonIcon, styles.depositButtonIcon]}>
                    <ArrowDownCircle size={18} color={AppColors.textWhite} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.actionButtonText}>Nạp tiền</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {showDepositForm ? (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Chọn số tiền nạp</Text>
                <TouchableOpacity activeOpacity={0.1}
                  onPress={() => {
                    setShowDepositForm(false);
                    setSelectedAmount(null);
                    setCustomAmount("");
                  }}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
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
                  <Text style={styles.customAmountSuffix}>đ</Text>
                </View>
                <Text style={styles.customAmountNote}>
                  Số tiền tối thiểu: 10.000 đ
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
              <View style={styles.paymentMethods}>
                {Object.keys(BankType)
                  .filter((key) => isNaN(Number(key)))
                  .map((key) => {
                    const method = BankType[key as keyof typeof BankType];
                    const methodInfo = getPaymentMethodInfo(method);

                    return (
                      <TouchableOpacity
                        key={key}
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
                              methodInfo.isImage && styles.paymentIconImage,
                              { backgroundColor: methodInfo.isImage ? "transparent" : methodInfo.color },
                            ]}
                          >
                            {methodInfo.isImage && methodInfo.logo ? (
                              <Image
                                source={methodInfo.logo}
                                style={styles.paymentLogo}
                                resizeMode="contain"
                              />
                            ) : (
                              <View style={styles.paymentIcon}>
                                <Text style={styles.paymentName}>{key}</Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.paymentInfo}>
                            <Text style={styles.paymentName}>{key}</Text>
                            <Text style={styles.paymentDescription}>
                              {methodInfo.description}
                            </Text>
                          </View>
                        </View>
                        {selectedPayment === method && (
                          <View style={styles.paymentSelectedIndicator}>
                            <Check
                              size={18}
                              color={AppColors.primary}
                              strokeWidth={3}
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </View>
            </View>

            {getTotalAmount() > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tóm tắt giao dịch</Text>
                <View style={styles.summaryContent}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Số tiền nạp:</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(getTotalAmount())} đ
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryTotalLabel}>Tổng nhận được:</Text>
                    <Text style={styles.summaryTotalValue}>
                      {formatCurrency(getTotalAmount())} đ
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        ) : null}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {showDepositForm && getTotalAmount() > 0 && selectedPayment && (
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity
            style={[
              styles.paymentButton,
              isProcessing && styles.paymentButtonDisabled,
            ]}
            onPress={handlePayment}
            activeOpacity={1}
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


      {/* Error Alert */}
      <AppAlert
        visible={showErrorAlert}
        title="Lỗi"
        message={errorMessage}
        variant={AlertVariant.Error}
        primaryButton={{
          label: "Đóng",
          onPress: () => setShowErrorAlert(false),
        }}
        onDismiss={() => setShowErrorAlert(false)}
      />

      <AppAlert
        visible={showSuccessAlert}
        title="Thành công"
        message={successMessage}
        variant={AlertVariant.Success}
        primaryButton={{
          label: "Đóng",
          onPress: () => setShowSuccessAlert(false),
        }}
        onDismiss={() => setShowSuccessAlert(false)}
      />

      <AppAlert
        visible={showConfirmAlert}
        title="Xác nhận thanh toán"
        message={`Bạn sẽ nạp ${formatCurrency(confirmAmount)} đ vào tài khoản?`}
        variant={AlertVariant.Info}
        primaryButton={{
          label: "Xác nhận",
          onPress: handleConfirmPayment,
        }}
        secondaryButton={{
          label: "Hủy",
          variant: "secondary",
          onPress: () => setShowConfirmAlert(false),
        }}
        onDismiss={() => setShowConfirmAlert(false)}
      />
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
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceContent: {
    alignItems: "center",
    paddingVertical: 6,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    gap: 8,
  },
  actionButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  depositButtonIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.textWhite,
  },
  actionButtonDisabled: {
    opacity: 0.5,
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
    fontSize: 28,
    fontWeight: "bold",
    color: AppColors.textWhite,
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  historyButtonText: {
    fontSize: 12,
    color: AppColors.textWhite,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: AppColors.gray600,
    fontWeight: "600",
  },
  emptyState: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 40,
    backgroundColor: AppColors.white,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: AppColors.gray500,
    textAlign: "center",
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
  amountCardDisabled: {
    opacity: 0.5,
    borderColor: AppColors.gray300,
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
  amountValueDisabled: {
    color: AppColors.gray400,
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
  bankAccountSection: {
    marginTop: 8,
  },
  bankAccountLabel: {
    fontSize: 14,
    color: AppColors.gray600,
    fontWeight: "600",
    marginBottom: 12,
  },
  bankAccountInput: {
    backgroundColor: AppColors.gray50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.gray200,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: AppColors.textPrimary,
    fontWeight: "600",
    minHeight: 100,
    maxHeight: 200,
  },
  bankAccountInputActive: {
    borderColor: AppColors.primary,
    backgroundColor: `${AppColors.primary}05`,
  },
  bankAccountNote: {
    fontSize: 12,
    color: AppColors.gray500,
    marginTop: 8,
    fontStyle: "italic",
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
  paymentIconImage: {
    backgroundColor: "transparent",
    padding: 4,
  },
  paymentLogo: {
    width: 36,
    height: 36,
  },
  paymentIconText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.textPrimary,
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
  summaryTotalValueError: {
    color: AppColors.error,
  },
  errorMessageContainer: {
    backgroundColor: `${AppColors.error}15`,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorMessageText: {
    fontSize: 13,
    color: AppColors.error,
    fontWeight: "600",
    textAlign: "center",
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
