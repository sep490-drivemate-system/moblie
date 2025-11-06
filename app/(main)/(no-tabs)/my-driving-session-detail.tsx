import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Clock, MapPin, Car, ArrowLeft } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { userPackagesData } from "@/data/user_packages_data";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useMemo, useState } from "react";

export default function MyDrivingSessionDetailScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams();

  const allSessions = userPackagesData.flatMap((p) => p.sessions || []);
  const session = allSessions.find((s) => s.id === sessionId);

  type RoutePoint = {
    id: string;
    address: string;
    coordinates: { latitude: number; longitude: number };
    isStart?: boolean;
    isEnd?: boolean;
  };

  type Route = {
    id: string;
    bookingId: string;
    points: RoutePoint[];
    status: "draft" | "sent" | "accepted" | "rejected";
    notes?: string;
    createdAt: string;
  };

  const proposedRoute: Route | null = useMemo(() => {
    if (!session) return null;
    // Mock a simple circular route in HCMC (pickup == dropoff)
    const start: RoutePoint = {
      id: "p1",
      address: session.location || "123 Nguyễn Huệ, Quận 1, TP.HCM",
      coordinates: { latitude: 10.776889, longitude: 106.700806 },
      isStart: true,
    };
    const mid1: RoutePoint = {
      id: "p2",
      address: "30 Cống Quỳnh, Quận 1, TP.HCM",
      coordinates: { latitude: 10.769722, longitude: 106.685 },
    };
    const mid2: RoutePoint = {
      id: "p3",
      address: "11 Sư Vạn Hạnh, Quận 10, TP.HCM",
      coordinates: { latitude: 10.772, longitude: 106.6662 },
    };
    const end: RoutePoint = {
      id: "p4",
      address: start.address,
      coordinates: start.coordinates,
      isEnd: true,
    };
    return {
      id: `route_${session.id}`,
      bookingId: session.id,
      points: [start, mid1, mid2, end],
      status: "sent",
      notes: "Lộ trình luyện tập kỹ năng cơ bản trong nội thành",
      createdAt: new Date().toISOString(),
    };
  }, [session]);

  const [routeDecision, setRouteDecision] = useState<
    "accepted" | "rejected" | null
  >(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedRescheduleReasons, setSelectedRescheduleReasons] = useState<
    string[]
  >([]);

  const cancellationReasons = [
    "Tôi muốn hủy lịch do bận đột xuất",
    "Tôi muốn hủy lịch do thời tiết bất lợi",
    "Không có lý do nào phù hợp",
  ];

  const parseSessionStartDate = () => {
    if (!displaySession) return null;
    // session.date is assumed ISO/date-like; startTime like "HH:mm"
    const datePart = new Date(displaySession.date);
    const [hh, mm] = String(displaySession.startTime || "00:00").split(":");
    const start = new Date(datePart);
    start.setHours(Number(hh), Number(mm || 0), 0, 0);
    return start;
  };

  const canCancelNow = () => {
    const start = parseSessionStartDate();
    if (!start) return false;
    const now = new Date();
    const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours >= 12;
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const toggleRescheduleReason = (reason: string) => {
    setSelectedRescheduleReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  // Allow override via route params after reschedule
  const params = useLocalSearchParams();
  const overrideDate = (params.overrideDate as string) || undefined;
  const overrideStartTime = (params.overrideStartTime as string) || undefined;
  const overrideEndTime = (params.overrideEndTime as string) || undefined;
  const overrideLocation = (params.overrideLocation as string) || undefined;
  const overrideInstructor = (params.overrideInstructor as string) || undefined;
  const overrideDuration = params.overrideDuration
    ? Number(params.overrideDuration)
    : undefined;

  const displaySession = session
    ? {
        ...session,
        date: overrideDate || (session as any).date,
        startTime: overrideStartTime || (session as any).startTime,
        endTime: overrideEndTime || (session as any).endTime,
        location: overrideLocation || (session as any).location,
        instructorName: overrideInstructor || (session as any).instructorName,
        duration: overrideDuration || (session as any).duration,
      }
    : null;

  const getSessionStatusMeta = (status?: string) => {
    switch (status) {
      case "upcoming":
        return { label: "Sắp diễn ra", color: AppColors.yellow, bg: "#fef9c3" };
      case "in_progress":
        return {
          label: "Đang diễn ra",
          color: AppColors.primary,
          bg: "#dcfce7",
        };
      case "completed":
        return { label: "Hoàn thành", color: AppColors.gray, bg: "#e5e7eb" };
      case "cancelled":
        return { label: "Đã hủy", color: AppColors.red, bg: "#fee2e2" };
      case "reschedule":
        return { label: "Dời lịch", color: AppColors.blue, bg: "#dbeafe" };
      case "route_planning":
      case "planing":
        return {
          label: "Đang lên lộ trình",
          color: AppColors.yellow,
          bg: "#fef9c3",
        };
      default:
        return {
          label: "Không xác định",
          color: AppColors.gray,
          bg: "#e5e7eb",
        };
    }
  };

  if (!displaySession) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={AppColors.white} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết buổi tập lái</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Không tìm thấy buổi tập lái</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={AppColors.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết buổi tập lái</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin buổi tập lái</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Người hướng dẫn</Text>
            <Text style={styles.value}>{displaySession.instructorName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.iconRow}>
            <Calendar size={18} color="#64748b" strokeWidth={2} />
            <Text style={styles.iconText}>
              {new Date(displaySession.date).toLocaleDateString("vi-VN")}
            </Text>
          </View>

          <View style={styles.iconRow}>
            <Clock size={18} color="#64748b" strokeWidth={2} />
            <Text style={styles.iconText}>
              {displaySession.startTime} - {displaySession.endTime} (
              {displaySession.duration}h)
            </Text>
          </View>

          {/* Status */}
          <View style={styles.row}>
            <Text style={styles.label}>Trạng thái</Text>
            {(() => {
              const meta = getSessionStatusMeta((session as any).status);
              return (
                <View
                  style={[styles.statusBadge, { backgroundColor: meta.bg }]}
                >
                  <Text style={[styles.statusText, { color: meta.color }]}>
                    {meta.label}
                  </Text>
                </View>
              );
            })()}
          </View>

          <View style={styles.iconRow}>
            <MapPin size={18} color="#64748b" strokeWidth={2} />
            <Text style={styles.iconText} numberOfLines={2}>
              {displaySession.location}
            </Text>
          </View>

          {displaySession.vehicleName ? (
            <View style={styles.iconRow}>
              <Car size={18} color="#64748b" strokeWidth={2} />
              <Text style={styles.iconText}>{displaySession.vehicleName}</Text>
            </View>
          ) : null}

          {/* Session actions: Cancel and Reschedule (inside info card) */}
          <View style={styles.sessionActions}>
            <TouchableOpacity
              style={styles.cancelLessonButton}
              onPress={() => setShowCancelModal(true)}
            >
              <Text style={styles.cancelLessonButtonText}>
                Hủy buổi tập lái
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rescheduleLessonButton}
              onPress={() => {
                setSelectedRescheduleReasons([]);
                setShowRescheduleModal(true);
              }}
            >
              <Text style={styles.rescheduleLessonButtonText}>
                Dời lịch buổi tập lái
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {proposedRoute && (
          <View style={styles.routeCard}>
            <Text style={styles.sectionTitle}>Lộ trình đề xuất</Text>

            {/* Route status / decision */}
            {routeDecision && (
              <View
                style={[
                  styles.decisionBadge,
                  {
                    backgroundColor:
                      routeDecision === "accepted" ? "#dcfce7" : "#fee2e2",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.decisionText,
                    {
                      color:
                        routeDecision === "accepted" ? "#16a34a" : "#dc2626",
                    },
                  ]}
                >
                  {routeDecision === "accepted"
                    ? "Bạn đã đồng ý lộ trình"
                    : "Bạn đã từ chối lộ trình"}
                </Text>
              </View>
            )}

            {/* Points list */}
            <View style={styles.pointsList}>
              {proposedRoute.points.map((pt, index) => (
                <View key={pt.id} style={styles.pointRow}>
                  <MapPin
                    size={20}
                    color={
                      pt.isStart || pt.isEnd
                        ? AppColors.primary
                        : AppColors.blue
                    }
                    strokeWidth={2}
                  />
                  <Text style={styles.pointAddress} numberOfLines={2}>
                    {pt.address}
                  </Text>
                </View>
              ))}
            </View>

            {/* Map */}
            <Text style={styles.mapTitle}>Bản đồ lộ trình</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: proposedRoute.points[0].coordinates.latitude,
                  longitude: proposedRoute.points[0].coordinates.longitude,
                  latitudeDelta: 0.06,
                  longitudeDelta: 0.06,
                }}
              >
                {proposedRoute.points.map((pt, index) => (
                  <Marker
                    key={pt.id}
                    coordinate={pt.coordinates}
                    title={
                      pt.isStart
                        ? "Bắt đầu"
                        : pt.isEnd
                        ? "Kết thúc"
                        : `Điểm ${index}`
                    }
                    description={pt.address}
                  >
                    <MapPin
                      size={28}
                      color={
                        pt.isStart || pt.isEnd
                          ? AppColors.primary
                          : AppColors.blue
                      }
                      strokeWidth={2}
                    />
                  </Marker>
                ))}

                <Polyline
                  coordinates={proposedRoute.points.map((p) => p.coordinates)}
                  strokeColor="#3b82f6"
                  strokeWidth={3}
                  lineDashPattern={[5, 5]}
                />
              </MapView>
            </View>

            {/* Actions */}
            <View style={styles.routeActions}>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => {
                  Alert.alert(
                    "Từ chối lộ trình",
                    "Bạn không đồng ý với lộ trình đề xuất này?",
                    [
                      { text: "Hủy", style: "cancel" },
                      {
                        text: "Từ chối",
                        style: "destructive",
                        onPress: () => setRouteDecision("rejected"),
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.rejectButtonText}>Không đồng ý</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => {
                  Alert.alert(
                    "Xác nhận lộ trình",
                    "Bạn đồng ý với lộ trình mà người hướng dẫn đưa ra?",
                    [
                      { text: "Hủy", style: "cancel" },
                      {
                        text: "Đồng ý",
                        onPress: () => setRouteDecision("accepted"),
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.acceptButtonText}>Đồng ý lộ trình</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Cancel confirmation modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Xác nhận hủy buổi tập</Text>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Ngày giờ đặt lịch</Text>
              <Text style={styles.modalValue}>
                {new Date(displaySession.date).toLocaleDateString("vi-VN")}{" "}
                {displaySession.startTime} - {displaySession.endTime}
              </Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Thời điểm hủy</Text>
              <Text style={styles.modalValue}>
                {new Date().toLocaleString("vi-VN")}
              </Text>
            </View>

            {canCancelNow() ? (
              <View
                style={[styles.noticeBadge, { backgroundColor: "#dcfce7" }]}
              >
                <Text style={[styles.noticeText, { color: "#16a34a" }]}>
                  Có thể hủy: Trước ít nhất 12 giờ.
                </Text>
              </View>
            ) : (
              <View
                style={[styles.noticeBadge, { backgroundColor: "#fee2e2" }]}
              >
                <Text style={[styles.noticeText, { color: "#dc2626" }]}>
                  Không thể hủy: Còn dưới 12 giờ trước giờ bắt đầu.
                </Text>
              </View>
            )}

            <Text style={styles.modalSectionTitle}>Lý do hủy lịch</Text>

            <View style={styles.reasonList}>
              {cancellationReasons.map((reason) => {
                const selected = selectedReasons.includes(reason);
                return (
                  <TouchableOpacity
                    key={reason}
                    style={styles.reasonRow}
                    onPress={() => toggleReason(reason)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selected && styles.checkboxSelected,
                      ]}
                    >
                      {selected ? (
                        <Text style={styles.checkboxTick}>✓</Text>
                      ) : null}
                    </View>
                    <Text style={styles.reasonText}>{reason}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  !canCancelNow() && { opacity: 0.5 },
                ]}
                disabled={!canCancelNow()}
                onPress={() => {
                  setShowCancelModal(false);
                  if (canCancelNow()) {
                    Alert.alert(
                      "Hủy lịch thành công",
                      `Bạn đã hủy buổi tập vào ${new Date(
                        displaySession.date
                      ).toLocaleDateString("vi-VN")} ${
                        displaySession.startTime
                      }.`
                    );
                  } else {
                    Alert.alert(
                      "Không thể hủy",
                      "Buổi tập còn dưới 12 giờ nên không thể hủy."
                    );
                  }
                }}
              >
                <Text style={styles.modalConfirmBtnText}>Xác nhận hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Reschedule confirmation modal */}
      <Modal
        visible={showRescheduleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRescheduleModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Xác nhận dời lịch</Text>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Ngày giờ đặt lịch</Text>
              <Text style={styles.modalValue}>
                {new Date(displaySession.date).toLocaleDateString("vi-VN")}{" "}
                {displaySession.startTime} - {displaySession.endTime}
              </Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Thời điểm yêu cầu dời</Text>
              <Text style={styles.modalValue}>
                {new Date().toLocaleString("vi-VN")}
              </Text>
            </View>

            <Text style={styles.modalSectionTitle}>Lý do dời lịch</Text>

            <View style={styles.reasonList}>
              {cancellationReasons.map((reason) => {
                const selected = selectedRescheduleReasons.includes(reason);
                return (
                  <TouchableOpacity
                    key={reason}
                    style={styles.reasonRow}
                    onPress={() => toggleRescheduleReason(reason)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selected && styles.checkboxSelected,
                      ]}
                    >
                      {selected ? (
                        <Text style={styles.checkboxTick}>✓</Text>
                      ) : null}
                    </View>
                    <Text style={styles.reasonText}>{reason}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowRescheduleModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rescheduleConfirmBtn}
                onPress={() => {
                  setShowRescheduleModal(false);
                  const qp = new URLSearchParams({
                    sessionId: String(displaySession.id),
                    instructorName: String(displaySession.instructorName || ""),
                    date: String(displaySession.date),
                    startTime: String(displaySession.startTime || ""),
                    duration: String(displaySession.duration || ""),
                    endTime: String(displaySession.endTime || ""),
                    location: String(displaySession.location || ""),
                    reasons: JSON.stringify(selectedRescheduleReasons),
                  }).toString();
                  router.push(`/(main)/(no-tabs)/reschedule-session?${qp}`);
                }}
              >
                <Text style={styles.modalConfirmBtnText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    fontSize: 20,
    fontWeight: "800",
    color: AppColors.white,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  card: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  value: {
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  iconText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
  },
  // Route section styles
  routeCard: {
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
  decisionBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  decisionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },
  pointsList: {
    gap: 10,
    marginBottom: 12,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pointBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  pointStart: {
    backgroundColor: "#10b981",
  },
  pointEnd: {
    backgroundColor: "#ef4444",
  },
  pointBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
  },
  pointAddress: {
    flex: 1,
    fontSize: 14,
    color: "#4b5563",
  },
  mapContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 12,
  },
  map: {
    height: 260,
    width: "100%",
  },
  markerContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  startMarker: {
    backgroundColor: "#10b981",
  },
  endMarker: {
    backgroundColor: "#ef4444",
  },
  waypointMarker: {
    backgroundColor: "#3b82f6",
  },
  markerText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
  },
  routeActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  sessionActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  cancelLessonButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelLessonButtonText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  rescheduleLessonButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rescheduleLessonButtonText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
    justifyContent: "center",
  },
  modalCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginTop: 10,
    marginBottom: 8,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  modalLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  modalValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
    marginLeft: 8,
  },
  noticeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  reasonList: {
    gap: 10,
    marginBottom: 12,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.white,
  },
  checkboxSelected: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  checkboxTick: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 16,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  modalCancelBtnText: {
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "800",
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmBtnText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  rescheduleConfirmBtn: {
    flex: 1,
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    flex: 1,
    backgroundColor: AppColors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButtonText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  rejectButtonText: {
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "800",
  },
});
