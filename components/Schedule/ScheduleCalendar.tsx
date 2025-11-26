import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

import { AppColors } from "@/constants/Colors";

type DateStatus = "free" | "partial" | "busy";


interface ScheduleCalendarProps {
  currentMonthDate: Date;
  selectedDate: string | null;
  onNavigateMonth: (direction: "prev" | "next") => void;
  onDayPress: (date: Date) => void;
  isDateFullyBusy: (date: Date) => boolean;
  isPastDate: (date: Date) => boolean;
  isDateInRange: (date: Date) => boolean;
  getDateStatus: (date: Date) => DateStatus;
  formatDate: (date: Date) => string;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  currentMonthDate,
  selectedDate,
  onNavigateMonth,
  onDayPress,
  isDateFullyBusy,
  isPastDate,
  isDateInRange,
  getDateStatus,
  formatDate,
}) => {
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDay = new Date(year, month, 1);

  const startDate = new Date(firstDay);
  const dayOfWeek = firstDay.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDate.setDate(startDate.getDate() - daysToSubtract);

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const headerDays = dayNames.map((day) => (
    <View key={day} style={styles.dayHeader}>
      <Text style={styles.dayHeaderText}>{day}</Text>
    </View>
  ));

  const days = [];
  for (let week = 0; week < 6; week++) {
    const weekDays = [];
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + week * 7 + day);

      const dateStr = formatDate(currentDate);
      const isCurrent =
        currentDate.getMonth() === currentMonthDate.getMonth() &&
        currentDate.getFullYear() === currentMonthDate.getFullYear();
      const isSelected = dateStr === selectedDate;
      const isFullyBusy = isDateFullyBusy(currentDate);
      const isPast = isPastDate(currentDate);
      const isInRange = isDateInRange(currentDate);
      const dateStatus = !isPast && isInRange ? getDateStatus(currentDate) : null;
      const isDisabled = isFullyBusy || isPast || !isInRange;
      const dayNumber = currentDate.getDate();

      const dayContainerStyle = {
        ...styles.dayButton,
        ...(!isCurrent && !isSelected ? styles.dayButtonOtherMonth : {}),
        ...(!isSelected && isDisabled ? styles.dayButtonDisabled : {}),
        ...(!isSelected && !isDisabled && dateStatus === "free"
          ? styles.dayButtonFree
          : {}),
        ...(!isSelected && !isDisabled && dateStatus === "partial"
          ? styles.dayButtonPartial
          : {}),
        ...(!isSelected && !isDisabled && dateStatus === "busy"
          ? styles.dayButtonBusy
          : {}),
        ...(isSelected ? styles.dayButtonSelected : {}),
      } as const;

      const dayNumberTextStyle = {
        ...styles.dayText,
        ...(!isCurrent && !isSelected ? styles.dayTextOtherMonth : {}),
        ...(!isSelected && isDisabled ? styles.dayTextDisabled : {}),
        ...(isSelected ? styles.dayTextSelected : {}),
      } as const;

      weekDays.push(
        <TouchableOpacity activeOpacity={1}
          key={dateStr}
          style={dayContainerStyle}
          onPress={() => onDayPress(currentDate)}
          disabled={isDisabled}
        >
          <Text style={dayNumberTextStyle}>{dayNumber}</Text>
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
        <TouchableOpacity activeOpacity={1}
          style={styles.monthButton}
          onPress={() => onNavigateMonth("prev")}
        >
          <ChevronLeft size={20} color={AppColors.primary} strokeWidth={2} />
        </TouchableOpacity>

        <Text style={styles.monthTitle}>
          {currentMonthDate.toLocaleDateString("vi-VN", {
            month: "long",
            year: "numeric",
          })}
        </Text>

        <TouchableOpacity activeOpacity={1}
          style={styles.monthButton}
          onPress={() => onNavigateMonth("next")}
        >
          <ChevronRight size={20} color={AppColors.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.dayHeaders}>{headerDays}</View>

      {days}
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    marginBottom: 16,
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
    borderColor: AppColors.primary,
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
    backgroundColor: AppColors.primary,
    borderWidth: 0,
    borderColor: "transparent",
  },
  dayButtonDisabled: {
    opacity: 0.4,
  },
  dayButtonFree: {
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#86efac",
  },
  dayButtonPartial: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  dayButtonBusy: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fca5a5",
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
  dayTextDisabled: {
    color: "#999999",
    opacity: 0.5,
  },
});

export default ScheduleCalendar;

