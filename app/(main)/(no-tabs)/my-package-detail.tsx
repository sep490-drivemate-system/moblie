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
import { IUserInfo } from "@/features/booking/bookingThunk";
import { ArrowLeft } from "lucide-react-native";
import SessionsList from "@/components/Session/Sessions";
import { userPackagesData } from "@/data/user_packages_data";
import { AppColors } from "@/constants/Colors";
import { ROUTES } from "@/constants/routes";
import { PackageDetailData, usePackageDetailViewModel } from "@/viewmodels/booking/PackageDetailViewModel";

export default function PackageDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const packageDetailViewModel = usePackageDetailViewModel();
  const packageId = params.packageId as string;
  const [instructorInfo, setInstructorInfo] = useState<IUserInfo | null>(null);
  const [isLoadingInstructor, setIsLoadingInstructor] = useState(false);

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
        {/* Instructor Info Card */}
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
          </View>
        )}

        {/* Sessions Section */}
        <View style={styles.sessionsSection}>
          <Text style={styles.sectionTitle}>Lịch thuê đã đặt</Text>
          <SessionsList
            bookingId={packageData?.id || ""}
            enableScroll={false}
            showHeader={false}
            emptyStateText="Bạn chưa có buổi học nào cho gói này."
          />
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
                  Trạng thái: {packageDetailViewModel.getStatusText(localStatus)}
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
