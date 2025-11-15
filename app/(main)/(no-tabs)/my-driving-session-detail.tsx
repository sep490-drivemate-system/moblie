import React, { useEffect, useMemo, useState, useRef } from "react";
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
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
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
  Play,
  Square,
} from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { userPackagesData } from "@/data/user_packages_data";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, UrlTile } from "react-native-maps";
import { useAppDispatch } from "@/lib/redux/hooks";
import { 
  getSessionRoutes, 
  addSessionLog, 
  cancelSession, 
  ICancelSessionRequest,
  ISessionLogRequest,
  updateSessionStatus
} from "@/features/booking/bookingThunk";
import { IGetSessionRoutesResponse } from "@/models/route/route";
import { SessionStatus } from "@/models/booking/booking";

export default function MyDrivingSessionDetailScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { sessionId: rawSessionId } = useLocalSearchParams();
  
  // Convert sessionId to string (handle both string and string[] types)
  const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;

  const allSessions = userPackagesData.flatMap((p) => p.sessions || []);
  const session = allSessions.find((s) => s.id === sessionId);

  // State for routes from API
  const [routesData, setRoutesData] = useState<IGetSessionRoutesResponse | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [routeSegments, setRouteSegments] = useState<any[]>([]);

  // State for vehicle simulation
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
  } | null>(null);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const simulationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<MapView>(null);
  const allRouteCoordinates = useRef<Array<{ latitude: number; longitude: number }>>([]);

  // Goong API Keys
  const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY;
  const GOONG_MAPTILES_KEY = process.env.EXPO_PUBLIC_GOONG_MAPTILES_KEY;
  

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


  // Fetch directions from Goong API
  const fetchGoongDirections = async (data: IGetSessionRoutesResponse) => {
    try {
      
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

  // Calculate heading between two points
  const calculateHeading = (
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number }
  ): number => {
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude * Math.PI) / 180;
    const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    const heading = (Math.atan2(y, x) * 180) / Math.PI;
    return (heading + 360) % 360; // Normalize to 0-360
  };

  // Get street name from coordinates (mock - in production use reverse geocoding)
  const getStreetName = async (lat: number, lng: number): Promise<string> => {
    // Mock street names based on route data
    if (routesData) {
      const nearestRoute = routesData.routes.find((r) => {
        const distance = Math.sqrt(
          Math.pow(r.latitudeStart - lat, 2) + Math.pow(r.longitudeStart - lng, 2)
        );
        return distance < 0.01; // Within ~1km
      });
      if (nearestRoute) return nearestRoute.streetName;
    }
    return "Đường không xác định";
  };

  // Send session log to API
  const sendSessionLog = async (
    lat: number,
    lng: number,
    heading: number,
    speed: number
  ) => {
    if (!sessionId || typeof sessionId !== "string") return;

    try {
      const streetName = await getStreetName(lat, lng);
      const logData: ISessionLogRequest = {
        streetName,
        latitude: lat,
        longitude: lng,
        heading: heading.toFixed(2) + "°",
        speed: Math.round(speed),
      };

      console.log("📍 Sending session log:", logData);
      await dispatch(addSessionLog({ sessionId, logData })).unwrap();
    } catch (error) {
      console.error("❌ Error sending session log:", error);
    }
  };

  const handelUpdate = async (sessionId: string) => {
    try {
      const response = await dispatch(updateSessionStatus({ sessionId, status: SessionStatus.Upcoming })).unwrap();
      console.log("✅ Session status updated successfully:", response);
      Alert.alert("Thành công", "Lưu lại thành công");
      router.back();
    } catch (error) {
      console.error("❌ Error updating session status:", error);
      Alert.alert("Lỗi", "Không thể lưu lại");
    }
  };
  // Start vehicle simulation - Round trip (khứ hồi)
  const startSimulation = () => {
    if (!routeSegments.length || isSimulating) return;

    // Collect all coordinates from route segments for outbound trip
    const outboundCoordinates: Array<{ latitude: number; longitude: number }> = [];
    routeSegments.forEach((segment) => {
      outboundCoordinates.push(...segment.coordinates);
    });

    if (outboundCoordinates.length === 0) {
      Alert.alert("Lỗi", "Không có lộ trình để giả lập");
      return;
    }

    // Create round trip: outbound + return journey
    const returnCoordinates = [...outboundCoordinates].reverse(); // Reverse for return trip
    const roundTripCoordinates = [...outboundCoordinates, ...returnCoordinates];
    
    console.log("🔄 Round trip simulation:", {
      outboundPoints: outboundCoordinates.length,
      returnPoints: returnCoordinates.length,
      totalPoints: roundTripCoordinates.length
    });

    allRouteCoordinates.current = roundTripCoordinates;
    setIsSimulating(true);
    setSimulationProgress(0);

    // Set initial position
    const startPos = roundTripCoordinates[0];
    const nextPos = roundTripCoordinates[1] || startPos;
    const initialHeading = calculateHeading(startPos, nextPos);
    setCurrentPosition({
      ...startPos,
      heading: initialHeading,
      speed: 40, // 40 km/h
    });

    let currentIndex = 0;
    const totalPoints = roundTripCoordinates.length;
    const outboundLength = outboundCoordinates.length;
    const simulationSpeed = 100; // Update every 100ms for smooth animation
    const speedKmh = 40; // Average speed 40 km/h

    // Simulation interval - move vehicle along route
    simulationIntervalRef.current = setInterval(() => {
      currentIndex++;
      if (currentIndex >= totalPoints) {
        stopSimulation();
        Alert.alert(
          "Hoàn thành chuyến khứ hồi", 
          "Đã hoàn thành lộ trình giả lập khứ hồi!\n\n" +
          `✅ Lượt đi: ${outboundLength} điểm\n` +
          `✅ Lượt về: ${returnCoordinates.length} điểm\n` +
          `🎯 Tổng cộng: ${totalPoints} điểm`
        );
        return;
      }

      const currentPos = roundTripCoordinates[currentIndex];
      const nextPos = roundTripCoordinates[currentIndex + 1] || currentPos;
      const heading = calculateHeading(currentPos, nextPos);

      // Determine if we're on outbound or return trip
      const isOutbound = currentIndex < outboundLength;
      const tripPhase = isOutbound ? "Lượt đi" : "Lượt về";
      const phaseProgress = isOutbound 
        ? (currentIndex / outboundLength) * 100
        : ((currentIndex - outboundLength) / returnCoordinates.length) * 100;

      console.log(`🚗 ${tripPhase}: ${Math.round(phaseProgress)}% (${currentIndex}/${totalPoints})`);

      setCurrentPosition({
        ...currentPos,
        heading,
        speed: speedKmh + Math.random() * 10 - 5, // Random speed variation ±5 km/h
      });

      setSimulationProgress((currentIndex / totalPoints) * 100);

      // Animate map to follow vehicle
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: currentPos.latitude,
            longitude: currentPos.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500
        );
      }
    }, simulationSpeed);

    // Log interval - send to API every 5 minutes (300000ms)
    logIntervalRef.current = setInterval(() => {
      if (currentPosition) {
        sendSessionLog(
          currentPosition.latitude,
          currentPosition.longitude,
          currentPosition.heading,
          currentPosition.speed
        );
      }
    }, 300000); // 5 minutes

    // Also send initial log immediately
    sendSessionLog(startPos.latitude, startPos.longitude, initialHeading, speedKmh);
  };

  // Stop vehicle simulation
  const stopSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    if (logIntervalRef.current) {
      clearInterval(logIntervalRef.current);
      logIntervalRef.current = null;
    }
    setIsSimulating(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSimulation();
    };
  }, []);

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
  
  // New states for API calls
  const [cancelNote, setCancelNote] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

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


  // Handle cancel session
  const handleCancelSession = async () => {
    if (!sessionId || typeof sessionId !== 'string') {
      Alert.alert("Lỗi", "Không tìm thấy thông tin buổi tập lái");
      return;
    }

    if (!cancelNote.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do hủy buổi tập lái");
      return;
    }

    try {
      setIsCancelling(true);
      
      const cancelData: ICancelSessionRequest = {
        note: cancelNote.trim()
      };

      await dispatch(cancelSession({ sessionId, cancelData })).unwrap();
      
      setShowCancelModal(false);
      setCancelNote("");
      setSelectedReasons([]);
      
      Alert.alert(
        "Thành công", 
        "Đã hủy buổi tập lái thành công",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error("Error cancelling session:", error);
      Alert.alert("Lỗi", error as string || "Không thể hủy buổi tập lái");
    } finally {
      setIsCancelling(false);
    }
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

  // SessionStatus enum from backend
  // Planning = 1, Upcoming = 2, InProgress = 3, Completed = 4, Reschedule = 5, Cancelled = 6
  const getSessionStatusMeta = (status?: number | string) => {
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    
    switch (statusNum) {
      case 1: // Planning
        return {
          label: "Đang lên lộ trình",
          color: AppColors.yellow,
          bg: "#fef9c3",
        };
      case 2: // Upcoming
        return { label: "Sắp diễn ra", color: AppColors.yellow, bg: "#fef9c3" };
      case 3: // InProgress
        return {
          label: "Đang diễn ra",
          color: AppColors.primary,
          bg: "#dcfce7",
        };
      case 4: // Completed
        return { label: "Hoàn thành", color: AppColors.gray, bg: "#e5e7eb" };
      case 5: // Reschedule
        return { label: "Dời lịch", color: AppColors.blue, bg: "#dbeafe" };
      case 6: // Cancelled
        return { label: "Đã hủy", color: AppColors.red, bg: "#fee2e2" };
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
                  router.push({
                    pathname: "/(main)/(no-tabs)/reschedule-session",
                    params: {
                      sessionId: sessionId,
                      instructorName: displaySession?.instructorName || "",
                      date: displaySession?.date || "",
                      startTime: displaySession?.startTime || "",
                      duration: Number(displaySession?.duration) || 2,
                      location: displaySession?.location || "",
                    },
                  });
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
            <View style={styles.sessionManagementControls}>
              <TouchableOpacity
                style={styles.rescheduleMapButton}
                onPress={() => {
                  router.push({
                    pathname: "/(main)/(no-tabs)/reschedule-session",
                    params: {
                      sessionId: sessionId,
                      instructorName: displaySession?.instructorName || "",
                      date: displaySession?.date || "",
                      startTime: displaySession?.startTime || "",
                      duration: Number(displaySession?.duration) || 2,
                      location: displaySession?.location || "",
                    },
                  });
                }}
              >
                <Calendar size={18} color="#fff" strokeWidth={2} />
                <Text style={styles.rescheduleMapButtonText}>Đổi lịch</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelMapButton}
                onPress={() => {
                  setCancelNote("");
                  setSelectedReasons([]);
                  setShowCancelModal(true);
                }}
              >
                <Text style={styles.cancelMapButtonText}>Hủy buổi tập</Text>
              </TouchableOpacity>
            </View>
            {/* Map with Goong Directions */}
            <Text style={styles.mapTitle}>Bản đồ lộ trình</Text>
            
            {/* Simulation Controls - Show if route exists */}
            {routeSegments.length > 0 && (
              <View style={styles.simulationControls}>
                <TouchableOpacity
                  style={[
                    styles.simulationButton,
                    isSimulating ? styles.stopButton : styles.startButton,
                  ]}
                  onPress={isSimulating ? stopSimulation : startSimulation}
                >
                  {isSimulating ? (
                    <Square size={20} color="#fff" strokeWidth={2} />
                  ) : (
                    <Play size={20} color="#fff" strokeWidth={2} />
                  )}
                  <Text style={styles.simulationButtonText}>
                    {isSimulating ? "Dừng giả lập" : "Bắt đầu giả lập"}
                  </Text>
                </TouchableOpacity>

                {isSimulating && (
                  <View style={styles.simulationInfo}>
                    <Text style={styles.simulationInfoText}>
                      Tiến độ: {simulationProgress.toFixed(1)}%
                    </Text>
                    {currentPosition && (
                      <>
                        <Text style={styles.simulationInfoText}>
                          Tốc độ: {currentPosition.speed.toFixed(1)} km/h
                        </Text>
                        <Text style={styles.simulationInfoText}>
                          Hướng: {currentPosition.heading.toFixed(0)}°
                        </Text>
                      </>
                    )}
                  </View>
                )}
              </View>
            )}



            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
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

                {/* Simulated Vehicle Marker */}
                {currentPosition && isSimulating && (
                  <Marker
                    coordinate={{
                      latitude: currentPosition.latitude,
                      longitude: currentPosition.longitude,
                    }}
                    anchor={{ x: 0.5, y: 0.5 }}
                    flat={true}
                    rotation={currentPosition.heading}
                  >
                    <View style={styles.vehicleMarker}>
                      <Car size={24} color="#fff" strokeWidth={2.5} />
                    </View>
                  </Marker>
                )}
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
                        onPress: async () => {
                          setRouteDecision("accepted");
                          await handelUpdate(sessionId);
                        },
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
        onRequestClose={() => {
          Keyboard.dismiss();
          setShowCancelModal(false);
          setCancelNote("");
          setSelectedReasons([]);
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          Keyboard.dismiss();
        }}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
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

            <Text style={styles.modalSectionTitle}>Ghi chú chi tiết</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Nhập lý do chi tiết để hủy buổi tập lái..."
              placeholderTextColor="#9ca3af"
              value={cancelNote}
              onChangeText={setCancelNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setShowCancelModal(false);
                  setCancelNote("");
                  setSelectedReasons([]);
                }}
              >
                <Text style={styles.modalCancelBtnText}>Đóng</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  (!cancelNote.trim() || isCancelling) && { opacity: 0.5 },
                ]}
                disabled={!cancelNote.trim() || isCancelling}
                onPress={handleCancelSession}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Xác nhận hủy</Text>
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
  // Simulation styles
  simulationControls: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  simulationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  startButton: {
    backgroundColor: AppColors.primary,
  },
  stopButton: {
    backgroundColor: "#ef4444",
  },
  simulationButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  simulationInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 6,
  },
  simulationInfoText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
  vehicleMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  // Session Management Controls
  sessionManagementControls: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  rescheduleMapButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  rescheduleMapButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  cancelMapButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelMapButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  // Note Input
  noteInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1f2937",
    backgroundColor: "#fff",
    minHeight: 80,
    marginBottom: 16,
  },
  // Date Time Picker Styles
  dateTimePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  dateTimePickerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  dateTimeDisplayButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  dateTimeDisplayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    flex: 1,
  },
  // Date Picker Modal Styles
  datePickerModal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  datePickerContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  datePickerValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
});
