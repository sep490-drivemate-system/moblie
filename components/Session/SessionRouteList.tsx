import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
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
  isSimulating?: boolean;
  simulationProgress?: number;
  currentPosition?: {
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
  } | null;
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
  isSimulating = false,
  simulationProgress = 0,
  currentPosition = null,
}: SessionRouteListProps) {
  if (!showRouteCard) {
    return null;
  }

  const statusDisplay = getStatusDisplay(status);

  // Tính toán điểm nào đã đi qua dựa trên simulationProgress
  // Tổng số điểm = 1 (điểm bắt đầu) + routePoints.length + 1 (điểm kết thúc)
  const totalPoints = 1 + routePoints.length + (sessionDetail?.displayEndLocationName ? 1 : 0);

  // Lưu lại số điểm đã đi qua tối đa để giữ dấu tích sau khi simulation kết thúc
  const maxCompletedPointsRef = useRef(0);

  // Tính số điểm đã đi qua dựa trên progress (0-100)
  const currentCompletedPoints = Math.floor((simulationProgress / 100) * totalPoints);

  // Cập nhật số điểm đã đi qua tối đa khi simulation đang chạy hoặc progress tăng
  useEffect(() => {
    if (isSimulating || currentCompletedPoints > maxCompletedPointsRef.current) {
      maxCompletedPointsRef.current = Math.max(maxCompletedPointsRef.current, currentCompletedPoints);
    }
  }, [isSimulating, currentCompletedPoints]);

  // Sử dụng số điểm đã đi qua tối đa để hiển thị dấu tích (giữ lại sau khi simulation kết thúc)
  // Khi bắt đầu simulation, điểm bắt đầu ngay lập tức có tích (ít nhất = 1)
  const completedPointsCount = isSimulating
    ? Math.max(1, currentCompletedPoints) // Đảm bảo ít nhất 1 điểm (điểm bắt đầu) khi đang simulation
    : maxCompletedPointsRef.current;

  // Kiểm tra điểm bắt đầu đã đi qua chưa
  // Điểm bắt đầu có tích ngay khi bắt đầu simulation hoặc đã đi qua
  const isStartPointCompleted = isSimulating || completedPointsCount > 0;

  // Kiểm tra các route points đã đi qua
  const getRoutePointCompleted = (index: number) => {
    // Điểm bắt đầu = 0, routePoints bắt đầu từ 1
    return completedPointsCount > index + 1;
  };

  // Kiểm tra điểm kết thúc đã đi qua chưa
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
        {/* Starting Point */}
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
                {sessionDetail?.displayStartLocationName}
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
        {sessionDetail?.displayEndLocationName && (
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




