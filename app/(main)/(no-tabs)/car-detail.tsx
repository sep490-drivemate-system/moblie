import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  FlatList,
  Animated,
  PanResponder,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Car } from '@/models/car/car';
import { Star, MapPin, Clock, User, Phone, MessageCircle, Calendar, CheckCircle, ChevronLeft, Heart, Share2, Camera } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Booking {
  id: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed';
  studentName: string;
  duration: string;
}

interface InstructorDetail {
  id: string;
  name: string;
  avatar: string;
  experience: string;
  rating: number;
  totalStudents: number;
  phone: string;
  specialties: string[];
  description: string;
  completedLessons: number;
}

export default function CarDetailScreen() {
  const router = useRouter();
  const { carId } = useLocalSearchParams();
  const [car, setCar] = useState<Car | null>(null);
  const [instructor, setInstructor] = useState<InstructorDetail | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'bookings'>('info');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef<FlatList>(null);

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
      images: [
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1494976688153-ca3ce29cd5b8?w=800&h=600&fit=crop'
      ],
      pricing: {
        halfDay: { price: 200000, duration: 4 },
        fullDay: { price: 300000, duration: 8 }
      },
      instructor: { experience: '8 năm kinh nghiệm' },
      location: 'Quận 1, TP.HCM',
      rating: { score: 5.0, totalStudents: 94 }
    };
    setCar(mockCar);

    // Mock instructor data
    const mockInstructor: InstructorDetail = {
      id: '1',
      name: 'Trần Minh Cường',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      experience: '8 năm kinh nghiệm',
      rating: 5.0,
      totalStudents: 94,
      phone: '0901234567',
      specialties: ['Lái xe an toàn', 'Đỗ xe song song', 'Lái xe đường dài'],
      description: 'Đã hoàn thành khóa tập huấn giáo viên lái xe từ năm 2020, với hơn 5 năm kinh nghiệm giảng dạy. Phong cách dạy kiên nhẫn và thân thiện.',
      completedLessons: 1250
    };
    setInstructor(mockInstructor);

    // Mock bookings data
    const mockBookings: Booking[] = [
      {
        id: '1',
        date: '2024-10-08',
        time: '08:00 - 12:00',
        status: 'confirmed',
        studentName: 'Nguyễn Văn A',
        duration: '4 giờ'
      },
      {
        id: '2',
        date: '2024-10-08',
        time: '14:00 - 18:00',
        status: 'pending',
        studentName: 'Lê Thị B',
        duration: '4 giờ'
      },
      {
        id: '3',
        date: '2024-10-09',
        time: '08:00 - 16:00',
        status: 'confirmed',
        studentName: 'Phạm Văn C',
        duration: '8 giờ'
      }
    ];
    setBookings(mockBookings);
  }, [carId]);

  if (!car) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  const renderCarouselItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.carouselItem}>
      <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="cover" />
    </View>
  );

  const renderThumbnail = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={[
        styles.thumbnailContainer,
        selectedImageIndex === index && styles.thumbnailActive
      ]}
      onPress={() => {
        setSelectedImageIndex(index);
        carouselRef.current?.scrollToIndex({ index, animated: true });
      }}
    >
      <Image source={{ uri: item }} style={styles.thumbnailImage} resizeMode="cover" />
      {selectedImageIndex === index && <View style={styles.thumbnailOverlay} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <Animated.View style={[
        styles.header,
        {
          opacity: scrollY.interpolate({
            inputRange: [0, 100],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          }),
        }
      ]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#1e293b" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{car.name}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setIsFavorite(!isFavorite)}>
            <Heart size={22} color={isFavorite ? "#ef4444" : "#64748b"} fill={isFavorite ? "#ef4444" : "none"} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Share2 size={22} color="#64748b" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Image Carousel */}
      <View style={styles.imageSection}>
        <FlatList
          ref={carouselRef}
          data={car.images}
          renderItem={renderCarouselItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setSelectedImageIndex(index);
          }}
          style={styles.carousel}
        />
        
        {/* Image Counter */}
        <View style={styles.imageCounter}>
          <Camera size={16} color="#ffffff" strokeWidth={2} />
          <Text style={styles.imageCounterText}>{selectedImageIndex + 1}/{car.images?.length || 1}</Text>
        </View>
        
        {/* Floating Action Buttons */}
        <View style={styles.floatingActions}>
          <TouchableOpacity style={styles.floatingButton} onPress={() => router.back()}>
            <ChevronLeft size={20} color="#1e293b" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.floatingButton, isFavorite && styles.floatingButtonActive]} 
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart size={18} color={isFavorite ? "#ffffff" : "#1e293b"} fill={isFavorite ? "#ffffff" : "none"} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Thumbnail Strip */}
      <View style={styles.thumbnailSection}>
        <FlatList
          data={car.images}
          renderItem={renderThumbnail}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailList}
        />
      </View>

      <Animated.ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Car Info Header */}
        <View style={styles.carInfoHeader}>
          <View style={styles.carTitleSection}>
            <Text style={styles.carName}>{car.name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={16} color="#64748b" strokeWidth={2} />
              <Text style={styles.locationText}>{car.location}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Star size={16} color="#FFD700" fill="#FFD700" strokeWidth={2} />
              <Text style={styles.ratingScore}>{car.rating.score}</Text>
              <Text style={styles.ratingCount}>({car.rating.totalStudents} đánh giá)</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <User size={24} color="#667eea" strokeWidth={2} />
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

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'info' && styles.activeTab]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Thông tin</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
            onPress={() => setActiveTab('bookings')}
          >
            <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>Lịch đặt ({bookings.length})</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'info' ? (
          <>
            {/* Instructor Section */}
            {instructor && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👨‍🏫 Thông tin người hướng dẫn</Text>
                
                <View style={styles.instructorDetailCard}>
                  <View style={styles.instructorHeader}>
                    <Image 
                      source={{ uri: instructor.avatar }} 
                      style={styles.instructorAvatar}
                    />
                    <View style={styles.instructorMainInfo}>
                      <Text style={styles.instructorName}>{instructor.name}</Text>
                      <View style={styles.instructorRatingRow}>
                        <Star size={16} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.instructorRating}>{instructor.rating}</Text>
                        <Text style={styles.instructorStudents}>({instructor.totalStudents} học viên)</Text>
                      </View>
                      <Text style={styles.instructorExperience}>{instructor.experience}</Text>
                    </View>
                  </View>

                  <View style={styles.instructorStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{instructor.completedLessons}</Text>
                      <Text style={styles.statLabel}>Buổi học</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{instructor.totalStudents}</Text>
                      <Text style={styles.statLabel}>Học viên</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{instructor.rating}</Text>
                      <Text style={styles.statLabel}>Đánh giá</Text>
                    </View>
                  </View>

                  <Text style={styles.instructorDescription}>{instructor.description}</Text>

                  <View style={styles.specialtiesContainer}>
                    <Text style={styles.specialtiesTitle}>Chuyên môn:</Text>
                    <View style={styles.specialtiesList}>
                      {instructor.specialties.map((specialty, index) => (
                        <View key={index} style={styles.specialtyTag}>
                          <Text style={styles.specialtyText}>{specialty}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.contactButtons}>
                    <TouchableOpacity style={styles.phoneButton}>
                      <Phone size={20} color="#10b981" />
                      <Text style={styles.phoneButtonText}>Gọi điện</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.messageButton}>
                      <MessageCircle size={20} color="#3b82f6" />
                      <Text style={styles.messageButtonText}>Nhắn tin</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Bookings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📅 Lịch đặt xe hiện tại</Text>
              
              {bookings.length > 0 ? (
                <FlatList
                  data={bookings}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.bookingCard}>
                      <View style={styles.bookingHeader}>
                        <View style={styles.bookingDateContainer}>
                          <Calendar size={20} color="#667eea" />
                          <Text style={styles.bookingDate}>{item.date}</Text>
                        </View>
                        <View style={[
                          styles.statusBadge, 
                          item.status === 'confirmed' && styles.statusConfirmed,
                          item.status === 'pending' && styles.statusPending,
                          item.status === 'completed' && styles.statusCompleted
                        ]}>
                          <Text style={[
                            styles.statusText,
                            item.status === 'pending' && { color: '#92400e' },
                            item.status === 'completed' && { color: '#4338ca' }
                          ]}>
                            {item.status === 'confirmed' ? 'Đã xác nhận' : 
                             item.status === 'pending' ? 'Chờ xác nhận' : 'Hoàn thành'}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.bookingDetails}>
                        <View style={styles.bookingRow}>
                          <Clock size={16} color="#64748b" />
                          <Text style={styles.bookingTime}>{item.time}</Text>
                        </View>
                        <View style={styles.bookingRow}>
                          <User size={16} color="#64748b" />
                          <Text style={styles.bookingStudent}>{item.studentName}</Text>
                        </View>
                        <View style={styles.bookingRow}>
                          <Text style={styles.bookingDuration}>Thời lượng: {item.duration}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyBookings}>
                  <Text style={styles.emptyBookingsText}>Chưa có lịch đặt nào</Text>
                </View>
              )}
            </View>
          </>
        )}

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
      </Animated.ScrollView>

      {/* Bottom Action Button with Gradient */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.bookButtonWrapper}
          onPress={() => {
            router.push({
              pathname: '/(main)/(no-tabs)/booking',
              params: { 
                carId: car.id,
                instructorId: instructor?.id,
                package: 'full',
                vehicleId: car.id.toString()
              }
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
    marginTop: 16,
    marginBottom: 20,
    gap: 12,
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
  // Tab Navigation Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#ffffff',
  },
  // Instructor Detail Styles
  instructorDetailCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 16,
  },
  instructorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  instructorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  instructorMainInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  instructorRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  instructorRating: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 4,
    marginRight: 8,
  },
  instructorStudents: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  instructorExperience: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  instructorStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  instructorDescription: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16,
  },
  specialtiesContainer: {
    marginBottom: 20,
  },
  specialtiesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  specialtyText: {
    fontSize: 13,
    color: '#4338ca',
    fontWeight: '600',
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  phoneButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  phoneButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10b981',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  messageButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3b82f6',
  },
  // Booking Styles
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusConfirmed: {
    backgroundColor: '#dcfce7',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusCompleted: {
    backgroundColor: '#e0e7ff',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
  },
  bookingDetails: {
    gap: 8,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingTime: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  bookingStudent: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  bookingDuration: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  emptyBookings: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyBookingsText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  // New Modern Layout Styles
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  // Image Section Styles
  imageSection: {
    height: height * 0.4,
    position: 'relative',
    marginTop: 90,
  },
  carousel: {
    flex: 1,
  },
  carouselItem: {
    width: width,
    height: '100%',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  imageCounterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  floatingActions: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingButtonActive: {
    backgroundColor: '#ef4444',
  },
  // Thumbnail Section Styles
  thumbnailSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  thumbnailList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  thumbnailContainer: {
    width: 80,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#667eea',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
  },
  // Car Info Header Styles
  carInfoHeader: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  carTitleSection: {
    alignItems: 'flex-start',
  },
  carName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  locationText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingScore: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  ratingCount: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
});
