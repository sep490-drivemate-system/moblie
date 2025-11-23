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
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, Home, Calendar, Car } from 'lucide-react-native';
import { ROUTES } from '@/constants/routes';

const { width, height } = Dimensions.get('window');

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animation sequence
    Animated.sequence([
      // Scale in the check icon
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
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



  const handleGoToRental = () => {
    router.replace('/(main)/(tabs)/rental');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />

      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.skylineContainer}>
          <View style={styles.skyline}>
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

        {/* Success Content */}
        <View style={styles.content}>
          {/* Success Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <View style={styles.successIcon}>
              <CheckCircle size={60} color="#ffffff" strokeWidth={3} />
            </View>
          </Animated.View>

          {/* Success Text */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.successTitle}>Thanh toán thành công</Text>
            <Text style={styles.successMessage}>
              Chúc mừng! Giao dịch của bạn đã được xử lý thành công. Bạn có thể xem chi tiết trong đơn đặt lịch thuê. Cảm ơn bạn đã đồng hành cùng chúng tôi!
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
            {/* Primary Button - Go to Rental */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGoToRental}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Calendar size={20} color="#ffffff" strokeWidth={2} />
                <Text style={styles.primaryButtonText}>Xem lịch thuê</Text>
              </View>
            </TouchableOpacity>

            {/* Secondary Button - Go Home */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.replace({
                pathname: ROUTES.HOME,
              })}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Home size={20} color="#10b981" strokeWidth={2} />
                <Text style={styles.secondaryButtonText}>Quay về trang chủ</Text>
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
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    position: 'absolute',
    bottom: 6,
    left: 5,
  },
  carWindow: {
    width: 30,
    height: 12,
    backgroundColor: '#1e40af',
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
  successIcon: {
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
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  successMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
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
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
