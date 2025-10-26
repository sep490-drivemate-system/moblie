import React from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { CalendarDays, CheckCircle } from "lucide-react-native";
import { BookingMode, Shift, ShiftType } from "@/models/booking/booking";

interface Step2Props {
  bookingMode: BookingMode;
  // Daily mode props
  selectedDate: string;
  selectedShift: Shift | null;
  onDateSelect: (date: string) => void;
  onShiftSelect: (shift: Shift) => void;
  // Recurring mode props
  startDate: string;
  endDate: string;
  selectedDays: string[];
  selectedShiftsRecurring: ShiftType[];
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onDayToggle: (dayId: string) => void;
  onRecurringShiftToggle: (shiftId: ShiftType) => void;
}

const shifts = [
  { id: "morning" as ShiftType, label: "Ca sáng", time: "6:00 - 10:00" },
  { id: "afternoon" as ShiftType, label: "Ca chiều", time: "14:00 - 18:00" },
  { id: "evening" as ShiftType, label: "Ca tối", time: "18:00 - 22:00" },
];

const weekDays = [
  { id: "mon", label: "T2" },
  { id: "tue", label: "T3" },
  { id: "wed", label: "T4" },
  { id: "thu", label: "T5" },
  { id: "fri", label: "T6" },
  { id: "sat", label: "T7" },
  { id: "sun", label: "CN" },
];

export default function Step2({
  bookingMode,
  selectedDate,
  selectedShift,
  onDateSelect,
  onShiftSelect,
  startDate,
  endDate,
  selectedDays,
  selectedShiftsRecurring,
  onStartDateChange,
  onEndDateChange,
  onDayToggle,
  onRecurringShiftToggle,
}: Step2Props) {
  if (bookingMode === "daily") {
    return (
      <>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CalendarDays size={24} color="#667eea" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Chọn ngày</Text>
          </View>
          <Calendar
            current={new Date().toISOString().split("T")[0]}
            onDayPress={(day) => onDateSelect(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: "#667eea",
              },
            }}
            theme={{
              todayTextColor: "#667eea",
              selectedDayBackgroundColor: "#667eea",
              selectedDayTextColor: "#ffffff",
              arrowColor: "#667eea",
            }}
            style={styles.calendar}
          />
        </View>

        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn ca thuê</Text>
            {shifts.map((shift) => (
              <TouchableOpacity
                key={shift.id}
                style={[
                  styles.shiftCard,
                  selectedShift?.id === shift.id && styles.shiftCardActive,
                ]}
                onPress={() => onShiftSelect(shift)}
              >
                <View style={styles.shiftInfo}>
                  <Text style={styles.shiftLabel}>{shift.label}</Text>
                  <Text style={styles.shiftTime}>{shift.time}</Text>
                </View>
                {selectedShift?.id === shift.id && (
                  <CheckCircle size={24} color="#667eea" strokeWidth={2} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </>
    );
  }

  // Recurring mode
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Chọn khoảng thời gian</Text>
        <View style={styles.dateRangeContainer}>
          <View style={styles.dateInputWrapper}>
            <Text style={styles.dateInputLabel}>Từ ngày:</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="DD/MM/YYYY"
              value={startDate}
              onChangeText={onStartDateChange}
            />
          </View>
          <View style={styles.dateInputWrapper}>
            <Text style={styles.dateInputLabel}>Đến ngày:</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="DD/MM/YYYY"
              value={endDate}
              onChangeText={onEndDateChange}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📆 Chọn các thứ trong tuần</Text>
        <View style={styles.weekDaysContainer}>
          {weekDays.map((day) => (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayButton,
                selectedDays.includes(day.id) && styles.dayButtonActive,
              ]}
              onPress={() => onDayToggle(day.id)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  selectedDays.includes(day.id) && styles.dayButtonTextActive,
                ]}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {selectedDays.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Chọn ca học</Text>
          {shifts.map((shift) => (
            <TouchableOpacity
              key={shift.id}
              style={[
                styles.shiftCard,
                selectedShiftsRecurring.includes(shift.id) && styles.shiftCardActive,
              ]}
              onPress={() => onRecurringShiftToggle(shift.id)}
            >
              <View style={styles.shiftInfo}>
                <Text style={styles.shiftLabel}>{shift.label}</Text>
                <Text style={styles.shiftTime}>{shift.time}</Text>
              </View>
              {selectedShiftsRecurring.includes(shift.id) && (
                <CheckCircle size={24} color="#667eea" strokeWidth={2} />
              )}
            </TouchableOpacity>
          ))}
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  calendar: {
    borderRadius: 12,
  },
  shiftCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    marginBottom: 12,
  },
  shiftCardActive: {
    borderColor: "#667eea",
    backgroundColor: "#f0f4ff",
  },
  shiftInfo: {
    flex: 1,
  },
  shiftLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  shiftTime: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  dateRangeContainer: {
    gap: 12,
  },
  dateInputWrapper: {
    gap: 8,
  },
  dateInputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  dateInput: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  weekDaysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  dayButtonActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
  },
  dayButtonTextActive: {
    color: "#ffffff",
  },
});