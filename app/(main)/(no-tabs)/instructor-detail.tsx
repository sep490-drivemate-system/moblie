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
import { instructorsData } from "@/data/instructors_data";
import { AppColors } from "@/constants/Colors";
import { IInstructor } from "@/models/instructor/instructor.type";
import { instructorVehicles } from "@/data/instructor_detail";
import { feedbackData } from "@/data/feedback_data";

export default function InstructorDetailScreen() {
  const router = useRouter();
  const { instructorId } = useLocalSearchParams();
  const [instructor, setInstructor] = useState<IInstructor | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null); // null = own car, string = vehicle id
  const [isProcessing, setIsProcessing] = useState(false);
  const fadeAnim = useState(new Animated.Value(1))[0]; // Start with 1 so modal is visible
  const scaleAnim = useState(new Animated.Value(1))[0]; // Start with 1 so modal is visible

  useEffect(() => {
    const foundInstructor = instructorsData.find((i) => i.id === instructorId);
    if (foundInstructor) {
      setInstructor(foundInstructor);
    }
  }, [instructorId]);

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

  const handleBuyPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setSelectedVehicle(null); // Reset vehicle selection
    setShowConfirmModal(true);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
  };

  const handleConfirmPurchase = async () => {
    if (!instructor || !selectedPackage) {
      return;
    }

    setIsProcessing(true);

    // Simulate payment process
    setTimeout(() => {
      // Payment successful - close modal first
      setIsProcessing(false);
      setShowConfirmModal(false);

      // Navigate to success page after a brief delay
      setTimeout(() => {
        router.push({
          pathname: "/(main)/(no-tabs)/transaction-success",
          params: {
            instructorId: instructor.id,
            packageId: selectedPackage.id,
            vehicleId: selectedVehicle || "",
          },
        });
      }, 300);
    }, 1500);
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
                <Text style={styles.heroName}>{instructor.name}</Text>
                <View style={styles.heroStatusRow}>
                  <Text style={styles.heroStatus}>{instructor.gender}</Text>
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
                <Text style={styles.quickStatText}>{instructor.rating}</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Award size={18} color="#fff" strokeWidth={2} />
                <Text style={styles.quickStatText}>
                  {instructor.experienceYears} năm
                </Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Users size={18} color="#fff" strokeWidth={2} />
                <Text style={styles.quickStatText}>
                  {instructor.totalBookings}+
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        {/* About & Specialties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.aboutText}>
            Giảng viên {instructor.name} có {instructor.experienceYears} năm
            kinh nghiệm trong lĩnh vực đào tạo lái xe. Với phong cách giảng dạy
            chuyên nghiệp và tận tâm, đã giúp hơn {instructor.totalBookings} học
            viên tự tin lái xe an toàn trên mọi địa hình.
          </Text>
        </View>
        {/* Packages Section */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>
            Gói thuê có sẵn ({instructor.packages?.length || 0})
          </Text>
          {instructor.packages?.map((pkg) => (
            <View key={pkg.id} style={[styles.priceCard]}>
              <View style={styles.priceCardHeader}>
                <View style={styles.priceCardInfo}>
                  <Text style={styles.priceCardTitle}>{pkg.name}</Text>
                  <View style={styles.packageTypeContainer}>
                    {pkg.hasVehicle || pkg.vehicle ? (
                      <View style={styles.packageTypeWithVehicle}>
                        <Text style={styles.packageTypeIcon}>
                          <Car />
                        </Text>
                        <Text style={styles.packageTypeText}>
                          Có xe và người hướng dẫn
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.packageTypeInstructor}>
                        <Text style={styles.packageTypeIcon}>
                          <User />
                        </Text>
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
                  <Text style={styles.packageDetailText}>
                    {pkg.duration} giờ
                  </Text>
                </View>

                <View style={styles.packageDetailRow}>
                  <MapPin size={16} color="#64748b" strokeWidth={2} />
                  <Text style={styles.packageDetailText}>
                    {pkg.roadTypes.join(", ")}
                  </Text>
                </View>

                <View style={styles.packageSkills}>
                  {pkg.skills.map((skill: string, idx: number) => (
                    <View key={idx} style={styles.skillChip}>
                      <Text style={styles.skillChipText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.priceCardBottom}>
                <Text style={styles.priceAmount}>{pkg.basePrice} vnd</Text>
              </View>
            </View>
          ))}
        </View>



        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Phương tiện ({instructorVehicles.length})
            </Text>
          </View>

          {instructorVehicles.map((vehicle, index) => (
            <View
              key={vehicle.id}
              style={[styles.vehicleCard, index > 0 && { marginTop: 12 }]}
            >
              <Image
                source={{ uri: vehicle.imageUrl }}
                style={styles.vehicleImage}
              />
              <View style={styles.vehicleOverlay}>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{vehicle.name}</Text>
                  <Text style={styles.vehiclePrice}>
                    {vehicle.price} vnd / giờ
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.vehicleDetailButton}
                  onPress={() =>
                    router.push({
                      pathname: "/car-detail",
                      params: { carId: vehicle.id },
                    })
                  }
                >
                  <Text style={styles.vehicleDetailButtonText}>Chi tiết</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá </Text>

          {/* Sample Reviews */}
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
        </View>

        {/* Spacing for bottom */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => setShowBookingModal(true)}
          activeOpacity={0.9}
        >
          <Text style={styles.bookButtonText}>Mua gói ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Booking Options Modal */}
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

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Package Options */}
              <View style={styles.packageOptions}>
                {instructor.packages && instructor.packages.length > 0 ? (
                  instructor.packages.map((pkg) => (
                    <TouchableOpacity
                      key={pkg.id}
                      style={[
                        styles.packageOption,
                        selectedPackage === pkg.id &&
                          styles.packageOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedPackage(pkg.id);
                        // Reset vehicle selection to null (default: own car)
                        setSelectedVehicle(null);
                      }}
                    >
                      <View style={styles.radioButton}>
                        {selectedPackage === pkg.id && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                      <View style={styles.packageInfo}>
                        <Text style={styles.packageTitle}>{pkg.name}</Text>

                        {/* Badge: Has Vehicle or Not */}
                        <View style={styles.packageBadgeContainer}>
                          {pkg.hasVehicle || pkg.vehicle ? (
                            <View style={styles.packageBadgeWithVehicle}>
                              <Text style={styles.packageBadgeIcon}>
                                <Car />
                              </Text>
                              <Text style={styles.packageBadgeText}>Có xe</Text>
                            </View>
                          ) : (
                            <View style={styles.packageBadgeInstructor}>
                              <Text style={styles.packageBadgeIcon}>
                                <User />
                              </Text>
                              <Text style={styles.packageBadgeText}>
                                Chỉ có người hướng dẫn
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Duration */}
                        <View style={styles.packageDetailRow}>
                          <Clock size={14} color="#64748b" strokeWidth={2} />
                          <Text style={styles.packageDetailText}>
                            {pkg.duration} giờ
                          </Text>
                        </View>

                        {/* Price */}
                        <Text style={styles.packagePrice}>
                          {pkg.basePrice.toLocaleString("vi-VN")} vnd
                        </Text>
                      </View>
                      <View style={styles.confirmDetailRow}>
                        <MapPin size={16} color="#64748b" />
                        <Text style={styles.confirmDetailText}>
                          {selectedPackage.roadTypes.join(", ")}
                        </Text>
                      </View>
                    </View>

                    {/* Skills */}
                    {selectedPackage.skills && selectedPackage.skills.length > 0 && (
                      <View style={styles.confirmSkillsContainer}>
                        <Text style={styles.confirmSkillsLabel}>Kỹ năng học được:</Text>
                        <View style={styles.confirmSkillsList}>
                          {selectedPackage.skills.map((skill: string, index: number) => (
                            <View key={index} style={styles.confirmSkillChip}>
                              <Text style={styles.confirmSkillText}>{skill}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>

              {/* Vehicle Selection (only show if selected package has vehicle) */}
              {selectedPackage &&
                instructor.packages?.find((p) => p.id === selectedPackage)
                  ?.hasVehicle && (
                  <View style={styles.vehicleSelection}>
                    <Text style={styles.vehicleSelectionTitleModal}>
                      🚗 Chọn xe (Tùy chọn)
                    </Text>
                    <Text style={styles.vehicleSelectionSubtitle}>
                      Bạn có thể chọn xe hoặc sử dụng xe riêng của mình
                    </Text>

                    {/* Option: No vehicle - Use own car */}
                    <TouchableOpacity
                      style={[
                        styles.vehicleOption,
                        selectedVehicle === null &&
                          styles.vehicleOptionSelected,
                      ]}
                      onPress={() => setSelectedVehicle(null)}
                    >
                      <View style={styles.noVehicleIcon}>
                        <Text style={styles.noVehicleIconText}>🚙</Text>
                      </View>
                      <View style={styles.vehicleOptionInfo}>
                        <Text style={styles.vehicleOptionName}>
                          Tôi có xe riêng
                        </Text>
                        <Text style={styles.vehicleOptionSpec}>
                          Không cần thuê xe từ giảng viên
                        </Text>
                      </View>
                      <View style={styles.vehicleRadioButton}>
                        {selectedVehicle === null && (
                          <View style={styles.vehicleRadioButtonInner} />
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Available vehicles from instructor */}
                    {instructorVehicles.map((vehicle) => (
                      <TouchableOpacity
                        key={vehicle.id}
                        style={[
                          styles.vehicleOption,
                          selectedVehicle === vehicle.id &&
                            styles.vehicleOptionSelected,
                        ]}
                        onPress={() => setSelectedVehicle(vehicle.id)}
                      >
                        <Image
                          source={{ uri: vehicle.imageUrl }}
                          style={styles.vehicleOptionImage}
                        />
                        <View style={styles.vehicleOptionInfo}>
                          <Text style={styles.vehicleOptionName}>
                            {vehicle.name}
                          </Text>
                          <View style={styles.vehicleOptionSpecs}>
                            <Text style={styles.vehicleOptionSpec}>
                              {vehicle.seats} chỗ
                            </Text>
                            <Text style={styles.vehicleOptionDot}> • </Text>
                            <Text style={styles.vehicleOptionSpec}>
                              {vehicle.fuel}
                            </Text>
                            <Text style={styles.vehicleOptionDot}> • </Text>
                            <Text style={styles.vehicleOptionSpec}>
                              {vehicle.type}
                            </Text>
                          </View>
                          <Text style={styles.vehicleOptionPrice}>
                            +{vehicle.price.toLocaleString("vi-VN")} vnd/giờ
                          </Text>
                        </View>
                        <View style={styles.vehicleRadioButton}>
                          {selectedVehicle === vehicle.id && (
                            <View style={styles.vehicleRadioButtonInner} />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
            </ScrollView>

            {/* Modal Actions */}
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
                onPress={() => {
                  if (!selectedPackage) return;

                  const selectedPkg = instructor.packages?.find(
                    (p) => p.id === selectedPackage
                  );
                  const packagePrice = selectedPkg?.basePrice || 0;

                  Alert.alert(
                    "Xác nhận mua gói",
                    `Bạn muốn mua gói "${
                      selectedPkg?.name
                    }" với giá ${packagePrice.toLocaleString("vi-VN")} vnd?`,
                    [
                      { text: "Hủy", style: "cancel" },
                      {
                        text: "Xác nhận",
                        onPress: () => {
                          // Simulate payment process
                          setTimeout(() => {
                            setShowBookingModal(false);
                            router.push({
                              pathname: "/(main)/(no-tabs)/transaction-success",
                              params: {
                                instructorId: instructor.id,
                                packageId: selectedPackage,
                              },
                            });
                          }, 800);
                        },
                      },
                    ]
                  );
                }}
                disabled={!selectedPackage}
              >
                <Text style={styles.continueButtonText}>Mua gói</Text>
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
});
