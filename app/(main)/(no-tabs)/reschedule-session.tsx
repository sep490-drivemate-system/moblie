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
interface BookingItem {
  id: string;
  studentName: string;
  time: string;
  date: string;
  status: "ongoing" | "completed" | "cancelled";
  route: string;
  vehicle: string;
  price: number;
}
const bookings: BookingItem[] = [
  {
    id: "1",
    studentName: "Nguyễn Văn B",
    time: "8:00 - 12:00",
    date: "2025-01-15",
    status: "ongoing",
    route: "Chưa cài đặt lộ trình",
    vehicle: "KIA Carnival 2024",
    price: 800,
  },
  {
    id: "2",
    studentName: "Trần Thị C",
    time: "13:00 - 17:00",
    date: "2025-01-15",
    status: "completed",
    route: "Quận 9 - Quận 1",
    vehicle: "Không có",
    price: 800,
  },
  {
    id: "3",
    studentName: "Lê Văn D",
    time: "18:00 - 22:00",
    date: "2025-01-15",
    status: "cancelled",
    route: "Tân Hòa, quận 9 - Cống Quỳnh, quận 1",
    vehicle: "KIA Carnival 2024",
    price: 800,
  },
  {
    id: "4",
    studentName: "Phạm Thị E",
    time: "8:00 - 12:00",
    date: "2025-01-16",
    status: "ongoing",
    route: "Quận 7 - Quận 1",
    vehicle: "Toyota Vios",
    price: 600,
  },
  {
    id: "5",
    studentName: "Võ Văn F",
    time: "14:00 - 18:00",
    date: "2025-01-16",
    status: "completed",
    route: "Quận 2 - Quận 3",
    vehicle: "Honda City",
    price: 700,
  },
  {
    id: "6",
    studentName: "Nguyễn Thị G",
    time: "9:00 - 13:00",
    date: "2025-01-17",
    status: "ongoing",
    route: "Quận 4 - Quận 5",
    vehicle: "Mazda 3",
    price: 750,
  },
  // Add some bookings for today's date (26/10/2025) with different times
  {
    id: "7",
    studentName: "Hồ Văn H",
    time: "8:00 - 12:00",
    date: "2025-10-26",
    status: "ongoing",
    route: "Quận 1 - Quận 3",
    vehicle: "Hyundai Accent",
    price: 650,
  },
  {
    id: "8",
    studentName: "Đặng Thị I",
    time: "14:00 - 18:00",
    date: "2025-10-26",
    status: "completed",
    route: "Quận 2 - Quận 7",
    vehicle: "Ford Focus",
    price: 720,
  },
  {
    id: "9",
    studentName: "Lê Văn K",
    time: "6:00 - 10:00",
    date: "2025-10-26",
    status: "completed",
    route: "Quận 5 - Quận 8",
    vehicle: "Toyota Camry",
    price: 800,
  },
  {
    id: "10",
    studentName: "Phạm Thị L",
    time: "19:00 - 23:00",
    date: "2025-10-26",
    status: "ongoing",
    route: "Quận 10 - Quận 11",
    vehicle: "Honda Civic",
    price: 700,
  },
  // Add bookings for tomorrow (27/10/2025)
  {
    id: "13",
    studentName: "Võ Văn O",
    time: "9:00 - 13:00",
    date: "2025-10-27",
    status: "ongoing",
    route: "Quận 6 - Quận 9",
    vehicle: "Nissan Altima",
    price: 750,
  },
  {
    id: "14",
    studentName: "Bùi Thị P",
    time: "15:00 - 19:00",
    date: "2025-10-27",
    status: "completed",
    route: "Quận 12 - Quận Thủ Đức",
    vehicle: "KIA Sorento",
    price: 680,
  },
  // Add bookings for other days in October 2025
  {
    id: "15",
    studentName: "Đỗ Văn Q",
    time: "10:00 - 14:00",
    date: "2025-10-28",
    status: "ongoing",
    route: "Quận 1 - Quận 4",
    vehicle: "Toyota Innova",
    price: 850,
  },
  {
    id: "16",
    studentName: "Hoàng Thị R",
    time: "16:00 - 20:00",
    date: "2025-10-29",
    status: "completed",
    route: "Quận 7 - Quận 8",
    vehicle: "Honda CR-V",
    price: 900,
  },
  // Add more bookings for 2025-01-15 to test sorting
  {
    id: "11",
    studentName: "Trần Văn M",
    time: "6:00 - 10:00",
    date: "2025-01-15",
    status: "completed",
    route: "Quận 1 - Quận 2",
    vehicle: "Mazda CX-5",
    price: 900,
  },
  {
    id: "12",
    studentName: "Nguyễn Thị N",
    time: "20:00 - 24:00",
    date: "2025-01-15",
    status: "ongoing",
    route: "Quận 3 - Quận 4",
    vehicle: "Hyundai Tucson",
    price: 850,
  },
];

export default function RescheduleSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const sessionId = params.sessionId as string;
  const initialInstructor = (params.instructorName as string) || "";
  const initialDate = (params.date as string) || ""; // ISO-like string
  const initialStartTime = (params.startTime as string) || ""; // HH:mm
  const initialDuration = Number(params.duration || 0);
  const initialLocation = (params.location as string) || "";

  const [date, setDate] = useState<string>(initialDate);
  const [startTime, setStartTime] = useState<string>(initialStartTime);
  const [duration] = useState<number>(initialDuration);
  const [location] = useState<string>(initialLocation);
  const [selectedDate, setSelectedDate] = useState<string>("2025-11-06");
  const [current, setCurrent] = useState(new Date());
  const [customTime, setCustomTime] = useState<string>("");

  const computedEndTime = useMemo(() => {
    if (!startTime || !duration) return "";
    const [hStr, mStr] = String(startTime).split(":");
    let h = Number(hStr || 0);
    const m = Number(mStr || 0);
    h = (h + duration) % 24;
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    return `${pad(h)}:${pad(m)}`;
  }, [startTime, duration]);

  const onSave = () => {
    if (!date || !startTime) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập ngày và giờ bắt đầu.");
      return;
    }
    router.replace({
      pathname: "/(main)/(no-tabs)/my-driving-session-detail",
      params: {
        sessionId,
        overrideDate: String(date),
        overrideStartTime: String(startTime),
        overrideEndTime: String(computedEndTime),
        overrideLocation: String(location),
        overrideInstructor: String(initialInstructor),
        overrideDuration: String(duration),
      },
    });
    Alert.alert("Thành công", "Đã dời lịch buổi học thành công.");
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

  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map((n) => Number(n));
    return h * 60 + m;
  };

  const isTimeWithin = (t: string, range: string) => {
    // range format: "8:00 - 12:00"
    const [start, end] = range.split("-").map((s) => s.trim());
    const startMin = toMinutes(start.replace(" ", ""));
    const endMin = toMinutes(end.replace(" ", ""));
    const tMin = toMinutes(t);
    return tMin >= startMin && tMin < endMin;
  };

  const isTimeSlotAvailable = (time: string): boolean => {
    const hasConflict = bookings.some(
      (b) => b.date === (date || selectedDate) && isTimeWithin(time, b.time)
    );
    return !hasConflict;
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

        // Check if this date has bookings
        const hasBookings = bookings.some(
          (booking) => booking.date === dateString
        );
        const isBusy = false; // You can add logic for busy days if needed

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

          <View style={styles.actions}>
            <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
              <Text style={styles.saveBtnText}>Xác nhận dời lịch</Text>
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
});
