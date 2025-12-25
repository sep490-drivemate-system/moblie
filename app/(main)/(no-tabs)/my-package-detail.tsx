import React, { useMemo, useState, useEffect, useCallback } from "react";
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
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { IUserInfo, submitFeedback, IFeedbackRequest, getBookingSessions } from "@/features/booking/bookingThunk";
import { Star, Calendar, Clock, MapPin, Car, ChevronRight, AlertCircle, CheckCircle, RefreshCw, PlayCircle, Navigation, X } from "lucide-react-native";
import { IBookingSession } from "@/models/booking/booking";
import { SessionStatus } from "@/models/session/session.enum";
import CancelPackageModal from "@/components/Modal/CancelPackageModal";
import { AppColors } from "@/constants/Colors";
import { PackageDetailData, usePackageDetailViewModel } from "@/viewmodels/booking/PackageDetailViewModel";
import { useAppDispatch } from "@/lib/redux/hooks";
import HeaderList from "@/components/Commons/HeaderList";
import { ROUTES } from "@/constants/routes";
import PackageDetailContent from "@/components/Package/PackageDetailContent";
import { clearSessionDetail } from "@/features/booking/bookingSlice";
import { CarViewModel } from "@/viewmodels/car/CarViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { ICarDetail } from "@/models/car/car";
import { BookingStatus } from "@/models/package/user-package";

export default function PackageDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const packageDetailViewModel = usePackageDetailViewModel();
  const dispatch = useAppDispatch();
  const [instructorInfo, setInstructorInfo] = useState<IUserInfo | null>(null);
  const [isLoadingInstructor, setIsLoadingInstructor] = useState(false);
  const [carInfo, setCarInfo] = useState<ICarDetail | null>(null);
  const [isLoadingCar, setIsLoadingCar] = useState(false);
  const [, carViewModel] = useViewModel(CarViewModel, (state) => state.car);


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
  const statusFromParams = params.status as unknown as BookingStatus;


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

  useEffect(() => {
    const fetchCarInfo = async () => {
      if (!carIdFromParams) {
        setCarInfo(null);
        return;
      }

      try {
        setIsLoadingCar(true);
        const car = await carViewModel.getCarById(carIdFromParams);
        setCarInfo(car);
      } catch (error) {
        console.log("Failed to fetch car info:", error);
        setCarInfo(null);
      } finally {
        setIsLoadingCar(false);
      }
    };

    fetchCarInfo();
  }, [carIdFromParams, carViewModel]);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [sessions, setSessions] = useState<IBookingSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"all" | "planning" | "upcoming" | "in_progress" | "completed" | "reschedule" | "cancelled">("all");

  // Normalize session status using enum (similar to rental screen)
  const parseSessionStatus = (status: SessionStatus | string | number | undefined): SessionStatus | undefined => {
    if (status === undefined || status === null) return undefined;
    if (typeof status === "number") return status as SessionStatus;
    const statusStr = String(status).toLowerCase();
    if (statusStr.includes("planning") || statusStr.includes("pending")) return SessionStatus.Planning;
    if (statusStr.includes("upcoming")) return SessionStatus.Upcoming;
    if (statusStr.includes("in_progress") || statusStr.includes("inprogress")) return SessionStatus.InProgress;
    if (statusStr.includes("completed")) return SessionStatus.Completed;
    if (statusStr.includes("reschedule")) return SessionStatus.Reschedule;
    if (statusStr.includes("cancelled") || statusStr.includes("canceled")) return SessionStatus.Cancelled;
    return undefined;
  };

  const getStatusColor = (status: SessionStatus | string | number) => {
    const parsed = parseSessionStatus(status);
    switch (parsed) {
      case SessionStatus.Planning:
        return "#3b82f6"; // blue
      case SessionStatus.Upcoming:
        return "#f59e0b"; // amber
      case SessionStatus.InProgress:
        return "#10b981"; // green
      case SessionStatus.Completed:
        return "#6b7280";
      case SessionStatus.Reschedule:
        return AppColors.blue;
      case SessionStatus.Cancelled:
        return "#9ca3af";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: SessionStatus | string | number) => {
    const parsed = parseSessionStatus(status);
    switch (parsed) {
      case SessionStatus.Planning:
        return "Lên lộ trình";
      case SessionStatus.Upcoming:
        return "Sắp diễn ra";
      case SessionStatus.InProgress:
        return "Đang diễn ra";
      case SessionStatus.Completed:
        return "Hoàn thành";
      case SessionStatus.Reschedule:
        return "Đổi lịch";
      case SessionStatus.Cancelled:
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const getStatusIcon = (status: SessionStatus | string | number) => {
    const parsed = parseSessionStatus(status);
    switch (parsed) {
      case SessionStatus.Planning:
        return Navigation;
      case SessionStatus.Upcoming:
        return Calendar;
      case SessionStatus.InProgress:
        return PlayCircle;
      case SessionStatus.Completed:
        return CheckCircle;
      case SessionStatus.Reschedule:
        return RefreshCw;
      case SessionStatus.Cancelled:
        return X;
      default:
        return AlertCircle;
    }
  };

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (!packageData?.id) return;

      try {
        setIsLoadingSessions(true);
        const result = await dispatch(getBookingSessions({ bookingId: packageData.id })).unwrap();
        const sessionsData = (result as any)?.value ?? result ?? [];
        setSessions(sessionsData);
      } catch (error) {
        console.log("Failed to fetch sessions:", error);
        setSessions([]);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [packageData?.id, dispatch]);

  // Refresh sessions list when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (packageData?.id) {
        const fetchSessions = async () => {
          try {
            const result = await dispatch(getBookingSessions({ bookingId: packageData.id })).unwrap();
            const sessionsData = (result as any)?.value ?? result ?? [];
            setSessions(sessionsData);
          } catch (error) {
            console.log("Failed to refresh sessions:", error);
          }
        };
        fetchSessions();
      }
    }, [packageData?.id, dispatch])
  );

  // Map status to filter key
  const mapStatusKey = (status: any): "planning" | "upcoming" | "in_progress" | "completed" | "reschedule" | "cancelled" => {
    const statusStr = String(status).toLowerCase();
    if (statusStr.includes("planning") || statusStr.includes("pending")) return "planning";
    if (statusStr.includes("upcoming")) return "upcoming";
    if (statusStr.includes("in_progress") || statusStr.includes("inprogress")) return "in_progress";
    if (statusStr.includes("completed")) return "completed";
    if (statusStr.includes("reschedule")) return "reschedule";
    if (statusStr.includes("cancelled") || statusStr.includes("canceled")) return "cancelled";
    return "planning";
  };

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: sessions.length,
      planning: 0,
      upcoming: 0,
      in_progress: 0,
      completed: 0,
      reschedule: 0,
      cancelled: 0,
    };
    sessions.forEach((session) => {
      const statusKey = mapStatusKey(session.status);
      if (counts[statusKey] !== undefined) {
        counts[statusKey] += 1;
      }
    });
    return counts;
  }, [sessions]);

  // Filter sessions by selected status
  const filteredSessions = useMemo(() => {
    if (selectedStatus === "all") return sessions;
    return sessions.filter((session) => mapStatusKey(session.status) === selectedStatus);
  }, [sessions, selectedStatus]);

  const STATUS_OPTIONS = [
    { key: "all" as const, label: "Tất cả" },
    { key: "planning" as const, label: "Lên lộ trình" },
    { key: "upcoming" as const, label: "Sắp diễn ra" },
    { key: "in_progress" as const, label: "Đang diễn ra" },
    { key: "completed" as const, label: "Đã hoàn thành" },
    { key: "reschedule" as const, label: "Đổi lịch" },
    { key: "cancelled" as const, label: "Đã hủy" },
  ];

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


  //   if (!packageData) return;

  //   setIsProcessingCancel(true);

  //   try {
  //     // Gọi API hủy gói
  //     const result = await dispatch(cancelBooking({ bookingId: packageData.id })).unwrap();
  //     if (!result) {
  //       Alert.alert("Lỗi", "Không thể hủy gói học");
  //       return;
  //     }

  //     // Tính toán thông tin hoàn tiền
  //     const info = computeRefund({
  //       status: localStatus,
  //       purchaseDate: packageData.purchaseDate,
  //       price: packageData.price,
  //       totalHours: packageData.totalHours,
  //       usedHours: packageData.usedHours,
  //     });

  //     setIsProcessingCancel(false);
  //     setShowCancelModal(false);

  //     // Hiển thị thông báo dựa trên kết quả tính toán hoàn tiền
  //     if (info.eligible) {
  //       Alert.alert(
  //         "Hủy gói thành công",
  //         `Số tiền hoàn: ${info.amount.toLocaleString("vi-VN")}₫\n${info.reason}`,
  //         [
  //           {
  //             text: "OK",
  //             onPress: () => {
  //               router.replace("/(main)/(no-tabs)/my-packages");
  //             },
  //           },
  //         ]
  //       );
  //     } else {
  //       Alert.alert(
  //         "Hủy gói thành công",
  //         info.reason,
  //         [
  //           {
  //             text: "OK",
  //             onPress: () => {
  //               router.replace("/(main)/(no-tabs)/my-packages");
  //             },
  //           },
  //         ]
  //       );
  //     }
  //   } catch (error) {
  //     setIsProcessingCancel(false);
  //     Alert.alert("Lỗi", error as string || "Không thể hủy gói học");
  //   }
  // };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <HeaderList onRightActionPress={() => dispatch(clearSessionDetail())} actionReturnScreen={ROUTES.MY_PACKAGES as any} title="Chi tiết gói" colors={[AppColors.primary, AppColors.gradientStart, AppColors.gradientEnd]} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <PackageDetailContent
          packageData={packageData}
          instructorInfo={instructorInfo}
          purchaseDateInfo={purchaseDateInfo}
          carInfo={carInfo}
          onOpenFeedback={handleOpenFeedback}
        />

        {/* Sessions Section */}
        <View style={styles.sessionsSection}>
          <Text style={styles.sectionTitle}>Lịch thuê đã đặt</Text>

          {/* Filter Bar */}
          {sessions.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterBar}
              contentContainerStyle={styles.filterBarContent}
            >
              {STATUS_OPTIONS.map((option) => {
                const isActive = selectedStatus === option.key;
                const baseColor =
                  option.key === "all"
                    ? "#cbd5f5"
                    : option.key === "planning"
                      ? "#3b82f6"
                      : option.key === "upcoming"
                        ? "#f59e0b"
                        : option.key === "in_progress"
                          ? AppColors.primary
                          : option.key === "completed"
                            ? "#94a3b8"
                            : option.key === "reschedule"
                              ? AppColors.blue
                              : AppColors.red;

                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.filterChip,
                      isActive && { backgroundColor: `${baseColor}22` },
                    ]}
                    onPress={() => setSelectedStatus(option.key)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isActive && { color: baseColor, fontWeight: "800" },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <View
                      style={[
                        styles.filterCount,
                        { backgroundColor: isActive ? baseColor : "#e2e8f0" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterCountText,
                          isActive && { color: "#fff" },
                        ]}
                      >
                        {statusCounts[option.key] ?? 0}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {isLoadingSessions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={AppColors.primary} />
              <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </View>
          ) : filteredSessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Chưa có lịch phù hợp</Text>
              <Text style={styles.emptySubtitle}>
                {sessions.length === 0
                  ? "Bạn chưa có lịch thuê nào cho gói này."
                  : "Không có lịch thuê nào phù hợp với bộ lọc đã chọn."}
              </Text>
            </View>
          ) : (
            <View style={styles.sessionsList}>
              {filteredSessions.map((session) => {
                const statusColor = getStatusColor(session.status);
                const statusLabel = getStatusText(session.status);
                const StatusIcon = getStatusIcon(session.status);

                return (
                  <View key={session.id} style={styles.sessionCard}>
                    <View style={styles.sessionHeaderRow}>
                      <View style={[styles.sessionRow, { marginBottom: 0, flex: 1 }]}>
                        <Calendar size={18} color="#64748b" strokeWidth={2} />
                        <Text style={[styles.sessionText, { flex: 0 }]}>
                          {new Date(session.date).toLocaleDateString("vi-VN")}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            borderColor: statusColor,
                            backgroundColor: `${statusColor}20`,
                          },
                        ]}
                      >
                        {StatusIcon && <StatusIcon size={16} color={statusColor} strokeWidth={2} />}
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {statusLabel}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.sessionRow}>
                      <Clock size={18} color="#64748b" strokeWidth={2} />
                      <Text style={styles.sessionText}>
                        {session.startTime} - {session.endTime} ({session.duration}h)
                      </Text>
                    </View>

                    {session.displayStartLocationName && (
                      <View style={styles.locationRow}>
                        <MapPin size={18} color="#22c55e" strokeWidth={2} />
                        <View style={styles.locationInfo}>
                          <Text style={styles.locationLabel}>Điểm đón</Text>
                          <Text style={styles.locationValue}>
                            {session.displayStartLocationName}
                          </Text>
                        </View>
                      </View>
                    )}

                    {session.displayEndLocationName && (
                      <View style={styles.locationRow}>
                        <MapPin size={18} color="#f97316" strokeWidth={2} />
                        <View style={styles.locationInfo}>
                          <Text style={styles.locationLabel}>Điểm trả</Text>
                          <Text style={styles.locationValue}>
                            {session.displayEndLocationName}
                          </Text>
                        </View>
                      </View>
                    )}

                    {session.vehicleName && (
                      <View style={styles.sessionRow}>
                        <Car size={18} color="#64748b" strokeWidth={2} />
                        <Text style={styles.sessionText}>{session.vehicleName}</Text>
                      </View>
                    )}

                    <View style={styles.sessionFooter}>
                      <TouchableOpacity
                        onPress={() => router.push({
                          pathname: ROUTES.DRIVING_SESSION_DETAIL,
                          params: { sessionId: session.id, instructorId: instructorInfo?.userId },
                        })}
                        style={styles.viewDetailButton}
                      >
                        <Text style={styles.viewDetailText}>Chi tiết</Text>
                        <ChevronRight size={16} color={AppColors.primary} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>


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
              setShowCancelModal(true);
            }}
          >
            <Text style={styles.cancelButtonText}>Hủy gói</Text>
          </TouchableOpacity>
        </View>
      </View>
      <CancelPackageModal
        visible={showCancelModal}
        packageData={packageData}
        onClose={() => setShowCancelModal(false)}
        onCancelled={() => {
          setShowCancelModal(false);
          router.replace(ROUTES.MY_PACKAGES);
        }}
        getStatusText={(status) => packageDetailViewModel.getStatusText(status)}
      />

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
                <Text style={styles.feedbackModalTitle}>Đánh giá gói thuê</Text>

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
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginBottom: 16,
    gap: 12,
  },
  skillCategory: {
    marginBottom: 8,
  },
  skillCategoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  skillCategoryLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
  },
  skillsTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7dd3fc",
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.primary,
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
  filterBar: {
    marginBottom: 16,
  },
  filterBarContent: {
    paddingHorizontal: 4,
    gap: 8,
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
  sessionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
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
    alignItems: "stretch",
  },
  viewDetailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: AppColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6,
    width: "100%",
  },
  viewDetailText: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.primary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
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
    minHeight: 50,
    width: "100%",
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
