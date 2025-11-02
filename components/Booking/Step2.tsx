import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Clock, Plus, Minus } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";

interface Step2Props {
  selectedStartTime: string;
  selectedDuration: number; // in hours
  onStartTimeSelect: (time: string) => void;
  onDurationChange: (duration: number) => void;
  maxDuration?: number;
}

const timeSlots = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00"
];

const calculateEndTime = (startTime: string, duration: number): string => {
  if (!startTime) return "00:00";
  const [hours, minutes] = startTime.split(':').map(Number);
  const endHours = hours + duration;
  return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export default function Step2({
  selectedStartTime,
  selectedDuration,
  onStartTimeSelect,
  onDurationChange,
  maxDuration = 8,
}: Step2Props) {
  const handleIncreaseDuration = () => {
    if (selectedDuration < maxDuration) {
      onDurationChange(selectedDuration + 0.5);
    }
  };

  const handleDecreaseDuration = () => {
    if (selectedDuration > 0.5) {
      onDurationChange(selectedDuration - 0.5);
    }
  };

  return (
    <>
      {/* Time Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={24} color={AppColors.primary} strokeWidth={2} />
          <Text style={styles.sectionTitle}>Chọn giờ bắt đầu</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Chọn thời gian bắt đầu cho buổi học của bạn
        </Text>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.timeScroll}
          contentContainerStyle={styles.timeContent}
        >
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlot,
                selectedStartTime === time && styles.timeSlotActive,
              ]}
              onPress={() => onStartTimeSelect(time)}
            >
              <Text style={[
                styles.timeText,
                selectedStartTime === time && styles.timeTextActive,
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Duration Selection */}
      {selectedStartTime && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={24} color={AppColors.primary} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Chọn thời lượng</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Tùy chỉnh thời lượng buổi học (tối đa {maxDuration} giờ)
          </Text>

          {/* Duration Control */}
          <View style={styles.durationControl}>
            <TouchableOpacity
              style={[
                styles.durationButton,
                selectedDuration <= 0.5 && styles.durationButtonDisabled,
              ]}
              onPress={handleDecreaseDuration}
              disabled={selectedDuration <= 0.5}
            >
              <Minus
                size={24}
                color={selectedDuration <= 0.5 ? "#cbd5e1" : AppColors.primary}
                strokeWidth={3}
              />
            </TouchableOpacity>

            <View style={styles.durationDisplay}>
              <Text style={styles.durationValue}>{selectedDuration}</Text>
              <Text style={styles.durationUnit}>giờ</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.durationButton,
                selectedDuration >= maxDuration && styles.durationButtonDisabled,
              ]}
              onPress={handleIncreaseDuration}
              disabled={selectedDuration >= maxDuration}
            >
              <Plus
                size={24}
                color={selectedDuration >= maxDuration ? "#cbd5e1" : AppColors.primary}
                strokeWidth={3}
              />
            </TouchableOpacity>
          </View>

          {/* Quick Duration Buttons */}
          <View style={styles.quickDurations}>
            {[1, 1.5, 2, 2.5, 3].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.quickDurationButton,
                  selectedDuration === duration && styles.quickDurationButtonActive,
                ]}
                onPress={() => onDurationChange(duration)}
              >
                <Text
                  style={[
                    styles.quickDurationText,
                    selectedDuration === duration && styles.quickDurationTextActive,
                  ]}
                >
                  {duration}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Time Summary */}
          <View style={styles.timeSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Thời gian bắt đầu:</Text>
              <Text style={styles.summaryValue}>{selectedStartTime}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Thời gian kết thúc:</Text>
              <Text style={styles.summaryValue}>
                {calculateEndTime(selectedStartTime, selectedDuration)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng thời lượng:</Text>
              <Text style={[styles.summaryValue, { color: AppColors.primary, fontWeight: "800" }]}>
                {selectedDuration} giờ
              </Text>
            </View>
          </View>
        </View>
      )}
    </>
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  sectionDesc: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
    lineHeight: 20,
  },
  timeScroll: {
    marginHorizontal: -24,
  },
  timeContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    minWidth: 80,
    alignItems: "center",
  },
  timeSlotActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + "15",
  },
  timeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748b",
  },
  timeTextActive: {
    color: AppColors.primary,
  },
  durationControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 24,
  },
  durationButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: AppColors.primary,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  durationButtonDisabled: {
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  durationDisplay: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  durationValue: {
    fontSize: 56,
    fontWeight: "800",
    color: AppColors.primary,
    lineHeight: 64,
  },
  durationUnit: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginTop: -8,
  },
  quickDurations: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  quickDurationButton: {
    flex: 1,
    minWidth: 60,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  quickDurationButtonActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + "15",
  },
  quickDurationText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748b",
  },
  quickDurationTextActive: {
    color: AppColors.primary,
  },
  timeSummary: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "700",
  },
});
