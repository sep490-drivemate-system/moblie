import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Car } from '@/models/car/car';
import { Star, MapPin, ChevronLeft, Phone } from 'lucide-react-native';
import { AppColors } from '@/constants/Colors';

export default function CarDetailScreen() {
  const router = useRouter();
  const { carId } = useLocalSearchParams();
  const [car, setCar] = useState<Car | null>(null);

  useEffect(() => {
    const mockCar: Car = {
      id: parseInt(carId as string) || 1,
      name: 'KIA Carnival 2024',
      brand: 'Kia Motors',
      seats: 7,
      type: 'MPV',
      fuel: 'Xăng',
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
      location: 'Quận 1, TP.HCM',
      rating: 4.8,
      price: 300000,
    };
    setCar(mockCar);
  }, [carId]);

  if (!car) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  const rating = typeof car.rating === 'number' ? car.rating : car.rating;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={AppColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết xe</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Car Image */}
        <Image source={{ uri: car.imageUrl }} style={styles.carImage} />

        {/* Car Info */}
        <View style={styles.infoCard}>
          <Text style={styles.carName}>{car.name}</Text>
          
          <View style={styles.row}>
            <MapPin size={16} color={AppColors.textSecondary} />
            <Text style={styles.location}>{car.location}</Text>
          </View>

         
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{car.seats}</Text>
            <Text style={styles.statLabel}>Chỗ ngồi</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{car.type}</Text>
            <Text style={styles.statLabel}>Loại xe</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{car.fuel}</Text>
            <Text style={styles.statLabel}>Nhiên liệu</Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Giá thuê</Text>
          <Text style={styles.priceValue}>{car.price?.toLocaleString()}đ/ngày</Text>
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hãng xe:</Text>
            <Text style={styles.detailValue}>{car.brand}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Loại xe:</Text>
            <Text style={styles.detailValue}>{car.type}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số ghế:</Text>
            <Text style={styles.detailValue}>{car.seats} chỗ</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          onPress={() => router.push('/(main)/(no-tabs)/booking')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[AppColors.primary, AppColors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookButton}
          >
            <Text style={styles.bookButtonText}>Đặt lịch thuê xe</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  carImage: {
    width: '100%',
    height: 250,
    backgroundColor: AppColors.gray200,
  },
  infoCard: {
    backgroundColor: AppColors.white,
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  carName: {
    fontSize: 24,
    fontWeight: '800',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: AppColors.gray50,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  priceCard: {
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.primary,
  },
  detailsCard: {
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AppColors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  bookButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
