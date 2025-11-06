import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
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

  const getSessionStatusMeta = (status?: string) => {
    switch (status) {
      case "upcoming":
        return { label: "Sắp diễn ra", color: AppColors.blue, bg: "#e0f2fe" };
      case "in_progress":
        return {
          label: "Đang diễn ra",
          color: AppColors.primary,
          bg: "#dcfce7",
        };
      case "completed":
        return { label: "Hoàn thành", color: AppColors.success, bg: "#dcfce7" };
      case "cancelled":
        return { label: "Đã hủy", color: AppColors.error, bg: "#fee2e2" };
      case "reschedule":
        return { label: "Dời lịch", color: AppColors.warning, bg: "#fef9c3" };
      case "route_planning":
      case "planing":
        return {
          label: "Đang lên lộ trình",
          color: AppColors.brandBlue,
          bg: "#e0f2fe",
        };
      default:
        return {
          label: "Không xác định",
          color: AppColors.gray,
          bg: "#e5e7eb",
        };
    }
  };

  if (!session) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={AppColors.white} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết buổi học</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Không tìm thấy buổi học</Text>
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
        <Text style={styles.headerTitle}>Chi tiết buổi học</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin buổi học</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Người hướng dẫn</Text>
            <Text style={styles.value}>{session.instructorName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.iconRow}>
            <Calendar size={18} color="#64748b" strokeWidth={2} />
            <Text style={styles.iconText}>
              {new Date(session.date).toLocaleDateString("vi-VN")}
            </Text>
          </View>

          <View style={styles.iconRow}>
            <Clock size={18} color="#64748b" strokeWidth={2} />
            <Text style={styles.iconText}>
              {session.startTime} - {session.endTime} ({session.duration}h)
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
              {session.location}
            </Text>
          </View>

          {session.vehicleName ? (
            <View style={styles.iconRow}>
              <Car size={18} color="#64748b" strokeWidth={2} />
              <Text style={styles.iconText}>{session.vehicleName}</Text>
            </View>
          ) : null}
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
