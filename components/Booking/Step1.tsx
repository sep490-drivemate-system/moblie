import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import {
  Calendar as CalendarIcon,
  AlertCircle,
} from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import ScheduleCalendar from "@/components/Schedule/ScheduleCalendar";
import ScheduleTimeRangePicker from "@/components/Schedule/ScheduleTimeRangePicker";
import {
  useScheduleStep1ViewModel,
  UseScheduleStep1Params,
} from "@/viewmodels/schedule/ScheduleViewModel";


type Step1Props = UseScheduleStep1Params;

export default function Step1(props: Step1Props) {
  const {
    remainTime,
    selectedStartTime,
    selectedEndTime,
    selectedDuration,
    maxDuration,
  } = props;

  const {
    isLoading,
    calendarProps,
    expandedDateString,
    expandedDateLabel,
    expandedBusySlots,
    isExpandedDateFullyBusy,
    timePickerState,
    timePickerHelpers,
    timePickerHandlers,
  } = useScheduleStep1ViewModel(props);

  const {
    startTimeHour,
    startTimeMinute,
    endTimeHour,
    endTimeMinute,
    selectedDurationPreset,
    timeError,
  } = timePickerState;

  const {
    generateHourOptions,
    generateMinuteOptions,
    formatDurationWithMinutes,
    formatTime,
  } = timePickerHelpers;

  const {
    onStartHourChange,
    onStartMinuteChange,
    onEndHourChange,
    onEndMinuteChange,
    onDurationPresetPress,
  } = timePickerHandlers;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <CalendarIcon size={24} color={AppColors.primary} strokeWidth={2} />
        <Text style={styles.sectionTitle}>Chọn ngày thuê</Text>
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={AppColors.primary}
            style={{ marginLeft: 8 }}
          />
        )}
      </View>

      <ScheduleCalendar {...calendarProps} />

      {expandedDateString && (
        <View style={styles.expandedTimeSlotsWrapper}>
          {isExpandedDateFullyBusy ? (
            <View style={styles.fullyBusyMessage}>
              <AlertCircle size={20} color="#ef4444" strokeWidth={2} />
              <Text style={styles.fullyBusyText}>Ngày này đã bận cả ngày</Text>
            </View>
          ) : (
            <View style={styles.timeSlotsContainer}>
              <Text style={styles.timeSlotsTitle}>
                Chọn khoảng thời gian cho ngày{" "}
                {expandedDateLabel ?? ""}:
              </Text>

              <ScheduleTimeRangePicker
                startTimeHour={startTimeHour}
                startTimeMinute={startTimeMinute}
                endTimeHour={endTimeHour}
                endTimeMinute={endTimeMinute}
                selectedDurationPreset={selectedDurationPreset}
                busySlots={expandedBusySlots}
                remainTime={remainTime}
                maxDuration={maxDuration}
                selectedStartTime={selectedStartTime}
                selectedEndTime={selectedEndTime}
                selectedDuration={selectedDuration}
                timeError={timeError}
                generateHourOptions={generateHourOptions}
                generateMinuteOptions={generateMinuteOptions}
                formatDurationWithMinutes={formatDurationWithMinutes}
                formatTime={formatTime}
                onStartHourChange={onStartHourChange}
                onStartMinuteChange={onStartMinuteChange}
                onEndHourChange={onEndHourChange}
                onEndMinuteChange={onEndMinuteChange}
                onDurationPresetPress={onDurationPresetPress}
              />
            </View>
          )}
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendGreenBox} />
          <Text style={styles.legendText}>Rảnh nguyên ngày</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendYellowBox} />
          <Text style={styles.legendText}>Có người đặt</Text>
        </View>
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendRedBox} />
          <Text style={styles.legendText}>Bận cả ngày</Text>
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

  expandedTimeSlotsWrapper: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  fullyBusyMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  fullyBusyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
  },
  timeSlotsContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  timeSlotsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    borderRadius: 8,
    paddingLeft: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  legendGreenBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#86efac",
    marginRight: 6,
  },
  legendYellowBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fcd34d",
    marginRight: 6,
  },
  legendRedBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666666",
  },
});
