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
  Clock,
  MapPin,
  User,
  Check,
} from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { IRescheduleSessionRequest } from "@/features/booking/bookingThunk";
import Step1 from "@/components/Booking/Step1";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { SessionViewModel } from "@/viewmodels/session/SessionViewModel";
import { getUserIdFromToken } from "@/lib/jwt/tokenUtils";


export default function RescheduleSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [, sessionViewModel] = useViewModel(
    SessionViewModel,
    (state) => state.session
  );

  const sessionId = params.sessionId as string;
  const paramInstructorId = params.instructorId as string | undefined;

  const initialDate = (params.date as string) || ""; // ISO-like string
  const initialStartTime = (params.startTime as string) || ""; // HH:mm
  const initialDuration = Number(params.duration || 2);
  const initialLocation = (params.location as string) || "";


  const [date, setDate] = useState<string>(initialDate);
  const [startTime, setStartTime] = useState<string>(initialStartTime);
  const [duration, setDuration] = useState<number>(initialDuration);
  const [location] = useState<string>(initialLocation);
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate || null);
  const [effectiveInstructorId, setEffectiveInstructorId] = useState<string | null>(
    paramInstructorId ?? null
  );
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleNote, setRescheduleNote] = useState("");
  const [isFetchingInstructor, setIsFetchingInstructor] = useState(
    !paramInstructorId
  );

  useEffect(() => {
    if (effectiveInstructorId) {
      setIsFetchingInstructor(false);
      return;
    }

    (async () => {
      try {
        const userId = await getUserIdFromToken();
        if (userId) {
          setEffectiveInstructorId(userId);
        }
      } finally {
        setIsFetchingInstructor(false);
      }
    })();
  }, [effectiveInstructorId]);

  const buildStartDateTime = (): Date | null => {
    if (!startTime) return null;

    // Trường hợp startTime là ISO (ví dụ: 2025-12-22T02:00:00)
    const isoCandidate = new Date(startTime);
    if (!Number.isNaN(isoCandidate.getTime())) {
      return isoCandidate;
    }

    // Trường hợp startTime là HH:mm và có selected date
    if (!date) return null;
    const [yearStr, monthStr, dayStr] = String(date).split("-");
    const [hourStr, minuteStr] = String(startTime).split(":");

    const year = Number(yearStr);
    const month = Number(monthStr) - 1; // JS month 0-based
    const dayNum = Number(dayStr);
    const hour = Number(hourStr);
    const minute = Number(minuteStr);

    if (
      [year, month, dayNum, hour, minute].some((v) => Number.isNaN(v))
    ) {
      return null;
    }

    return new Date(year, month, dayNum, hour, minute, 0, 0);
  };

  const formatTimeDisplay = (value: Date | string | null): string => {
    if (!value) return "";

    // Nếu đã là Date
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return "";
      const hh = value.getHours().toString().padStart(2, "0");
      const mm = value.getMinutes().toString().padStart(2, "0");
      return `${hh}:${mm}`;
    }

    // Nếu là string, thử parse ISO
    const asDate = new Date(value);
    if (!Number.isNaN(asDate.getTime())) {
      const hh = asDate.getHours().toString().padStart(2, "0");
      const mm = asDate.getMinutes().toString().padStart(2, "0");
      return `${hh}:${mm}`;
    }

    // Fallback: nếu đã là dạng HH:mm thì giữ nguyên
    if (/^\d{1,2}:\d{2}$/.test(value)) {
      return value;
    }

    return "";
  };

  const formatWithTimeZone = (value: Date): string => {
    if (Number.isNaN(value.getTime())) return "";
    const tzOffsetMinutes = -value.getTimezoneOffset(); // ví dụ GMT+7 => 420
    const offsetSign = tzOffsetMinutes >= 0 ? "+" : "-";
    const absOffset = Math.abs(tzOffsetMinutes);
    const offsetHours = Math.floor(absOffset / 60)
      .toString()
      .padStart(2, "0");
    const offsetMinutes = (absOffset % 60).toString().padStart(2, "0");

    const localIso = new Date(
      value.getTime() - value.getTimezoneOffset() * 60000
    )
      .toISOString()
      .replace("Z", "");

    return `${localIso}${offsetSign}${offsetHours}:${offsetMinutes}`;
  };

  const formattedStartTime = useMemo(
    () => formatTimeDisplay(startTime || null),
    [startTime]
  );

  const computedEndTime = useMemo(() => {
    if (!duration) return "";
    const startDateTime = buildStartDateTime();
    if (!startDateTime) return "";

    const end = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000);
    return formatTimeDisplay(end);
  }, [startTime, duration, date]);

  const onSave = async () => {
    const startDateTime = buildStartDateTime();
    if (!startDateTime) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn đầy đủ ngày và giờ bắt đầu.");
      return;
    }

    if (!rescheduleNote.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập lý do đổi lịch.");
      return;
    }

    try {
      setIsRescheduling(true);

      // Calculate end datetime
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + (duration * 60));

      // Validate: endTime must be after startTime
      if (endDateTime <= startDateTime) {
        Alert.alert("Lỗi", "Giờ kết thúc phải sau giờ bắt đầu.");
        setIsRescheduling(false);
        return;
      }

      // Validate: new time must be in the future
      const now = new Date();
      if (startDateTime <= now) {
        Alert.alert("Lỗi", "Thời gian đổi lịch phải trong tương lai.");
        setIsRescheduling(false);
        return;
      }

      // Backend .NET thường mong đợi ISO string với Z (UTC)
      const rescheduleData: IRescheduleSessionRequest = {
        note: rescheduleNote.trim(),
        newStartTime: startDateTime.toISOString(),
        newEndTime: endDateTime.toISOString(),
      };

      console.log("Reschedule request body:", JSON.stringify(rescheduleData, null, 2));

      const success = await sessionViewModel.rescheduleSession(
        sessionId,
        rescheduleData
      );
      if (!success) {
        throw new Error("Reschedule failed");
      }

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
          {isFetchingInstructor || !effectiveInstructorId ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator size="small" color={AppColors.primary} />
              <Text style={{ marginTop: 8, color: "#475569" }}>
                Đang tải thông tin lịch
              </Text>
            </View>
          ) : (
            <Step1
              instructorId={effectiveInstructorId}
              selectedDate={selectedDate}
              selectedStartTime={startTime}
              selectedEndTime={computedEndTime}
              selectedDuration={duration}
              onDateSelect={(d) => {
                setSelectedDate(d);
                setDate(d);
              }}
              onStartTimeSelect={(time) => {
                setStartTime(time);
              }}
              onEndTimeSelect={() => {
              }}
              onDurationChange={(h) => {
                setDuration(h);
              }}
              maxDuration={duration}
            />
          )}

          {/* Ngày, giờ bắt đầu, giờ kết thúc (ẩn nếu chưa có giá trị) */}
          {selectedDate && (
            <View style={styles.fieldRow}>
              <Calendar size={18} color="#64748b" strokeWidth={2} />
              <Text style={styles.label}>Ngày</Text>
              <Text style={styles.value}>{selectedDate}</Text>
            </View>
          )}

          {formattedStartTime && (
            <View style={styles.fieldRow}>
              <Clock size={18} color="#64748b" strokeWidth={2} />
              <Text style={styles.label}>Giờ bắt đầu</Text>
              <Text style={styles.value}>{formattedStartTime}</Text>
            </View>
          )}

          {computedEndTime && (
            <View style={styles.fieldRow}>
              <Clock size={18} color="#64748b" strokeWidth={2} />
              <Text style={styles.label}>Giờ kết thúc</Text>
              <Text style={styles.value}>{computedEndTime}</Text>
            </View>
          )}

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
