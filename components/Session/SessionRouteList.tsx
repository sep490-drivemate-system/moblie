import React, { useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { ISessionRoutes } from "@/models/route/route";
import { SessionStatus } from "@/models/booking/booking";
import SessionActions from "./SessionActions";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { SessionViewModel } from "@/viewmodels/session/SessionViewModel";

interface SessionRouteListProps {
  routePoints: ISessionRoutes[];
  status: SessionStatus | string | undefined;
  sessionId: string | string[] | undefined;
  instructorId: string | undefined;
  displaySession: {
    instructorName?: string;
    date?: string;
    startTime?: string;
    duration?: number;
    location?: string;
  } | null;
  onCancelPress: () => void;
  showRouteCard: boolean;
  isSimulating?: boolean;
  simulationProgress?: number;
  hideDirections?: boolean;
}

const parseSessionStatus = (status: string | SessionStatus | undefined): SessionStatus | undefined => {
  if (!status) return undefined;
  if (typeof status === "number") return status as SessionStatus;

  const normalized = String(status).trim().toLowerCase();
  const statusMap: Record<string, SessionStatus> = {
    planning: SessionStatus.Planning,
    pending: SessionStatus.Planning,
    pendingapproval: SessionStatus.Planning,
    pending_approval: SessionStatus.Planning,
    upcoming: SessionStatus.Upcoming,
    inprogress: SessionStatus.InProgress,
    in_progress: SessionStatus.InProgress,
    completed: SessionStatus.Completed,
    reschedule: SessionStatus.Reschedule,
    cancelled: SessionStatus.Cancelled,
  };

  return statusMap[normalized];
};

const getStatusDisplay = (status?: SessionStatus | string) => {
  const parsedStatus = parseSessionStatus(status);
  switch (parsedStatus) {
    case SessionStatus.Planning:
      return { text: "Lên lộ trình", color: "#3b82f6" };
    case SessionStatus.Upcoming:
      return { text: "Sắp diễn ra", color: "#10b981" };
    case SessionStatus.InProgress:
      return { text: "Đang diễn ra", color: "#10b981" };
    case SessionStatus.Completed:
      return { text: "Hoàn thành", color: "#6b7280" };
    case SessionStatus.Reschedule:
      return { text: "Đổi lịch", color: "#f59e0b" };
    case SessionStatus.Cancelled:
      return { text: "Đã hủy", color: "#9ca3af" };
    default:
      return { text: "Không xác định", color: "#94a3b8" };
  }
};

export default function SessionRouteList({
  routePoints,
  status,
  sessionId,
  instructorId,
  displaySession,
  onCancelPress,
  showRouteCard,
  isSimulating = false,
  simulationProgress = 0,
  hideDirections = false,
}: SessionRouteListProps) {
  if (!showRouteCard) {
    return null;
  }


  const [sessionState,] = useViewModel(SessionViewModel, (state) => state.session);
  const parsedStatus = parseSessionStatus(status);
  const statusDisplay = getStatusDisplay(status);

  // Lấy các điểm từ routeDetails nếu có, nếu không thì dùng routePoints
  const effectiveRoutePoints = useMemo(() => {
    if (sessionState?.sessionDetail?.routeDetails && sessionState.sessionDetail.routeDetails.length > 0) {
      // Chuyển đổi routeDetails thành format ISessionRoutes
      return sessionState.sessionDetail.routeDetails.map((point, index) => ({
        id: `route-detail-${index}`,
        sessionId: sessionId as string,
        textInstruction: point.textInstruction,
        streetName: point.streetName,
        latitudeStart: point.latitudeStart,
        longitudeStart: point.longitudeStart,
      })) as ISessionRoutes[];
    }
    return routePoints;
  }, [sessionState?.sessionDetail?.routeDetails, routePoints, sessionId]);

  const totalPoints = 1 + effectiveRoutePoints.length + (sessionState.sessionDetail?.displayEndLocationName ? 1 : 0);

  const maxCompletedPointsRef = useRef(0);

  const currentCompletedPoints = Math.floor((simulationProgress / 100) * totalPoints);

  useEffect(() => {
    if (isSimulating || currentCompletedPoints > maxCompletedPointsRef.current) {
      maxCompletedPointsRef.current = Math.max(maxCompletedPointsRef.current, currentCompletedPoints);
    }
    // Đảm bảo khi simulation hoàn thành (progress = 100), tất cả điểm đều được đánh dấu
    if (simulationProgress >= 100) {
      maxCompletedPointsRef.current = totalPoints;
    }
  }, [isSimulating, currentCompletedPoints, simulationProgress, totalPoints]);

  const completedPointsCount = isSimulating
    ? Math.max(1, currentCompletedPoints)
    : maxCompletedPointsRef.current;

  // Đảm bảo khi progress = 100, tất cả điểm đều completed
  const finalCompletedPoints = simulationProgress >= 100 ? totalPoints : completedPointsCount;

  const isStartPointCompleted = isSimulating || finalCompletedPoints > 0;

  const getRoutePointCompleted = (index: number) => {
    return finalCompletedPoints > index + 1;
  };

  const isEndPointCompleted = finalCompletedPoints >= totalPoints;

  return (
    <View style={styles.routeCard}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Lộ trình buổi tập lái</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusDisplay.color }]}>
          <Text style={styles.statusText}>{statusDisplay.text}</Text>
        </View>
      </View>

      <View style={styles.routePointsSection}>
        <View style={styles.routePoint}>
          <View style={styles.pointHeader}>
            <View
              style={[
                styles.pointNumber,
                (status === SessionStatus.Planning || (isSimulating && !isStartPointCompleted)) && styles.pointNumberPrimary,
                isStartPointCompleted && styles.pointNumberCompleted,
              ]}
            >
              {isStartPointCompleted ? (
                <Check size={16} color="#ffffff" strokeWidth={3} />
              ) : (
                <Text style={styles.pointNumberText}>1</Text>
              )}
            </View>
            <View style={styles.pointInfo}>
              <Text style={styles.pointAddress}>Điểm bắt đầu</Text>
              <Text style={styles.pointCoords}>
                {sessionState.sessionDetail?.displayStartLocationName}
              </Text>
            </View>
          </View>
        </View>

        {!hideDirections &&
          effectiveRoutePoints.map((point, index) => {
            const isCompleted = getRoutePointCompleted(index);
            return (
              <View key={point.id || `route-point-${index}`} style={styles.routePoint}>
                <View style={styles.pointHeader}>
                  <View style={[
                    styles.pointNumber,
                    isCompleted && styles.pointNumberCompleted,
                  ]}>
                    {isCompleted ? (
                      <Check size={16} color="#ffffff" strokeWidth={3} />
                    ) : (
                      <Text style={styles.pointNumberText}>{index + 2}</Text>
                    )}
                  </View>
                  <View style={styles.pointInfo}>
                    <Text style={styles.pointAddress}>
                      {point.streetName || point.textInstruction || `Điểm ${index + 2}`}
                    </Text>
                    {point.textInstruction && point.textInstruction !== point.streetName && (
                      <Text style={styles.pointCoords}>{point.textInstruction}</Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}

        {/* Ending Point */}
        {sessionState.sessionDetail?.displayEndLocationName && (
          <View style={styles.routePoint}>
            <View style={styles.pointHeader}>
              <View style={[
                styles.pointNumber,
                (!isSimulating || isEndPointCompleted) && styles.pointNumberPrimary,
                isEndPointCompleted && styles.pointNumberCompleted,
              ]}>
                {isEndPointCompleted ? (
                  <Check size={16} color="#ffffff" strokeWidth={3} />
                ) : (
                  <Text style={styles.pointNumberText}>
                    {effectiveRoutePoints.length + 2}
                  </Text>
                )}
              </View>
              <View style={styles.pointInfo}>
                <Text style={styles.pointAddress}>Điểm kết thúc</Text>
                <Text style={styles.pointCoords}>
                  {sessionState.sessionDetail?.displayEndLocationName}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* LogDetails khi buổi tập đã hoàn thành */}
      {sessionState.sessionDetail &&
        parseSessionStatus(sessionState.sessionDetail.status) === SessionStatus.Completed &&
        sessionState.sessionDetail.logDetails && (
          <View style={styles.logSection}>
            <Text style={styles.logTitle}>Nhật ký lộ trình</Text>
            {sessionState.sessionDetail.logDetails.map((log, index) => (
              <View key={`log-${index}`} style={styles.logRow}>
                <View style={styles.logIndex}>
                  <Text style={styles.logIndexText}>{index + 1}</Text>
                </View>
                <View style={styles.logInfo}>
                  <Text style={styles.logStreet}>
                    {log.streetName || "Địa điểm không xác định"}
                  </Text>
                  <Text style={styles.logMeta}>
                    {log.latitude.toFixed(5)}, {log.longitude.toFixed(5)} • {log.speed} km/h •{" "}
                    {log.heading}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

      <SessionActions
        status={parsedStatus ?? SessionStatus.Planning}
        sessionId={sessionId}
        instructorId={instructorId as string}
        displaySession={displaySession}
        onCancelPress={onCancelPress}
        isSimulating={isSimulating}
      />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
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
  pointNumberCompleted: {
    backgroundColor: "#10b981",
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
  pointCoords: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  logSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
    gap: 8,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 6,
  },
  logIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  logIndexText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  logInfo: {
    flex: 1,
  },
  logStreet: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  logMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
});




