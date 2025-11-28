import React, { useState, useEffect, useRef } from "react";
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
  status: SessionStatus;
  sessionId: string | string[] | undefined;
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
  currentPosition?: {
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
  } | null;
}

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
  displaySession,
  onCancelPress,
  showRouteCard,
  isSimulating = false,
  simulationProgress = 0,
}: SessionRouteListProps) {
  if (!showRouteCard) {
    return null;
  }


  const [sessionState,] = useViewModel(SessionViewModel, (state) => state.session);
  const statusDisplay = getStatusDisplay(status);

  const totalPoints = 1 + routePoints.length + (sessionState.sessionDetail?.displayEndLocationName ? 1 : 0);

  const maxCompletedPointsRef = useRef(0);

  const currentCompletedPoints = Math.floor((simulationProgress / 100) * totalPoints);

  useEffect(() => {
    if (isSimulating || currentCompletedPoints > maxCompletedPointsRef.current) {
      maxCompletedPointsRef.current = Math.max(maxCompletedPointsRef.current, currentCompletedPoints);
    }
  }, [isSimulating, currentCompletedPoints]);

  const completedPointsCount = isSimulating
    ? Math.max(1, currentCompletedPoints)
    : maxCompletedPointsRef.current;

  const isStartPointCompleted = isSimulating || completedPointsCount > 0;

  const getRoutePointCompleted = (index: number) => {
    return completedPointsCount > index + 1;
  };

  const isEndPointCompleted = completedPointsCount >= totalPoints;

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

        {/* Route Points */}
        {routePoints.map((point, index) => {
          const isCompleted = getRoutePointCompleted(index);
          return (
            <View key={point.id} style={styles.routePoint}>
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
                  <Text style={styles.pointAddress}>{point.streetName}</Text>
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
                    {routePoints.length + 2}
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

      <SessionActions
        sessionId={sessionId}
        displaySession={displaySession}
        onCancelPress={onCancelPress}
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
});




