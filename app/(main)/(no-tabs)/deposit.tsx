import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  Smartphone,
  Building2,
  Check,
  Star,
  Plus,
  CheckCircle,
  Coins
} from 'lucide-react-native';

interface TopUpAmount {
  value: number;
  popular?: boolean;
  label: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
}

export default function DepositScreen() {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<TopUpAmount | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('vnpay');
  const [customAmount, setCustomAmount] = useState('');
  const [currentBalance] = useState(150000);

  const topUpAmounts: TopUpAmount[] = [
    { value: 100000, label: '100K' },
    { value: 200000, label: '200K', popular: true },
    { value: 500000, label: '500K' },
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'vnpay',
      name: 'VNPay',
      icon: CreditCard,
      color: '#1976D2',
      description: 'Thanh toán qua VNPay'
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      icon: Wallet,
      color: '#0068FF',
      description: 'Ví điện tử ZaloPay'
    },
    {
      id: 'payos',
      name: 'PayOs',
      icon: Smartphone,
      color: '#D82D8B',
      description: 'Ví điện tử PayOs'
    },

  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const getTotalAmount = () => {
    if (selectedAmount) {
      return selectedAmount.value;
    }
    if (customAmount) {
      const amount = parseInt(customAmount.replace(/[^0-9]/g, ''));
      return amount || 0;
    }
    return 0;
  };

  const handlePayment = () => {
    const total = getTotalAmount();
    if (total < 10000) {
      Alert.alert('Lỗi', 'Số tiền nạp tối thiểu là 10.000 VND');
      return;
    }

    Alert.alert(
      'Xác nhận thanh toán',
      `Bạn sẽ nạp ${formatCurrency(total)} VND vào tài khoản?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            // Simulate payment process
            setTimeout(() => {
              const success = Math.random() > 0.2; // 80% success rate
              if (success) {
                router.push('/(main)/(no-tabs)/payment-success');
              } else {
                router.push('/(main)/(no-tabs)/payment-failed');
              }
            }, 1500);
          }
        }
      ]
    );
  };

  const handleAmountSelect = (amount: TopUpAmount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (text: string) => {
    // Remove non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');
    // Format with thousand separators
    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    setCustomAmount(formattedValue);
    setSelectedAmount(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />

      {/* Modern Header with Curved Bottom */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#1e40af', '#3b82f6', '#6366f1']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#ffffff" strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Nạp xu</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          {/* Premium Balance Card */}
          <View style={styles.balanceCardContainer}>
            <View style={styles.balanceCard}>
              <LinearGradient
                colors={['#ffffff', '#f8fafc', '#f1f5f9']}
                style={styles.balanceCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Balance Header with Icon and Badge */}
                <View style={styles.balanceTopSection}>
                  <View style={styles.balanceIconWrapper}>

                    <Wallet size={18} color="#036AA5" strokeWidth={2.5} />
                  </View>

                  <TouchableOpacity style={styles.historyButton}>
                    <Text style={styles.historyButtonText}>Lịch sử</Text>
                    <ArrowLeft size={12} color="#3b82f6" strokeWidth={2.5} style={{ transform: [{ rotate: '180deg' }] }} />
                  </TouchableOpacity>

                </View>

                {/* Balance Amount Section */}
                <View style={styles.balanceMainSection}>
                  <Text style={styles.balanceLabel}>Số xu hiện tại</Text>
                  <View style={styles.balanceAmountContainer}>
                    <Text style={styles.balanceAmount}>{formatCurrency(currentBalance)}</Text>
                    <Text style={styles.balanceUnit}>xu</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Curved Bottom Shape */}
          <View style={styles.curvedBottom} />
        </LinearGradient>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Quick Amount Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn số tiền nạp</Text>
          <View style={styles.amountGrid}>
            {topUpAmounts.map((amount, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.amountCard,
                  selectedAmount?.value === amount.value && styles.amountCardSelected,
                  amount.popular && styles.amountCardPopular
                ]}
                onPress={() => handleAmountSelect(amount)}
              >
                {amount.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Phổ biến</Text>
                  </View>
                )}

                <View style={styles.amountCardLeft}>
                  <Text style={[
                    styles.amountValue,
                    selectedAmount?.value === amount.value && styles.amountValueSelected
                  ]}>
                    {formatCurrency(amount.value)} VND
                  </Text>
                </View>

                <View style={styles.amountCardRight}>
                  <View style={styles.coinIconContainer}>
                    <Text style={styles.coinValue}>{amount.value / 1000}</Text>
                    <View style={styles.coinIcon}>
                      <Coins size={16} color="#ffffff" strokeWidth={2} />
                    </View>
                  </View>
                </View>

                {selectedAmount?.value === amount.value && (
                  <View style={styles.selectedIndicator}>
                    <Check size={16} color="#ffffff" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoặc nhập số tiền khác</Text>
          <View style={styles.customAmountContainer}>
            <TextInput
              style={[
                styles.customAmountInput,
                customAmount && styles.customAmountInputActive
              ]}
              placeholder="Nhập số tiền (VND)"
              value={customAmount}
              onChangeText={handleCustomAmountChange}
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.customAmountSuffix}>VND</Text>
          </View>
          <Text style={styles.customAmountNote}>Số tiền tối thiểu: 10.000 VND</Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={styles.paymentMethods}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedPayment === method.id && styles.paymentMethodSelected
                ]}
                onPress={() => setSelectedPayment(method.id)}
              >
                <View style={styles.paymentMethodLeft}>
                  <View style={[styles.paymentIcon, { backgroundColor: method.color }]}>
                    <method.icon size={24} color="#ffffff" />
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentName}>{method.name}</Text>
                    <Text style={styles.paymentDescription}>{method.description}</Text>
                  </View>
                </View>
                {selectedPayment === method.id && (
                  <View style={styles.paymentSelectedIndicator}>
                    <Check size={20} color="#3b82f6" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        {getTotalAmount() > 0 && (
          <View style={styles.section}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Tóm tắt giao dịch</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Số tiền nạp:</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(selectedAmount?.value || parseInt(customAmount.replace(/[^0-9]/g, '')) || 0)} VND
                </Text>
              </View>

              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Tổng xu nhận được:</Text>
                <Text style={styles.summaryTotalValue}>
                  {formatCurrency(getTotalAmount() / 1000)} xu
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Payment Button */}
      {getTotalAmount() > 0 && (
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity
            style={styles.paymentButton}
            onPress={handlePayment}
          >
            <LinearGradient
              colors={['#3b82f6', '#8b5cf6']}
              style={styles.paymentButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.paymentButtonText}>
                Thanh toán {formatCurrency(getTotalAmount())} VND
              </Text>
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
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    position: 'relative',
    zIndex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'relative',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerRight: {
    width: 44,
  },
  balanceCardContainer: {
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  balanceCard: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  balanceCardGradient: {
    padding: 28,
  },

  // New Balance Card Layout
  balanceTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceIconWrapper: {
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  balanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verifiedText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '700',
  },

  balanceMainSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 40,
  },
  balanceUnit: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
  },

  balanceFooterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  equivalentContainer: {
    flex: 1,
  },
  equivalentLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: 2,
  },
  equivalentAmount: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  historyButtonText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  curvedBottom: {
    position: 'absolute',
    bottom: -25,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  content: {
    flex: 1,
    marginTop: -20,
    paddingTop: 30,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  amountGrid: {
    gap: 12,
  },
  amountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  amountCardPopular: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  amountCardLeft: {
    flex: 1,
  },
  amountCardRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  coinIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  amountValueSelected: {
    color: '#3b82f6',
  },
  amountPrice: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  amountPriceSelected: {
    color: '#3b82f6',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 16,
  },
  customAmountInputActive: {
    color: '#3b82f6',
  },
  customAmountSuffix: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  customAmountNote: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    marginLeft: 4,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentMethodSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  paymentSelectedIndicator: {
    marginLeft: 12,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  bottomSpacing: {
    height: 100,
  },
  paymentButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  paymentButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  paymentButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});