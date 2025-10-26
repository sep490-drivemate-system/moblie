import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CalendarDays, Repeat } from "lucide-react-native";
import { BookingMode } from "@/models/booking/booking";

interface Step1Props {
  bookingMode: BookingMode;
  onModeChange: (mode: BookingMode) => void;
}

export default function Step1({ bookingMode, onModeChange }: Step1Props) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chọn phương thức đặt lịch</Text>
      </View>
      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[
            styles.modeCard,
            bookingMode === "daily" && styles.modeCardActive,
          ]}
          onPress={() => onModeChange("daily")}
        >
          <View style={styles.modeIconContainer}>
            <CalendarDays
              size={32}
              color={bookingMode === "daily" ? "#667eea" : "#64748b"}
              strokeWidth={2}
            />
          </View>
          <Text
            style={[
              styles.modeText,
              bookingMode === "daily" && styles.modeTextActive,
            ]}
          >
            Theo ca trong ngày
          </Text>
          <Text style={styles.modeDesc}>
            Đặt lịch theo từng ngày cụ thể
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeCard,
            bookingMode === "recurring" && styles.modeCardActive,
          ]}
          onPress={() => onModeChange("recurring")}
        >
          <View style={styles.modeIconContainer}>
            <Repeat
              size={32}
              color={bookingMode === "recurring" ? "#667eea" : "#64748b"}
              strokeWidth={2}
            />
          </View>
          <Text
            style={[
              styles.modeText,
              bookingMode === "recurring" && styles.modeTextActive,
            ]}
          >
            Theo chu kỳ
          </Text>
          <Text style={styles.modeDesc}>Đặt lịch lặp lại theo tuần</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  modeContainer: {
    gap: 12,
  },
  modeCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    alignItems: "center",
  },
  modeCardActive: {
    borderColor: "#667eea",
    backgroundColor: "#f0f4ff",
  },
  modeIconContainer: {
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 4,
  },
  modeTextActive: {
    color: "#667eea",
  },
  modeDesc: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
  },
});