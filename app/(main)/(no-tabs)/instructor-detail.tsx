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
  Route,
  Clock,
  Car,
  User,
} from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { IInstructor, IInstructors, IInstructorPackages, IInstructorCar } from "@/models/instructor/instructor.type";
import { useAppDispatch } from "@/lib/redux/hooks";
import { getInstructorCars } from "@/features/instructor/instructorThunk";
import { Gender } from "@/models/user/gender.enum";
import { ConfirmPurchaseModal } from "@/components/Modal/ConfirmPurchaseModal";
import { BookingViewModel } from "@/viewmodels/booking/BookingViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { WalletViewModel } from "@/viewmodels/wallet/WalletViewModel";
import { ROUTES } from "@/constants/routes";
import { AlertVariant, AppAlert } from "@/components/Commons/AppAlert";
import { NoviceDriverViewModel } from "@/viewmodels/driver/NoviceDriverViewModel";
import { PackageViewModel } from "@/viewmodels/package/PackageViewModel";

// Helper function to convert gender number to text
const getGenderText = (gender: Gender): string => {
  return gender === Gender.Male ? "Nam" : "Nữ";
};

export default function InstructorDetailScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [, bookingVM] = useViewModel(BookingViewModel, (state) => state.booking);
  const { instructorData } = useLocalSearchParams();
  const [instructor, setInstructor] = useState<IInstructors | null>(null);
  const [packages, setPackages] = useState<IInstructorPackages[]>([]);
  const [cars, setCars] = useState<IInstructorCar[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<IInstructorPackages | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null); // null = own car, string = vehicle id
  const [isProcessing, setIsProcessing] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0]; // Start with 1 so modal is visible
  const [walletState] = useViewModel(WalletViewModel, (state) => state.wallet);
  const [showBalanceAlert, setShowBalanceAlert] = useState(false);
  const [, noviceDriverViewModel] = useViewModel(NoviceDriverViewModel, (state) => state.user);
  const [, packageViewModel] = useViewModel(PackageViewModel, (state) => state.package);

  const [showLicenseAlert, setShowLicenseAlert] = useState(false);
  const [licenseAlertMessage, setLicenseAlertMessage] = useState("");
  useEffect(() => {
    if (instructorData && typeof instructorData === 'string') {
      try {
        const parsedInstructor: IInstructors = JSON.parse(instructorData);
        setInstructor(parsedInstructor);

      } catch (error) {
        console.error('Failed to parse instructor data:', error);
      }
    }
  }, [instructorData]);

  useEffect(() => {
    if (instructor && instructor.id) {
      const fetchPackages = async () => {
        setIsLoadingPackages(true);
        const packages = await packageViewModel.getPackages(instructor.id);
        setPackages(packages);
        setIsLoadingPackages(false);
      };
      fetchPackages();

      const fetchCars = async () => {
        setIsLoadingCars(true);
        const carsResult = await dispatch(getInstructorCars({ id: instructor.id })).unwrap();
        const cars = (carsResult as any).value || carsResult;
        setCars(cars);
        setIsLoadingCars(false);
      };
      fetchCars();
    }
  }, [instructor, dispatch]);

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

  const handleBuyPackage = async (pkg: IInstructorPackages) => {
    if (pkg.price > walletState.balance) {
      setShowBalanceAlert(true);
      return;
    }

    const isLicenseValid = await noviceDriverViewModel.getLicenseValidity();
    if (!isLicenseValid) {
      setLicenseAlertMessage("Bạn chưa có giấy phép lái xe hoặc giấy phép lái xe đã hết hạn. Vui lòng đăng ký lái xe để tiếp tục.");
      setShowLicenseAlert(true);
      return;
    }

    setSelectedPackage(pkg);
    setSelectedVehicle(null);
    setShowConfirmModal(true);
    scaleAnim.setValue(0.9);
  };

  const handleConfirmPurchase = async () => {
    if (!instructor || !selectedPackage) {
      return;
    }

    // Nếu gói có thuê xe, kiểm tra hạng bằng lái so với hạng xe (qua ViewModel)
    if (selectedPackage.isRentalCar && selectedVehicle) {
      const selectedCar = cars.find((c) => String(c.id) === String(selectedVehicle));
      console.log('selectedCar', selectedCar);
      if (selectedCar) {
        const canDrive = await noviceDriverViewModel.canDriveVehicle(selectedCar.licenseTier);
        console.log('canDrive', canDrive);
        if (!canDrive) {
          // Đóng modal xác nhận trước khi hiển thị cảnh báo
          setShowConfirmModal(false);
          setLicenseAlertMessage("Bạn chưa có giấy phép lái xe đủ để lái xe này. Vui lòng đăng ký lái xe để tiếp tục.");
          setShowLicenseAlert(true);
          return;
        }
      } else {
        // Không tìm được xe tương ứng -> cũng hiển thị cảnh báo và đóng modal
        setShowConfirmModal(false);
        setLicenseAlertMessage("Bạn chưa có giấy phép lái xe đủ để lái xe này. Vui lòng đăng ký lái xe để tiếp tục.");
        setShowLicenseAlert(true);
        return;
      }
    }

    setIsProcessing(true);

    try {
      await bookingVM.handleConfirmPurchase({
        instructorId: instructor.id,
        selectedPackage,
        selectedVehicleId: selectedVehicle,
      });
      // Thanh toán thành công, đóng modal và reset trạng thái xử lý
      setShowConfirmModal(false);
    } catch (error) {
      console.error("Error while confirming purchase:", error);
    } finally {
      // Dù thành công hay thất bại thì cũng tắt trạng thái xử lý
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
              <AppAlert
                visible={showBalanceAlert}
                message="Số dư ví của bạn không đủ để mua gói này. Vui lòng nạp tiền để tiếp tục."
                variant={AlertVariant.Warning}
                primaryButton={{
                  label: "Nạp tiền",
                  onPress: () => router.push(ROUTES.MAIN_NO_TABS_DEPOSIT),
                }}
                onDismiss={() => setShowBalanceAlert(false)}
              />
              <AppAlert
                visible={showLicenseAlert}
                message={licenseAlertMessage}
                variant={AlertVariant.Warning}
                primaryButton={{
                  label: "Đăng ký lái xe",
                  onPress: () => router.push(ROUTES.HOME),
                }}
                onDismiss={() => setShowLicenseAlert(false)}
              />
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
              <Text style={styles.loadingText}>Đang tải gói thuê...</Text>
            </View>
          ) : packages.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Chưa có gói thuê nào</Text>
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
                    <Text style={styles.packageDetailText}>Thời lượng sử dụng: {pkg.duration} giờ</Text>
                  </View>

                  <View style={styles.packageRoadTypesContainer}>
                    <View style={styles.packageRoadTypesHeader}>
                      <Route size={16} color="#64748b" strokeWidth={2} />
                      <Text style={styles.packageRoadTypesLabel}>Loại đường:</Text>
                    </View>
                    <View style={styles.packageRoadTypes}>
                      {pkg.roadTypes.map((roadType: string, idx: number) => (
                        <View key={idx} style={styles.roadTypeChip}>
                          <Text style={styles.roadTypeChipText}>{roadType}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.packageSkillsContainer}>
                    <View style={styles.packageSkillsHeader}>
                      <Award size={16} color="#64748b" strokeWidth={2} />
                      <Text style={styles.packageSkillsLabel}>Kỹ năng lái xe:</Text>
                    </View>
                    <View style={styles.packageSkills}>
                      {pkg.drivingSkills.map((skill: string, idx: number) => (
                        <View key={idx} style={styles.skillChip}>
                          <Text style={styles.skillChipText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
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

      <ConfirmPurchaseModal
        visible={showConfirmModal}
        selectedPackage={selectedPackage}
        selectedVehicle={selectedVehicle}
        cars={cars}
        isProcessing={isProcessing}
        scaleAnim={scaleAnim}
        onClose={() => setShowConfirmModal(false)}
        onSelectVehicle={setSelectedVehicle}
        onConfirmPurchase={handleConfirmPurchase}
      />

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
  packageRoadTypesContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  packageRoadTypesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  packageRoadTypesLabel: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  packageRoadTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  roadTypeChip: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  roadTypeChipText: {
    fontSize: 11,
    color: "#92400e",
    fontWeight: "600",
  },
  packageSkillsContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  packageSkillsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  packageSkillsLabel: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  packageSkills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
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
  // Vehicle Spec
  vehicleSpec: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "500",
    marginTop: 4,
  },
});