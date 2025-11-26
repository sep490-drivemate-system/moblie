import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { Check, Clock } from "lucide-react-native";

import { AppColors } from "@/constants/Colors";
import { ScheduleBusyTime } from "@/viewmodels/schedule/types";

interface ScheduleTimeRangePickerProps {
  startTimeHour: string;
  startTimeMinute: string;
  endTimeHour: string;
  endTimeMinute: string;
  selectedDurationPreset: number | null;
  durationOptions?: number[];
  busySlots: ScheduleBusyTime[];
  remainTime?: number;
  maxDuration?: number;
  selectedStartTime: string;
  selectedEndTime: string;
  selectedDuration: number;
  timeError: string | null;
  generateHourOptions: () => string[];
  generateMinuteOptions: () => string[];
  formatDurationWithMinutes: (hours: number) => string;
  formatTime: (time: string) => string;
  onStartHourChange: (hour: string) => void;
  onStartMinuteChange: (minute: string) => void;
  onEndHourChange: (hour: string) => void;
  onEndMinuteChange: (minute: string) => void;
  onDurationPresetPress: (duration: number) => void;
}

const ScheduleTimeRangePicker: React.FC<ScheduleTimeRangePickerProps> = ({
    startTimeHour,
    startTimeMinute,
    endTimeHour,
    endTimeMinute,
    selectedDurationPreset,
    durationOptions = [1, 2, 3, 4],
    busySlots,
    remainTime,
    maxDuration,
    selectedStartTime,
    selectedEndTime,
    selectedDuration,
    timeError,
    generateHourOptions,
    generateMinuteOptions,
    formatDurationWithMinutes,
    formatTime,
    onStartHourChange,
    onStartMinuteChange,
    onEndHourChange,
    onEndMinuteChange,
    onDurationPresetPress,
}) => {
    const hourOptions = generateHourOptions();
    const minuteOptions = generateMinuteOptions();
    const canShowDurationPresets = Boolean(startTimeHour && startTimeMinute);

    return (
        <View>
            <View style={styles.timeRangeSection}>
                <View style={styles.timePickerGroup}>
                    <Text style={styles.timePickerLabel}>Thời gian bắt đầu:</Text>
                    <View style={styles.timePickerContainer}>
                        <ScrollView
                            style={styles.timePickerScroll}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled
                        >
                            {hourOptions.map((hour) => (
                                <TouchableOpacity
                                    activeOpacity={1}
                                    key={hour}
                                    style={[
                                        styles.timePickerOption,
                                        startTimeHour === hour && styles.timePickerOptionSelected,
                                    ]}
                  onPress={() => onStartHourChange(hour)}
                                >
                                    <Text
                                        style={[
                                            styles.timePickerOptionText,
                                            startTimeHour === hour && styles.timePickerOptionTextSelected,
                                        ]}
                                    >
                                        {hour}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <Text style={styles.timePickerSeparator}>:</Text>
                        <ScrollView
                            style={styles.timePickerScroll}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled
                        >
                            {minuteOptions.map((minute) => (
                                <TouchableOpacity
                                    activeOpacity={1}
                                    key={minute}
                                    style={[
                                        styles.timePickerOption,
                                        startTimeMinute === minute && styles.timePickerOptionSelected,
                                    ]}
                  onPress={() => onStartMinuteChange(minute)}
                                >
                                    <Text
                                        style={[
                                            styles.timePickerOptionText,
                                            startTimeMinute === minute &&
                                            styles.timePickerOptionTextSelected,
                                        ]}
                                    >
                                        {minute}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </View>

            {canShowDurationPresets && (
                <View style={styles.durationPresetsSection}>
                    <Text style={styles.durationPresetsLabel}>Chọn thời lượng (nhanh):</Text>
                    <View style={styles.durationPresetsGrid}>
                        {durationOptions.map((duration) => {
                            const isDisabled =
                                (remainTime !== undefined && duration > remainTime) ||
                                (maxDuration !== undefined && duration > maxDuration);
                            const isSelected = selectedDurationPreset === duration;

                            return (
                                <TouchableOpacity
                                    activeOpacity={1}
                                    key={duration}
                                    style={[
                                        styles.durationPresetButton,
                                        isSelected && styles.durationPresetButtonSelected,
                                        isDisabled && styles.durationPresetButtonDisabled,
                                    ]}
                  onPress={() => !isDisabled && onDurationPresetPress(duration)}
                                    disabled={isDisabled}
                                >
                                    <Text
                                        style={[
                                            styles.durationPresetText,
                                            isSelected && styles.durationPresetTextSelected,
                                            isDisabled && styles.durationPresetTextDisabled,
                                        ]}
                                    >
                                        {formatDurationWithMinutes(duration)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}

            <View style={styles.timeRangeSection}>
                <Text style={styles.timePickerLabel}>Hoặc chọn thời gian kết thúc thủ công:</Text>
                <View style={styles.timeRangeRow}>
                    <View style={styles.timePickerGroup}>
                        <Text style={styles.timePickerLabel}>Đến:</Text>
                        <View style={styles.timePickerContainer}>
                            <ScrollView
                                style={styles.timePickerScroll}
                                showsVerticalScrollIndicator={false}
                                nestedScrollEnabled
                            >
                                {hourOptions.map((hour) => (
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        key={hour}
                                        style={[
                                            styles.timePickerOption,
                                            endTimeHour === hour && styles.timePickerOptionSelected,
                                        ]}
                  onPress={() => onEndHourChange(hour)}
                                    >
                                        <Text
                                            style={[
                                                styles.timePickerOptionText,
                                                endTimeHour === hour && styles.timePickerOptionTextSelected,
                                            ]}
                                        >
                                            {hour}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <Text style={styles.timePickerSeparator}>:</Text>
                            <ScrollView
                                style={styles.timePickerScroll}
                                showsVerticalScrollIndicator={false}
                                nestedScrollEnabled
                            >
                                {minuteOptions.map((minute) => (
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        key={minute}
                                        style={[
                                            styles.timePickerOption,
                                            endTimeMinute === minute && styles.timePickerOptionSelected,
                                        ]}
                  onPress={() => onEndMinuteChange(minute)}
                                    >
                                        <Text
                                            style={[
                                                styles.timePickerOptionText,
                                                endTimeMinute === minute &&
                                                styles.timePickerOptionTextSelected,
                                            ]}
                                        >
                                            {minute}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </View>

                {timeError && <Text style={styles.timeError}>{timeError}</Text>}

                {selectedStartTime &&
                    selectedEndTime &&
                    selectedDuration > 0 &&
                    !timeError && (
                        <View style={styles.selectedTimeDisplay}>
                            <Check size={16} color={AppColors.primary} strokeWidth={3} />
                            <Text style={styles.selectedTimeText}>
                                Đã chọn: {selectedStartTime} - {selectedEndTime} (
                                {formatDurationWithMinutes(selectedDuration)})
                            </Text>
                        </View>
                    )}

                {remainTime !== undefined && (
                    <Text style={styles.remainTimeText}>
                        Thời gian còn lại: {formatDurationWithMinutes(remainTime)}
                    </Text>
                )}
            </View>

            {busySlots.length > 0 && (
                <View style={styles.busyTimesInfo}>
                    <Text style={styles.busyTimesTitle}>Thời gian bận:</Text>
                    <View style={styles.busyTimesList}>
                        {busySlots.map((slot, slotIndex) => (
                            <View key={`${slot.startTime}-${slot.endTime}-${slotIndex}`} style={styles.busyTimeItem}>
                                <Clock size={12} color="#ef4444" strokeWidth={2} />
                                <Text style={styles.busyTimeText}>
                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    timeRangeSection: {
        marginTop: 12,
        marginBottom: 12,
    },
    timePickerGroup: {
        flex: 1,
    },
    timePickerLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: 8,
    },
    timePickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        padding: 8,
        height: 200,
    },
    timePickerScroll: {
        flex: 1,
        maxHeight: 180,
    },
    timePickerOption: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginVertical: 4,
        alignItems: "center",
    },
    timePickerOptionSelected: {
        backgroundColor: AppColors.primary,
    },
    timePickerOptionText: {
        fontSize: 16,
        color: "#1e293b",
        fontWeight: "500",
    },
    timePickerOptionTextSelected: {
        color: "#ffffff",
        fontWeight: "700",
    },
    timePickerSeparator: {
        paddingHorizontal: 8,
        fontSize: 18,
        fontWeight: "700",
        color: "#1e293b",
    },
    durationPresetsSection: {
        marginBottom: 16,
    },
    durationPresetsLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: 12,
    },
    durationPresetsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    durationPresetButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    durationPresetButtonSelected: {
        backgroundColor: AppColors.primary,
        borderColor: AppColors.primary,
    },
    durationPresetButtonDisabled: {
        opacity: 0.5,
    },
    durationPresetText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0f172a",
    },
    durationPresetTextSelected: {
        color: "#ffffff",
    },
    durationPresetTextDisabled: {
        color: "#94a3b8",
    },
    timeRangeRow: {
        flexDirection: "row",
        gap: 16,
        justifyContent: "space-between",
    },
    timeError: {
        marginTop: 8,
        fontSize: 12,
        color: "#ef4444",
        fontWeight: "600",
    },
    selectedTimeDisplay: {
        marginTop: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#f0fdf4",
        borderWidth: 1,
        borderColor: "#bbf7d0",
    },
    selectedTimeText: {
        fontSize: 13,
        color: "#065f46",
        fontWeight: "600",
    },
    remainTimeText: {
        marginTop: 8,
        fontSize: 12,
        color: "#475569",
        fontWeight: "600",
    },
    busyTimesInfo: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#e2e8f0",
    },
    busyTimesTitle: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748b",
        marginBottom: 6,
    },
    busyTimesList: {
        gap: 4,
    },
    busyTimeItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    busyTimeText: {
        fontSize: 11,
        color: "#ef4444",
        fontWeight: "600",
    },
});

export default ScheduleTimeRangePicker;

