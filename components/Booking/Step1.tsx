import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from "react-native";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  Check,
} from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { useAppDispatch } from "@/lib/redux/hooks";
import {
  IInstructorSchedule,
  IInstructorBookedSession,
} from "@/features/booking/bookingThunk";
import { getInstructorSchedule } from "@/features/schedule/scheduleThunk";
import { getInstructorBookedSessions } from "@/features/schedule/scheduleThunk";


interface Step1Props {
  instructorId: string;
  remainTime?: number;
  selectedDate: string | null;
  selectedStartTime: string;
  selectedEndTime: string;
  selectedDuration: number;
  onDateSelect: (date: string) => void;
  onStartTimeSelect: (time: string) => void;
  onEndTimeSelect: (time: string) => void;
  onDurationChange: (duration: number) => void;
  maxDuration?: number;
  instructorBusyTimes?: {
    instructorId: string;
    date: string;
    busySlots: { startTime: string; endTime: string }[];
  }[];
}

interface BusyTime {
  startTime: string;
  endTime: string;
}

const formatTime = (time: string) => {
  return time.replace(":", "h");
};

const getDateFromISO = (isoString: string): string => {
  return isoString.split('T')[0];
};

const getTimeFromISO = (isoString: string): string => {
  const timePart = isoString.split('T')[1];
  if (timePart) {
    const [hours, minutes] = timePart.split(':');
    return `${hours}:${minutes}`;
  }

  const date = new Date(isoString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const getAvailableDateRanges = (schedule: IInstructorSchedule[]): { start: Date; end: Date }[] => {
  if (!schedule || schedule.length === 0) return [];

  return schedule.map(slot => {
    const startDate = new Date(slot.startTime + 'T00:00:00');
    const endDate = new Date(slot.endTime + 'T00:00:00');

    return {
      start: startDate,
      end: endDate
    };
  });
};

const isDateInAvailableRange = (date: Date, availableRanges: { start: Date; end: Date }[]): boolean => {
  // If no schedule, no dates are available
  if (availableRanges.length === 0) return false;

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return availableRanges.some(range => {
    const rangeStart = new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate());
    const rangeEnd = new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate());
    return dateOnly >= rangeStart && dateOnly <= rangeEnd;
  });
};

export default function Step1({
  instructorId,
  remainTime,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  selectedDuration,
  onDateSelect,
  onStartTimeSelect,
  onEndTimeSelect,
  onDurationChange,
  maxDuration,
  instructorBusyTimes = [],
}: Step1Props) {
  const dispatch = useAppDispatch();
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [startTimeHour, setStartTimeHour] = useState<string>("");
  const [startTimeMinute, setStartTimeMinute] = useState<string>("");
  const [endTimeHour, setEndTimeHour] = useState<string>("");
  const [endTimeMinute, setEndTimeMinute] = useState<string>("");
  const [timeError, setTimeError] = useState<string | null>(null);
  const [selectedDurationPreset, setSelectedDurationPreset] = useState<number | null>(null);
  const [useDurationMode, setUseDurationMode] = useState(true); // true: chọn duration, false: chọn end time

  // API data state
  const [instructorSchedule, setInstructorSchedule] = useState<IInstructorSchedule[]>([]);
  const [instructorBookedSessions, setInstructorBookedSessions] = useState<IInstructorBookedSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Log props in useEffect
  useEffect(() => {
    console.log("Step1 Props:", {
      instructorId,
      remainTime,
      selectedDate,
      selectedStartTime,
      selectedEndTime,
      selectedDuration,
      maxDuration,
      instructorBusyTimes,
      instructorSchedule,
      instructorBookedSessions,

    });
  }, [instructorId, remainTime, selectedDate, selectedStartTime, selectedEndTime, selectedDuration, maxDuration]);

  // Sync selected times with local state
  useEffect(() => {
    if (selectedStartTime) {
      const [hour, minute] = selectedStartTime.split(":").map(String);
      setStartTimeHour(hour);
      setStartTimeMinute(minute);
    }
  }, [selectedStartTime]);

  useEffect(() => {
    if (selectedEndTime) {
      const [hour, minute] = selectedEndTime.split(":").map(String);
      setEndTimeHour(hour);
      setEndTimeMinute(minute);
    }
  }, [selectedEndTime]);

  useEffect(() => {
    fetchInstructorData();
  }, [instructorId]);

  const fetchInstructorData = async () => {
    try {
      setIsLoading(true);

      const scheduleResult = await dispatch(
        getInstructorSchedule({ instructorId })
      ).unwrap();
      const scheduleData = (scheduleResult as any).value || scheduleResult;
      setInstructorSchedule(scheduleData);
      console.log("Step1 - Instructor schedule loaded:", {
        raw: scheduleData,
        parsed: scheduleData.map((s: IInstructorSchedule) => ({
          start: s.startTime,
          end: s.endTime,
          startDate: new Date(s.startTime + 'T00:00:00'),
          endDate: new Date(s.endTime + 'T00:00:00')
        }))
      });

      // Fetch booked sessions (busy times)
      const sessionsResult = await dispatch(
        getInstructorBookedSessions({ instructorId })
      ).unwrap();
      const sessionsData = (sessionsResult as any).value || sessionsResult;
      setInstructorBookedSessions(sessionsData);
      console.log("Step1 - Instructor booked sessions loaded:", {
        raw: sessionsData,
        parsed: sessionsData.map((s: IInstructorBookedSession) => ({
          date: getDateFromISO(s.startTime),
          startTime: getTimeFromISO(s.startTime),
          endTime: getTimeFromISO(s.endTime)
        }))
      });

    } catch (error) {
      console.error("Step1 - Failed to fetch instructor data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    // Use local date components to avoid timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  const isPastDate = (date: Date) => {
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const dateStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    return dateStart < todayStart;
  };

  const availableDateRanges = getAvailableDateRanges(instructorSchedule);

  const getBusyTimesForDate = (date: Date): BusyTime[] => {
    const dateStr = formatDate(date);
    const busySlots: BusyTime[] = [];

    // Get busy times from mock data (instructorBusyTimes) - for backward compatibility
    const mockBusyTime = instructorBusyTimes.find((bt) => bt.date === dateStr);
    if (mockBusyTime) {
      busySlots.push(...mockBusyTime.busySlots);
    }

    // Get booked sessions from API for this date
    // API returns ISO datetime strings like "2025-11-13T10:00:00"
    const bookedForDate = instructorBookedSessions.filter(session => {
      const sessionDate = getDateFromISO(session.startTime);
      const matches = sessionDate === dateStr;


      return matches;
    });

    // Convert booked sessions to busy time format (HH:MM)
    bookedForDate.forEach(session => {
      const startTime = getTimeFromISO(session.startTime);
      const endTime = getTimeFromISO(session.endTime);
      busySlots.push({
        startTime,
        endTime
      });
    });

    return busySlots;
  };

  const getDateStatus = (date: Date): "free" | "partial" | "busy" => {
    const busyTimes = getBusyTimesForDate(date);
    if (busyTimes.length === 0) return "free";

    // Calculate total busy hours
    const totalBusyHours = busyTimes.reduce((total, slot) => {
      const [startHour, startMin] = slot.startTime.split(":").map(Number);
      const [endHour, endMin] = slot.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return total + (endMinutes - startMinutes) / 60;
    }, 0);

    // Consider fully busy if more than 14 hours (out of 16 hours 6:00-22:00)
    if (totalBusyHours >= 14) return "busy";

    // Partial busy if has any bookings but not fully busy
    return "partial";
  };

  const isDateFullyBusy = (date: Date) => {
    return getDateStatus(date) === "busy";
  };

  const isDateFree = (date: Date) => {
    return getDateStatus(date) === "free";
  };

  const isDatePartial = (date: Date) => {
    return getDateStatus(date) === "partial";
  };

  const current = new Date(currentYear, currentMonth);

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
    setExpandedDate(null); // Close expanded date when navigating
  };

  const handleDatePress = (date: Date) => {
    const dateStr = formatDate(date);
    const isFullyBusy = isDateFullyBusy(date);
    const isPast = isPastDate(date);
    const isInRange = isDateInAvailableRange(date, availableDateRanges);

    // Disable if: past, fully busy, or not in available range
    if (isFullyBusy || isPast || !isInRange) return;

    if (expandedDate === dateStr) {
      setExpandedDate(null);
    } else {
      setExpandedDate(dateStr);
      onDateSelect(dateStr);
      // Reset time when selecting new date
      setStartTimeHour("");
      setStartTimeMinute("");
      setEndTimeHour("");
      setEndTimeMinute("");
      setTimeError(null);
      setSelectedDurationPreset(null);
    }
  };

  const handleDurationPreset = (duration: number, busySlots: BusyTime[]) => {
    if (!startTimeHour || !startTimeMinute) {
      setTimeError("Vui lòng chọn thời gian bắt đầu trước");
      return;
    }

    const startHour = parseInt(startTimeHour, 10);
    const startMin = parseInt(startTimeMinute, 10);

    if (Number.isNaN(startHour) || Number.isNaN(startMin)) {
      return;
    }

    // Calculate end time from start time + duration
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = startMinutes + (duration * 60);
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;

    if (endHour > 23) {
      setTimeError(`Thời lượng ${duration}h vượt quá 24h. Vui lòng chọn thời gian bắt đầu sớm hơn.`);
      return;
    }

    setEndTimeHour(endHour.toString().padStart(2, "0"));
    setEndTimeMinute(endMin.toString().padStart(2, "0"));
    setSelectedDurationPreset(duration);

    // Validate the calculated time range
    setTimeout(() => {
      const startTime = `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`;
      const endTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;
      validateTimeRange(startTime, endTime, duration, busySlots);
    }, 100);
  };

  const validateTimeRange = (startTime: string, endTime: string, duration: number, busySlots: BusyTime[]) => {
    setTimeError(null);

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    // Validate start < end
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      setTimeError("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    // Validate against busy slots
    for (const busySlot of busySlots) {
      const busyStart = busySlot.startTime.split(":").map(Number);
      const busyEnd = busySlot.endTime.split(":").map(Number);
      const busyStartMinutes = busyStart[0] * 60 + busyStart[1];
      const busyEndMinutes = busyEnd[0] * 60 + busyEnd[1];

      // Check if time range overlaps with busy slot
      if (
        (startMinutes < busyEndMinutes && endMinutes > busyStartMinutes)
      ) {
        setTimeError(`Khung giờ này trùng với thời gian bận: ${busySlot.startTime} - ${busySlot.endTime}`);
        return;
      }
    }

    // Validate against remainTime
    if (remainTime !== undefined && duration > remainTime) {
      setTimeError(`Thời lượng vượt quá thời gian còn lại (${remainTime}h)`);
      return;
    }

    // Validate against maxDuration
    if (maxDuration !== undefined && duration > maxDuration) {
      setTimeError(`Thời lượng vượt quá thời lượng tối đa (${maxDuration}h)`);
      return;
    }

    // Update times and duration
    onStartTimeSelect(startTime);
    onEndTimeSelect(endTime);
    onDurationChange(duration);
  };

  const validateAndUpdateTimeRange = (busySlots: BusyTime[]) => {
    if (!startTimeHour || !startTimeMinute || !endTimeHour || !endTimeMinute) {
      return;
    }

    const startHour = parseInt(startTimeHour, 10);
    const startMin = parseInt(startTimeMinute, 10);
    const endHour = parseInt(endTimeHour, 10);
    const endMin = parseInt(endTimeMinute, 10);

    // Validate time format
    if (
      Number.isNaN(startHour) || Number.isNaN(startMin) ||
      Number.isNaN(endHour) || Number.isNaN(endMin) ||
      startHour < 0 || startHour > 23 || startMin < 0 || startMin > 59 ||
      endHour < 0 || endHour > 23 || endMin < 0 || endMin > 59
    ) {
      setTimeError("Giờ không hợp lệ");
      return;
    }

    const startTime = `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`;
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;

    // Calculate duration
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const duration = (endMinutes - startMinutes) / 60;

    // Clear preset when manually selecting end time
    setSelectedDurationPreset(null);

    validateTimeRange(startTime, endTime, duration, busySlots);
  };

  const generateHourOptions = () => {
    return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  };

  const generateMinuteOptions = () => {
    return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
  };

  const renderCalendar = () => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1);

    // Calculate start date of calendar grid (Monday of the week containing first day)
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Header with day names
    const headerDays = dayNames.map((day) => (
      <View key={day} style={styles.dayHeader}>
        <Text style={styles.dayHeaderText}>{day}</Text>
      </View>
    ));

    // Generate calendar days in week rows
    const days = [];
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);

        const dateStr = formatDate(currentDate);
        const isCurrent = currentDate.getMonth() === current.getMonth();
        const isSelected = dateStr === selectedDate;
        const isTodayDate = isToday(currentDate);
        const isFullyBusy = isDateFullyBusy(currentDate);
        const isPast = isPastDate(currentDate);
        const isInRange = isDateInAvailableRange(currentDate, availableDateRanges);
        const busySlots = getBusyTimesForDate(currentDate);
        const isDisabled = isFullyBusy || isPast || !isInRange;
        const dayNumber = currentDate.getDate();
        const dateStatus = !isPast && isInRange ? getDateStatus(currentDate) : null;

        // Compose styles with explicit override order so selected state always wins
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
          <TouchableOpacity
            key={dateStr}
            style={dayContainerStyle}
            onPress={() => handleDatePress(currentDate)}
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
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => navigateMonth("prev")}
          >
            <ChevronLeft size={20} color={AppColors.primary} strokeWidth={2} />
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {current.toLocaleDateString("vi-VN", {
              month: "long",
              year: "numeric",
            })}
          </Text>

          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => navigateMonth("next")}
          >
            <ChevronRight size={20} color={AppColors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.dayHeaders}>{headerDays}</View>

        {days}
      </View>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <CalendarIcon size={24} color={AppColors.primary} strokeWidth={2} />
        <Text style={styles.sectionTitle}>Chọn ngày thuê</Text>
        {isLoading && (
          <ActivityIndicator size="small" color={AppColors.primary} style={{ marginLeft: 8 }} />
        )}
      </View>

      {/* Calendar */}
      {renderCalendar()}

      {/* Expanded Time Slots - Outside Calendar Grid */}
      {expandedDate && (
        <View style={styles.expandedTimeSlotsWrapper}>
          {(() => {
            const expandedDateObj = new Date(expandedDate + "T00:00:00");
            const busySlots = getBusyTimesForDate(expandedDateObj);
            const isFullyBusy = isDateFullyBusy(expandedDateObj);

            if (isFullyBusy) {
              return (
                <View style={styles.fullyBusyMessage}>
                  <AlertCircle size={20} color="#ef4444" strokeWidth={2} />
                  <Text style={styles.fullyBusyText}>
                    Ngày này đã bận cả ngày
                  </Text>
                </View>
              );
            }

            return (
              <View style={styles.timeSlotsContainer}>
                <Text style={styles.timeSlotsTitle}>
                  Chọn khoảng thời gian cho ngày{" "}
                  {expandedDateObj.toLocaleDateString("vi-VN")}:
                </Text>

                {/* Start Time Picker */}
                <View style={styles.timeRangeSection}>
                  <View style={styles.timePickerGroup}>
                    <Text style={styles.timePickerLabel}>Thời gian bắt đầu:</Text>
                    <View style={styles.timePickerContainer}>
                      <ScrollView
                        style={styles.timePickerScroll}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                      >
                        {generateHourOptions().map((hour) => (
                          <TouchableOpacity
                            key={hour}
                            style={[
                              styles.timePickerOption,
                              startTimeHour === hour && styles.timePickerOptionSelected,
                            ]}
                            onPress={() => {
                              setStartTimeHour(hour);
                              setSelectedDurationPreset(null); // Clear preset when changing start time
                            }}
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
                        nestedScrollEnabled={true}
                      >
                        {generateMinuteOptions().map((minute) => (
                          <TouchableOpacity
                            key={minute}
                            style={[
                              styles.timePickerOption,
                              startTimeMinute === minute && styles.timePickerOptionSelected,
                            ]}
                            onPress={() => {
                              setStartTimeMinute(minute);
                              setSelectedDurationPreset(null); // Clear preset when changing start time
                            }}
                          >
                            <Text
                              style={[
                                styles.timePickerOptionText,
                                startTimeMinute === minute && styles.timePickerOptionTextSelected,
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

                {/* Duration Presets */}
                {startTimeHour && startTimeMinute && (
                  <View style={styles.durationPresetsSection}>
                    <Text style={styles.durationPresetsLabel}>Chọn thời lượng (nhanh):</Text>
                    <View style={styles.durationPresetsGrid}>
                      {[1, 2, 3, 4].map((duration) => {
                        const isDisabled =
                          (remainTime !== undefined && duration > remainTime) ||
                          (maxDuration !== undefined && duration > maxDuration);
                        const isSelected = selectedDurationPreset === duration;

                        return (
                          <TouchableOpacity
                            key={duration}
                            style={[
                              styles.durationPresetButton,
                              isSelected && styles.durationPresetButtonSelected,
                              isDisabled && styles.durationPresetButtonDisabled,
                            ]}
                            onPress={() => !isDisabled && handleDurationPreset(duration, busySlots)}
                            disabled={isDisabled}
                          >
                            <Text
                              style={[
                                styles.durationPresetText,
                                isSelected && styles.durationPresetTextSelected,
                                isDisabled && styles.durationPresetTextDisabled,
                              ]}
                            >
                              {duration}h
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* End Time Picker (Manual) */}
                <View style={styles.timeRangeSection}>
                  <Text style={styles.timePickerLabel}>Hoặc chọn thời gian kết thúc thủ công:</Text>
                  <View style={styles.timeRangeRow}>
                    <View style={styles.timePickerGroup}>
                      <Text style={styles.timePickerLabel}>Đến:</Text>
                      <View style={styles.timePickerContainer}>
                        <ScrollView
                          style={styles.timePickerScroll}
                          showsVerticalScrollIndicator={false}
                          nestedScrollEnabled={true}
                        >
                          {generateHourOptions().map((hour) => (
                            <TouchableOpacity
                              key={hour}
                              style={[
                                styles.timePickerOption,
                                endTimeHour === hour && styles.timePickerOptionSelected,
                              ]}
                              onPress={() => {
                                setEndTimeHour(hour);
                                setTimeout(() => validateAndUpdateTimeRange(busySlots), 100);
                              }}
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
                          nestedScrollEnabled={true}
                        >
                          {generateMinuteOptions().map((minute) => (
                            <TouchableOpacity
                              key={minute}
                              style={[
                                styles.timePickerOption,
                                endTimeMinute === minute && styles.timePickerOptionSelected,
                              ]}
                              onPress={() => {
                                setEndTimeMinute(minute);
                                setTimeout(() => validateAndUpdateTimeRange(busySlots), 100);
                              }}
                            >
                              <Text
                                style={[
                                  styles.timePickerOptionText,
                                  endTimeMinute === minute && styles.timePickerOptionTextSelected,
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

                  {timeError && (
                    <Text style={styles.timeError}>{timeError}</Text>
                  )}

                  {selectedStartTime && selectedEndTime && selectedDuration > 0 && !timeError && (
                    <View style={styles.selectedTimeDisplay}>
                      <Check
                        size={16}
                        color={AppColors.primary}
                        strokeWidth={3}
                      />
                      <Text style={styles.selectedTimeText}>
                        Đã chọn: {selectedStartTime} - {selectedEndTime} ({selectedDuration.toFixed(1)}h)
                      </Text>
                    </View>
                  )}

                  {remainTime !== undefined && (
                    <Text style={styles.remainTimeText}>
                      Thời gian còn lại: {remainTime}h
                    </Text>
                  )}
                </View>

                {/* Busy Times Info */}
                {busySlots.length > 0 && (
                  <View style={styles.busyTimesInfo}>
                    <Text style={styles.busyTimesTitle}>Thời gian bận:</Text>
                    <View style={styles.busyTimesList}>
                      {busySlots.map((slot, slotIndex) => (
                        <View key={slotIndex} style={styles.busyTimeItem}>
                          <Clock size={12} color="#ef4444" strokeWidth={2} />
                          <Text style={styles.busyTimeText}>
                            {formatTime(slot.startTime)} -{" "}
                            {formatTime(slot.endTime)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            );
          })()}
        </View>
      )}

      {/* Legend */}
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
    backgroundColor: "#dcfce7", // Light green
    borderWidth: 1,
    borderColor: "#86efac",
  },
  dayButtonPartial: {
    backgroundColor: "#fef3c7", // Light yellow
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  dayButtonBusy: {
    backgroundColor: "#fee2e2", // Light red
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
  customTimeError: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: -4,
    marginBottom: 8,
  },
  timeRangeSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  timeRangeRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between",
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginVertical: 2,
  },
  timePickerOptionSelected: {
    backgroundColor: AppColors.primary,
  },
  timePickerOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  timePickerOptionTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
  timePickerSeparator: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginHorizontal: 4,
  },
  timeError: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 8,
    marginBottom: 4,
  },
  remainTimeText: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.primary,
    marginTop: 8,
  },
  durationPresetsSection: {
    marginTop: 16,
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
    gap: 12,
    flexWrap: "wrap",
  },
  durationPresetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  durationPresetButtonSelected: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  durationPresetButtonDisabled: {
    opacity: 0.4,
    backgroundColor: "#f1f5f9",
  },
  durationPresetText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748b",
  },
  durationPresetTextSelected: {
    color: "#ffffff",
  },
  durationPresetTextDisabled: {
    color: "#94a3b8",
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
