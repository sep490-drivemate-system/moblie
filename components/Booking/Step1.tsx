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
  getInstructorSchedule,
  getInstructorBookedSessions,
  IInstructorSchedule,
  IInstructorBookedSession,
} from "@/features/booking/bookingThunk";

const { width } = Dimensions.get("window");

interface Step1Props {
  instructorId: string;
  selectedDate: string | null;
  selectedTime: string | null;
  onDateSelect: (date: string) => void;
  onTimeSelect?: (time: string) => void;
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

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
};

const isTimeSlotAvailable = (time: string, busySlots: BusyTime[]): boolean => {
  if (!busySlots || busySlots.length === 0) return true;

  const [hour, minute] = time.split(":").map(Number);
  const timeMinutes = hour * 60 + minute;

  for (const busySlot of busySlots) {
    const [busyStartHour, busyStartMin] = busySlot.startTime
      .split(":")
      .map(Number);
    const [busyEndHour, busyEndMin] = busySlot.endTime.split(":").map(Number);
    const busyStartMinutes = busyStartHour * 60 + busyStartMin;
    const busyEndMinutes = busyEndHour * 60 + busyEndMin;

    if (timeMinutes >= busyStartMinutes && timeMinutes < busyEndMinutes) {
      return false;
    }
  }

  return true;
};

// Helper function to convert ISO datetime to date string (YYYY-MM-DD)
const getDateFromISO = (isoString: string): string => {
  return isoString.split('T')[0];
};

// Helper function to convert ISO datetime to time string (HH:MM)
const getTimeFromISO = (isoString: string): string => {
  // Extract time directly from ISO string to avoid timezone conversion
  const timePart = isoString.split('T')[1];
  if (timePart) {
    const [hours, minutes] = timePart.split(':');
    return `${hours}:${minutes}`;
  }
  // Fallback to Date parsing if format is different
  const date = new Date(isoString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// Helper function to get available date ranges from instructor schedule
// Schedule API returns date strings in YYYY-MM-DD format
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

// Helper function to check if a date is within available ranges
const isDateInAvailableRange = (date: Date, availableRanges: { start: Date; end: Date }[]): boolean => {
  if (availableRanges.length === 0) return true; // If no schedule, all dates available
  
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  return availableRanges.some(range => {
    const rangeStart = new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate());
    const rangeEnd = new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate());
    return dateOnly >= rangeStart && dateOnly <= rangeEnd;
  });
};

export default function Step1({
  instructorId,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  instructorBusyTimes = [],
}: Step1Props) {
  const dispatch = useAppDispatch();
  const today = new Date();
  
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [customTime, setCustomTime] = useState<string>("");
  
  // API data state
  const [instructorSchedule, setInstructorSchedule] = useState<IInstructorSchedule[]>([]);
  const [instructorBookedSessions, setInstructorBookedSessions] = useState<IInstructorBookedSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const timeSlots = generateTimeSlots();

  // Fetch instructor schedule and booked sessions on mount
  useEffect(() => {
    if (instructorId) {
      fetchInstructorData();
    }
  }, [instructorId]);

  const fetchInstructorData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch instructor schedule (available date ranges)
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
      
      // Debug log for date matching
      if (instructorBookedSessions.length > 0 && date.getDate() >= 13 && date.getDate() <= 14) {
        console.log(`Step1 - Date matching for ${dateStr}:`, {
          calendarDate: dateStr,
          sessionDate: sessionDate,
          matches: matches,
          sessionStartTime: session.startTime
        });
      }
      
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
    setCustomTime(""); // Clear custom time when navigating
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
      setCustomTime(""); // Clear custom time when closing
    } else {
      setExpandedDate(dateStr);
      setCustomTime(""); // Clear custom time when selecting new date
      onDateSelect(dateStr);
    }
  };

  const handleTimeSlotPress = (time: string, busySlots: BusyTime[]) => {
    if (isTimeSlotAvailable(time, busySlots) && onTimeSelect) {
      onTimeSelect(time);
      setCustomTime(""); // Clear custom time when selecting from grid
    }
  };

  const handleCustomTimeSubmit = (busySlots: BusyTime[]) => {
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(customTime)) {
      return; // Invalid format
    }

    // Check if time is available
    if (isTimeSlotAvailable(customTime, busySlots) && onTimeSelect) {
      onTimeSelect(customTime);
    }
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
                  Chọn giờ bắt đầu cho ngày{" "}
                  {expandedDateObj.toLocaleDateString("vi-VN")}:
                </Text>

                {/* Custom Time Input */}
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
                      onPress={() => handleCustomTimeSubmit(busySlots)}
                      disabled={!customTime}
                    >
                      <Text
                        style={{
                          ...styles.customTimeButtonText,
                          ...(customTime
                            ? styles.customTimeButtonTextActive
                            : {}),
                        }}
                      >
                        OK
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {selectedTime && (
                    <View style={styles.selectedTimeDisplay}>
                      <Check
                        size={16}
                        color={AppColors.primary}
                        strokeWidth={3}
                      />
                      <Text style={styles.selectedTimeText}>
                        Đã chọn: {formatTime(selectedTime)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Quick Time Slots (Optional) */}
                <Text style={styles.quickSlotsTitle}>Hoặc chọn nhanh:</Text>
                <View style={styles.timeSlotsGrid}>
                  {timeSlots.map((time) => {
                    const isAvailable = isTimeSlotAvailable(time, busySlots);
                    const isTimeSelected = selectedTime === time;

                    return (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.timeSlot,
                          isAvailable
                            ? styles.timeSlotAvailable
                            : styles.timeSlotBusy,
                          isTimeSelected && styles.timeSlotSelected,
                        ]}
                        onPress={() => handleTimeSlotPress(time, busySlots)}
                        disabled={!isAvailable}
                      >
                        {isTimeSelected && (
                          <Check size={14} color="#ffffff" strokeWidth={3} />
                        )}
                        <Text
                          style={[
                            styles.timeSlotText,
                            isAvailable
                              ? styles.timeSlotTextAvailable
                              : styles.timeSlotTextBusy,
                            isTimeSelected && styles.timeSlotTextSelected,
                          ]}
                        >
                          {formatTime(time)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
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
