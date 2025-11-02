import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Calendar as CalendarIcon } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";

interface Step1Props {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  instructorBusyDates?: string[];
}

// Generate next 30 days
const generateDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

const getDayName = (date: Date) => {
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return days[date.getDay()];
};

export default function Step1({ selectedDate, onDateSelect, instructorBusyDates = [] }: Step1Props) {
  const dates = generateDates();

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isBusy = (date: Date) => {
    return instructorBusyDates.includes(formatDate(date));
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <CalendarIcon size={24} color={AppColors.primary} strokeWidth={2} />
        <Text style={styles.sectionTitle}>Chọn ngày học</Text>
      </View>
      <Text style={styles.sectionDesc}>
        Chọn ngày bạn muốn đặt lịch học lái xe
      </Text>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.calendarScroll}
        contentContainerStyle={styles.calendarContent}
      >
        {dates.map((date, index) => {
          const dateStr = formatDate(date);
          const isSelected = selectedDate === dateStr;
          const isTodayDate = isToday(date);
          const isBusyDate = isBusy(date);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateCard,
                isSelected && styles.dateCardActive,
                isBusyDate && styles.dateCardBusy,
              ]}
              onPress={() => onDateSelect(dateStr)}
              disabled={isBusyDate}
            >
              <Text style={[
                styles.dayName,
                isSelected && styles.dayNameActive,
                isBusyDate && styles.dayNameBusy,
              ]}>
                {getDayName(date)}
              </Text>
              <Text style={[
                styles.dateNumber,
                isSelected && styles.dateNumberActive,
                isBusyDate && styles.dateNumberBusy,
              ]}>
                {date.getDate()}
              </Text>
              <Text style={[
                styles.monthName,
                isSelected && styles.monthNameActive,
                isBusyDate && styles.monthNameBusy,
              ]}>
                Th{date.getMonth() + 1}
              </Text>
              {isTodayDate && !isSelected && (
                <View style={styles.todayDot} />
              )}
              {isBusyDate && (
                <Text style={styles.busyText}>Bận</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Hôm nay</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: "#fecaca" }]} />
          <Text style={styles.legendText}>Đã bận</Text>
        </View>
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
  calendarScroll: {
    marginHorizontal: -24,
    marginBottom: 16,
  },
  calendarContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  dateCard: {
    width: 70,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    alignItems: "center",
    position: "relative",
  },
  dateCardActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + "15",
  },
  dateCardBusy: {
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    opacity: 0.6,
  },
  dayName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 8,
  },
  dayNameActive: {
    color: AppColors.primary,
  },
  dayNameBusy: {
    color: "#ef4444",
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 4,
  },
  dateNumberActive: {
    color: AppColors.primary,
  },
  dateNumberBusy: {
    color: "#ef4444",
  },
  monthName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
  },
  monthNameActive: {
    color: AppColors.primary,
  },
  monthNameBusy: {
    color: "#ef4444",
  },
  todayDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.primary,
  },
  busyText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ef4444",
    marginTop: 4,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.primary,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
});
