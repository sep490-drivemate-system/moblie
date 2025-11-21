import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Star,
  Award,
  Users,
  MapPin,
  Clock,
  Car,
  User,
  X,
  CheckCircle,
} from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { IInstructor, IInstructors, InstructorPackageAPI, InstructorCarAPI } from "@/models/instructor/instructor.type";
import { useAppDispatch } from "@/lib/redux/hooks";
import { getInstructorPackages, getInstructorCars, buyPackage } from "@/features/instructor/instructorThunk";
import { Gender } from "@/models/user/gender.enum";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IBuyPackageRequest } from "@/models/package/package";
import { getUserIdFromToken } from "@/lib/jwt/tokenUtils";


// Helper function to convert gender number to text
const getGenderText = (gender: Gender): string => {
  return gender === Gender.Male ? "Nam" : "Nữ";
};

export default function InstructorDetailScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { instructorData } = useLocalSearchParams();
  const [instructor, setInstructor] = useState<IInstructors | null>(null);
  const [packages, setPackages] = useState<InstructorPackageAPI[]>([]);
  const [cars, setCars] = useState<InstructorCarAPI[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<InstructorPackageAPI | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null); // null = own car, string = vehicle id
  const [isProcessing, setIsProcessing] = useState(false);
  const fadeAnim = useState(new Animated.Value(1))[0]; // Start with 1 so modal is visible
  const scaleAnim = useState(new Animated.Value(1))[0]; // Start with 1 so modal is visible

  useEffect(() => {
    if (instructorData && typeof instructorData === 'string') {
      try {
        const parsedInstructor: IInstructors = JSON.parse(instructorData);
        setInstructor(parsedInstructor);
        fetchInstructorData(parsedInstructor.id);
      } catch (error) {
        console.error('Failed to parse instructor data:', error);
      }
    }
  }, [instructorData]);

  const fetchInstructorData = async (instructorId: string) => {
    setIsLoadingPackages(true);
    try {
      const packagesResult = await dispatch(getInstructorPackages({ id: instructorId })).unwrap();

      const packagesData = (packagesResult as any).value || packagesResult;
      setPackages(packagesData);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách gói học');
    } finally {
      setIsLoadingPackages(false);
    }

    setIsLoadingCars(true);
    try {
      const carsResult = await dispatch(getInstructorCars({ id: instructorId })).unwrap();
      const carsData = (carsResult as any).value || carsResult;
      setCars(carsData);
    } catch (error) {
      console.error('Failed to fetch cars:', error);
    } finally {
      setIsLoadingCars(false);
    }
  };

  useEffect(() => {
    if (showConfirmModal) {
      scaleAnim.setValue(0.95);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }).start(() => {
      });
    } else {
      scaleAnim.setValue(0.95);
    }
  }, [showConfirmModal]);

  const handleBuyPackage = (pkg: InstructorPackageAPI) => {
    setSelectedPackage(pkg);
    setSelectedVehicle(null);
    setShowConfirmModal(true);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
  };

  const handleConfirmPurchase = async () => {
    if (!instructor || !selectedPackage) {
      return;
    }

    setIsProcessing(true);

    try {
      const requestBody: IBuyPackageRequest = {
        durationWhenBought: parseInt(selectedPackage.duration) || 0,
        priceAtBuyingTime: selectedPackage.price,
        carId: selectedVehicle ? selectedVehicle : null,
        packageId: selectedPackage.id,
        instructorId: instructor.id
      };

      await dispatch(buyPackage(requestBody)).unwrap();

      // Success - close modal và navigate
      setShowConfirmModal(false);
      router.push({
        pathname: "/(main)/(no-tabs)/transaction-success",
        params: {
          instructorId: instructor.id,
          packageId: selectedPackage.id,
          vehicleId: selectedVehicle || "",
        },
      });
    } catch (error: any) {
      // Error handling
      console.log('Purchase failed:', error);

      // Hiển thị error message cho user
      const errorMessage = error?.message || 'Không thể mua gói. Vui lòng thử lại.';
      Alert.alert('Lỗi mua gói', errorMessage);
    } finally {
      // Luôn reset loading state
      setIsProcessing(false);
    }
  };

  if (!instructor) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section with Avatar */}
        <LinearGradient
          colors={[AppColors.gradientStart, AppColors.gradientEnd]}
          style={styles.heroSection}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(main)/(tabs)/instructors")}
          >
            <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: instructor.avatar }}
                  style={styles.heroAvatar}
                />
              </View>

              <View style={styles.heroNameContainer}>
                <Text style={styles.heroName}>{instructor.fullName}</Text>
                <View style={styles.heroStatusRow}>
                  <Text style={styles.heroStatus}>{getGenderText(instructor.gender)}</Text>
                </View>
              </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={styles.quickStatItem}>
                <Star
                  size={18}
                  color="#fbbf24"
                  fill="#fbbf24"
                  strokeWidth={0}
                />
                <Text style={styles.quickStatText}>{instructor.averageRating}</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Award size={18} color="#fff" strokeWidth={2} />
                <Text style={styles.quickStatText}>
                  {instructor.experienceYear} năm
                </Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Users size={18} color="#fff" strokeWidth={2} />
                <Text style={styles.quickStatText}>
                  {instructor.bookingCount}+
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        {/* About & Specialties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.aboutText}>
            {instructor.bio}
          </Text>
        </View>
        {/* Packages Section */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Gói thuê ({packages.length})</Text>

          {isLoadingPackages ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={AppColors.primary} />
              <Text style={styles.loadingText}>Đang tải gói học...</Text>
            </View>
          ) : packages.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Chưa có gói học nào</Text>
            </View>
          ) : (
            packages.map((pkg) => (
              <View key={pkg.id} style={styles.priceCard}>
                <View style={styles.priceCardHeader}>
                  <View style={styles.priceCardInfo}>
                    <Text style={styles.priceCardTitle}>{pkg.name}</Text>
                    <Text style={styles.packageDescription}>{pkg.description}</Text>
                    <View style={styles.packageTypeContainer}>
                      {pkg.isRentalCar ? (
                        <View style={styles.packageTypeWithVehicle}>
                          <Car size={16} color="#16a34a" />
                          <Text style={styles.packageTypeText}>
                            Có xe và người hướng dẫn
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.packageTypeInstructor}>
                          <User size={16} color="#ca8a04" />
                          <Text style={styles.packageTypeText}>
                            Chỉ có người hướng dẫn
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.packageDetails}>
                  <View style={styles.packageDetailRow}>
                    <Clock size={16} color="#64748b" strokeWidth={2} />
                    <Text style={styles.packageDetailText}>{pkg.duration} giờ</Text>
                  </View>

                  <View style={styles.packageDetailRow}>
                    <MapPin size={16} color="#64748b" strokeWidth={2} />
                    <Text style={styles.packageDetailText}>
                      {pkg.roadTypes.join(", ")}
                    </Text>
                  </View>

                  <View style={styles.packageSkills}>
                    {pkg.drivingSkills.map((skill: string, idx: number) => (
                      <View key={idx} style={styles.skillChip}>
                        <Text style={styles.skillChipText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.priceCardBottom}>
                  <View style={styles.priceInfo}>
                    <Text style={styles.priceAmount}>
                      {pkg.price.toLocaleString('vi-VN')} VND
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => handleBuyPackage(pkg)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buyButtonText}>Mua gói</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>



        {/* Cars Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Phương tiện ({cars.length})
            </Text>
          </View>

          {isLoadingCars ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={AppColors.primary} />
              <Text style={styles.loadingText}>Đang tải xe...</Text>
            </View>
          ) : cars.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Chưa có xe nào</Text>
            </View>
          ) : (
            cars.map((vehicle, index) => (
              <View
                key={vehicle.id}
                style={[styles.vehicleCard, index > 0 && { marginTop: 12 }]}
              >
                <Image
                  source={{ uri: vehicle.thumbnailUrl }}
                  style={styles.vehicleImage}
                />
                <View style={styles.vehicleOverlay}>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleName}>{vehicle.modelName}</Text>
                    <Text style={styles.vehicleSpec}>
                      {vehicle.seatCounts} chỗ {vehicle.vehicleType ? `• ${vehicle.vehicleType}` : ''}
                    </Text>
                    <Text style={styles.vehiclePrice}>
                      {vehicle.unitPrice.toLocaleString('vi-VN')} VND / giờ
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.vehicleDetailButton}
                    onPress={() => router.push({
                      pathname: "/car-detail",
                      params: { carId: vehicle.id }
                    })}
                  >
                    <Text style={styles.vehicleDetailButtonText}>Chi tiết</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Reviews Section */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá </Text>

          {feedbackData.reviews.map((review) => (
            <View style={styles.reviewItem} key={review.id}>
              <View style={styles.reviewHeader}>
                <Image
                  source={{ uri: review.reviewer.avatarUrl }}
                  style={styles.reviewAvatar}
                />
                <View style={styles.reviewHeaderInfo}>
                  <Text style={styles.reviewerName}>
                    {review.reviewer.name}
                  </Text>
                  <View style={styles.reviewStars}>
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        color="#f59e0b"
                        fill="#f59e0b"
                        strokeWidth={0}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <Text style={styles.reviewText}>{review.comment}</Text>
            </View>
          ))}
        </View> */}

        {/* Spacing for bottom */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isProcessing && setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => !isProcessing && setShowConfirmModal(false)}
          />
          <Animated.View
            style={[
              styles.confirmModalContent,
              {
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            {/* Modal Header */}
            <View style={styles.confirmModalHeader}>
              <Text style={styles.confirmModalTitle}>Xác nhận mua gói</Text>
              {!isProcessing && (
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowConfirmModal(false)}
                >
                  <X size={20} color="#64748b" strokeWidth={2.5} />
                </TouchableOpacity>
              )}
            </View>

            {/* Package Info */}
            {selectedPackage && (
              <ScrollView
                style={styles.confirmModalBody}
                showsVerticalScrollIndicator={false}
              >
                {/* Package Details */}
                <View style={styles.confirmPackageSection}>
                  <Text style={styles.confirmSectionTitle}>Thông tin gói</Text>
                  <View style={styles.confirmPackageCard}>
                    <Text style={styles.confirmPackageName}>
                      {selectedPackage.name}
                    </Text>

                    <Text style={styles.confirmPackageDescription}>
                      {selectedPackage.description}
                    </Text>

                    <View style={styles.confirmPackageBadge}>
                      {selectedPackage.isRentalCar ? (
                        <View style={styles.confirmBadgeWithVehicle}>
                          <Car size={14} color="#16a34a" />
                          <Text style={styles.confirmBadgeText}>Có xe</Text>
                        </View>
                      ) : (
                        <View style={styles.confirmBadgeInstructor}>
                          <User size={14} color="#ca8a04" />
                          <Text style={styles.confirmBadgeText}>Chỉ có người hướng dẫn</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.confirmPackageDetails}>
                      <View style={styles.confirmDetailRow}>
                        <Clock size={16} color="#64748b" />
                        <Text style={styles.confirmDetailText}>
                          {selectedPackage.duration} giờ
                        </Text>
                      </View>
                      <View style={styles.confirmDetailRow}>
                        <MapPin size={16} color="#64748b" />
                        <Text style={styles.confirmDetailText}>
                          {selectedPackage.roadTypes.join(", ")}
                        </Text>
                      </View>
                    </View>

                    {selectedPackage.drivingSkills && selectedPackage.drivingSkills.length > 0 && (
                      <View style={styles.confirmSkillsContainer}>
                        <Text style={styles.confirmSkillsLabel}>Kỹ năng học được:</Text>
                        <View style={styles.confirmSkillsList}>
                          {selectedPackage.drivingSkills.map((skill: string, index: number) => (
                            <View key={index} style={styles.confirmSkillChip}>
                              <Text style={styles.confirmSkillText}>{skill}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                {/* Vehicle Selection (only show if package has vehicle) */}
                {selectedPackage && selectedPackage.isRentalCar && (
                  <View style={styles.confirmVehicleSection}>
                    <Text style={styles.confirmSectionTitle}>Chọn xe (Tùy chọn)</Text>
                    <Text style={styles.confirmVehicleSubtitle}>
                      Bạn có thể chọn xe hoặc sử dụng xe riêng của mình
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.confirmVehicleOption,
                        selectedVehicle === null && styles.confirmVehicleOptionSelected,
                      ]}
                      onPress={() => setSelectedVehicle(null)}
                    >
                      <View style={styles.confirmNoVehicleIcon}>
                        <Text style={styles.confirmNoVehicleIconText}>🚙</Text>
                      </View>
                      <View style={styles.confirmVehicleOptionInfo}>
                        <Text style={styles.confirmVehicleOptionName}>Tôi có xe riêng</Text>
                        <Text style={styles.confirmVehicleOptionSpec}>
                          Không cần thuê xe từ giảng viên
                        </Text>
                      </View>
                      <View style={styles.confirmVehicleRadioButton}>
                        {selectedVehicle === null && (
                          <View style={styles.confirmVehicleRadioButtonInner} />
                        )}
                      </View>
                    </TouchableOpacity>

                    {cars.map((vehicle) => (
                      <TouchableOpacity
                        key={vehicle.id}
                        style={[
                          styles.confirmVehicleOption,
                          selectedVehicle === String(vehicle.id) && styles.confirmVehicleOptionSelected,
                        ]}
                        onPress={() => setSelectedVehicle(String(vehicle.id))}
                      >
                        <Image
                          source={{ uri: vehicle.thumbnailUrl }}
                          style={styles.confirmVehicleOptionImage}
                        />
                        <View style={styles.confirmVehicleOptionInfo}>
                          <Text style={styles.confirmVehicleOptionName}>{vehicle.modelName}</Text>
                          <View style={styles.confirmVehicleOptionSpecs}>
                            <Text style={styles.confirmVehicleOptionSpec}>{vehicle.seatCounts} chỗ</Text>
                            {vehicle.vehicleType && (
                              <>
                                <Text style={styles.confirmVehicleOptionDot}> • </Text>
                                <Text style={styles.confirmVehicleOptionSpec}>{vehicle.vehicleType}</Text>
                              </>
                            )}
                          </View>
                        </View>
                        <View style={styles.confirmVehicleRadioButton}>
                          {selectedVehicle === String(vehicle.id) && (
                            <View style={styles.confirmVehicleRadioButtonInner} />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Price Summary */}
                <View style={styles.confirmPriceSection}>
                  <View style={styles.confirmPriceRow}>
                    <Text style={styles.confirmPriceLabel}>Giá gói:</Text>
                    <Text style={styles.confirmPriceValue}>
                      {selectedPackage.price.toLocaleString('vi-VN')} VND
                    </Text>
                  </View>
                  <View style={styles.confirmDivider} />
                  <View style={styles.confirmPriceRow}>
                    <Text style={styles.confirmTotalLabel}>Tổng cộng:</Text>
                    <Text style={styles.confirmTotalValue}>
                      {(
                        selectedPackage.price
                      ).toLocaleString('vi-VN')} VND
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}

            <View style={styles.confirmModalActions}>
              {!isProcessing && (
                <TouchableOpacity
                  style={styles.confirmCancelButton}
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Text style={styles.confirmCancelButtonText}>Hủy</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.confirmPurchaseButton,
                  isProcessing && styles.confirmPurchaseButtonDisabled
                ]}
                onPress={handleConfirmPurchase}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmPurchaseButtonText}>
                    Xác nhận mua
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Hero Section
  heroSection: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  heroContent: {
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
  },
  statusBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  heroNameContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  heroStatusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroStatus: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  heroStatusDot: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600",
  },
  quickStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  quickStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quickStatText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  quickStatDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginHorizontal: 16,
  },
  // Pricing Section
  pricingSection: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  priceCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  featuredBadge: {
    position: "absolute",
    top: -8,
    right: 20,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  priceCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  priceCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  priceCardInfo: {
    flex: 1,
  },
  priceCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 2,
  },
  priceCardDesc: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  priceCardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
  priceInfo: {
    flex: 1,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: AppColors.primary,
  },
  buyButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: AppColors.active,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buyButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  // Section Styles
  section: {
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    top: 10,
  },
  aboutText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 22,
    fontWeight: "400",
    marginBottom: 20,
  },
  specialtiesContainer: {
    marginTop: 8,
  },
  specialtiesTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  specialtiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specialtyChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  specialtyText: {
    color: "#0369a1",
    fontSize: 13,
    fontWeight: "600",
  },
  // Info List
  infoList: {
    gap: 0,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  infoRowLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  infoRowValue: {
    fontSize: 15,
    color: AppColors.textPrimary,
    fontWeight: "700",
  },
  // Vehicle Card
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  vehicleCard: {
    borderRadius: 16,
    overflow: "hidden",
    height: 160,
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  vehicleOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  vehicleInfo: {
    flex: 1,
    gap: 8,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.white,
  },
  vehicleSpecText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "500",
  },
  vehiclePrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fbbf24",
    marginTop: 8,
  },
  vehicleDetailButton: {
    backgroundColor: "#70E000",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 70,
  },
  vehicleDetailButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  // Reviews
  reviewSummaryCard: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
  },
  reviewSummaryLeft: {
    alignItems: "center",
    paddingRight: 24,
    borderRightWidth: 1,
    borderRightColor: AppColors.borderLight,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: "800",
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  reviewCount: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  reviewSummaryRight: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },
  ratingBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.textSecondary,
    width: 24,
  },
  ratingBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: AppColors.gray100,
    borderRadius: 3,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    backgroundColor: "#f59e0b",
    borderRadius: 3,
  },
  ratingBarCount: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.textSecondary,
    width: 32,
    textAlign: "right",
  },
  reviewItem: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
    marginTop: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewHeaderInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: AppColors.textLight,
    fontWeight: "500",
  },
  reviewText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
    fontWeight: "400",
  },
  // Package Styles
  packageTypeContainer: {
    marginTop: 8,
  },
  packageTypeWithVehicle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  packageTypeInstructor: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  packageTypeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  packageTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  packageDetails: {
    marginTop: 12,
    marginBottom: 12,
    gap: 8,
  },
  packageDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  packageDetailText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  packageSkills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  skillChip: {
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillChipText: {
    fontSize: 11,
    color: AppColors.primary,
    fontWeight: "600",
  },
  vehicleIncluded: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: "500",
    marginLeft: 8,
  },
  noPackagesCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    borderStyle: "dashed",
  },
  noPackagesText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  vehicleCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  vehicleCardSpecs: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "500",
    marginBottom: 8,
  },
  vehicleCardPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10b981",
  },
  // Confirmation Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
    height: "100%",
  },
  confirmModalContent: {
    backgroundColor: AppColors.white,
    borderRadius: 24,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    position: "relative",
  },
  confirmModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.textPrimary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmModalBody: {
    maxHeight: 400,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  confirmInstructorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  confirmInstructorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  confirmInstructorDetails: {
    flex: 1,
  },
  confirmInstructorName: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 6,
  },
  confirmInstructorRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  confirmInstructorRatingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fbbf24",
  },
  confirmPackageSection: {
    marginBottom: 20,
  },
  confirmSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  confirmPackageCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  confirmPackageName: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  confirmPackageBadge: {
    marginBottom: 12,
  },
  confirmBadgeWithVehicle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 6,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  confirmBadgeInstructor: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 6,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  confirmBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  confirmPackageDetails: {
    gap: 8,
  },
  confirmDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confirmDetailText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  // Skills Styles
  confirmSkillsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
  confirmSkillsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textPrimary,
    marginBottom: 10,
  },
  confirmSkillsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  confirmSkillChip: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7dd3fc",
  },
  confirmSkillText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.primary,
  },
  // Vehicle Selection Styles
  confirmVehicleSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  confirmVehicleSubtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "500",
    marginBottom: 16,
  },
  confirmVehicleOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.borderLight,
    backgroundColor: AppColors.white,
    marginBottom: 12,
  },
  confirmVehicleOptionSelected: {
    borderColor: AppColors.primary,
    backgroundColor: "#dbeafe",
    borderWidth: 2.5,
  },
  confirmVehicleOptionImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  confirmNoVehicleIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#86efac",
  },
  confirmNoVehicleIconText: {
    fontSize: 32,
  },
  confirmVehicleOptionInfo: {
    flex: 1,
  },
  confirmVehicleOptionName: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  confirmVehicleOptionSpecs: {
    flexDirection: "row",
    alignItems: "center",
  },
  confirmVehicleOptionSpec: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  confirmVehicleOptionDot: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  confirmVehicleOptionPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.primary,
    marginTop: 6,
  },
  confirmVehicleRadioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: AppColors.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmVehicleRadioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: AppColors.primary,
  },
  confirmPriceSection: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  confirmPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  confirmPriceLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  confirmPriceValue: {
    fontSize: 14,
    color: AppColors.textPrimary,
    fontWeight: "600",
  },
  confirmDivider: {
    height: 1,
    backgroundColor: AppColors.borderLight,
    marginVertical: 12,
  },
  confirmTotalLabel: {
    fontSize: 16,
    color: AppColors.textPrimary,
    fontWeight: "700",
  },
  confirmTotalValue: {
    fontSize: 18,
    color: AppColors.primary,
    fontWeight: "800",
  },
  confirmModalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.white,
  },
  confirmCancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.textSecondary,
  },
  confirmPurchaseButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: AppColors.active,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmPurchaseButtonDisabled: {
    opacity: 0.7,
  },
  confirmPurchaseButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  // Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successModalContent: {
    backgroundColor: AppColors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 15,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  successInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
  successInfoLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  successInfoValue: {
    fontSize: 18,
    color: AppColors.primary,
    fontWeight: "800",
  },
  // Loading and Empty States
  loadingCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  // Package Description
  packageDescription: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 18,
  },
  confirmPackageDescription: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 18,
  },
  // Vehicle Spec
  vehicleSpec: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "500",
    marginTop: 4,
  },
});