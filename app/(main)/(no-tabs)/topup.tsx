import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Coins, Plus, Wallet, CreditCard, Smartphone } from 'lucide-react-native';

interface TopUpAmount {
  value: number;
  bonus: number;
  popular?: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  color: string;
}

export default function TopUpScreen() {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<TopUpAmount | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('vnpay');
  const [currentBalance] = useState(1500);

  const topUpAmounts: TopUpAmount[] = [
    { value: 100000, bonus: 0 },
    { value: 200000, bonus: 20000, popular: true },
    { value: 500000, bonus: 100000 },
  ];

  const paymentMethods: PaymentMethod[] = [
    { id: 'vnpay', name: 'VNPay', icon: CreditCard, color: '#1976D2' },
    { id: 'payos', name: 'PayOs', icon: Wallet, color: '#4CAF50' },
    { id: 'zalopay', name: 'ZaloPay', icon: Smartphone, color: '#0068FF' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const handlePayment = () => {
    if (!selectedAmount) return;
    
    // Simulate payment process
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate
      if (success) {
        router.push('/payment-success');
      } else {
        router.push('/payment-failed');
      }
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nạp xu</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Current Balance in Header */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceIcon}>
            <Wallet size={32} color="#ffffff" strokeWidth={2} />
          </View>
          <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
          <Text style={styles.balanceAmount}>{currentBalance.toLocaleString()} xu</Text>
          <Text style={styles.balanceSubtext}>≈ {(currentBalance * 1000).toLocaleString()} VND</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Top-up Amounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn mệnh giá</Text>
          {topUpAmounts.map((amount, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.amountCard,
                selectedAmount?.value === amount.value && styles.amountCardSelected
              ]}
              onPress={() => setSelectedAmount(amount)}
            >
              <View style={styles.amountInfo}>
                <Text style={styles.amountValue}>{formatCurrency(amount.value)}</Text>
                {amount.bonus > 0 && (
                  <Text style={styles.bonusText}>+{amount.bonus.toLocaleString()} xu bonus</Text>
                )}
              </View>
              <View style={styles.amountRight}>
                <Text style={styles.coinAmount}>{(amount.value / 1000).toLocaleString()}</Text>
                {amount.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Phổ biến</Text>
                  </View>
                )}
                <View style={[
                  styles.radioButton,
                  selectedAmount?.value === amount.value && styles.radioButtonSelected
                ]}>
                  {selectedAmount?.value === amount.value && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={styles.paymentGrid}>
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentCard,
                    selectedPayment === method.id && styles.paymentCardSelected
                  ]}
                  onPress={() => setSelectedPayment(method.id)}
                >
                  <View style={[styles.paymentIconContainer, { backgroundColor: method.color + '15' }]}>
                    <IconComponent size={24} color={method.color} strokeWidth={2} />
                  </View>
                  <Text style={styles.paymentName}>{method.name}</Text>
                  {selectedPayment === method.id && (
                    <View style={styles.selectedBadge}>
                      <View style={styles.selectedDot} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.backToHomeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backToHomeText}>Quay lại</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.paymentButton,
            !selectedAmount && styles.paymentButtonDisabled
          ]}
          onPress={handlePayment}
          disabled={!selectedAmount}
        >
          <LinearGradient
            colors={selectedAmount ? ['#667eea', '#764ba2'] : ['#94a3b8', '#94a3b8']}
            style={styles.paymentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.paymentButtonText}>Thanh toán</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerRight: {
    width: 40,
  },
  balanceSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  balanceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  amountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  amountCardSelected: {
    borderColor: '#667eea',
    backgroundColor: '#667eea05',
  },
  amountInfo: {
    flex: 1,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  bonusText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  amountRight: {
    alignItems: 'flex-end',
  },
  coinAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 4,
  },
  popularBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  popularText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  paymentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  paymentCardSelected: {
    borderColor: '#667eea',
    backgroundColor: '#667eea08',
  },
  paymentIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#667eea',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#667eea',
  },
  bottomContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  backToHomeButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToHomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  paymentButton: {
    flex: 2,
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
  },
  paymentButtonDisabled: {
    opacity: 0.5,
  },
  paymentGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
