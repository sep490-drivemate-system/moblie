import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  ArrowLeft,
  Route,
  User,
  Loader,
} from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { userPackagesData } from "@/data/user_packages_data";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, UrlTile } from "react-native-maps";
import { useAppDispatch } from "@/lib/redux/hooks";
import { getSessionRoutes } from "@/features/booking/bookingThunk";
import { IGetSessionRoutesResponse } from "@/models/route/route";

export default function MyDrivingSessionDetailScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { sessionId } = useLocalSearchParams();

  const allSessions = userPackagesData.flatMap((p) => p.sessions || []);
  const session = allSessions.find((s) => s.id === sessionId);

  // State for routes from API
  const [routesData, setRoutesData] = useState<IGetSessionRoutesResponse | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [routeSegments, setRouteSegments] = useState<any[]>([]);

  // Goong API Keys
  const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY;
  const GOONG_MAPTILES_KEY = process.env.EXPO_PUBLIC_GOONG_MAPTILES_KEY;
  
  // Debug: Log keys on component mount
  useEffect(() => {
    console.log("🔑 DEBUG - Goong API Key:", GOONG_API_KEY || "❌ MISSING");
    console.log("🗺️ DEBUG - Goong MapTiles Key:", GOONG_MAPTILES_KEY || "❌ MISSING");
    console.log("📦 DEBUG - All env vars:", process.env);
  }, []);

  type RoutePoint = {
    id: string;
    address: string;
    coordinates: { latitude: number; longitude: number };
    isStart?: boolean;
    isEnd?: boolean;
    description?: string;
    estimatedTime?: string;
    skills?: string[];
  };

  type Route = {
    id: string;
    bookingId: string;
    points: RoutePoint[];
    status: "draft" | "sent" | "accepted" | "rejected";
    notes?: string;
    createdAt: string;
    title?: string;
    description?: string;
    totalDuration?: string;
  };

  // Decode polyline from Goong API
  const decodePolyline = (encoded: string) => {
    const points: { latitude: number; longitude: number }[] = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  };

  // Helper functions for formatting
  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) return `${hours}h ${minutes}phút`;
    return `${minutes} phút`;
  };

  // Fetch directions from Goong API
  const fetchGoongDirections = async (data: IGetSessionRoutesResponse) => {
    try {
      console.log("🔑 Goong API Key:", GOONG_API_KEY ? "✅ Found" : "❌ Missing");
      console.log("🗺️ Goong MapTiles Key:", GOONG_MAPTILES_KEY ? "✅ Found" : "❌ Missing");
      
      // Create waypoints array: start point + all route points
      const allPoints = [
        { lat: data.sessionStartingLat, lng: data.sessionStartingLong },
        ...data.routes.map(r => ({ lat: r.latitudeStart, lng: r.longitudeStart }))
      ];

      console.log("📍 Total points to connect:", allPoints.length);

      const segments: any[] = [];

      // Fetch directions for each segment
      for (let i = 0; i < allPoints.length - 1; i++) {
        const origin = allPoints[i];
        const destination = allPoints[i + 1];

        const url = `https://rsapi.goong.io/Direction?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&vehicle=car&api_key=${GOONG_API_KEY}`;
        
        console.log(`🚗 Fetching segment ${i + 1}/${allPoints.length - 1}...`);
        
        const response = await fetch(url);
        const json = await response.json();

        console.log(`📦 Goong response for segment ${i + 1}:`, json.status || json.error || "OK");

        if (json.routes && json.routes[0]) {
          const route = json.routes[0];
          const coordinates = decodePolyline(route.overview_polyline.points);
          
          console.log(`✅ Segment ${i + 1}: ${coordinates.length} coordinates`);
          
          segments.push({
            coordinates,
            distance: route.legs[0].distance.text,
            duration: route.legs[0].duration.text,
          });
        } else {
          console.warn(`⚠️ No route found for segment ${i + 1}`);
          // Fallback: draw straight line
          segments.push({
            coordinates: [
              { latitude: origin.lat, longitude: origin.lng },
              { latitude: destination.lat, longitude: destination.lng }
            ],
            distance: "N/A",
            duration: "N/A",
          });
        }
      }

      setRouteSegments(segments);
      console.log("✅ Goong directions fetched:", segments.length, "segments");
    } catch (error) {
      console.error("❌ Error fetching Goong directions:", error);
    }
  };

  // Fetch routes from API
  useEffect(() => {
    if (!sessionId || typeof sessionId !== 'string') return;

    const fetchRoutes = async () => {
      try {
        setIsLoadingRoutes(true);
        console.log("🗺️ Fetching routes for session:", sessionId);

        const result = await dispatch(getSessionRoutes(sessionId)).unwrap();
        
        // API trả về isSuccess, nhưng GenericResponse type định nghĩa success
        // Cast để access cả 2 properties
        const apiResult = result as any;
        if ((apiResult.isSuccess || result.success) && result.value) {
          setRoutesData(result.value);
          console.log("✅ Routes loaded:", result.value);
          console.log("📊 DEBUG - Routes data structure:", {
            startLat: result.value.sessionStartingLat,
            startLng: result.value.sessionStartingLong,
            routesCount: result.value.routes.length,
            firstRoute: result.value.routes[0]
          });
          
          // Fetch directions from Goong API
          console.log("🚀 DEBUG - About to call fetchGoongDirections...");
          await fetchGoongDirections(result.value);
          console.log("✅ DEBUG - fetchGoongDirections completed");
        } else {
          console.warn("⚠️ DEBUG - API response not successful or no value:", result);
        }
      } catch (error) {
        console.error("❌ Error fetching routes:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin lộ trình");
      } finally {
        setIsLoadingRoutes(false);
      }
    };

    fetchRoutes();
  }, [sessionId]);


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
        {/* Session Info Card - Only show if displaySession exists */}
        {displaySession && (
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
                {displaySession.startTime} - {displaySession.endTime}
              </Text>
            </View>

            <View style={styles.iconRow}>
              <Clock size={18} color="#64748b" strokeWidth={2} />
              <Text style={styles.iconText}>
                Tổng thời gian: {displaySession.duration}h
              </Text>
            </View>

            {/* Status */}
            <View style={styles.row}>
              <Text style={styles.label}>Trạng thái</Text>
              {(() => {
                const meta = getSessionStatusMeta((session as any)?.status);
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
        )}

        {/* Loading State */}
        {isLoadingRoutes && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.loadingText}>Đang tải lộ trình...</Text>
          </View>
        )}

        {/* Routes from API */}
        {!isLoadingRoutes && routesData && (
          <View style={styles.routeCard}>
            <Text style={styles.sectionTitle}>
              Lộ trình buổi tập lái ({routesData.routes.length + 1} điểm)
            </Text>

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

            {/* Route Points Section */}
            <View style={styles.routePointsSection}>
              {/* Starting Point */}
              <View style={styles.routePoint}>
                <View style={styles.pointHeader}>
                  <View style={[styles.pointNumber, styles.pointNumberPrimary]}>
                    <Text style={styles.pointNumberText}>1</Text>
                  </View>
                  <View style={styles.pointInfo}>
                    <Text style={styles.pointAddress}>Điểm bắt đầu</Text>
                    <Text style={styles.pointCoords}>
                      📍 {routesData.sessionStartingLat.toFixed(6)}, {routesData.sessionStartingLong.toFixed(6)}
                    </Text>
                  </View>
                </View>
                <View style={styles.routeLine} />
              </View>

              {/* Route Points */}
              {routesData.routes.map((point, index) => (
                <View key={point.id} style={styles.routePoint}>
                  <View style={styles.pointHeader}>
                    <View style={styles.pointNumber}>
                      <Text style={styles.pointNumberText}>{index + 2}</Text>
                    </View>
                    <View style={styles.pointInfo}>
                      <Text style={styles.pointAddress}>{point.streetName}</Text>
                      <Text style={styles.pointCoords}>
                        📍 {point.latitudeStart.toFixed(6)}, {point.longitudeStart.toFixed(6)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.pointDescription}>
                    {point.textInstruction}
                  </Text>

                  {index < routesData.routes.length - 1 && (
                    <View style={styles.routeLine} />
                  )}
                </View>
              ))}
            </View>

            {/* Map with Goong Directions */}
            <Text style={styles.mapTitle}>Bản đồ lộ trình</Text>
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: routesData.sessionStartingLat,
                  longitude: routesData.sessionStartingLong,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                showsUserLocation={false}
                showsMyLocationButton={false}
              >
                {/* Goong Map Tiles */}
                {GOONG_MAPTILES_KEY && (
                  <UrlTile
                    urlTemplate={`https://tiles.goong.io/assets/navigation_day/{z}/{x}/{y}.png?api_key=${GOONG_MAPTILES_KEY}`}
                    maximumZ={19}
                    flipY={false}
                  />
                )}
                {/* Starting Point Marker */}
                <Marker
                  coordinate={{
                    latitude: routesData.sessionStartingLat,
                    longitude: routesData.sessionStartingLong,
                  }}
                  title="Điểm bắt đầu"
                  pinColor="green"
                />

                {/* Route Points Markers */}
                {routesData.routes.map((point, index) => (
                  <Marker
                    key={point.id}
                    coordinate={{
                      latitude: point.latitudeStart,
                      longitude: point.longitudeStart,
                    }}
                    title={`Điểm ${index + 2}`}
                    description={point.streetName}
                    pinColor={index === routesData.routes.length - 1 ? "red" : "blue"}
                  />
                ))}

                {/* Route Polylines from Goong */}
                {routeSegments.map((segment, index) => (
                  <Polyline
                    key={`segment-${index}`}
                    coordinates={segment.coordinates}
                    strokeColor="#3b82f6"
                    strokeWidth={4}
                  />
                ))}
              </MapView>
            </View>

            {/* Route Info */}
            {routeSegments.length > 0 && (
              <View style={styles.routeInfoContainer}>
                <Text style={styles.routeInfoTitle}>Thông tin lộ trình:</Text>
                {routeSegments.map((segment, index) => (
                  <Text key={index} style={styles.routeInfoText}>
                    • Đoạn {index + 1}: {segment.distance} - {segment.duration}
                  </Text>
                ))}
              </View>
            )}

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

            {/* <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Ngày giờ đặt lịch</Text>
              <Text style={styles.modalValue}>
                {new Date(displaySession.date).toLocaleDateString("vi-VN")}{" "}
                {displaySession.startTime} - {displaySession.endTime}
              </Text>
            </View> */}

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
              {/* <TouchableOpacity
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
              </TouchableOpacity> */}
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

            {/* <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Ngày giờ đặt lịch</Text>
              <Text style={styles.modalValue}>
                {new Date(displaySession.date).toLocaleDateString("vi-VN")}{" "}
                {displaySession.startTime} - {displaySession.endTime}
              </Text>
            </View> */}

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
              {/* <TouchableOpacity
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
              </TouchableOpacity> */}
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  routeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  routeDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 16,
  },
  routeInfoGrid: {
    gap: 8,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    minWidth: 100,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    flex: 1,
  },
  routePointsSection: {
    marginTop: 24,
  },
  routePoint: {
    marginBottom: 16,
    position: "relative",
  },
  pointHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
  },
  pointNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  pointNumberPrimary: {
    backgroundColor: AppColors.primary,
  },
  pointNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  pointInfo: {
    flex: 1,
  },
  pointAddress: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 2,
  },
  pointTime: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
  },
  pointDescription: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 40,
    marginBottom: 8,
    lineHeight: 18,
  },
  skillsContainer: {
    marginLeft: 40,
  },
  skillsLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  },
  skillsTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillTag: {
    backgroundColor: "#fef3c7",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  skillTagText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#d97706",
  },
  routeLine: {
    position: "absolute",
    left: 13,
    top: 28,
    bottom: -16,
    width: 2,
    backgroundColor: "#e5e7eb",
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
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  pointCoords: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  routeInfoContainer: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  routeInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  routeInfoText: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },
});
