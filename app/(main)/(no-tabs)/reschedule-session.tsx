import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Check,
} from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { useAppDispatch } from "@/lib/redux/hooks";
import { rescheduleSession, IRescheduleSessionRequest } from "@/features/booking/bookingThunk";

export default function RescheduleSessionScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams();

  const sessionId = params.sessionId as string;
  const initialInstructor = (params.instructorName as string) || "";
  const initialDate = (params.date as string) || ""; // ISO-like string
  const initialStartTime = (params.startTime as string) || ""; // HH:mm
  const initialDuration = Number(params.duration || 2);
  const initialLocation = (params.location as string) || "";

  // Debug log để kiểm tra params
  console.log("🔍 Reschedule params:", {
    sessionId,
    instructorName: initialInstructor,
    date: initialDate,
    startTime: initialStartTime,
    duration: params.duration,
    parsedDuration: initialDuration,
    location: initialLocation
  });

  const [date, setDate] = useState<string>(initialDate);
  const [startTime, setStartTime] = useState<string>(initialStartTime);
  const [duration] = useState<number>(initialDuration);
  const [location] = useState<string>(initialLocation);
  const [selectedDate, setSelectedDate] = useState<string>("2025-11-06");
  const [current, setCurrent] = useState(new Date());
  const [customTime, setCustomTime] = useState<string>("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleNote, setRescheduleNote] = useState("");

  const computedEndTime = useMemo(() => {
    if (!startTime || !duration) return "";
    const [hStr, mStr] = String(startTime).split(":");
    let h = Number(hStr || 0);
    const m = Number(mStr || 0);
    h = (h + duration) % 24;
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    return `${pad(h)}:${pad(m)}`;
  }, [startTime, duration]);

  const onSave = async () => {
    if (!date || !startTime) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập ngày và giờ bắt đầu.");
      return;
    }

    if (!rescheduleNote.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập lý do đổi lịch.");
      return;
    }

    try {
      setIsRescheduling(true);

      // Create start datetime from selected date and time
      const startDateTime = new Date(date);
      const [hours, minutes] = startTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);

      // Calculate end datetime
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + (duration * 60));

      const rescheduleData: IRescheduleSessionRequest = {
        note: rescheduleNote.trim(),
        reschedule_start_time: startDateTime.toISOString(),
        reschedule_end_time: endDateTime.toISOString()
      };

      await dispatch(rescheduleSession({ sessionId, rescheduleData })).unwrap();

      Alert.alert(
        "Thành công", 
        "Đã gửi yêu cầu đổi lịch thành công. Vui lòng chờ xác nhận từ giảng viên.",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error("Error rescheduling session:", error);
      Alert.alert("Lỗi", error as string || "Không thể đổi lịch buổi tập lái");
    } finally {
      setIsRescheduling(false);
    }
  };

  const formatTime = (time: string) => time.replace(":", "h");

  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  };

  const timeSlots = useMemo(() => generateTimeSlots(), []);


  const isTimeSlotAvailable = (time: string): boolean => {
    // For now, all time slots are available
    // In production, you would check against real booking data
    return true;
  };

  const handleTimeSlotPress = (time: string) => {
    if (isTimeSlotAvailable(time)) {
      setStartTime(time);
      setCustomTime("");
    }
  };

  const handleCustomTimeSubmit = () => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(customTime)) return;
    if (isTimeSlotAvailable(customTime)) {
      setStartTime(customTime);
    }
  };
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayString = `${year}-${month}-${day}`;
    console.log("Setting selectedDate to:", todayString);
    setDate(todayString);
  }, []);

  const formatSelectedDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    console.log("Input dateString test:", dateString);
    console.log("Parsed date:", date);
    console.log(
      "Formatted date:",
      date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    );

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderCalendar = () => {
    const current = new Date();
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Calculate start date of calendar grid (Monday of the week containing first day)
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const days = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Header with day names
    const headerDays = dayNames.map((day) => (
      <View key={day} style={styles.dayHeader}>
        <Text style={styles.dayHeaderText}>{day}</Text>
      </View>
    ));

    // Generate calendar days
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const dayNum = String(currentDate.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${dayNum}`;

        const isCurrent = currentDate.getMonth() === current.getMonth();
        const isSelected = dateString === "2025-11-06";
        const dayNumber = currentDate.getDate();

        // For now, no special indicators for dates
        const hasBookings = false;
        const isBusy = false;

        weekDays.push(
          <TouchableOpacity
            key={dateString}
            style={[
              styles.dayButton,
              !isCurrent && styles.dayButtonOtherMonth,
              isSelected && styles.dayButtonSelected,
            ]}
            onPress={() => {
              console.log("Calendar day clicked - dateString:", dateString);
              console.log("Calendar day clicked - dayNumber:", dayNumber);
              setSelectedDate(dateString);
            }}
          >
            <Text
              style={[
                styles.dayText,
                !isCurrent && styles.dayTextOtherMonth,
                isSelected && styles.dayTextSelected,
              ]}
            >
              {dayNumber}
            </Text>
            <View style={styles.dayIndicators}>
              {hasBookings && <View style={styles.greenDot} />}
              {isBusy && <View style={styles.redDot} />}
            </View>
          </TouchableOpacity>
        );
      }
      days.push(
        <View key={week} style={styles.weekRow}>
          {weekDays}
        </View>
      );
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => {
              const newMonth = new Date(current);
              newMonth.setMonth(newMonth.getMonth() - 1);
              setCurrent(newMonth);
            }}
          >
            <ChevronLeft size={20} color={"#70E000"} />
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {current.toLocaleDateString("vi-VN", {
              month: "long",
              year: "numeric",
            })}
          </Text>

          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => {
              const newMonth = new Date(current);
              newMonth.setMonth(newMonth.getMonth() + 1);
              setCurrent(newMonth);
            }}
          >
            <ChevronRight size={20} color={"#70E000"} />
          </TouchableOpacity>
        </View>

        <View style={styles.dayHeaders}>{headerDays}</View>

        {days}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={AppColors.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dời lịch buổi tập lái</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin buổi tập lái</Text>

          <View style={styles.fieldRow}>
            <User size={18} color="#64748b" strokeWidth={2} />
            <Text style={styles.label}>Người hướng dẫn</Text>
            <Text style={styles.value} numberOfLines={1}>
              {initialInstructor}
            </Text>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldLabelRow}>
              <Calendar size={18} color="#64748b" strokeWidth={2} />
              <Text style={styles.fieldLabel}>Chọn ngày thuê</Text>
            </View>
            {renderCalendar()}
          </View>

          <View style={styles.field}>
            <View style={styles.fieldLabelRow}>
              <Clock size={18} color="#64748b" strokeWidth={2} />
              <Text style={styles.fieldLabel}>Chọn giờ bắt đầu</Text>
            </View>
            <View style={styles.customTimeSection}>
              <Text style={styles.customTimeLabel}>
                Nhập giờ bắt đầu (HH:MM):
              </Text>
              <View style={styles.customTimeInputContainer}>
                <TextInput
                  style={styles.customTimeInput}
                  value={customTime}
                  onChangeText={setCustomTime}
                  placeholder="VD: 08:30"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TouchableOpacity
                  style={{
                    ...styles.customTimeButton,
                    ...(customTime ? styles.customTimeButtonActive : {}),
                  }}
                  onPress={handleCustomTimeSubmit}
                  disabled={!customTime}
                >
                  <Text
                    style={{
                      ...styles.customTimeButtonText,
                      ...(customTime ? styles.customTimeButtonTextActive : {}),
                    }}
                  >
                    OK
                  </Text>
                </TouchableOpacity>
              </View>
              {startTime ? (
                <View style={styles.selectedTimeDisplay}>
                  <Check size={16} color={AppColors.primary} strokeWidth={3} />
                  <Text style={styles.selectedTimeText}>
                    Đã chọn: {formatTime(startTime)}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.quickSlotsTitle}>Hoặc chọn nhanh:</Text>
            <View style={styles.timeSlotsGrid}>
              {timeSlots.map((time) => {
                const available = isTimeSlotAvailable(time);
                const isSelected = startTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      available
                        ? styles.timeSlotAvailable
                        : styles.timeSlotBusy,
                      isSelected && styles.timeSlotSelected,
                    ]}
                    onPress={() => handleTimeSlotPress(time)}
                    disabled={!available}
                  >
                    {isSelected && (
                      <Check size={14} color="#ffffff" strokeWidth={3} />
                    )}
                    <Text
                      style={[
                        styles.timeSlotText,
                        available
                          ? styles.timeSlotTextAvailable
                          : styles.timeSlotTextBusy,
                        isSelected && styles.timeSlotTextSelected,
                      ]}
                    >
                      {formatTime(time)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldRow}>
            <Clock size={18} color="#64748b" strokeWidth={2} />
            <Text style={styles.label}>Thời lượng</Text>
            <Text style={styles.value}>{duration} giờ</Text>
          </View>

          <View style={styles.fieldRow}>
            <Clock size={18} color="#64748b" strokeWidth={2} />
            <Text style={styles.label}>Giờ kết thúc</Text>
            <Text style={styles.value}>{computedEndTime || "--:--"}</Text>
          </View>

          <View style={styles.fieldRow}>
            <MapPin size={18} color="#64748b" strokeWidth={2} />
            <Text style={styles.label}>Địa chỉ</Text>
            <Text style={styles.value} numberOfLines={2}>
              {location}
            </Text>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldLabel}>Lý do đổi lịch *</Text>
            </View>
            <TextInput
              style={styles.noteInput}
              placeholder="Nhập lý do chi tiết để đổi lịch buổi tập lái..."
              placeholderTextColor="#9ca3af"
              value={rescheduleNote}
              onChangeText={setRescheduleNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.saveBtn, isRescheduling && { opacity: 0.5 }]} 
              onPress={onSave}
              disabled={isRescheduling}
            >
              {isRescheduling ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Xác nhận dời lịch</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#1AD562",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: AppColors.white,
  },
  headerRight: { width: 40 },
  content: { flex: 1 },
  card: {
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
  field: { marginBottom: 12 },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  fieldLabel: { fontSize: 14, color: "#64748b", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  label: { fontSize: 14, color: "#64748b", fontWeight: "600" },
  value: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
  },
  actions: { marginTop: 16 },
  saveBtn: {
    backgroundColor: AppColors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: AppColors.white, fontSize: 14, fontWeight: "800" },
  // Time selection styles (aligned with Step1)
  customTimeSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  customTimeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  customTimeInputContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  customTimeInput: {
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
  customTimeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  customTimeButtonActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  customTimeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  customTimeButtonTextActive: {
    color: "#ffffff",
  },
  selectedTimeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  selectedTimeText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.primary,
  },
  quickSlotsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 12,
    marginTop: 8,
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  timeSlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 70,
    justifyContent: "center",
  },
  timeSlotAvailable: {
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4",
  },
  timeSlotBusy: {
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    opacity: 0.6,
  },
  timeSlotSelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary,
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: "600",
  },
  timeSlotTextAvailable: {
    color: "#16a34a",
  },
  timeSlotTextBusy: {
    color: "#ef4444",
  },
  timeSlotTextSelected: {
    color: "#ffffff",
  },
  // Calendar Styles
  calendarContainer: {
    backgroundColor: "#ffffff",
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#70E000",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  dayHeaders: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666666",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  dayButton: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
    borderRadius: 8,
    position: "relative",
  },
  dayButtonOtherMonth: {
    opacity: 0.3,
  },
  dayButtonSelected: {
    backgroundColor: AppColors.brandBlue,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  dayTextOtherMonth: {
    color: "#cccccc",
  },
  dayTextSelected: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  dayIndicators: {
    position: "absolute",
    bottom: 4,
    flexDirection: "row",
    gap: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2ed573",
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef4444",
  },

  // Legend Styles
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
  },
  legendGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2ed573",
    marginRight: 6,
  },
  legendRedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666666",
  },

  // Selected Date Container
  selectedDateContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginVertical: 8,
    marginBottom: 40,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Selected Date Header
  selectedDateHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginLeft: 8,
  },
  // Note Input
  noteInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
    minHeight: 80,
    marginBottom: 12,
  },
});
