import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  cancelSession,
  getAllSessions,
  ICancelSessionRequest,
  getSessionDetail,
  saveSessionRoutes,
  updateSessionStatus,
} from "@/features/booking/bookingThunk";
import { ISessionRoutes } from "@/models/route/route";
import { IBookingSession, SessionStatus, ISessionDetailResponse } from "@/models/booking/booking";
import { UserRole } from "@/models/enum/UserRole.enum";
import { ROUTES } from "@/constants/routes";
import HeaderList from "@/components/Commons/HeaderList";
import SessionRouteList from "@/components/Session/SessionRouteList";
import CancelSessionModal from "@/components/Session/CancelSessionModal";
import { RootState } from "@/lib/redux/store";
import { useSessionMap } from "@/lib/map/useSessionMap";
import SessionMap from "@/components/Session/SessionMap";
import { parseCoordinateValue } from "@/lib/map/mapUtils";
import { AlertVariant, AppAlert } from "@/components/Commons/AppAlert";

export default function DrivingSessionDetailScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams();
  const sessionId = params.sessionId;
  const status = params.status;
  const displayStartLocationName = params.displayStartLocationName;
  const startingLatitude = params.startingLatitude;
  const startingLongtitude = params.startingLongtitude;
  const duration = params.duration;
  const displayEndLocationName = params.displayEndLocationName;
  const endingLatitude = params.endingLatitude;
  const endingLongtitude = params.endingLongtitude;

  useEffect(() => {
    console.log("🔎 DrivingSessionDetail params:", params);
  }, [params]);


  const allSessions = userPackagesData.flatMap((p) => p.sessions || []);
  const localSession = allSessions.find((s) => s.id === sessionId);
  const [remoteSession, setRemoteSession] = useState<IBookingSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const session = remoteSession ?? localSession ?? null;
  const sessionLocationData = session as any;

  const [sessionDetail, setSessionDetail] = useState<ISessionDetailResponse | null>(null);
  const [routesData, setRoutesData] = useState<ISessionRoutes[] | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  // Goong API Keys
  const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY;

  const userRole = useAppSelector((state: RootState) => state.auth.user?.role ?? null);
  const isInstructor = userRole === UserRole.Instructor;
  const isNoviceDriver = userRole === UserRole.NoviceDriver;

  const normalizeParamValue = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;



  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  // New states for API calls
  const [cancelNote, setCancelNote] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSavingRoutes, setIsSavingRoutes] = useState(false);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertVariant, setAlertVariant] = useState<AlertVariant>(AlertVariant.Info);
  const [alertPrimaryButton, setAlertPrimaryButton] = useState<{ label: string; onPress?: () => void } | undefined>(undefined);

  const parseSessionStartDate = () => {
    if (!displaySession) return null;
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


  const displaySession = useMemo(() => {
    if (session) {
      return {
        ...session,
        date: displayStartLocationName || (session as any).date,
        startTime: startingLongtitude || (session as any).startTime,
        endTime: displayEndLocationName || (session as any).endTime,
        location: endingLatitude || (session as any).location,
        instructorName: endingLongtitude || (session as any).instructorName,
        duration: duration || (session as any).duration,
      };
    }

    if (
      displayStartLocationName ||
      startingLongtitude ||
      displayEndLocationName ||
      endingLatitude ||
      endingLongtitude ||
      duration
    ) {
      return {
        id: sessionId || "temp-session",
        date: displayStartLocationName || new Date().toISOString(),
        startTime: startingLongtitude || "--:--",
        endTime: displayEndLocationName || "--:--",
        location:
          endingLatitude || sessionLocationData?.displayStartLocationName || "",
        instructorName: endingLongtitude || "",
        duration: duration ?? 0,
        vehicleName: sessionLocationData?.vehicleName || "",
      } as any;
    }

    return null;
  }, [
    session,
    displayStartLocationName,
    startingLongtitude,
    displayEndLocationName,
    endingLatitude,
    endingLongtitude,
    duration,
    sessionId,
    sessionLocationData?.vehicleName,
  ]);

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

  const pickupDetails = useMemo(() => {
    // Ưu tiên lấy từ params, nếu không có thì lấy từ sessionDetail
    const lat = normalizeParamValue(startingLatitude) ||
      (sessionDetail?.startingLatitude ? String(sessionDetail.startingLatitude) : null);
    const long = normalizeParamValue(startingLongtitude) ||
      (sessionDetail?.startingLongtitude ? String(sessionDetail.startingLongtitude) : null);

    return {
      name:
        displayStartLocationName ||
        sessionDetail?.displayStartLocationName ||
        sessionLocationData?.displayStartLocationName ||
        "",
      lat: lat,
      long: long,
    };
  }, [displayStartLocationName, sessionDetail, sessionLocationData, startingLatitude, startingLongtitude]);
  const dropoffDetails = useMemo(() => {
    return {
      lat: normalizeParamValue(startingLatitude),
      long: normalizeParamValue(startingLongtitude),
    };
  }, [startingLatitude, startingLongtitude]);
  const endDetails = useMemo(() => {
    const sessionEndLat = parseCoordinateValue(sessionDetail?.endingLatitude as any);
    const sessionEndLong = parseCoordinateValue(sessionDetail?.endingLongtitude as any);
    const paramEndLat = parseCoordinateValue(endingLatitude as any);
    const paramEndLong = parseCoordinateValue(endingLongtitude as any);

    return {
      lat: sessionEndLat ?? paramEndLat ?? null,
      long: sessionEndLong ?? paramEndLong ?? null,
    };
  }, [
    sessionDetail?.endingLatitude,
    sessionDetail?.endingLongtitude,
    endingLatitude,
    endingLongtitude,
  ]);

  const fallbackRoutesData = useMemo(() => {
    return null;
  }, []);

  const effectiveRoutesData = routesData ?? fallbackRoutesData;
  // Ensure routePoints is always an array
  const routePoints = Array.isArray(effectiveRoutesData) ? effectiveRoutesData : [];

  const durationFromParams = duration ? Number(duration) : null;
  const allowedDurationMinutes = useMemo(() => {
    const normalizeDuration = (value: number | null | undefined) => {
      if (typeof value === "number" && !Number.isNaN(value) && value > 0) {
        // duration hiện đang tính theo giờ -> đổi sang phút
        return value * 60;
      }
      return null;
    };

    const fromParams = normalizeDuration(durationFromParams);
    if (fromParams !== null) {
      return fromParams;
    }

    const detailDuration = normalizeDuration(
      Number((displaySession as any)?.duration)
    );
    if (detailDuration !== null) {
      return detailDuration;
    }

    return null;
  }, [durationFromParams, displaySession]);

  // Lấy tọa độ bắt đầu: ưu tiên từ pickupDetails, nếu không có thì lấy từ route đầu tiên
  const mapStartLat = useMemo(() => {
    const fromPickup = parseCoordinateValue(pickupDetails.lat as any);
    if (fromPickup !== null) return fromPickup;
    if (routesData && routesData.length > 0) {
      return parseCoordinateValue(routesData[0].latitudeStart as any);
    }
    return null;
  }, [pickupDetails.lat, routesData]);

  const mapStartLong = useMemo(() => {
    const fromPickup = parseCoordinateValue(pickupDetails.long as any);
    if (fromPickup !== null) return fromPickup;
    if (routesData && routesData.length > 0) {
      return parseCoordinateValue(routesData[0].longitudeStart as any);
    }
    return null;
  }, [pickupDetails.long, routesData]);

  const hasValidStartCoords =
    typeof mapStartLat === "number" && typeof mapStartLong === "number";

  const currentSessionStatus = (sessionDetail?.status ??
    session?.status) as SessionStatus | undefined;
  const isPlanningStatus = currentSessionStatus === SessionStatus.Planning;
  const isInProgressStatus = currentSessionStatus === SessionStatus.Upcoming;

  const allowInstructorRoutePlanning =
    Boolean(isInstructor && isPlanningStatus && hasValidStartCoords);
  const allowNoviceApproval = Boolean(isNoviceDriver && isPlanningStatus);

  // Hiển thị map cho instructor khi planning hoặc cho novice driver khi cần xem route để chấp nhận/từ chối
  const shouldShowMapForPlanning = allowInstructorRoutePlanning ||
    (allowNoviceApproval && Boolean(routesData && routesData.length > 0));
  const sessionStatusForMap =
    (currentSessionStatus ?? SessionStatus.Planning) as SessionStatus;

  const {
    mapRef,
    selectedRoutePoints,
    setSelectedRoutePoints,
    handleMapPress,
    updateSelectedPointLocation,
    effectiveRouteSegments,
    isSimulating,
    simulationProgress,
    currentPosition,
    startSimulation,
    stopSimulation,
  } = useSessionMap({
    sessionId,
    sessionDetail,
    routesData,
    pickupDetails,
    dropoffDetails,
    endDetails,
    shouldShowMapForPlanning,
    goongApiKey: GOONG_API_KEY,
    maxDurationMinutes: allowedDurationMinutes ?? undefined,
  });

  // Kiểm tra nếu instructor đã có route và đang chờ chấp nhận
  const hasExistingRoutes = Boolean(routesData && routesData.length > 0);
  const isInstructorWaitingApproval = Boolean(
    isInstructor &&
    isPlanningStatus &&
    hasExistingRoutes &&
    selectedRoutePoints.length === 0
  );

  const handleSelectedPointDrag = useCallback(
    (
      pointId: string,
      coords: { latitude: number; longitude: number }
    ) => {
      updateSelectedPointLocation(pointId, coords.latitude, coords.longitude);
    },
    [updateSelectedPointLocation]
  );

  const handleSaveRoutes = useCallback(async () => {
    if (!sessionId || typeof sessionId !== "string") {
      Alert.alert("Lỗi", "Không tìm thấy thông tin buổi tập.");
      return;
    }

    if (selectedRoutePoints.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất một điểm trên bản đồ.");
      return;
    }

    try {
      setIsSavingRoutes(true);
      const payload = selectedRoutePoints.map((point, index) => ({
        textInstruction: point.streetName || `Điểm ${index + 1}`,
        streetName: point.streetName || `Điểm ${index + 1}`,
        latitudeStart: point.latitude,
        longitudeStart: point.longitude,
      }));

      await dispatch(
        saveSessionRoutes({
          sessionId,
          body: payload,
        })
      ).unwrap();

      setAlertTitle("Thành công");
      setAlertMessage("Đã lưu lộ trình buổi tập.");
      setAlertVariant(AlertVariant.Success);
      setAlertPrimaryButton({
        label: "OK",
        onPress: () => {
          setAlertVisible(false);
          router.back();
        },
      });
      setAlertVisible(true);
    } catch (error) {
      const message =
        typeof error === "string" ? error : "Không thể lưu lộ trình";
      setAlertTitle("Lỗi");
      setAlertMessage(message);
      setAlertVariant(AlertVariant.Error);
      setAlertPrimaryButton({
        label: "OK",
        onPress: () => setAlertVisible(false),
      });
      setAlertVisible(true);
    } finally {
      setIsSavingRoutes(false);
    }
  }, [dispatch, selectedRoutePoints, sessionId, router]);

  const canShowSimulationControls =
    isInstructor && isInProgressStatus && effectiveRouteSegments.length > 0;

  const canShowRouteActions =
    allowNoviceApproval && Boolean(routesData && routesData.length > 0);

  // Xử lý chấp nhận lộ trình
  const handleAcceptRoute = useCallback(async () => {
    if (!sessionId || typeof sessionId !== "string") {
      setAlertTitle("Lỗi");
      setAlertMessage("Không tìm thấy thông tin buổi tập.");
      setAlertVariant(AlertVariant.Error);
      setAlertPrimaryButton({
        label: "OK",
        onPress: () => setAlertVisible(false),
      });
      setAlertVisible(true);
      return;
    }

    try {
      // Gọi API cập nhật trạng thái session thành Upcoming
      await dispatch(
        updateSessionStatus({
          sessionId,
          status: SessionStatus.Upcoming,
        })
      ).unwrap();

      // Refresh session detail để cập nhật trạng thái mới
      await dispatch(getSessionDetail({ sessionId })).unwrap();

      setAlertTitle("Thành công");
      setAlertMessage("Đã chấp nhận lộ trình thành công");
      setAlertVariant(AlertVariant.Success);
      setAlertPrimaryButton({
        label: "OK",
        onPress: () => {
          setAlertVisible(false);
          router.back();
        },
      });
      setAlertVisible(true);
    } catch (error) {
      console.error("Error accepting route:", error);
      const message =
        typeof error === "string" ? error : "Không thể chấp nhận lộ trình";
      setAlertTitle("Lỗi");
      setAlertMessage(message);
      setAlertVariant(AlertVariant.Error);
      setAlertPrimaryButton({
        label: "OK",
        onPress: () => setAlertVisible(false),
      });
      setAlertVisible(true);
    }
  }, [sessionId, dispatch, router]);

  // Xử lý từ chối lộ trình
  const handleRejectRoute = useCallback(async () => {
    if (!sessionId || typeof sessionId !== "string") {
      Alert.alert("Lỗi", "Không tìm thấy thông tin buổi tập.");
      return;
    }

    try {
      // TODO: Gọi API từ chối lộ trình
      Alert.alert("Thông báo", "Đã từ chối lộ trình");
      // Refresh session detail
      const response = await dispatch(getSessionDetail({ sessionId })).unwrap();
      // Có thể cần reload lại trang hoặc cập nhật state
    } catch (error) {
      console.error("Error rejecting route:", error);
      Alert.alert("Lỗi", "Không thể từ chối lộ trình");
    }
  }, [sessionId, dispatch]);

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

      } catch (error) {
        if (isMounted) {
          setRoutesData(null);
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



  return (
    <View style={styles.container}>
      <HeaderList actionReturnScreen={ROUTES.MY_PACKAGES as any} title="Chi tiết buổi tập lái" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SessionRouteList
          routePoints={routePoints}
          sessionDetail={sessionDetail}
          status={sessionDetail?.status as SessionStatus}
          sessionId={sessionId}
          displaySession={displaySession}
          onCancelPress={() => {
            setCancelNote("");
            setSelectedReasons([]);
            setShowCancelModal(true);
          }}
          showRouteCard
        />

        <SessionMap
          mapStartLat={mapStartLat}
          mapStartLong={mapStartLong}
          status={sessionStatusForMap}
          endDetails={endDetails}
          routePoints={routePoints}
          routeSegments={effectiveRouteSegments}
          mapRef={mapRef}
          currentPosition={currentPosition}
          isSimulating={isSimulating}
          simulationProgress={simulationProgress}
          onStartSimulation={startSimulation}
          onStopSimulation={stopSimulation}
          onMapPress={allowInstructorRoutePlanning && !isInstructorWaitingApproval ? handleMapPress : undefined}
          selectedRoutePoints={selectedRoutePoints}
          setSelectedRoutePoints={setSelectedRoutePoints}
          enableMapPress={allowInstructorRoutePlanning && !isInstructorWaitingApproval}
          showPlanningList={allowInstructorRoutePlanning && !isInstructorWaitingApproval}
          showSimulationControls={canShowSimulationControls}
          showRouteActions={canShowRouteActions}
          onRouteAccept={handleAcceptRoute}
          onRouteReject={handleRejectRoute}
          onSaveRoute={
            allowInstructorRoutePlanning ? handleSaveRoutes : undefined
          }
          isSavingRoute={isSavingRoutes}
          onSelectedPointDrag={
            allowInstructorRoutePlanning ? handleSelectedPointDrag : undefined
          }
          hasExistingRoutes={hasExistingRoutes}
          isInstructorWaitingApproval={isInstructorWaitingApproval}
        />


        <View style={{ height: 24 }} />
      </ScrollView>

      <CancelSessionModal
        visible={showCancelModal}
        cancelNote={cancelNote}
        selectedReasons={selectedReasons}
        isCancelling={isCancelling}
        canCancel={canCancelNow()}
        onClose={() => {
          setShowCancelModal(false);
          setCancelNote("");
          setSelectedReasons([]);
        }}
        onNoteChange={setCancelNote}
        onToggleReason={toggleReason}
        onConfirm={handleCancelSession}
      />

      <AppAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        variant={alertVariant}
        primaryButton={alertPrimaryButton}
        onDismiss={() => setAlertVisible(false)}
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
