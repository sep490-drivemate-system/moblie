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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppDispatch } from "@/lib/redux/hooks";
import { getBookingSessions } from "@/features/booking/bookingThunk";
import { IBookingSessionAPI, SessionStatus } from "@/models/booking/booking";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Calendar,
  Car,
  CheckCircle,
  XCircle,
  Package as PackageIcon,
  ChevronRight,
  AlertCircle,
} from "lucide-react-native";
import { userPackagesData } from "@/data/user_packages_data";
import { AppColors } from "@/constants/Colors";

type StatusFilter =
  | "all"
  | "planning"
  | "upcoming"
  | "cancelled"
  | "rescheduled"
  | "in_progress"
  | "completed";

export default function PackageDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const packageId = params.packageId as string;
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [apiSessions, setApiSessions] = useState<any[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  // Get package data from params (API data) or fallback to mock data
  const packageDataFromParams = params.packageData 
    ? JSON.parse(params.packageData as string) 
    : null;
  
  // Map API data format to UI format
  const packageData = packageDataFromParams ? {
    id: packageDataFromParams.id,
    instructorId: packageDataFromParams.instructorId,
    instructorName: packageDataFromParams.nameInstructor || "N/A",
    instructorAvatar: packageDataFromParams.avatarInstructor || "https://via.placeholder.com/60",
    packageName: packageDataFromParams.namePackake || "Gói học lái xe",
    totalHours: packageDataFromParams.duration || 0,
    usedHours: packageDataFromParams.durationInUse || 0,
    remainingHours: packageDataFromParams.remainingTime || 0,
    purchaseDate: packageDataFromParams.buyDate || new Date().toISOString(),
    price: packageDataFromParams.price || 0, // API may not have price
    status: packageDataFromParams.bookingStatus === 1 ? "paid" : "in_progress",
    carId: packageDataFromParams.carId,
    carPrice: packageDataFromParams.carPrice,
  } : null;
  
  
  // Extract params for booking
  const instructorIdFromParams = params.instructorId as string || packageData?.instructorId;
  const carIdFromParams = params.carId as string || "";
  const carPriceFromParams = params.carPrice ? parseFloat(params.carPrice as string) : 0;
  
  // Map API SessionStatus enum to string status for UI
  const mapApiStatusToString = (status: SessionStatus): string => {
    switch (status) {
      case SessionStatus.Pending:
        return "planing";
      case SessionStatus.Upcoming:
        return "upcoming";
      case SessionStatus.Completed:
        return "completed";
      case SessionStatus.Cancelled:
        return "cancelled";
      case SessionStatus.Rescheduled:
        return "reschedule";
      default:
        return "planing";
    }
  };
  
  // Fetch sessions from API and merge with mock data
  useEffect(() => {
    const fetchApiSessions = async () => {
      if (!packageId) return;
      
      try {
        setIsLoadingApi(true);
        const result = await dispatch(
          getBookingSessions({ bookingId: packageId })
        ).unwrap();
        
        const sessionsData = result.value || [];
        
        // Map API sessions to mock data format
        const mappedSessions = sessionsData.map((apiSession: IBookingSessionAPI) => ({
          id: apiSession.id,
          date: apiSession.date,
          startTime: apiSession.startTime,
          endTime: apiSession.endTime,
          duration: apiSession.duration,
          location: apiSession.location,
          vehicleName: apiSession.vehicleName,
          status: mapApiStatusToString(apiSession.status), // Convert enum to string
         // instructorName: apiSession.instructorName,
        }));
        
        setApiSessions(mappedSessions);
        console.log("Loaded API sessions:", mappedSessions.length);
      } catch (error) {
        console.error("Failed to fetch API sessions:", error);
        setApiSessions([]);
      } finally {
        setIsLoadingApi(false);
      }
    };
    
    fetchApiSessions();
  }, [packageId]);

  // Allow API-only mode - show loading or API data even without mock packageData
  // if (!packageData) {
  //   return (
  //     <View style={styles.container}>
  //       <Text>Package not found</Text>
  //     </View>
  //   );
  // }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "planing":
        return <Calendar size={16} color={AppColors.yellow} strokeWidth={2} />;
      case "upcoming":
        return <Clock size={16} color={AppColors.yellow} strokeWidth={2} />;
      case "in_progress":
        return <Clock size={16} color={AppColors.primary} strokeWidth={2} />;
      case "completed":
        return <CheckCircle size={16} color={AppColors.gray} strokeWidth={2} />;
      case "reschedule":
        return <Clock size={16} color={AppColors.blue} strokeWidth={2} />;
      case "cancelled":
        return <XCircle size={16} color={AppColors.red} strokeWidth={2} />;
      default:
        return <AlertCircle size={16} color="#64748b" strokeWidth={2} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planing":
        return AppColors.yellow;
      case "upcoming":
        return AppColors.yellow;
      case "in_progress":
        return AppColors.primary;
      case "completed":
        return AppColors.gray;
      case "reschedule":
        return AppColors.blue;
      case "cancelled":
        return AppColors.red;
      default:
        return AppColors.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "planing":
        return "Lên lộ trình";
      case "upcoming":
        return "Sắp diễn ra";
      case "in_progress":
        return "Đang diễn ra";
      case "completed":
        return "Đã hoàn thành";
      case "reschedule":
        return "Đổi lịch";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const [selectedSessionStatus, setSelectedSessionStatus] =
    useState<string>("all");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);
  const [localStatus, setLocalStatus] = useState<string>(packageData?.status || "paid");
  const [cancelDateStr, setCancelDateStr] = useState<string | null>(null);

  const sessionStatusOptions = useMemo(
    () => [
      { key: "all", label: "Tất cả" },
      { key: "planing", label: "Lên lộ trình" },
      { key: "upcoming", label: "Sắp diễn ra" },
      { key: "in_progress", label: "Đang diễn ra" },
      { key: "completed", label: "Đã hoàn thành" },
      { key: "reschedule", label: "Đổi lịch" },
      { key: "cancelled", label: "Đã hủy" },
    ],
    []
  );

  const sessionStatusCounts = useMemo(() => {
    // Use API sessions if available, otherwise use mock data sessions
    const mockSessions = (packageData as any)?.sessions || [];
    const sessions = apiSessions.length > 0 ? apiSessions : mockSessions;
    
    const counts: Record<string, number> = {
      all: sessions.length,
      planing: 0,
      upcoming: 0,
      in_progress: 0,
      completed: 0,
      reschedule: 0,
      cancelled: 0,
    };
    
    sessions.forEach((s: any) => {
      if (counts[s.status] !== undefined) counts[s.status] += 1;
    });
    
    return counts;
  }, [apiSessions, packageData]);

  const filteredSessions = useMemo(() => {
    // Use API sessions if available, otherwise use mock data sessions
    const mockSessions = (packageData as any)?.sessions || [];
    const sessions = apiSessions.length > 0 ? apiSessions : mockSessions;
    
    if (selectedSessionStatus === "all") return sessions;
    return sessions.filter((s: any) => s.status === selectedSessionStatus);
  }, [apiSessions, packageData, selectedSessionStatus]);

  const handleBookNewSession = () => {
    if (!packageData) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin gói");
      return;
    }

    // Use carId from params if available, otherwise try to get from sessions
    let vehicleId = carIdFromParams;
    if (!vehicleId) {
      const mockSessions = (packageData as any)?.sessions || [];
      const sessions = apiSessions.length > 0 ? apiSessions : mockSessions;
      const latestSession = sessions?.find((s: any) => s.vehicleId);
      vehicleId = latestSession?.vehicleId || "";
    }

    console.log("Booking params:", {
      instructorId: instructorIdFromParams,
      packageId: packageId,
      vehicleId: vehicleId,
      carPrice: carPriceFromParams,
      remainingHours: packageData.remainingHours,
    });

    router.push({
      pathname: "/(main)/(no-tabs)/booking",
      params: {
        instructorId: instructorIdFromParams,
        packageId: packageId,
        vehicleId: vehicleId,
        carPrice: carPriceFromParams.toString(),
        fromUserPackage: "true",
        userPackageId: packageData.id || packageId,
        remainingHours: packageData.remainingHours.toString(), // Add remaining hours for validation
      },
    });
  };

  const handleViewSessionDetail = (sessionId: string) => {
    router.push({
      pathname: "/(main)/(no-tabs)/my-driving-session-detail",
      params: { sessionId },
    });
  };

  const handleConfirmCancel = () => {
    if (!packageData) return;
    setIsProcessingCancel(true);
    const info = computeRefund({
      status: localStatus,
      purchaseDate: packageData.purchaseDate,
      price: packageData.price,
      totalHours: packageData.totalHours,
      usedHours: packageData.usedHours,
    });
    const days = daysSince(packageData.purchaseDate);
    const canRefundPaidUnder30 = localStatus === "paid" && days < 30;
    const canRefundInProgressUnder30 =
      localStatus === "in_progress" &&
      days < 30 &&
      packageData.usedHours < packageData.totalHours;
    const cancelNoRefundPaidOver30 = localStatus === "paid" && days >= 30;
    setTimeout(() => {
      setIsProcessingCancel(false);
      setShowCancelModal(false);
      if (canRefundPaidUnder30 || canRefundInProgressUnder30) {
        const refundAmount = Math.max(info.amount, 0);
        setLocalStatus("refunded");
        Alert.alert(
          "Hủy gói thành công",
          `Số tiền hoàn: ${refundAmount.toLocaleString("vi-VN")}₫`,
          [
            {
              text: "OK",
              onPress: () => {
                const idx = userPackagesData.findIndex(
                  (p) => p.id === packageData.id
                );
                if (idx >= 0) userPackagesData.splice(idx, 1);
                router.replace("/(main)/(no-tabs)/my-packages");
              },
            },
          ]
        );
        return;
      }
      if (cancelNoRefundPaidOver30) {
        setLocalStatus("not_refund");
        Alert.alert(
          "Hủy gói thành công",
          "Không có hoàn tiền theo chính sách.",
          [
            {
              text: "OK",
              onPress: () => {
                const idx = userPackagesData.findIndex(
                  (p) => p.id === packageData.id
                );
                if (idx >= 0) userPackagesData.splice(idx, 1);
                router.replace("/(main)/(no-tabs)/my-packages");
              },
            },
          ]
        );
        return;
      }
      setLocalStatus("not_refund");
      Alert.alert(
        "Hủy gói không thành công",
        "Không đủ điều kiện hoàn tiền theo chính sách."
      );
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={AppColors.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết gói</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Package Info Card - Only show if mock data exists */}
        {packageData && (
        <View style={styles.packageCard}>
          <View style={styles.instructorSection}>
            {/* <Image
              source={{ uri: packageData.instructorAvatar }}
              style={styles.instructorAvatar}
            /> */}
            <View style={styles.instructorInfo}>
              {/* <Text style={styles.instructorName}>
                {packageData.instructorName}
              </Text> */}
              <Text style={styles.packageName}>{packageData.packageName}</Text>

              {/* <View style={styles.skillsContainer}>
                <Text style={styles.skillsTitle}>Kỹ năng & Loại đường</Text>
                
                <View style={styles.skillCategory}>
                  <Text style={styles.categoryTitle}>🚗 Kỹ năng cơ bản</Text>
                  <View style={styles.skillsTags}>
                    {[
                      "Điều khiển cơ bản",
                      "Khởi động xe",
                      "Phanh an toàn",
                      "Chuyển số",
                      "Quan sát gương",
                    ].map((skill, index) => (
                      <View key={index} style={[styles.skillTag, styles.basicSkillTag]}>
                        <Text style={[styles.skillTagText, styles.basicSkillText]}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.skillCategory}>
                  <Text style={styles.categoryTitle}>🛣️ Loại đường</Text>
                  <View style={styles.skillsTags}>
                    {[
                      "Đường phố",
                      "Đường cao tốc",
                      "Đường quốc lộ",
                      "Đường dốc",
                      "Đường cong",
                      "Đường hẹp",
                      "Đường đông xe",
                      "Đường ban đêm",
                    ].map((road, index) => (
                      <View key={index} style={[styles.skillTag, styles.roadTypeTag]}>
                        <Text style={[styles.skillTagText, styles.roadTypeText]}>{road}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View> */}


            </View>
          </View>

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
                      width: `${
                        (packageData.usedHours / packageData.totalHours) * 100
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
            <View>
              <Text style={styles.dateLabel}>Ngày mua</Text>
              <Text style={styles.dateValue}>
                {new Date(packageData.purchaseDate).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          </View>
        </View>
        )}

        {/* Sessions Section */}
        <View style={styles.sessionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Lịch thuê đã đặt ({filteredSessions.length})
            </Text>
          </View>

          {/* Filter Bar for Sessions */}
          <View style={styles.filterBarContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterBarScroll}
            >
              {sessionStatusOptions.map((opt) => {
                const isActive = selectedSessionStatus === opt.key;
                const color =
                  opt.key === "all"
                    ? AppColors.gray
                    : getStatusColor(opt.key as string);
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setSelectedSessionStatus(opt.key)}
                    activeOpacity={0.8}
                    style={[
                      styles.filterChip,
                      isActive && {
                        backgroundColor: color + "15",
                        borderColor: color,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: isActive ? color : "#475569" },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <View
                      style={[
                        styles.filterCount,
                        { backgroundColor: isActive ? color : "#e2e8f0" },
                      ]}
                    >
                      <Text style={styles.filterCountText}>
                        {sessionStatusCounts[opt.key] ?? 0}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {filteredSessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#cbd5e1" strokeWidth={1.5} />
              <Text style={styles.emptyText}>Chưa có buổi học nào</Text>
              <Text style={styles.emptySubtext}>
                Đặt lịch học đầu tiên của bạn
              </Text>
            </View>
          ) : (
            <View style={styles.sessionsList}>
              {filteredSessions.map((session: any) => (
                <View key={session.id} style={styles.sessionCard}>
                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColor(session.status) + "20",
                        borderColor: getStatusColor(session.status),
                      },
                    ]}
                  >
                    {getStatusIcon(session.status)}
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(session.status) },
                      ]}
                    >
                      {getStatusText(session.status)}
                    </Text>
                  </View>

                  {/* Date & Time */}
                  <View style={styles.sessionRow}>
                    <Calendar size={18} color="#64748b" strokeWidth={2} />
                    <Text style={styles.sessionText}>
                      {new Date(session.date).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>

                  <View style={styles.sessionRow}>
                    <Clock size={18} color="#64748b" strokeWidth={2} />
                    <Text style={styles.sessionText}>
                      {session.startTime} - {session.endTime} (
                      {session.duration}h)
                    </Text>
                  </View>

                  {/* Location */}
                  {/* <View style={styles.sessionRow}>
                    <MapPin size={18} color="#64748b" strokeWidth={2} />
                    <Text style={styles.sessionText} numberOfLines={1}>
                      {session.location}
                    </Text>
                  </View> */}

                  {/* Vehicle */}
                  {session.vehicleName && (
                    <View style={styles.sessionRow}>
                      <Car size={18} color="#64748b" strokeWidth={2} />
                      <Text style={styles.sessionText}>
                        {session.vehicleName}
                      </Text>
                    </View>
                  )}

                  {/* Footer Actions */}
                  <View style={styles.sessionFooter}>
                    <TouchableOpacity
                      onPress={() => handleViewSessionDetail(session.id)}
                      style={styles.viewDetailButton}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.viewDetailText}>Xem chi tiết</Text>
                      <ChevronRight
                        size={18}
                        color={AppColors.primary}
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
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
                setCancelDateStr(new Date().toISOString());
                setShowCancelModal(true);
              }}
            >
              <Text style={styles.cancelButtonText}>Hủy gói</Text>
            </TouchableOpacity>
          </View>
        </View>
      

      {/* Cancel Modal */}
      {packageData && (
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isProcessingCancel && setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Xác nhận hủy gói</Text>
            <View style={{ gap: 8 }}>
              <Text style={styles.modalText}>
                Gói: {packageData.packageName}
              </Text>
              {typeof packageData.price === "number" && (
                <Text style={styles.modalText}>
                  Giá gói: {packageData.price.toLocaleString("vi-VN")}VNĐ
                </Text>
              )}
              <Text style={styles.modalText}>
                Trạng thái: {getStatusText(localStatus)}
              </Text>
              <Text style={styles.modalText}>
                Ngày mua:{" "}
                {new Date(packageData.purchaseDate).toLocaleDateString(
                  "vi-VN",
                  { day: "2-digit", month: "2-digit", year: "numeric" }
                )}
              </Text>
              {cancelDateStr && (
                <Text style={styles.modalText}>
                  Ngày hủy:{" "}
                  {new Date(cancelDateStr).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </Text>
              )}
              {renderRefundInfo({ ...packageData, status: localStatus })}
              <View style={styles.modalNoteBox}>
                <Text style={styles.modalNoteTitle}>
                  Lưu ý chính sách hoàn tiền
                </Text>
                <Text style={styles.modalSubText}>
                  - Nếu gói ở trạng thái đã thanh toán hoặc đang sử dụng và được
                  mua dưới 30 ngày: hoàn 100% nếu chưa dùng giờ nào.
                </Text>
                <Text style={styles.modalSubText}>
                  - Nếu gói ở trạng thái đã thanh toán hoặc đang sử dụng và được
                  mua dưới 30 ngày, đã dùng một phần: số tiền hoàn = (giá gói /
                  tổng giờ) × (tổng giờ - giờ đã dùng).
                </Text>
                <Text style={styles.modalSubText}>
                  - Nếu đã từ 30 ngày trở lên kể từ ngày mua: không hoàn tiền.
                </Text>
              </View>
            </View>
            <View style={styles.modalActions}>
              <Pressable
                disabled={isProcessingCancel}
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalCancelText}>Đóng</Text>
              </Pressable>
              <Pressable
                disabled={isProcessingCancel}
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={() => handleConfirmCancel()}
              >
                <Text style={styles.modalConfirmText}>
                  {isProcessingCancel ? "Đang xử lý..." : "Xác nhận hủy"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      )}
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

function renderRefundInfo(pkg: any) {
  const info = computeRefund(pkg);
  if (!info.eligible) {
    return (
      <Text style={[styles.modalText, { fontWeight: "700", color: "#ef4444" }]}>
        Không đủ điều kiện hoàn tiền ({info.reason})
      </Text>
    );
  }
  return (
    <View style={{ gap: 4 }}>
      <Text
        style={[
          styles.modalText,
          { fontWeight: "800", color: AppColors.primary },
        ]}
      >
        Số tiền dự kiến hoàn: {info.amount.toLocaleString("vi-VN")}₫
      </Text>
      <Text style={styles.modalSubText}>{info.reason}</Text>
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
  packageCard: {
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructorSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  instructorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e2e8f0",
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 4,
  },
  packageName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 12,
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
  dateLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  dateValue: {
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
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: "800",
    color: AppColors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 20,
    width: "100%",
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  modalText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  modalSubText: {
    fontSize: 12,
    color: "#6b7280",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalCancel: {
    backgroundColor: "#e5e7eb",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  modalConfirm: {
    backgroundColor: AppColors.primary,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: "800",
    color: AppColors.white,
  },
  modalNoteBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 4,
  },
  modalNoteTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
});
