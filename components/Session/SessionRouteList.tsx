import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AppColors } from "@/constants/Colors";
import { ISessionRoutes } from "@/models/route/route";
import { ISessionDetailResponse } from "@/models/booking/booking";

interface SessionRouteListProps {
  routePoints: ISessionRoutes[];
  sessionDetail: ISessionDetailResponse | null;
}

export default function SessionRouteList({
  routePoints,
  sessionDetail,
}: SessionRouteListProps) {
  return (
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
  );
}

const styles = StyleSheet.create({
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




