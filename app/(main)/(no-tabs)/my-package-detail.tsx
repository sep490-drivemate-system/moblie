import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Modal,
  Pressable,
  Alert,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { IUserInfo, submitFeedback, IFeedbackRequest, cancelBooking } from "@/features/booking/bookingThunk";
import { ArrowLeft, Star, MessageSquare } from "lucide-react-native";
import SessionsList from "@/components/Session/Sessions";
import CancelPackageModal from "@/components/Package/CancelPackageModal";
import { userPackagesData } from "@/data/user_packages_data";
import { AppColors } from "@/constants/Colors";
import { PackageDetailData, usePackageDetailViewModel } from "@/viewmodels/booking/PackageDetailViewModel";
import { useAppDispatch } from "@/lib/redux/hooks";
import HeaderList from "@/components/Commons/HeaderList";
import { ROUTES } from "@/constants/routes";

export default function PackageDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const packageDetailViewModel = usePackageDetailViewModel();
  const dispatch = useAppDispatch();
  const [instructorInfo, setInstructorInfo] = useState<IUserInfo | null>(null);
  const [isLoadingInstructor, setIsLoadingInstructor] = useState(false);

  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [instructorRating, setInstructorRating] = useState(0);
  const [instructorFeedback, setInstructorFeedback] = useState("");
  const [carRating, setCarRating] = useState(0);
  const [carFeedback, setCarFeedback] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const packageData = useMemo(
    () => packageDetailViewModel.parsePackageData(params.packageData as string),
    [packageDetailViewModel, params.packageData]
  );

  const purchaseDateInfo = useMemo(
    () =>
      packageDetailViewModel.getPurchaseDateInfo(packageData?.purchaseDate),
    [packageDetailViewModel, packageData?.purchaseDate]
  );

  const carIdFromParams = params.carId as string || "";
  const carPriceFromParams = params.carPrice ? parseFloat(params.carPrice as string) : 0;


  useEffect(() => {
    const fetchInstructorInfo = async () => {
      const instructorId = packageData?.instructorId;
      if (!instructorId) return;

      try {
        setIsLoadingInstructor(true);
        const info = await packageDetailViewModel.fetchInstructorInfo(
          instructorId
        );
        setInstructorInfo(info);
      } catch (error) {
        setInstructorInfo(null);
      } finally {
        setIsLoadingInstructor(false);
      }
    };

    fetchInstructorInfo();
  }, [
    packageData?.instructorId,
    packageDetailViewModel,
  ]);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);
  const [localStatus, setLocalStatus] = useState<string>(packageData?.status || "paid");
  const [cancelDateStr, setCancelDateStr] = useState<string | null>(null);

  const handleBookNewSession = () => {

    const navigationConfig =
      packageDetailViewModel.getBookingNavigationConfig(packageData as PackageDetailData, {
        carIdFromParams,
        carPriceFromParams,
      });

    router.push(navigationConfig);
  };

  const handleOpenFeedback = () => {
    setInstructorRating(0);
    setInstructorFeedback("");
    setCarRating(0);
    setCarFeedback("");
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (!packageData) return;

    if (instructorRating === 0) {
      Alert.alert("Lỗi", "Vui lòng đánh giá người hướng dẫn");
      return;
    }

    if (!instructorFeedback.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập phản hồi cho người hướng dẫn");
      return;
    }

    const hasCar = false;
    const carId = hasCar ? null : null;

    try {
      setIsSubmittingFeedback(true);

      if (!packageData.instructorId) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin người hướng dẫn");
        return;
      }

      const feedbackData: IFeedbackRequest = {
        instructorRating,
        instructorFeedback: instructorFeedback.trim(),
        carRating: hasCar ? carRating : null,
        carFeedback: hasCar ? (carFeedback.trim() || null) : null,
        carId: carId,
        bookingId: packageData.id,
        instructorId: packageData.instructorId,
      };

      await dispatch(submitFeedback(feedbackData)).unwrap();

      Alert.alert("Thành công", "Cảm ơn bạn đã gửi phản hồi!", [
        {
          text: "OK",
          onPress: () => {
            setShowFeedbackModal(false);
            router.back();
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", error as string || "Không thể gửi phản hồi");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!packageData) return;

    setIsProcessingCancel(true);

    try {
      // Gọi API hủy gói
      const result = await dispatch(cancelBooking({ bookingId: packageData.id })).unwrap();
      if (!result) {
        Alert.alert("Lỗi", "Không thể hủy gói học");
        return;
      }

      // Tính toán thông tin hoàn tiền
      const info = computeRefund({
        status: localStatus,
        purchaseDate: packageData.purchaseDate,
        price: packageData.price,
        totalHours: packageData.totalHours,
        usedHours: packageData.usedHours,
      });

      setIsProcessingCancel(false);
      setShowCancelModal(false);

      // Hiển thị thông báo dựa trên kết quả tính toán hoàn tiền
      if (info.eligible) {
        Alert.alert(
          "Hủy gói thành công",
          `Số tiền hoàn: ${info.amount.toLocaleString("vi-VN")}₫\n${info.reason}`,
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(main)/(no-tabs)/my-packages");
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Hủy gói thành công",
          info.reason,
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(main)/(no-tabs)/my-packages");
              },
            },
          ]
        );
      }
    } catch (error) {
      setIsProcessingCancel(false);
      Alert.alert("Lỗi", error as string || "Không thể hủy gói học");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <HeaderList actionReturnScreen={ROUTES.MY_PACKAGES as any} title="Chi tiết gói" colors={[AppColors.primary, AppColors.gradientStart, AppColors.gradientEnd]} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {packageData && instructorInfo && (
          <View style={styles.instructorCard}>
            <View style={styles.instructorSection}>
              <Image
                source={{ uri: instructorInfo.avatarUrl || "https://via.placeholder.com/60" }}
                style={styles.instructorAvatar}
              />
              <View style={styles.instructorInfo}>
                <Text style={styles.instructorLabel}>Người hướng dẫn</Text>
                <Text style={styles.instructorName}>
                  {instructorInfo.fullName}
                </Text>
              </View>
            </View>
          </View>
        )}

        {packageData && (
          <View style={styles.packageCard}>
            {/* Package Name */}
            <Text style={styles.packageName}>{packageData.packageName}</Text>

            {/* Skills and Road Types */}
            {(packageData.drivingSkills && packageData.drivingSkills.length > 0 || packageData.roadTypes && packageData.roadTypes.length > 0) && (
              <View style={styles.skillsContainer}>
                {packageData.drivingSkills && packageData.drivingSkills.length > 0 && (
                  <View style={styles.skillCategory}>
                    <Text style={styles.categoryTitle}>Kỹ năng lái xe</Text>
                    <View style={styles.skillsTags}>
                      {packageData.drivingSkills.map((skill: string, index: number) => (
                        <View key={index} style={[styles.skillTag, styles.basicSkillTag]}>
                          <Text style={[styles.skillTagText, styles.basicSkillText]}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {packageData.roadTypes && packageData.roadTypes.length > 0 && (
                  <View style={styles.skillCategory}>
                    <Text style={styles.categoryTitle}>Loại đường</Text>
                    <View style={styles.skillsTags}>
                      {packageData.roadTypes.map((road: string, index: number) => (
                        <View key={index} style={[styles.skillTag, styles.roadTypeTag]}>
                          <Text style={[styles.skillTagText, styles.roadTypeText]}>{road}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Hours Info */}
            <View style={styles.hoursCard}>
              <View style={styles.hoursRow}>
                <View style={styles.hoursItem}>
                  <Text style={styles.hoursLabel}>Tổng giờ</Text>
                  <Text style={styles.hoursValue}>{packageData.totalHours}h</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.hoursItem}>
                  <Text style={styles.hoursLabel}>Đã dùng</Text>
                  <Text style={[styles.hoursValue, { color: "#64748b" }]}>
                    {packageData.usedHours}h
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.hoursItem}>
                  <Text style={styles.hoursLabel}>Còn lại</Text>
                  <Text
                    style={[
                      styles.hoursValue,
                      {
                        color:
                          packageData.remainingHours > 0
                            ? AppColors.primary
                            : "#ef4444",
                      },
                    ]}
                  >
                    {packageData.remainingHours}h
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(packageData.usedHours / packageData.totalHours) * 100
                          }%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(
                    (packageData.usedHours / packageData.totalHours) * 100
                  )}
                  % đã sử dụng
                </Text>
              </View>
            </View>

            {/* Package Dates */}
            <View style={styles.datesRow}>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Mua ngày:</Text>
                <Text style={styles.dateValue}>{purchaseDateInfo.date}</Text>
                {purchaseDateInfo.time ? (
                  <Text style={styles.dateTimeValue}>
                    lúc {purchaseDateInfo.time}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Feedback Button - Show when package is fully used */}
            {(packageData.remainingHours === 0 || packageData.usedHours >= packageData.totalHours) && (
              <TouchableOpacity
                style={styles.feedbackButton}
                onPress={handleOpenFeedback}
              >
                <MessageSquare size={20} color={AppColors.primary} strokeWidth={2} />
                <Text style={styles.feedbackButtonText}>Đánh giá</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.sessionsSection}>
          <Text style={styles.sectionTitle}>Lịch thuê đã đặt</Text>
          <SessionsList
            bookingId={packageData?.id}
            enableScroll={false}
            showHeader={false}
            emptyStateText="Bạn chưa có lịch thuê nào cho gói này."
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>


      {packageData?.remainingHours !== undefined && packageData.remainingHours > 0 && (
        <View style={styles.bottomContainer}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={[styles.bookButton, { flex: 1 }]}
              onPress={handleBookNewSession}
            >
              <View style={styles.bookButtonGradient}>
                <Text style={styles.bookButtonText}>Đặt buổi thuê mới</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, { flex: 1 }]}
              onPress={() => {
                setCancelDateStr(new Date().toISOString());
                setShowCancelModal(true);
              }}
            >
              <Text style={styles.cancelButtonText}>Hủy gói</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}




      {/* Cancel Modal */}
      <CancelPackageModal
        visible={showCancelModal}
        packageData={packageData}
        localStatus={localStatus}
        cancelDateStr={cancelDateStr}
        isProcessingCancel={isProcessingCancel}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        getStatusText={(status) => packageDetailViewModel.getStatusText(status)}
      />

      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          Keyboard.dismiss();
          setShowFeedbackModal(false);
        }}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.feedbackModalBackdrop}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={styles.feedbackModalContent}>
                <Text style={styles.feedbackModalTitle}>Đánh giá gói học</Text>

                {/* Instructor Rating */}
                <View style={styles.ratingSection}>
                  <Text style={styles.ratingLabel}>Đánh giá người hướng dẫn *</Text>
                  <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setInstructorRating(star)}
                        style={styles.starButton}
                      >
                        <Star
                          size={32}
                          color={star <= instructorRating ? "#fbbf24" : "#e2e8f0"}
                          fill={star <= instructorRating ? "#fbbf24" : "none"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.feedbackInput}
                    placeholder="Nhập phản hồi về người hướng dẫn *"
                    placeholderTextColor="#9ca3af"
                    value={instructorFeedback}
                    onChangeText={setInstructorFeedback}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                {/* Car Rating - Only show if package has car */}
                {packageData && (
                  <View style={styles.ratingSection}>
                    <Text style={styles.ratingLabel}>Đánh giá xe (nếu có)</Text>
                    <View style={styles.starContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                          key={star}
                          onPress={() => setCarRating(star)}
                          style={styles.starButton}
                        >
                          <Star
                            size={32}
                            color={star <= carRating ? "#fbbf24" : "#e2e8f0"}
                            fill={star <= carRating ? "#fbbf24" : "none"}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TextInput
                      style={styles.feedbackInput}
                      placeholder="Nhập phản hồi về xe (tùy chọn)"
                      placeholderTextColor="#9ca3af"
                      value={carFeedback}
                      onChangeText={setCarFeedback}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                )}

                {/* Modal Actions */}
                <View style={styles.feedbackModalActions}>
                  <TouchableOpacity
                    style={styles.feedbackModalCancelButton}
                    onPress={() => {
                      setShowFeedbackModal(false);
                    }}
                  >
                    <Text style={styles.feedbackModalCancelText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.feedbackModalSubmitButton,
                      isSubmittingFeedback && { opacity: 0.6 },
                    ]}
                    onPress={handleSubmitFeedback}
                    disabled={isSubmittingFeedback}
                  >
                    {isSubmittingFeedback ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.feedbackModalSubmitText}>Gửi đánh giá</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

function daysSince(dateStr: string): number {
  const start = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

function computeRefund(pkg: {
  status: string;
  purchaseDate: string;
  price?: number;
  totalHours: number;
  usedHours: number;
}): { eligible: boolean; amount: number; reason: string } {
  if (pkg.status !== "paid" && pkg.status !== "in_progress") {
    return {
      eligible: false,
      amount: 0,
      reason: "Gói không ở trạng thái đã thanh toán",
    };
  }
  const days = daysSince(pkg.purchaseDate);
  const price = typeof pkg.price === "number" ? pkg.price : 0;
  if (days >= 30) {
    return {
      eligible: false,
      amount: 0,
      reason: "Đã quá 30 ngày kể từ ngày mua",
    };
  }
  if (pkg.usedHours === 0) {
    return {
      eligible: true,
      amount: price,
      reason: "Hoàn 100% vì chưa sử dụng giờ nào",
    };
  }
  const unusedHours = Math.max(pkg.totalHours - pkg.usedHours, 0);
  const perHour = pkg.totalHours > 0 ? price / pkg.totalHours : 0;
  const refund = Math.max(Math.floor(perHour * unusedHours), 0);
  return {
    eligible: refund > 0,
    amount: refund,
    reason: "Hoàn theo số giờ chưa sử dụng (< 30 ngày)",
  };
}

//

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#1AD562",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: AppColors.white,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  instructorCard: {
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructorSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  instructorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e2e8f0",
    borderWidth: 2,
    borderColor: "#f1f5f9",
  },
  instructorInfo: {
    flex: 1,
  },
  instructorLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  packageCard: {
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  packageName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 20,
    lineHeight: 28,
  },
  skillsContainer: {
    marginBottom: 16,
  },
  skillsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  skillCategory: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
  },
  skillsTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  skillTagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  basicSkillTag: {
    backgroundColor: "#dbeafe",
    borderColor: "#3b82f6",
  },
  basicSkillText: {
    color: "#1d4ed8",
  },
  trafficSkillTag: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
  },
  trafficSkillText: {
    color: "#15803d",
  },
  parkingSkillTag: {
    backgroundColor: "#f3e8ff",
    borderColor: "#8b5cf6",
  },
  parkingSkillText: {
    color: "#7c3aed",
  },
  roadTypeTag: {
    backgroundColor: "#fed7aa",
    borderColor: "#f97316",
  },
  roadTypeText: {
    color: "#ea580c",
  },
  priceText: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.primary,
  },
  hoursCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  hoursItem: {
    alignItems: "center",
  },
  hoursLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  hoursValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
  },
  divider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: AppColors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
  },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  dateLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginRight: 8,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  dateTimeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  sessionsSection: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  filterBarContainer: {
    backgroundColor: AppColors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  filterBarScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: AppColors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    gap: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
  filterCount: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: "800",
    color: AppColors.white,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    marginRight: 8,
  },
  filterButtonSelected: {
    borderWidth: 1.5,
  },
  filterIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  sessionsList: {
    gap: 12,
  },
  sessionCard: {
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  sessionText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  sessionFooter: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  viewDetailButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewDetailText: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.primary,
  },
  emptyState: {
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: AppColors.white,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bookButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  bookButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    backgroundColor: "#1AD562",
  },
  bookButtonText: {
    fontWeight: "800",
    color: AppColors.white,
  },
  cancelButton: {
    borderRadius: 12,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  cancelButtonText: {
    fontWeight: "800",
    color: AppColors.white,
  },
  feedbackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: AppColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
    marginHorizontal: 20,
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.primary,
  },
  feedbackModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  feedbackModalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  feedbackModalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 24,
    textAlign: "center",
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    minHeight: 100,
    textAlignVertical: "top",
  },
  feedbackModalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  feedbackModalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  feedbackModalCancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },
  feedbackModalSubmitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackModalSubmitText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
});
