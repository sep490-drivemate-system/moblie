import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AppColors } from "@/constants/Colors";
import { ISessionRoutes } from "@/models/route/route";
import { ISessionDetailResponse, SessionStatus } from "@/models/booking/booking";
import SessionActions from "./SessionActions";

interface SessionRouteListProps {
  routePoints: ISessionRoutes[];
  sessionDetail: ISessionDetailResponse | null;
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
}

const getStatusDisplay = (status?: SessionStatus) => {
  switch (status) {
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
  sessionDetail,
  status,
  sessionId,
  displaySession,
  onCancelPress,
  showRouteCard,
}: SessionRouteListProps) {
  if (!showRouteCard) {
    return null;
  }

  const statusDisplay = getStatusDisplay(status);

  return (
    <View style={styles.routeCard}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Lộ trình buổi tập lái</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusDisplay.color }]}>
          <Text style={styles.statusText}>{statusDisplay.text}</Text>
        </View>
      </View>

      <View style={styles.routePointsSection}>
        {/* Starting Point */}
        <View style={styles.routePoint}>
          <View style={styles.pointHeader}>
            <View
              style={[
                styles.pointNumber,
                status === SessionStatus.Planning && styles.pointNumberPrimary,
              ]}
            >
              <Text style={styles.pointNumberText}>1</Text>
            </View>
            <View style={styles.pointInfo}>
              <Text style={styles.pointAddress}>Điểm bắt đầu</Text>
              <Text style={styles.pointCoords}>
                {sessionDetail?.displayStartLocationName}
              </Text>
            </View>
          </View>
          <View style={styles.routeLine} />
        </View>

        {/* Route Points */}
        {routePoints.map((point, index) => (
          <View key={point.id} style={styles.routePoint}>
            <View style={styles.pointHeader}>
              <View style={styles.pointNumber}>
                <Text style={styles.pointNumberText}>{index + 2}</Text>
              </View>
              <View style={styles.pointInfo}>
                <Text style={styles.pointAddress}>{point.streetName}</Text>
              </View>
            </View>

            {index < routePoints.length - 1 && <View style={styles.routeLine} />}
          </View>
        ))}

        {/* Ending Point */}
        {sessionDetail?.displayEndLocationName && (
          <View style={styles.routePoint}>
            <View style={styles.pointHeader}>
              <View style={[styles.pointNumber, styles.pointNumberPrimary]}>
                <Text style={styles.pointNumberText}>
                  {routePoints.length + 2}
                </Text>
              </View>
              <View style={styles.pointInfo}>
                <Text style={styles.pointAddress}>Điểm kết thúc</Text>
                <Text style={styles.pointCoords}>
                  {sessionDetail?.displayEndLocationName}
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
  routeLine: {
    position: "absolute",
    left: 13,
    top: 28,
    bottom: -16,
    width: 2,
    backgroundColor: "#e5e7eb",
  },
});




