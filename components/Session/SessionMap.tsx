import React, { MutableRefObject, useCallback, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { SessionStatus } from "@/models/booking/booking";
import { ISessionRoutes } from "@/models/route/route";
import SimulationControls from "./SimulationControls";
import RouteActions from "./RouteActions";
import { AppColors } from "@/constants/Colors";
import { SelectedRoutePoint } from "@/lib/map/useSessionMap";
import { parseCoordinateValue } from "@/lib/map/mapUtils";
import { MapViewModel } from "@/viewmodels/map/MapViewModel";
import { Car } from "lucide-react-native";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { SessionViewModel } from "@/viewmodels/session/SessionViewModel";

interface SessionMapProps {
  status?: SessionStatus;
  endDetails: { lat: number | null; long: number | null };
  routePoints: ISessionRoutes[];
  routeSegments: Array<{
    coordinates: Array<{ latitude: number; longitude: number }>;
    distance: string;
    duration: string;
  }>;
  mapRef: MutableRefObject<MapView | null>;
  currentPosition: {
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
  } | null;
  isSimulating: boolean;
  simulationProgress: number;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onMapPress?: (event: any) => void;
  selectedRoutePoints: SelectedRoutePoint[];
  setSelectedRoutePoints: React.Dispatch<
    React.SetStateAction<SelectedRoutePoint[]>
  >;
  enableMapPress: boolean;
  showPlanningList: boolean;
  showSimulationControls: boolean;
  showRouteActions: boolean;
  onRouteAccept: () => void;
  onRouteReject: () => void;
  onSaveRoute?: () => void;
  isSavingRoute?: boolean;
  onSelectedPointDrag?: (
    pointId: string,
    coords: { latitude: number; longitude: number }
  ) => void;
  hasExistingRoutes?: boolean;
  isInstructorWaitingApproval?: boolean;
}



export default function SessionMap({
  status,
  endDetails,
  routePoints,
  routeSegments,
  mapRef,
  currentPosition,
  isSimulating,
  simulationProgress,
  onStartSimulation,
  onStopSimulation,
  onMapPress,
  selectedRoutePoints,
  setSelectedRoutePoints,
  enableMapPress,
  showPlanningList,
  showSimulationControls,
  showRouteActions,
  onRouteAccept,
  onRouteReject,
  onSaveRoute,
  isSavingRoute,
  onSelectedPointDrag,
  hasExistingRoutes = false,
  isInstructorWaitingApproval = false,
}: SessionMapProps) {



  const internalMapRef = useRef<MapView>(null);
  const finalMapRef = mapRef ?? internalMapRef;

  const mapViewModel = useMemo(() => new MapViewModel(), []);

  const handleRemovePoint = useCallback(
    (pointId: string) => {
      setSelectedRoutePoints(mapViewModel.handleRemovePoint(pointId));
    },
    [mapViewModel, setSelectedRoutePoints]
  );

  const [sessionState,] = useViewModel(SessionViewModel, (state) => state.session);

  const endingCoordinates = useMemo(() => {
    const lat = sessionState?.sessionDetail?.endingLatitude;
    const long = sessionState?.sessionDetail?.endingLongtitude;
    if (typeof lat === 'number' && typeof long === 'number' && !isNaN(lat) && !isNaN(long)) {
      return { latitude: lat, longitude: long };
    }
    return null;
  }, [sessionState?.sessionDetail?.endingLatitude, sessionState?.sessionDetail?.endingLongtitude]);

  const startingCoordinates = useMemo(() => {
    const lat = sessionState?.sessionDetail?.startingLatitude;
    const long = sessionState?.sessionDetail?.startingLongtitude;
    if (typeof lat === 'number' && typeof long === 'number' && !isNaN(lat) && !isNaN(long)) {
      return { latitude: lat, longitude: long };
    }
    return null;
  }, [sessionState?.sessionDetail?.startingLatitude, sessionState?.sessionDetail?.startingLongtitude]);

  const allowDirectMapPress = enableMapPress;
  const hasEndPoint =
    endingCoordinates !== null ||
    (typeof endDetails.lat === "number" && typeof endDetails.long === "number");
  const hasDistinctEndPoint =
    hasEndPoint &&
    endingCoordinates !== null;
  const shouldRenderRoute =
    routeSegments.length > 0 ||
    (hasExistingRoutes && isInstructorWaitingApproval) ||
    !(allowDirectMapPress && selectedRoutePoints.length === 0);

  const getRoutePointName = useCallback(
    (point: ISessionRoutes, index: number) => {
      if (point.streetName && point.streetName.trim().length > 0) {
        return point.streetName.trim();
      }
      if (
        (point as any).textInstruction &&
        String((point as any).textInstruction).trim().length > 0
      ) {
        return String((point as any).textInstruction).trim();
      }
      return `Điểm ${index + 1}`;
    },
    []
  );

  const segmentLabels = useMemo(() => {
    const labels: Array<{ start: string; end: string }> = [];
    let currentStart = "Điểm bắt đầu";

    const basePoints = routePoints.map((point, index) => ({
      name: getRoutePointName(point, index),
    }));

    const plannedPoints = allowDirectMapPress
      ? selectedRoutePoints.map((point, index) => ({
        name: point.streetName?.trim() || `Điểm mới ${index + 1}`,
      }))
      : [];

    const combinedPoints: Array<{ name: string }> = [
      ...basePoints,
      ...plannedPoints,
    ];

    combinedPoints.forEach((point) => {
      labels.push({
        start: currentStart,
        end: point.name,
      });
      currentStart = point.name;
    });

    if (hasDistinctEndPoint) {
      labels.push({
        start: currentStart,
        end: "Điểm kết thúc",
      });
    }

    return labels;
  }, [
    routePoints,
    getRoutePointName,
    hasDistinctEndPoint,
    selectedRoutePoints,
  ]);

  const legendItems = useMemo(
    () => [
      { label: "Điểm bắt đầu", color: "green" },
      { label: "Điểm lộ trình", color: "blue" },
      ...(hasDistinctEndPoint ? [{ label: "Điểm kết thúc", color: "red" }] : []),
    ],
    [hasDistinctEndPoint]
  );

  return (
    <View style={styles.routeCard}>
      <View style={styles.headerRow}>
        <Text style={styles.mapTitle}>Bản đồ lộ trình</Text>
        {allowDirectMapPress && onSaveRoute && !isInstructorWaitingApproval && (
          <TouchableOpacity
            style={[
              styles.saveButton,
              (isSavingRoute || selectedRoutePoints.length === 0) &&
              styles.saveButtonDisabled,
            ]}
            onPress={onSaveRoute}
            disabled={isSavingRoute || selectedRoutePoints.length === 0}
          >
            {isSavingRoute ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Đề xuất lộ trình</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
      {allowDirectMapPress && (
        <View style={styles.editHintContainer}>
          <Text style={styles.editHintTitle}>
            {isInstructorWaitingApproval && hasExistingRoutes
              ? "Đang chờ chấp nhận lộ trình"
              : "Đang xét lộ trình"}
          </Text>
          <Text style={styles.editHint}>
            {isInstructorWaitingApproval && hasExistingRoutes
              ? "Lộ trình đã được đề xuất và đang chờ học viên chấp nhận."
              : "Chạm lên bản đồ để thêm điểm, kéo thả để tinh chỉnh vị trí trước khi gửi."}
          </Text>
        </View>
      )}

      {showSimulationControls && (
        <SimulationControls
          isSimulating={isSimulating}
          simulationProgress={simulationProgress}
          currentPosition={currentPosition}
          onStart={onStartSimulation}
          onStop={onStopSimulation}
        />
      )}

      <View style={styles.mapContainer}>
        <MapView
          showsTraffic={true}
          ref={finalMapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          showsUserLocation={false}
          showsMyLocationButton={false}
          initialRegion={{
            latitude: sessionState.sessionDetail?.startingLatitude as number,
            longitude: sessionState.sessionDetail?.startingLongtitude as number,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          mapType="standard"
          onPress={allowDirectMapPress ? onMapPress : undefined}
        >
          {startingCoordinates && (
            <Marker
              coordinate={startingCoordinates}
              title="Điểm bắt đầu"
              description={sessionState?.sessionDetail?.displayStartLocationName || "Điểm bắt đầu"}
              pinColor="green"
            />
          )}

          {endingCoordinates && (
            <Marker
              coordinate={endingCoordinates}
              title="Điểm kết thúc"
              description={sessionState?.sessionDetail?.displayEndLocationName || "Điểm kết thúc"}
              pinColor="red"
            />
          )}

          {routePoints.map((point, index) => {
            const markerLat = parseCoordinateValue(point.latitudeStart as any);
            const markerLong = parseCoordinateValue(point.longitudeStart as any);
            if (markerLat === null || markerLong === null) {
              return null;
            }
            return (
              <Marker
                key={point.id}
                coordinate={{
                  latitude: markerLat,
                  longitude: markerLong,
                }}
                title={`Điểm ${index + 2}`}
                description={point.streetName}
                pinColor="blue"
              />
            );
          })}

          {selectedRoutePoints.map((point) => (
            <Marker
              key={point.id}
              coordinate={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
              title={`Điểm ${point.order + routePoints.length + 1}`}
              description={point.streetName || "Điểm mới"}
              pinColor="orange"
              draggable={allowDirectMapPress}
              onDragEnd={
                allowDirectMapPress && onSelectedPointDrag
                  ? (e) =>
                    onSelectedPointDrag(point.id, e.nativeEvent.coordinate)
                  : undefined
              }
            />
          ))}

          {!endingCoordinates && hasEndPoint && typeof endDetails.lat === "number" && typeof endDetails.long === "number" && (
            <Marker
              coordinate={{
                latitude: endDetails.lat,
                longitude: endDetails.long,
              }}
              title="Điểm kết thúc"
              pinColor="red"
            />
          )}

          {shouldRenderRoute &&
            routeSegments.map((segment, index) => (
              <Polyline
                key={`segment-${index}`}
                coordinates={segment.coordinates}
                strokeColor={AppColors.primary}
                strokeWidth={4}
              />
            ))}

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
        <View style={styles.legendContainer}>
          {legendItems.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  {
                    backgroundColor: item.color,
                  },
                ]}
              />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
          <View style={styles.legendItem}>
            <View style={styles.legendLinePlanning} />
            <Text style={styles.legendText}>Lộ trình đề xuất</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendLineCompleted} />
            <Text style={styles.legendText}>Lộ trình đã đi</Text>
          </View>
        </View>

        {shouldRenderRoute && routeSegments.length > 0 && (
          <View style={styles.routeInfoContainer}>
            <Text style={styles.routeInfoTitle}>Thông tin lộ trình:</Text>
            {routeSegments.map((segment, index) => {
              const label = segmentLabels[index];
              return (
                <View key={`segment-info-${index}`} style={styles.routeInfoRow}>
                  <View style={styles.routeInfoIndex}>
                    <Text style={styles.routeInfoIndexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.routeInfoContent}>
                    <Text style={styles.routeInfoLabel}>
                      {label?.start ?? "Điểm trước"}
                    </Text>
                    <Text style={styles.routeInfoArrow}>↓</Text>
                    <Text style={styles.routeInfoLabel}>
                      {label?.end ?? "Điểm kế tiếp"}
                    </Text>
                    <Text style={styles.routeInfoMeta}>
                      {segment.distance} • {segment.duration}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

      </View>

      {showPlanningList && allowDirectMapPress && selectedRoutePoints.length > 0 && (
        <View style={styles.selectedPointsContainer}>
          <Text style={styles.selectedPointsTitle}>
            Các điểm đã chọn ({selectedRoutePoints.length})
          </Text>
          {selectedRoutePoints.map((point) => (
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
                onPress={() => handleRemovePoint(point.id)}
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

      {showRouteActions && (
        <RouteActions onAccept={onRouteAccept} onReject={onRouteReject} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  mapTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  editHintContainer: {
    backgroundColor: "#f0fdf4",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: 12,
  },
  editHintTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#14532d",
    marginBottom: 4,
  },
  editHint: {
    fontSize: 12,
    color: "#166534",
    lineHeight: 18,
  },
  mapContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  map: {
    height: 260,
    width: "100%",
  },
  placeholderOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 13,
    color: "#1f2937",
    textAlign: "center",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
    alignItems: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  legendLinePlanning: {
    width: 30,
    height: 3,
    backgroundColor: AppColors.yellow,
    borderRadius: 2,
  },
  legendLineCompleted: {
    width: 30,
    height: 3,
    backgroundColor: AppColors.primary,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
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
  routeInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  routeInfoIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  routeInfoIndexText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  routeInfoContent: {
    flex: 1,
  },
  routeInfoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  routeInfoArrow: {
    fontSize: 12,
    color: "#94a3b8",
    marginVertical: 2,
  },
  routeInfoMeta: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  saveButtonText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: "700",
  },
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
});

