import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { AppColors } from "@/constants/Colors";

interface RouteActionsProps {
  onAccept: () => void;
  onReject: () => void;
}

export default function RouteActions({
  onAccept,
  onReject,
}: RouteActionsProps) {
  return (
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
                onPress: onReject,
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
                onPress: onAccept,
              },
            ]
          );
        }}
      >
        <Text style={styles.acceptButtonText}>Đồng ý lộ trình</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  routeActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
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
});




