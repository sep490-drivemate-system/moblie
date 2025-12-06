import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { XCircle, RotateCcw, MessageCircle } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function PaymentFailedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Lấy tất cả dữ liệu return từ payment gateway
  useEffect(() => {
    if (Object.keys(params).length > 0) {
      console.log('=== Payment Gateway Return Data (Failed) ===');
      console.log('All parameters:', params);

      // VNPay error parameters
      const vnpayError = {
        responseCode: params.vnp_ResponseCode || params.responseCode,
        message: params.vnp_ResponseMessage || params.message,
        txnRef: params.vnp_TxnRef || params.txnRef,
        orderInfo: params.vnp_OrderInfo || params.orderInfo,
      };

      // ZaloPay error parameters
      const zalopayError = {
        returncode: params.returncode,
        returnmessage: params.returnmessage,
        apptransid: params.apptransid,
      };

      // PayOs error parameters
      const payosError = {
        code: params.code,
        desc: params.desc,
        message: params.message,
      };

      console.log('VNPay error:', vnpayError);
      console.log('ZaloPay error:', zalopayError);
      console.log('PayOs error:', payosError);

      // TODO: Gửi thông tin lỗi lên server để log
      // logPaymentError(vnpayError, zalopayError, payosError);
    }
  }, [params]);

  useEffect(() => {
    // Animation sequence
    Animated.sequence([
      // Scale in the error icon with shake
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        // Shake animation
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Fade in content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleRetry = () => {
    router.back();
  };

  const handleSupport = () => {
    // Navigate to support or contact screen
    console.log('Contact support');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#ef4444" />

      <LinearGradient
        colors={['#ef4444', '#dc2626', '#b91c1c']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* City Skyline Background */}
        <View style={styles.skylineContainer}>
          <View style={styles.skyline}>
            {/* Building shapes */}
            <View style={[styles.building, { height: 80, width: 30, left: 20 }]} />
            <View style={[styles.building, { height: 120, width: 25, left: 55 }]} />
            <View style={[styles.building, { height: 90, width: 35, left: 85 }]} />
            <View style={[styles.building, { height: 110, width: 28, left: 125 }]} />
            <View style={[styles.building, { height: 95, width: 32, left: 158 }]} />
            <View style={[styles.building, { height: 130, width: 26, left: 195 }]} />
            <View style={[styles.building, { height: 85, width: 30, left: 226 }]} />
            <View style={[styles.building, { height: 105, width: 35, left: 261 }]} />
            <View style={[styles.building, { height: 115, width: 28, left: 301 }]} />
            <View style={[styles.building, { height: 88, width: 33, left: 334 }]} />
          </View>

          {/* Car */}
          <View style={styles.carContainer}>
            <View style={styles.car}>
              <View style={styles.carBody} />
              <View style={styles.carWindow} />
              <View style={[styles.carWheel, styles.carWheelFront]} />
              <View style={[styles.carWheel, styles.carWheelRear]} />
            </View>
          </View>
        </View>

        {/* Failed Content */}
        <View style={styles.content}>
          {/* Error Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  { translateX: shakeAnim }
                ]
              }
            ]}
          >
            <View style={styles.errorIcon}>
              <XCircle size={60} color="#ffffff" strokeWidth={3} />
            </View>
          </Animated.View>

          {/* Error Text */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.errorTitle}>Thanh toán thất bại</Text>
            <Text style={styles.errorMessage}>
              Giao dịch của bạn thực hiện thất bại. Vui lòng xem lại thông tin thanh toán, liên hệ chúng tôi để được hỗ trợ sớm nhất!
            </Text>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.8}
            >
              <View style={styles.retryButtonContent}>
                <RotateCcw size={20} color="#ef4444" strokeWidth={2} />
                <Text style={styles.retryButtonText}>Quay về</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.supportButton}
              onPress={handleSupport}
              activeOpacity={0.8}
            >
              <View style={styles.supportButtonContent}>
                <MessageCircle size={20} color="#ffffff" strokeWidth={2} />
                <Text style={styles.supportButtonText}>Liên hệ hỗ trợ</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  skylineContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  skyline: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    height: 120,
  },
  building: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  carContainer: {
    position: 'absolute',
    bottom: 40,
    left: width / 2 - 30,
  },
  car: {
    width: 60,
    height: 30,
    position: 'relative',
  },
  carBody: {
    width: 50,
    height: 20,
    backgroundColor: '#f97316',
    borderRadius: 8,
    position: 'absolute',
    bottom: 6,
    left: 5,
  },
  carWindow: {
    width: 30,
    height: 12,
    backgroundColor: '#ea580c',
    borderRadius: 4,
    position: 'absolute',
    bottom: 14,
    left: 15,
  },
  carWheel: {
    width: 12,
    height: 12,
    backgroundColor: '#1f2937',
    borderRadius: 6,
    position: 'absolute',
    bottom: 0,
  },
  carWheelFront: {
    right: 8,
  },
  carWheelRear: {
    left: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  iconContainer: {
    marginBottom: 40,
  },
  errorIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  errorMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  retryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  retryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  supportButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  supportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
