import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Calendar } from "lucide-react-native";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "expo-router";
import { SessionStatus } from "@/models/booking/booking";

interface SessionActionsProps {
  status: SessionStatus;
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
}

export default function SessionActions({
  status,
  sessionId,
  instructorId,
  displaySession,
  onCancelPress,
}: SessionActionsProps) {
  const router = useRouter();

  // Nếu buổi tập đã hoàn thành thì không cho đổi lịch / hủy
  if (status === SessionStatus.Completed) {
    return null;
  }


  return (
    <View style={styles.sessionManagementControls}>
      <TouchableOpacity
        style={styles.rescheduleMapButton}
        onPress={() => {
          router.push({
            pathname: ROUTES.RESCHEDULE_SESSION as any,
            params: {
              sessionId: sessionId,
              instructorId: instructorId,
              instructorName: displaySession?.instructorName || "",
              date: displaySession?.date || "",
              startTime: displaySession?.startTime || "",
              duration: Number(displaySession?.duration) || 2,
              location: displaySession?.location || "",
            },
          });
        }}
      >
        <Calendar size={18} color="#fff" strokeWidth={2} />
        <Text style={styles.rescheduleMapButtonText}>Đổi lịch</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelMapButton}
        onPress={onCancelPress}
      >
        <Text style={styles.cancelMapButtonText}>Hủy buổi tập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});




