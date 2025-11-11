import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from "react-native";
import { Clock, Plus, Minus, Edit3 } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";

interface IInstructorBookedSession {
  id: string;
  startTime: string; // ISO format
  endTime: string; // ISO format
  status: number;
}

interface Step2Props {
  selectedStartTime: string;
  selectedDuration: number; // in hours
  onStartTimeSelect: (time: string) => void;
  onDurationChange: (duration: number) => void;
  maxDuration?: number;
  selectedDate?: string | null;
  instructorBookedSessions?: IInstructorBookedSession[];
  busyTimes?: { startTime: string; endTime: string }[];
}

// Popular time slots for quick selection
const popularTimeSlots = [
  "07:00", "08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "17:00"
];

// Generate time options in 30-minute intervals
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 6; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeString);
    }
  }
  return times;
};

const calculateEndTime = (startTime: string, duration: number): string => {
  if (!startTime) return "00:00";
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration * 60;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

const isTimeSlotAvailable = (time: string, busyTimes: { startTime: string; endTime: string }[]): boolean => {
  if (!busyTimes || busyTimes.length === 0) return true;

  const [targetHours, targetMinutes] = time.split(':').map(Number);
  const targetTotalMinutes = targetHours * 60 + targetMinutes;

  for (const busySlot of busyTimes) {
    const [busyStartHours, busyStartMinutes] = busySlot.startTime.split(':').map(Number);
    const [busyEndHours, busyEndMinutes] = busySlot.endTime.split(':').map(Number);

    const busyStartTotalMinutes = busyStartHours * 60 + busyStartMinutes;
    const busyEndTotalMinutes = busyEndHours * 60 + busyEndMinutes;

    if (targetTotalMinutes >= busyStartTotalMinutes && targetTotalMinutes < busyEndTotalMinutes) {
      return false; // Time slot conflicts with busy time
    }
  }

  return true;
};

// Helper to convert ISO to time string
const getTimeFromISO = (isoString: string): string => {
  const date = new Date(isoString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// Helper to get date from ISO
const getDateFromISO = (isoString: string): string => {
  return isoString.split('T')[0];
};

export default function Step2({
  selectedStartTime,
  selectedDuration,
  onStartTimeSelect,
  onDurationChange,
  maxDuration = 40,
  selectedDate = null,
  instructorBookedSessions = [],
  busyTimes = [],
}: Step2Props) {
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [customTime, setCustomTime] = useState(selectedStartTime || "");
  const [customDuration, setCustomDuration] = useState<string>("");

  // Update customTime when selectedStartTime changes from Step1
  useEffect(() => {
    if (selectedStartTime) {
      setCustomTime(selectedStartTime);
    }
  }, [selectedStartTime]);

  // Merge busy times from mock data and API booked sessions
  const allBusyTimes = React.useMemo(() => {
    const merged = [...busyTimes];
    
    if (selectedDate && instructorBookedSessions.length > 0) {
      const bookedForDate = instructorBookedSessions.filter(session => {
        const sessionDate = getDateFromISO(session.startTime);
        return sessionDate === selectedDate;
      });
      
      bookedForDate.forEach(session => {
        merged.push({
          startTime: getTimeFromISO(session.startTime),
          endTime: getTimeFromISO(session.endTime)
        });
      });
    }
    
    return merged;
  }, [busyTimes, instructorBookedSessions, selectedDate]);

  const timeOptions = generateTimeOptions();

  const handleIncreaseDuration = () => {
    if (selectedDuration < maxDuration) {
      onDurationChange(selectedDuration + 0.5);
      setCustomDuration(""); // Clear custom input when using +/- buttons
    }
  };

  const handleDecreaseDuration = () => {
    if (selectedDuration > 0.5) {
      onDurationChange(selectedDuration - 0.5);
      setCustomDuration(""); // Clear custom input when using +/- buttons
    }
  };

  const handleCustomTimeSubmit = () => {
    // Validate time format HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(customTime)) {
      if (isTimeSlotAvailable(customTime, allBusyTimes)) {
        onStartTimeSelect(customTime);
        setShowTimeInput(false);
      }
    }
  };

  const handleCustomDurationSubmit = () => {
    const duration = parseFloat(customDuration);
    if (!isNaN(duration) && duration > 0 && duration <= maxDuration) {
      onDurationChange(duration);
      setCustomDuration(""); // Clear after submit
    }
  };

  const quickDurationOptions = [1, 2, 3, 4, 5, 6, 8];

  return (
    <>
      {/* Time Selection - Optional change if needed */}
      {selectedStartTime && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={24} color={AppColors.primary} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Giờ bắt đầu đã chọn</Text>
          </View>
          <View style={styles.selectedTimeInfo}>
            <Text style={styles.selectedTimeText}>{selectedStartTime}</Text>
            <Text style={styles.selectedTimeNote}>
              (Đã chọn từ bước trước - có thể thay đổi)
            </Text>
          </View>
        </View>
      )}

      {/* Time Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={24} color={AppColors.primary} strokeWidth={2} />
          <Text style={styles.sectionTitle}>
            {selectedStartTime ? "Thay đổi giờ bắt đầu (tùy chọn)" : "Chọn giờ bắt đầu"}
          </Text>
        </View>
        <Text style={styles.sectionDesc}>
          {selectedStartTime
            ? "Nếu muốn, bạn có thể thay đổi giờ bắt đầu"
            : "Chọn thời gian bắt đầu hoặc nhập giờ tùy ý"}
        </Text>

        {/* Custom Time Input */}
        <View style={styles.customTimeContainer}>
          <TouchableOpacity
            style={styles.customTimeToggle}
            onPress={() => setShowTimeInput(!showTimeInput)}
          >
            <Edit3 size={16} color={AppColors.primary} strokeWidth={2} />
            <Text style={styles.customTimeToggleText}>
              {showTimeInput ? "Đóng nhập giờ" : "Nhập giờ tùy ý"}
            </Text>
          </TouchableOpacity>

          {showTimeInput && (
            <View style={styles.customTimeInputContainer}>
              <TextInput
                style={styles.customTimeInput}
                value={customTime}
                onChangeText={setCustomTime}
                placeholder="HH:MM (vd: 08:30)"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                maxLength={5}
              />
              <TouchableOpacity
                style={styles.customTimeSubmit}
                onPress={handleCustomTimeSubmit}
              >
                <Text style={styles.customTimeSubmitText}>OK</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Popular Time Slots */}
        <View style={styles.timeSlotsSection}>
          <Text style={styles.timeSlotsTitle}>Thời gian phổ biến:</Text>
          <View style={styles.popularTimesGrid}>
            {popularTimeSlots.map((time) => {
              const isAvailable = isTimeSlotAvailable(time, allBusyTimes);
              return (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    selectedStartTime === time && styles.timeSlotActive,
                    !isAvailable && styles.timeSlotUnavailable,
                  ]}
                  onPress={() => isAvailable && onStartTimeSelect(time)}
                  disabled={!isAvailable}
                >
                  <Text style={[
                    styles.timeText,
                    selectedStartTime === time && styles.timeTextActive,
                    !isAvailable && styles.timeTextUnavailable,
                  ]}>
                    {time}
                  </Text>
                  {!isAvailable && (
                    <Text style={styles.unavailableText}>Bận</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* All Time Options */}
        <View style={styles.allTimesSection}>
          <Text style={styles.allTimesTitle}>Tất cả thời gian:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.allTimesScroll}
            contentContainerStyle={styles.allTimesContent}
          >
            {timeOptions.map((time) => {
              const isAvailable = isTimeSlotAvailable(time, allBusyTimes);
              return (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.smallTimeSlot,
                    selectedStartTime === time && styles.smallTimeSlotActive,
                    !isAvailable && styles.smallTimeSlotUnavailable,
                  ]}
                  onPress={() => isAvailable && onStartTimeSelect(time)}
                  disabled={!isAvailable}
                >
                  <Text style={[
                    styles.smallTimeText,
                    selectedStartTime === time && styles.smallTimeTextActive,
                    !isAvailable && styles.smallTimeTextUnavailable,
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
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

          {/* Custom Duration Input */}
          <View style={styles.customDurationSection}>
            <Text style={styles.customDurationLabel}>Nhập thời lượng tùy chỉnh (giờ):</Text>
            <View style={styles.customDurationInputContainer}>
              <TextInput
                style={styles.customDurationInput}
                value={customDuration}
                onChangeText={setCustomDuration}
                placeholder="VD: 25.5"
                placeholderTextColor="#94a3b8"
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                style={[
                  styles.customDurationButton,
                  customDuration && styles.customDurationButtonActive,
                ]}
                onPress={handleCustomDurationSubmit}
                disabled={!customDuration}
              >
                <Text
                  style={[
                    styles.customDurationButtonText,
                    customDuration && styles.customDurationButtonTextActive,
                  ]}
                >
                  OK
                </Text>
              </TouchableOpacity>
            </View>
            {selectedDuration > 0 && (
              <View style={styles.selectedDurationDisplay}>
                <Clock size={16} color={AppColors.primary} strokeWidth={2} />
                <Text style={styles.selectedDurationText}>
                  Đã chọn: {selectedDuration} giờ
                </Text>
              </View>
            )}
          </View>

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
            <Text style={styles.quickDurationsTitle}>Hoặc chọn nhanh:</Text>
            <View style={styles.quickDurationsGrid}>
              {quickDurationOptions.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.quickDurationButton,
                    selectedDuration === duration && styles.quickDurationButtonActive,
                  ]}
                  onPress={() => {
                    onDurationChange(duration);
                    setCustomDuration(""); // Clear custom input when selecting from quick buttons
                  }}
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
  selectedTimeInfo: {
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#86efac",
    alignItems: "center",
  },
  selectedTimeText: {
    fontSize: 24,
    fontWeight: "800",
    color: AppColors.primary,
    marginBottom: 4,
  },
  selectedTimeNote: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
  },
  customTimeContainer: {
    marginBottom: 20,
  },
  customTimeToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignSelf: "flex-start",
  },
  customTimeToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.primary,
  },
  customTimeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  customTimeInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },
  customTimeSubmit: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: AppColors.primary,
    borderRadius: 8,
  },
  customTimeSubmitText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  timeSlotsSection: {
    marginBottom: 20,
  },
  timeSlotsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 12,
  },
  popularTimesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeSlot: {
    width: "22%",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    alignItems: "center",
    position: "relative",
  },
  timeSlotActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + "15",
  },
  timeSlotUnavailable: {
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    opacity: 0.7,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  timeTextActive: {
    color: AppColors.primary,
  },
  timeTextUnavailable: {
    color: "#ef4444",
  },
  unavailableText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ef4444",
    position: "absolute",
    bottom: 4,
  },
  allTimesSection: {
    marginBottom: 16,
  },
  allTimesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 12,
  },
  allTimesScroll: {
    marginHorizontal: -24,
  },
  allTimesContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  smallTimeSlot: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    minWidth: 60,
    alignItems: "center",
  },
  smallTimeSlotActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + "15",
  },
  smallTimeSlotUnavailable: {
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    opacity: 0.7,
  },
  smallTimeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  smallTimeTextActive: {
    color: AppColors.primary,
  },
  smallTimeTextUnavailable: {
    color: "#ef4444",
  },
  customDurationSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  customDurationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  customDurationInputContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  customDurationInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1e293b",
    backgroundColor: "#f8fafc",
  },
  customDurationButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  customDurationButtonActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  customDurationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  customDurationButtonTextActive: {
    color: "#ffffff",
  },
  selectedDurationDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  selectedDurationText: {
    fontSize: 14,
    fontWeight: "600",
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
    marginBottom: 24,
  },
  quickDurationsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 12,
  },
  quickDurationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickDurationButton: {
    minWidth: 60,
    flexBasis: "20%",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
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
