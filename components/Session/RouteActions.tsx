import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { AppColors } from "@/constants/Colors";
import { AppAlert } from "../Commons/AppAlert";

interface RouteActionsProps {
  onAccept: () => void;
  onReject: () => void;
}

export default function RouteActions({
  onAccept,
  onReject,
}: RouteActionsProps) {
  const [showConfirmAccept, setShowConfirmAccept] = useState(false);
  const [showConfirmReject, setShowConfirmReject] = useState(false);


  return (
    <View style={styles.routeActions}>
      <TouchableOpacity
        style={styles.rejectButton}
        onPress={() => setShowConfirmReject(true)}
      >
        <Text style={styles.rejectButtonText}>Không đồng ý</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => setShowConfirmAccept(true)}
      >
        <Text style={styles.acceptButtonText}>Đồng ý</Text>
      </TouchableOpacity>

      <AppAlert
        visible={showConfirmAccept}
        title="Xác nhận lộ trình"
        message="Bạn có chắc chắn muốn chấp nhận lộ trình này?"
        primaryButton={{
          label: "Đồng ý",
          onPress: () => {
            setShowConfirmAccept(false);
            onAccept();
          },
        }}
        secondaryButton={{
          label: "Hủy",
          variant: "secondary",
          onPress: () => setShowConfirmAccept(false),
        }}
        onDismiss={() => setShowConfirmAccept(false)}
        closable={false}
      />

      <AppAlert
        visible={showConfirmReject}
        title="Từ chối lộ trình"
        message="Bạn không đồng ý với lộ trình đề xuất này?"
        primaryButton={{
          label: "Từ chối",
          onPress: () => {
            setShowConfirmReject(false);
            onReject();
          },
        }}
        secondaryButton={{
          label: "Hủy",
          variant: "secondary",
          onPress: () => setShowConfirmReject(false),
        }}
        onDismiss={() => setShowConfirmReject(false)}
        closable={false}
      />

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




