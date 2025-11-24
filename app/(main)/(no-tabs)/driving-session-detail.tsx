import React, { useEffect, useMemo, useState, useRef } from "react";
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
import { AppColors } from "@/constants/Colors";
import { userPackagesData } from "@/data/user_packages_data";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  getSessionRoutes,
  addSessionLog,
  cancelSession,
  ISessionLogRequest,
  getAllSessions,
  ICancelSessionRequest,
  getSessionDetail,
} from "@/features/booking/bookingThunk";
import { ISessionRoutes } from "@/models/route/route";
import { IBookingSession, SessionStatus, ISessionDetailResponse } from "@/models/booking/booking";
import { UserRole } from "@/models/enum/UserRole.enum";
import { ROUTES } from "@/constants/routes";
import HeaderList from "@/components/Commons/HeaderList";
import SessionRouteList from "@/components/Session/SessionRouteList";
import SessionMapView from "@/components/Session/SessionMapView";
import SimulationControls from "@/components/Session/SimulationControls";
import SessionActions from "@/components/Session/SessionActions";
import RouteActions from "@/components/Session/RouteActions";
import CancelSessionModal from "@/components/Session/CancelSessionModal";

export default function DrivingSessionDetailScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams();
  const sessionId = params.sessionId;

  // Get user role from Redux store
  const role = useAppSelector((s) => s.auth.user?.role ?? null);

  const getStringParam = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) return value[0];
    return value ?? undefined;
  };

  const getNumberParam = (value: string | string[] | undefined) => {
    const str = getStringParam(value);
    if (!str) return undefined;
    const num = Number(str);
    return Number.isNaN(num) ? undefined : num;
  };


  const allSessions = userPackagesData.flatMap((p) => p.sessions || []);
  const localSession = allSessions.find((s) => s.id === sessionId);
  const [remoteSession, setRemoteSession] = useState<IBookingSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const session = remoteSession ?? localSession ?? null;
  const sessionLocationData = session as any;

  // State for session detail from API
  const [sessionDetail, setSessionDetail] = useState<ISessionDetailResponse | null>(null);

  // State for routes from API
  const [routesData, setRoutesData] = useState<ISessionRoutes[] | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [routeSegments, setRouteSegments] = useState<any[]>([]);

  // State for planning route points (clicked on map)
  const [selectedRoutePoints, setSelectedRoutePoints] = useState<Array<{
    id: string;
    latitude: number;
    longitude: number;
    streetName?: string;
    order: number;
  }>>([]);

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
  const mapRef = useRef<any>(null);
  const allRouteCoordinates = useRef<Array<{ latitude: number; longitude: number }>>([]);

  // Goong API Keys
  const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY;
  const GOONG_MAPTILES_KEY = process.env.EXPO_PUBLIC_GOONG_MAPTILES_KEY;

  const parseCoordinateValue = (
    value: number | string | undefined | null
  ): number | null => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (
        trimmed === "" ||
        trimmed.toLowerCase() === "null" ||
        trimmed.toLowerCase() === "undefined"
      ) {
        return null;
      }

      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  };

  const formatCoordinateText = (
    value: number | string | undefined | null
  ): string => {
    const parsed = parseCoordinateValue(value);
    return parsed !== null ? parsed.toFixed(6) : "--";
  };


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
  const fetchGoongDirections = async (routes: ISessionRoutes[], startLat?: number, startLng?: number) => {
    try {
      // Use provided start coordinates or get from first route point
      let startPointLat = startLat;
      let startPointLng = startLng;

      if (startPointLat === undefined || startPointLng === undefined) {
        // Try to get from sessionDetail
        const sessionLat = parseCoordinateValue(sessionDetail?.startingLatitude as any);
        const sessionLng = parseCoordinateValue(sessionDetail?.startingLongtitude as any);
        startPointLat = sessionLat ?? undefined;
        startPointLng = sessionLng ?? undefined;
      }

      // If still no start point, use first route point
      if ((startPointLat === undefined || startPointLng === undefined) && routes.length > 0) {
        const routeLat = parseCoordinateValue(routes[0].latitudeStart as any);
        const routeLng = parseCoordinateValue(routes[0].longitudeStart as any);
        startPointLat = routeLat ?? undefined;
        startPointLng = routeLng ?? undefined;
      }

      if (startPointLat === undefined || startPointLng === undefined) {
        console.warn("⚠️ Goong directions skipped: invalid start coordinates");
        return;
      }

      // Get end point coordinates
      const endLat = parseCoordinateValue(sessionDetail?.endingLatitude as any);
      const endLng = parseCoordinateValue(sessionDetail?.endingLongtitude as any);
      const endPointLat = endLat ?? undefined;
      const endPointLng = endLng ?? undefined;

      // Create waypoints array: start point + all route points + end point
      const allPoints = [
        { lat: startPointLat, lng: startPointLng },
        ...routes
          .map((r) => {
            const lat = parseCoordinateValue(r.latitudeStart as any);
            const lng = parseCoordinateValue(r.longitudeStart as any);
            if (lat === null || lng === null) return null;
            return { lat, lng };
          })
          .filter((point): point is { lat: number; lng: number } => point !== null),
      ];

      // Add end point if available
      if (endPointLat !== undefined && endPointLng !== undefined) {
        allPoints.push({ lat: endPointLat, lng: endPointLng });
        console.log("📍 Added end point to route:", { lat: endPointLat, lng: endPointLng });
      } else {
        console.warn("⚠️ End point coordinates not available");
      }

      if (allPoints.length < 2) {
        console.warn("⚠️ Goong directions skipped: not enough points (need at least 2)");
        return;
      }

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

        if (json.error) {
          console.log(`❌ Goong API Error for segment ${i + 1}:`, json.error);
          // Fallback: draw straight line
          segments.push({
            coordinates: [
              { latitude: origin.lat, longitude: origin.lng },
              { latitude: destination.lat, longitude: destination.lng }
            ],
            distance: "N/A",
            duration: "N/A",
          });
        } else if (json.routes && json.routes[0]) {
          const route = json.routes[0];

          if (route.overview_polyline && route.overview_polyline.points) {
            try {
              const coordinates = decodePolyline(route.overview_polyline.points);

              if (coordinates.length > 0) {
                segments.push({
                  coordinates,
                  distance: route.legs?.[0]?.distance?.text || "N/A",
                  duration: route.legs?.[0]?.duration?.text || "N/A",
                });
              } else {
                console.warn(`⚠️ Segment ${i + 1}: Decoded coordinates array is empty`);
                // Fallback
                segments.push({
                  coordinates: [
                    { latitude: origin.lat, longitude: origin.lng },
                    { latitude: destination.lat, longitude: destination.lng }
                  ],
                  distance: "N/A",
                  duration: "N/A",
                });
              }
            } catch (decodeError) {
              console.error(`❌ Error decoding polyline for segment ${i + 1}:`, decodeError);
              // Fallback
              segments.push({
                coordinates: [
                  { latitude: origin.lat, longitude: origin.lng },
                  { latitude: destination.lat, longitude: destination.lng }
                ],
                distance: "N/A",
                duration: "N/A",
              });
            }
          } else {
            console.warn(`⚠️ Segment ${i + 1}: Route missing overview_polyline or points`);
            // Fallback
            segments.push({
              coordinates: [
                { latitude: origin.lat, longitude: origin.lng },
                { latitude: destination.lat, longitude: destination.lng }
              ],
              distance: "N/A",
              duration: "N/A",
            });
          }
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

      // Check if we got valid routes or just fallback straight lines
      const hasValidRoutes = segments.some(s => s.coordinates.length > 2);

      if (hasValidRoutes) {
        setRouteSegments(segments);
        console.log("✅ Goong directions fetched:", segments.length, "segments with valid routes");
      } else {
        console.warn("⚠️ All segments are fallback straight lines. API may not be working correctly.");
        setRouteSegments(segments); // Still set them so user can see something
      }

    } catch (error) {
      console.error("❌ Error fetching Goong directions:", error);
      setRouteSegments([]);
    }
  };

  // Get street name from coordinates using Goong Geocoding API
  const getStreetName = async (lat: number, lng: number): Promise<string> => {
    try {
      if (!GOONG_API_KEY) {
        return "Đường không xác định";
      }
      const url = `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${GOONG_API_KEY}`;
      const response = await fetch(url);
      const json = await response.json();

      if (json.status === "OK" && json.results && json.results.length > 0) {
        const address = json.results[0].formatted_address || json.results[0].address_components?.[0]?.long_name;
        return address || "Đường không xác định";
      }
      return "Đường không xác định";
    } catch (error) {
      console.error("Error getting street name:", error);
      return "Đường không xác định";
    }
  };

  // Handle map press to add route point (only for Planning status)
  const handleMapPress = async (event: any) => {
    if (!shouldShowMapForPlanning) return;

    const { latitude, longitude } = event.nativeEvent.coordinate;
    const streetName = await getStreetName(latitude, longitude);

    const newPoint = {
      id: `point-${Date.now()}`,
      latitude,
      longitude,
      streetName,
      order: selectedRoutePoints.length + 1,
    };

    setSelectedRoutePoints((prev) => [...prev, newPoint]);
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

      await dispatch(addSessionLog({ sessionId, logData })).unwrap();
    } catch (error) {
    }
  };

  // Calculate heading (bearing) between two coordinates
  const calculateHeading = (
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number }
  ): number => {
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude * Math.PI) / 180;
    const deltaLng = ((to.longitude - from.longitude) * Math.PI) / 180;

    const x = Math.sin(deltaLng) * Math.cos(lat2);
    const y =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    const heading = Math.atan2(x, y);
    const headingDegrees = (heading * 180) / Math.PI;
    return (headingDegrees + 360) % 360; // Normalize to 0-360
  };

  // const handelUpdate = async (sessionId: string) => {
  //   try {
  //     const response = await dispatch(updateSessionStatus({ sessionId, status: SessionStatus.Upcoming })).unwrap();
  //     console.log("✅ Session status updated successfully:", response);
  //     Alert.alert("Thành công", "Lưu lại thành công");
  //     router.back();
  //   } catch (error) {
  //     console.error("❌ Error updating session status:", error);
  //     Alert.alert("Lỗi", "Không thể lưu lại");
  //   }
  // };
  // Start vehicle simulation - 2 minutes duration, save data every 15 seconds
  const startSimulation = () => {
    if (!effectiveRouteSegments.length || isSimulating) return;

    // Collect all coordinates from route segments
    const allCoordinates: Array<{ latitude: number; longitude: number }> = [];
    effectiveRouteSegments.forEach((segment) => {
      allCoordinates.push(...segment.coordinates);
    });

    if (allCoordinates.length === 0) {
      Alert.alert("Lỗi", "Không có lộ trình để giả lập");
      return;
    }
    allRouteCoordinates.current = allCoordinates;
    setIsSimulating(true);
    setSimulationProgress(0);

    // Set initial position
    const startPos = allCoordinates[0];
    const nextPos = allCoordinates[1] || startPos;
    const initialHeading = calculateHeading(startPos, nextPos);
    setCurrentPosition({
      ...startPos,
      heading: initialHeading,
      speed: 40, // 40 km/h
    });

    // Simulation parameters
    const SIMULATION_DURATION = 120000; // 2 minutes in milliseconds
    const SAVE_INTERVAL = 15000; // 15 seconds in milliseconds
    const UPDATE_INTERVAL = 100; // Update position every 100ms for smooth animation
    const speedKmh = 40; // Average speed 40 km/h

    const startTime = Date.now();
    let currentIndex = 0;
    const totalPoints = allCoordinates.length;

    // Send initial log immediately
    sendSessionLog(startPos.latitude, startPos.longitude, initialHeading, speedKmh);
    console.log(`💾 Đã lưu dữ liệu tại 0s (bắt đầu)`);

    // Track last save time - start from 0 since we already saved at start
    let lastSaveTime = 0;

    // Simulation interval - move vehicle along route
    simulationIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;

      // Stop after 2 minutes
      if (elapsed >= SIMULATION_DURATION) {
        // Save final log before stopping
        const finalIndex = Math.min(
          Math.floor((99.9 / 100) * totalPoints),
          totalPoints - 1
        );
        const finalPos = allCoordinates[finalIndex];
        const finalNextPos = allCoordinates[Math.min(finalIndex + 1, totalPoints - 1)] || finalPos;
        const finalHeading = calculateHeading(finalPos, finalNextPos);
        sendSessionLog(
          finalPos.latitude,
          finalPos.longitude,
          finalHeading,
          speedKmh
        );
        console.log(`💾 Đã lưu dữ liệu tại ${Math.floor(elapsed / 1000)}s (kết thúc)`);

        stopSimulation();
        Alert.alert(
          "Hoàn thành giả lập",
          "Đã hoàn thành lộ trình giả lập 2 phút!"
        );
        return;
      }

      // Update progress
      const progress = (elapsed / SIMULATION_DURATION) * 100;
      setSimulationProgress(progress);

      // Calculate current position index based on progress
      currentIndex = Math.min(
        Math.floor((progress / 100) * totalPoints),
        totalPoints - 1
      );

      const currentPos = allCoordinates[currentIndex];
      const nextPos = allCoordinates[Math.min(currentIndex + 1, totalPoints - 1)] || currentPos;
      const heading = calculateHeading(currentPos, nextPos);

      setCurrentPosition({
        ...currentPos,
        heading,
        speed: speedKmh + Math.random() * 10 - 5, // Random speed variation ±5 km/h
      });

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

      // Save data every 15 seconds
      if (elapsed - lastSaveTime >= SAVE_INTERVAL) {
        lastSaveTime = elapsed;
        const currentSpeed = speedKmh + Math.random() * 10 - 5;
        sendSessionLog(
          currentPos.latitude,
          currentPos.longitude,
          heading,
          currentSpeed
        );
        console.log(`💾 Đã lưu dữ liệu tại ${Math.floor(elapsed / 1000)}s`);
      }
    }, UPDATE_INTERVAL);
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
    setSimulationProgress(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSimulation();
    };
  }, []);


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
  const overrideDate = getStringParam(params.overrideDate);
  const overrideStartTime = getStringParam(params.overrideStartTime);
  const overrideEndTime = getStringParam(params.overrideEndTime);
  const overrideLocation = getStringParam(params.overrideLocation);
  const overrideInstructor = getStringParam(params.overrideInstructor);
  const overrideDurationValue = getNumberParam(params.overrideDuration);
  const overrideDuration =
    overrideDurationValue !== undefined ? overrideDurationValue : undefined;

  const displaySession = useMemo(() => {
    if (session) {
      return {
        ...session,
        date: overrideDate || (session as any).date,
        startTime: overrideStartTime || (session as any).startTime,
        endTime: overrideEndTime || (session as any).endTime,
        location: overrideLocation || (session as any).location,
        instructorName: overrideInstructor || (session as any).instructorName,
        duration: overrideDuration || (session as any).duration,
      };
    }

    if (
      overrideDate ||
      overrideStartTime ||
      overrideEndTime ||
      overrideLocation ||
      overrideInstructor ||
      overrideDuration
    ) {
      return {
        id: sessionId || "temp-session",
        date: overrideDate || new Date().toISOString(),
        startTime: overrideStartTime || "--:--",
        endTime: overrideEndTime || "--:--",
        location:
          overrideLocation || sessionLocationData?.displayStartLocationName || "",
        instructorName: overrideInstructor || "",
        duration: overrideDuration ?? 0,
        vehicleName: sessionLocationData?.vehicleName || "",
      } as any;
    }

    return null;
  }, [
    session,
    overrideDate,
    overrideStartTime,
    overrideEndTime,
    overrideLocation,
    overrideInstructor,
    overrideDuration,
    sessionId,
    sessionLocationData?.vehicleName,
  ]);

  const normalizeCoordinate = (value: number | string | undefined | null) => {
    const parsed = parseCoordinateValue(value);
    return parsed === null ? undefined : parsed;
  };

  const parseLocationString = (value?: string | null) => {
    if (!value) {
      return { lat: undefined, long: undefined };
    }

    const [latPart, longPart] = value.split(",");
    return {
      lat: normalizeCoordinate(latPart?.trim()),
      long: normalizeCoordinate(longPart?.trim()),
    };
  };

  useEffect(() => {
    if (!sessionId || typeof sessionId !== "string") return;
    if (localSession) return;

    let isMounted = true;

    const fetchSessionDetail = async () => {
      try {
        setIsLoadingSession(true);
        setSessionError(null);
        const response = await dispatch(getAllSessions(undefined)).unwrap();
        const allSessionsResult = (response?.value ?? []) as IBookingSession[];
        if (!isMounted) return;

        const found = allSessionsResult.find(
          (item) => item.id === sessionId
        );

        if (found) {
          setRemoteSession(found);
        } else {
          setSessionError("Chưa thiết lập lộ trình.");
        }
      } catch (error) {
        console.error("❌ Error fetching session detail:", error);
        if (isMounted) {
          setSessionError("Không thể tải thông tin buổi tập.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingSession(false);
        }
      }
    };

    fetchSessionDetail();

    return () => {
      isMounted = false;
    };
  }, [sessionId, localSession, dispatch]);

  // Fetch session detail with coordinates (for map display)
  useEffect(() => {
    if (!sessionId || typeof sessionId !== "string") return;

    let isMounted = true;

    const fetchSessionDetailInfo = async () => {
      try {
        const response = await dispatch(getSessionDetail({ sessionId })).unwrap();
        if (!isMounted) return;

        // Handle different response structures
        let sessionDetailData: ISessionDetailResponse | null = null;
        if (response) {
          // Check if response has value property (GenericResponse structure)
          if ((response as any)?.value) {
            sessionDetailData = (response as any).value;
          } else if ((response as any)?.isSuccess && (response as any)?.value) {
            sessionDetailData = (response as any).value;
          } else if ((response as any)?.startingLatitude !== undefined) {
            // Direct ISessionDetailResponse
            sessionDetailData = response as unknown as ISessionDetailResponse;
          }
        }

        if (sessionDetailData) {
          setSessionDetail(sessionDetailData);
        }
      } catch (error) {
        console.error("Error fetching session detail info:", error);
        // Don't set to null, keep existing data if any
      }
    };

    fetchSessionDetailInfo();

    return () => {
      isMounted = false;
    };
  }, [sessionId, dispatch]);

  // Fetch session routes
  useEffect(() => {
    if (!sessionId || typeof sessionId !== "string") return;

    let isMounted = true;

    const fetchSessionRoutes = async () => {
      try {
        setIsLoadingRoutes(true);
        const response = await dispatch(getSessionRoutes({ sessionId })).unwrap();
        if (!isMounted) return;

        // Handle different response structures
        let routes: ISessionRoutes[] | null = null;
        if (Array.isArray(response)) {
          routes = response;
        } else if (response?.value && Array.isArray(response.value)) {
          routes = response.value;
        } else if ((response as any)?.isSuccess && (response as any)?.value && Array.isArray((response as any).value)) {
          routes = (response as any).value;
        }

        if (routes && routes.length > 0) {
          setRoutesData(routes);
        } else {
          setRoutesData(null);
        }
      } catch (error) {
        console.error("Error fetching session routes:", error);
        if (isMounted) {
          setRoutesData(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingRoutes(false);
        }
      }
    };

    fetchSessionRoutes();

    return () => {
      isMounted = false;
    };
  }, [sessionId, dispatch]);

  const sessionLocationCoords = useMemo(
    () => parseLocationString(sessionLocationData?.location),
    [sessionLocationData?.location]
  );

  const pickupDetails = useMemo(() => {
    const nameParam = getStringParam(params.pickupName);
    const latParam =
      normalizeCoordinate(getStringParam(params.pickupLat)) ??
      normalizeCoordinate(sessionDetail?.startingLatitude) ??
      normalizeCoordinate(sessionLocationData?.startingLatitude) ??
      sessionLocationCoords.lat;
    const longParam =
      normalizeCoordinate(getStringParam(params.pickupLong)) ??
      normalizeCoordinate(sessionDetail?.startingLongtitude) ??
      normalizeCoordinate(sessionLocationData?.startingLongtitude) ??
      sessionLocationCoords.long;

    return {
      name:
        nameParam ||
        sessionDetail?.displayStartLocationName ||
        sessionLocationData?.displayStartLocationName ||
        "",
      lat: latParam,
      long: longParam,
    };
  }, [params, sessionDetail, sessionLocationData, sessionLocationCoords]);

  const dropoffDetails = useMemo(() => {
    const nameParam = getStringParam(params.dropoffName);
    const latParam =
      normalizeCoordinate(getStringParam(params.dropoffLat)) ??
      normalizeCoordinate(sessionDetail?.endingLatitude) ??
      normalizeCoordinate(sessionLocationData?.endingLatitude) ??
      sessionLocationCoords.lat;
    const longParam =
      normalizeCoordinate(getStringParam(params.dropoffLong)) ??
      normalizeCoordinate(sessionDetail?.endingLongtitude) ??
      normalizeCoordinate(sessionLocationData?.endingLongtitude) ??
      sessionLocationCoords.long;

    return {
      name:
        nameParam ||
        sessionDetail?.displayEndLocationName ||
        sessionLocationData?.displayEndLocationName ||
        "",
      lat: latParam,
      long: longParam,
    };
  }, [params, sessionDetail, sessionLocationData, sessionLocationCoords]);

  const fallbackRoutesData = useMemo(() => {
    return null;
  }, []);

  const effectiveRoutesData = routesData ?? fallbackRoutesData;
  // Ensure routePoints is always an array
  const routePoints = Array.isArray(effectiveRoutesData) ? effectiveRoutesData : [];

  const fallbackSegments = useMemo(() => {
    if (
      pickupDetails.lat === undefined ||
      pickupDetails.long === undefined ||
      dropoffDetails.lat === undefined ||
      dropoffDetails.long === undefined
    ) {
      return [];
    }

    return [
      {
        coordinates: [
          { latitude: pickupDetails.lat, longitude: pickupDetails.long },
          { latitude: dropoffDetails.lat, longitude: dropoffDetails.long },
        ],
        distance: "N/A",
        duration: "N/A",
      },
    ];
  }, [
    pickupDetails.lat,
    pickupDetails.long,
    dropoffDetails.lat,
    dropoffDetails.long,
  ]);

  const effectiveRouteSegments =
    routeSegments.length > 0 ? routeSegments : fallbackSegments;

  const mapStartLat = pickupDetails.lat;
  const mapStartLong = pickupDetails.long;
  const hasValidStartCoords =
    typeof mapStartLat === "number" && typeof mapStartLong === "number";

  // Check if should show map for Planning status (Instructor can view route)
  const isPlanningStatus =
    sessionDetail?.status === SessionStatus.Planning ||
    session?.status === SessionStatus.Planning;
  const shouldShowMapForPlanning =
    hasValidStartCoords &&
    role === UserRole.Instructor &&
    isPlanningStatus;

  useEffect(() => {
    if (!sessionId || typeof sessionId !== "string") return;

    let isMounted = true;

    const loadRoutes = async () => {
      try {
        setIsLoadingRoutes(true);
        const response = await dispatch(getSessionRoutes({ sessionId })).unwrap();

        let routes: ISessionRoutes[] | null = null;
        if (Array.isArray(response)) {
          routes = response;
        } else if (response?.value && Array.isArray(response.value)) {
          routes = response.value;
        } else if ((response as any)?.isSuccess && (response as any)?.value && Array.isArray((response as any).value)) {
          routes = (response as any).value;
        }

        if (!isMounted) return;

        if (routes && routes.length > 0) {
          setRoutesData(routes);
        } else {
          setRoutesData(null);
        }

        const startLat = pickupDetails.lat;
        const startLng = pickupDetails.long;
        if (startLat !== undefined && startLng !== undefined) {
          const routesToUse = routes || [];
          await fetchGoongDirections(routesToUse, startLat, startLng);
        } else {
          setRouteSegments([]);
        }
      } catch (error) {
        if (isMounted) {
          setRoutesData(null);
          setRouteSegments([]);
          Alert.alert("Lỗi", "Không thể tải thông tin lộ trình");
        }
      } finally {
        if (isMounted) {
          setIsLoadingRoutes(false);
        }
      }
    };

    loadRoutes();

    return () => {
      isMounted = false;
    };
  }, [sessionId, dispatch]);

  useEffect(() => {

    const startLat = pickupDetails.lat;
    const startLng = pickupDetails.long;

    const dataForDirections = routesData ?? [];

    fetchGoongDirections(dataForDirections, startLat, startLng);
  }, [routesData, GOONG_API_KEY, pickupDetails.lat, pickupDetails.long, sessionDetail?.endingLatitude, sessionDetail?.endingLongtitude]);



  return (
    <View style={styles.container}>
      <HeaderList actionReturnScreen={ROUTES.MY_PACKAGES as any} title="Chi tiết buổi tập lái" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {(sessionDetail || effectiveRoutesData) && (
          <View style={styles.routeCard}>
            <Text style={styles.sectionTitle}>
              Lộ trình buổi tập lái
            </Text>

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
            <SessionRouteList
              routePoints={routePoints}
              sessionDetail={sessionDetail}
            />

            {/* Session Actions */}
            <SessionActions
              sessionId={sessionId}
              displaySession={displaySession}
              onCancelPress={() => {
                setCancelNote("");
                setSelectedReasons([]);
                setShowCancelModal(true);
              }}
            />

            {/* Actions */}

          </View>
        )}

        {/* Map Section - Display independently when coordinates are available */}
        {/* Show map for: 1) Valid coords, or 2) Instructor with Planning status */}
        {(hasValidStartCoords || shouldShowMapForPlanning) && (
          <View style={styles.routeCard}>
            <Text style={styles.mapTitle}>Bản đồ lộ trình</Text>

            {/* Planning Status Badge for Instructor */}
            {shouldShowMapForPlanning && (
              <View style={[styles.statusBadge, { backgroundColor: "#fef3c7", marginBottom: 12 }]}>
                <Text style={[styles.statusText, { color: "#d97706" }]}>
                  Trạng thái: Đang lên kế hoạch - Nhấn vào bản đồ để thêm các điểm lộ trình
                </Text>
              </View>
            )}

            {/* Simulation Controls - Show if route exists, user is instructor, and session is upcoming */}
            {effectiveRouteSegments.length > 0 &&
              role === UserRole.Instructor &&
              (sessionDetail?.status === SessionStatus.Upcoming || session?.status === SessionStatus.Upcoming) && (
                <SimulationControls
                  isSimulating={isSimulating}
                  simulationProgress={simulationProgress}
                  currentPosition={currentPosition}
                  onStart={startSimulation}
                  onStop={stopSimulation}
                />
              )}

            {/* Map View */}
            <SessionMapView
              startLat={mapStartLat!}
              startLong={mapStartLong!}
              endLat={dropoffDetails.lat}
              endLong={dropoffDetails.long}
              routePoints={routePoints}
              routeSegments={effectiveRouteSegments}
              currentPosition={currentPosition}
              isSimulating={isSimulating}
              mapRef={mapRef}
              onMapPress={handleMapPress}
              selectedRoutePoints={selectedRoutePoints}
              enableMapPress={shouldShowMapForPlanning}
            />

            {/* Selected Route Points List (Planning mode) */}
            {shouldShowMapForPlanning && selectedRoutePoints.length > 0 && (
              <View style={styles.selectedPointsContainer}>
                <Text style={styles.selectedPointsTitle}>
                  Các điểm đã chọn ({selectedRoutePoints.length})
                </Text>
                {selectedRoutePoints.map((point, index) => (
                  <View key={point.id} style={styles.selectedPointItem}>
                    <View style={styles.selectedPointNumber}>
                      <Text style={styles.selectedPointNumberText}>
                        {point.order}
                      </Text>
                    </View>
                    <View style={styles.selectedPointInfo}>
                      <Text style={styles.selectedPointAddress}>
                        {point.streetName || "Đường không xác định"}
                      </Text>
                      <Text style={styles.selectedPointCoords}>
                        {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removePointButton}
                      onPress={() => {
                        setSelectedRoutePoints((prev) =>
                          prev.filter((p) => p.id !== point.id).map((p, idx) => ({
                            ...p,
                            order: idx + 1,
                          }))
                        );
                      }}
                    >
                      <Text style={styles.removePointButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.clearAllButton}
                  onPress={() => setSelectedRoutePoints([])}
                >
                  <Text style={styles.clearAllButtonText}>Xóa tất cả</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Route Actions - Only show for Novice Driver */}
            {routesData && role === UserRole.NoviceDriver && routesData.length > 0 && (
              <RouteActions
                onAccept={() => {
                  setRouteDecision("accepted");
                  // await handelUpdate(sessionId);
                }}
                onReject={() => {
                  setRouteDecision("rejected");
                }}
              />
            )}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Cancel confirmation modal */}
      <CancelSessionModal
        visible={showCancelModal}
        cancelNote={cancelNote}
        selectedReasons={selectedReasons}
        isCancelling={isCancelling}
        canCancel={canCancelNow()}
        cancellationReasons={cancellationReasons}
        onClose={() => {
          setShowCancelModal(false);
          setCancelNote("");
          setSelectedReasons([]);
        }}
        onNoteChange={setCancelNote}
        onToggleReason={toggleReason}
        onConfirm={handleCancelSession}
      />
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
  locationDetailsContainer: {
    marginTop: 12,
    gap: 12,
  },
  locationDetailCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#f8fafc",
  },
  locationDetailLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 4,
  },
  locationDetailName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  locationCoordsText: {
    marginTop: 4,
    fontSize: 12,
    color: "#94a3b8",
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
  routeFetchCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  routeFetchTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  routeFetchDesc: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 16,
  },
  routeFetchButton: {
    alignSelf: "flex-start",
    backgroundColor: AppColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  routeFetchButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
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
  // Selected Route Points (Planning mode)
  selectedPointsContainer: {
    marginTop: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectedPointsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  selectedPointItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectedPointNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedPointNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.white,
  },
  selectedPointInfo: {
    flex: 1,
  },
  selectedPointAddress: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  selectedPointCoords: {
    fontSize: 12,
    color: "#64748b",
  },
  removePointButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  removePointButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },
  clearAllButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#ef4444",
    borderRadius: 8,
    alignItems: "center",
  },
  clearAllButtonText: {
    color: AppColors.white,
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
