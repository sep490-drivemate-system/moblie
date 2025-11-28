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
  getAllSessions,
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
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { SessionViewModel } from "@/viewmodels/session/SessionViewModel";
import { ISessionDetailDTO } from "@/models/session/session.type";

export default function DrivingSessionDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sessionId = params.sessionId;
  const [sessionState, sessionViewModel] = useViewModel(SessionViewModel, (state) => state.session);


  const allSessions = userPackagesData.flatMap((p) => p.sessions || []);

  const localSession = allSessions.find((s) => s.id === sessionId);
  const [remoteSession, setRemoteSession] = useState<IBookingSession | null>(null);
  const session = remoteSession ?? localSession ?? null;
  const sessionLocationData = session as any;
  const [routesData, setRoutesData] = useState<ISessionRoutes[] | null>(null);

  const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY;

  const userRole = useAppSelector((state: RootState) => state.auth.user?.role ?? null);
  const isInstructor = userRole === UserRole.Instructor;
  const isNoviceDriver = userRole === UserRole.NoviceDriver;

  const normalizeParamValue = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  // Extract values from params or sessionDetail
  const startingLatitude = normalizeParamValue(params.startingLatitude as string | string[] | undefined);
  const startingLongtitude = normalizeParamValue(params.startingLongtitude as string | string[] | undefined);
  const displayStartLocationName = normalizeParamValue(params.displayStartLocationName as string | string[] | undefined);
  const endingLatitude = normalizeParamValue(params.endingLatitude as string | string[] | undefined);
  const endingLongtitude = normalizeParamValue(params.endingLongtitude as string | string[] | undefined);
  const displayEndLocationName = normalizeParamValue(params.displayEndLocationName as string | string[] | undefined);
  const duration = normalizeParamValue(params.duration as string | string[] | undefined);



  const [showCancelModal, setShowCancelModal] = useState(false);
  // New states for API calls
  const [isSavingRoutes, setIsSavingRoutes] = useState(false);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertVariant, setAlertVariant] = useState<AlertVariant>(AlertVariant.Info);
  const [alertPrimaryButton, setAlertPrimaryButton] = useState<{ label: string; onPress?: () => void } | undefined>(undefined);

  const displaySession = useMemo(() => {
    if (session) {
      return {
        ...session,
        date: sessionState.sessionDetail?.startTime ? new Date(sessionState.sessionDetail.startTime).toISOString().split('T')[0] : (session as any).date,
        startTime: sessionState.sessionDetail?.startTime || (session as any).startTime,
        endTime: sessionState.sessionDetail?.endTime || (session as any).endTime,
        location: sessionState.sessionDetail?.displayStartLocationName || (session as any).location,
        instructorName: (session as any).instructorName,
        duration: sessionState.sessionDetail ? undefined : (session as any).duration,
      };
    }

    if (sessionState.sessionDetail) {
      return {
        id: sessionId || "temp-session",
        date: sessionState.sessionDetail.startTime ? new Date(sessionState.sessionDetail.startTime).toISOString().split('T')[0] : new Date().toISOString(),
        startTime: sessionState.sessionDetail.startTime || "--:--",
        endTime: sessionState.sessionDetail.endTime || "--:--",
        location: sessionState.sessionDetail.displayStartLocationName || "",
        instructorName: "",
        duration: undefined,
        vehicleName: sessionLocationData?.vehicleName || "",
      } as any;
    }

    return null;
  }, [
    session,
    sessionState.sessionDetail,
    sessionId,
    sessionLocationData?.vehicleName,
  ]);

  useEffect(() => {
    sessionViewModel.getSessionDetail(sessionId as string);

  }, [sessionId, sessionViewModel]);

  const routesFromSessionDetail = useMemo(() => {
    if (sessionState.sessionDetail?.routeDetails !== undefined && sessionState.sessionDetail.routeDetails !== null) {
      if (sessionState.sessionDetail.routeDetails.length > 0) {
        return sessionState.sessionDetail.routeDetails.map((route, index) => ({
          id: `route-${index}`,
          sessionId: sessionId as string,
          textInstruction: route.textInstruction,
          streetName: route.streetName,
          latitudeStart: route.latitudeStart,
          longitudeStart: route.longitudeStart,
        })) as ISessionRoutes[];
      } else {
        return [];
      }
    }
    return null;
  }, [sessionState.sessionDetail?.routeDetails, sessionId]);

  useEffect(() => {
    if (!sessionId || typeof sessionId !== "string") return;

    if (routesFromSessionDetail !== null) {
      setRoutesData(routesFromSessionDetail);
      return;
    }

  }, [sessionId, dispatch, routesFromSessionDetail]);

  const pickupDetails = useMemo(() => {
    const lat = startingLatitude ||
      (sessionState.sessionDetail?.startingLatitude ? String(sessionState.sessionDetail.startingLatitude) : null);
    const long = startingLongtitude ||
      (sessionState.sessionDetail?.startingLongtitude ? String(sessionState.sessionDetail.startingLongtitude) : null);

    return {
      name:
        displayStartLocationName ||
        sessionState.sessionDetail?.displayStartLocationName ||
        sessionLocationData?.displayStartLocationName ||
        "",
      lat: lat,
      long: long,
    };
  }, [displayStartLocationName, sessionState.sessionDetail, sessionLocationData, startingLatitude, startingLongtitude]);
  const dropoffDetails = useMemo(() => {
    return {
      lat: startingLatitude,
      long: startingLongtitude,
    };
  }, [startingLatitude, startingLongtitude]);
  const endDetails = useMemo(() => {
    const sessionEndLat = sessionState.sessionDetail?.endingLatitude ? parseCoordinateValue(sessionState.sessionDetail.endingLatitude as any) : null;
    const sessionEndLong = sessionState.sessionDetail?.endingLongtitude ? parseCoordinateValue(sessionState.sessionDetail.endingLongtitude as any) : null;
    const paramEndLat = endingLatitude ? parseCoordinateValue(endingLatitude as any) : null;
    const paramEndLong = endingLongtitude ? parseCoordinateValue(endingLongtitude as any) : null;

    return {
      lat: sessionEndLat ?? paramEndLat ?? null,
      long: sessionEndLong ?? paramEndLong ?? null,
    };
  }, [
    sessionState.sessionDetail?.endingLatitude,
    sessionState.sessionDetail?.endingLongtitude,
    endingLatitude,
    endingLongtitude,
  ]);

  const fallbackRoutesData = useMemo(() => {
    return null;
  }, []);

  const effectiveRoutesData = routesData ?? fallbackRoutesData;
  const routePoints = Array.isArray(effectiveRoutesData) ? effectiveRoutesData : [];

  const durationFromParams = duration ? Number(duration) : null;
  const allowedDurationMinutes = useMemo(() => {
    const normalizeDuration = (value: number | null | undefined) => {
      if (typeof value === "number" && !Number.isNaN(value) && value > 0) {
        return value * 60;
      }
      return null;
    };

    const fromParams = normalizeDuration(durationFromParams);
    if (fromParams !== null) {
      return fromParams;
    }

    const sessionDuration = (session as any)?.duration;
    const detailDuration = normalizeDuration(Number(sessionDuration));
    if (detailDuration !== null) {
      return detailDuration;
    }

    return null;
  }, [durationFromParams, session]);

  const rawMapStartLat = useMemo(() => {
    const fromPickup = parseCoordinateValue(pickupDetails.lat as any);
    if (fromPickup !== null) return fromPickup;
    if (routesData && routesData.length > 0) {
      return parseCoordinateValue(routesData[0].latitudeStart as any);
    }
    return null;
  }, [pickupDetails.lat, routesData]);

  const rawMapStartLong = useMemo(() => {
    const fromPickup = parseCoordinateValue(pickupDetails.long as any);
    if (fromPickup !== null) return fromPickup;
    if (routesData && routesData.length > 0) {
      return parseCoordinateValue(routesData[0].longitudeStart as any);
    }
    return null;
  }, [pickupDetails.long, routesData]);


  const parseSessionStatus = (status: string | SessionStatus | undefined): SessionStatus | undefined => {
    if (!status) return undefined;
    if (typeof status === 'number') return status as SessionStatus;

    const statusMap: Record<string, SessionStatus> = {
      'Planning': SessionStatus.Planning,
      'Upcoming': SessionStatus.Upcoming,
      'InProgress': SessionStatus.InProgress,
      'Completed': SessionStatus.Completed,
      'Reschedule': SessionStatus.Reschedule,
      'Cancelled': SessionStatus.Cancelled,
    };

    return statusMap[status] ?? undefined;
  };

  useEffect(() => {
    if (sessionState.sessionDetail?.status) {
      parseSessionStatus(sessionState.sessionDetail.status);
    } else if (session?.status) {
      parseSessionStatus(session.status);
    }
  }, [sessionState.sessionDetail?.status, session?.status]);

  const currentSessionStatus = parseSessionStatus(sessionState.sessionDetail?.status ?? session?.status);
  const isPlanningStatus = currentSessionStatus === SessionStatus.Planning;
  const isUpcomingStatus = currentSessionStatus === SessionStatus.Upcoming;
  const isInProgressStatus = currentSessionStatus === SessionStatus.InProgress;

  const allowInstructorRoutePlanning =
    Boolean(isInstructor && isPlanningStatus);
  const allowNoviceApproval = Boolean(isNoviceDriver && isPlanningStatus);

  const shouldShowMapForPlanning = allowInstructorRoutePlanning ||
    (allowNoviceApproval && Boolean(routesData && routesData.length > 0));
  const sessionStatusForMap =
    (currentSessionStatus ?? SessionStatus.Planning) as SessionStatus;

  const handleSimulationComplete = useCallback(async () => {
    if (!sessionId || typeof sessionId !== "string") {
      return;
    }

    try {
      await dispatch(
        updateSessionStatus({
          sessionId,
          status: SessionStatus.Completed,
        })
      ).unwrap();

      await sessionViewModel.getSessionDetail(sessionId);

      setAlertTitle("Hoàn thành");
      setAlertMessage("Đã hoàn thành buổi tập lái này!");
      setAlertVariant(AlertVariant.Success);
      setAlertPrimaryButton({
        label: "OK",
        onPress: () => setAlertVisible(false),
      });
      setAlertVisible(true);
    } catch (error) {
      console.error("Error updating session status to Completed:", error);
      setAlertTitle("Hoàn thành");
      setAlertMessage("Đã hoàn thành buổi tập lái này!");
      setAlertVariant(AlertVariant.Success);
      setAlertPrimaryButton({
        label: "OK",
        onPress: () => setAlertVisible(false),
      });
      setAlertVisible(true);
    }
  }, [sessionId, dispatch]);

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
    sessionDetail: sessionState.sessionDetail,
    routesData,
    pickupDetails,
    dropoffDetails,
    endDetails,
    shouldShowMapForPlanning,
    goongApiKey: GOONG_API_KEY,
    maxDurationMinutes: allowedDurationMinutes ?? undefined,
    onSimulationComplete: handleSimulationComplete,
  });

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

      await sessionViewModel.saveSessionRoutes(sessionId as string, payload);

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
    isInstructor && (isInProgressStatus || isUpcomingStatus) && effectiveRouteSegments.length > 0;

  const handleStartSimulation = useCallback(async () => {
    if (!sessionId || typeof sessionId !== "string") {
      return;
    }

    if (currentSessionStatus !== SessionStatus.InProgress) {
      try {
        await dispatch(
          updateSessionStatus({
            sessionId,
            status: SessionStatus.InProgress,
          })
        ).unwrap();

        await sessionViewModel.getSessionDetail(sessionId);
      } catch (error) {
        console.error("Error updating session status:", error);
      }
    }

    // Bắt đầu simulation
    startSimulation();
  }, [sessionId, currentSessionStatus, dispatch, startSimulation]);

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
      await sessionViewModel.getSessionDetail(sessionId);

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
      await sessionViewModel.getSessionDetail(sessionId);
      // Có thể cần reload lại trang hoặc cập nhật state
    } catch (error) {
      console.error("Error rejecting route:", error);
      Alert.alert("Lỗi", "Không thể từ chối lộ trình");
    }
  }, [sessionId, dispatch]);


  return (
    <View style={styles.container}>
      <HeaderList actionReturnScreen={ROUTES.PROFILE as any} title="Chi tiết buổi tập lái" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SessionRouteList
          routePoints={routePoints}
          status={sessionState.sessionDetail?.status as SessionStatus}
          sessionId={sessionId}
          displaySession={displaySession}
          onCancelPress={() => setShowCancelModal(true)}
          showRouteCard
          isSimulating={isSimulating}
          simulationProgress={simulationProgress}
          currentPosition={currentPosition}
        />

        <SessionMap
          status={sessionStatusForMap}
          endDetails={endDetails}
          routePoints={routePoints}
          routeSegments={effectiveRouteSegments}
          mapRef={mapRef}
          currentPosition={currentPosition}
          isSimulating={isSimulating}
          simulationProgress={simulationProgress}
          onStartSimulation={handleStartSimulation}
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
        sessionId={typeof sessionId === "string" ? sessionId : null}
        onClose={() => setShowCancelModal(false)}
        onCancelled={() => router.back()}
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
