import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Car } from '@/models/car/car';

const { width, height } = Dimensions.get('window');

export default function CarDetailScreen() {
  const router = useRouter();
  const { carId } = useLocalSearchParams();
  const [car, setCar] = useState<Car | null>(null);

  useEffect(() => {
    // TODO: Fetch car data from API or Redux store
    const mockCar: Car = {
      id: parseInt(carId as string) || 1,
      name: 'KIA Carnival 2024',
      brand: 'Kia Motors',
      seats: 7,
      type: 'MPV',
      fuel: 'Xăng',
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
      pricing: {
        halfDay: { price: 600000, duration: 4 },
        fullDay: { price: 1000000, duration: 8 }
      },
      instructor: { experience: '8 năm kinh nghiệm' },
      location: 'Quận 1, TP.HCM',
      rating: { score: 5.0, totalStudents: 94 }
    };
    setCar(mockCar);
  }, [carId]);

  if (!car) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Hero Image Section */}
      <View style={styles.heroSection}>
        <Image 
          source={{ uri: car.imageUrl }} 
          style={styles.heroImage}
          resizeMode="cover"
        />
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
          style={styles.heroOverlay}
        />
        
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
            style={styles.backButtonGradient}
          >
            <Text style={styles.backIcon}>←</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Rating Badge */}
        <View style={styles.ratingBadgeContainer}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ratingBadge}
          >
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={styles.ratingText}>{car.rating.score}</Text>
          </LinearGradient>
        </View>

        {/* Car Name Overlay */}
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroCarName}>{car.name}</Text>
          <View style={styles.heroLocationRow}>
            <Text style={styles.heroLocationIcon}>📍</Text>
            <Text style={styles.heroLocation}>{car.location}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>👥</Text>
            </View>
            <Text style={styles.statValue}>{car.seats} chỗ</Text>
            <Text style={styles.statLabel}>Số ghế</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>⚙️</Text>
            </View>
            <Text style={styles.statValue}>Tự động</Text>
            <Text style={styles.statLabel}>Truyền động</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>⛽</Text>
            </View>
            <Text style={styles.statValue}>{car.fuel}</Text>
            <Text style={styles.statLabel}>Nhiên liệu</Text>
          </View>
        </View>

        {/* Price Section with Gradient Card */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.priceCard}
        >
          <View style={styles.priceHeader}>
            <Text style={styles.priceTitle}>💰 Giá thuê</Text>
          </View>
          
          <View style={styles.priceRow}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Nửa ngày ({car.pricing.halfDay.duration}h)</Text>
              <Text style={styles.priceValue}>
                {car.pricing.halfDay.price.toLocaleString()}đ
              </Text>
            </View>
            
            <View style={styles.priceDivider} />
            
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Cả ngày ({car.pricing.fullDay.duration}h)</Text>
              <Text style={styles.priceValue}>
                {car.pricing.fullDay.price.toLocaleString()}đ
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Car Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚗 Thông tin xe</Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Hãng xe</Text>
              <Text style={styles.detailValue}>{car.brand}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Loại xe</Text>
              <Text style={styles.detailValue}>{car.type}</Text>
            </View>
          </View>
        </View>

        {/* Instructor Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👨‍🏫 Người hướng dẫn</Text>
          
          <View style={styles.instructorCard}>
            <View style={styles.instructorIconContainer}>
              <Text style={styles.instructorIcon}>🎓</Text>
            </View>
            <View style={styles.instructorInfo}>
              <Text style={styles.instructorLabel}>Kinh nghiệm</Text>
              <Text style={styles.instructorValue}>{car.instructor.experience}</Text>
            </View>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Đánh giá</Text>
          
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text key={star} style={styles.starIcon}>⭐</Text>
                ))}
              </View>
              <Text style={styles.reviewScore}>{car.rating.score}/5.0</Text>
            </View>
            
            <Text style={styles.reviewCount}>
              Dựa trên {car.rating.totalStudents} lượt đánh giá
            </Text>
            
            <TouchableOpacity style={styles.viewReviewsButton}>
              <Text style={styles.viewReviewsText}>Xem tất cả đánh giá →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Spacing for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Button with Gradient */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.bookButtonWrapper}
          onPress={() => {
            router.push({
              pathname: '/(main)/(no-tabs)/booking',
              params: { carId: car.id }
            });
          }}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bookButton}
          >
            <Text style={styles.bookButtonText}>🚗 Đặt lịch thuê ngay</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  heroSection: {
    width: width,
    height: height * 0.45,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '700',
  },
  ratingBadgeContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ratingIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroCarName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLocationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  heroLocation: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -40,
    marginBottom: 20,
    zIndex: 5,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  priceCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  priceHeader: {
    marginBottom: 16,
  },
  priceTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceItem: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  priceDivider: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  instructorIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructorIcon: {
    fontSize: 28,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '600',
  },
  instructorValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  reviewCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    fontSize: 20,
    marginRight: 2,
  },
  reviewScore: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
  },
  reviewCount: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    fontWeight: '600',
  },
  viewReviewsButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  viewReviewsText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#667eea',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  bookButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  bookButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
