import { useCallback, useEffect, useMemo, useState } from "react";

import {
    IInstructorSchedule,
    IInstructorBookedSession,
} from "@/features/booking/bookingThunk";
import {
    getInstructorSchedule,
    getInstructorBookedSessions,
} from "@/features/schedule/scheduleThunk";
import { useAppDispatch } from "@/lib/redux/hooks";
import { AppDispatch } from "@/lib/redux/store";
import { ScheduleBusyTime } from "./types";

export interface DateRange {
    start: Date;
    end: Date;
}

const formatTimeLabel = (time: string) => time.replace(":", "h");

const getDateFromISO = (isoString: string): string => isoString.split("T")[0];

const getTimeFromISO = (isoString: string): string => {
    const timePart = isoString.split("T")[1];
    if (timePart) {
        const [hours, minutes] = timePart.split(":");
        return `${hours}:${minutes}`;
    }

    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
};

const formatDurationWithMinutesValue = (hours: number): string => {
    const minutes = Math.round(hours * 60);
    const normalizedHours = Number.isInteger(hours)
        ? hours
        : parseFloat(hours.toFixed(1));
    return `${normalizedHours}h (${minutes} phút)`;
};

const convertTimeToMinutes = (hour: string, minute: string) => {
    const parsedHour = parseInt(hour, 10);
    const parsedMinute = parseInt(minute, 10);
    if (Number.isNaN(parsedHour) || Number.isNaN(parsedMinute)) {
        return null;
    }
    return parsedHour * 60 + parsedMinute;
};

const findBusySlotForMinutes = (
    minutes: number | null,
    busySlots: ScheduleBusyTime[]
) => {
    if (minutes === null) return null;
    return (
        busySlots.find((slot) => {
            const [startHour, startMin] = slot.startTime.split(":").map(Number);
            const [endHour, endMin] = slot.endTime.split(":").map(Number);
            const slotStart = startHour * 60 + startMin;
            const slotEnd = endHour * 60 + endMin;
            return minutes >= slotStart && minutes < slotEnd;
        }) || null
    );
};

const getDurationHoursBetweenTimes = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);

    if (
        Number.isNaN(startHour) ||
        Number.isNaN(startMin) ||
        Number.isNaN(endHour) ||
        Number.isNaN(endMin)
    ) {
        return 0;
    }

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes > startMinutes) {
        return (endMinutes - startMinutes) / 60;
    }

    // Handle sessions that wrap past midnight (e.g., 00:00 next day)
    const minutesUntilMidnight = 24 * 60 - startMinutes;
    return (minutesUntilMidnight + endMinutes) / 60;
};

export class ScheduleViewModel {
    private dispatch: AppDispatch;
    private schedule: IInstructorSchedule[] = [];

    constructor(dispatch: AppDispatch) {
        this.dispatch = dispatch;
    }

    getSchedule = async (
        instructorId: string
    ): Promise<IInstructorSchedule[]> => {
        try {
            const response = await this.dispatch(
                getInstructorSchedule({ instructorId })
            ).unwrap();
            const schedule: IInstructorSchedule[] = (response as any).value || response;
            this.schedule = schedule;
            return schedule;
        } catch (error) {
            console.log("Failed to get instructor schedule:", error);
            throw error;
        }
    };

    getAvailableDateRanges = (
        schedule?: IInstructorSchedule[]
    ): DateRange[] => {
        const scheduleToUse = schedule || this.schedule;
        if (!scheduleToUse || scheduleToUse.length === 0) return [];

        return scheduleToUse.map((slot) => {
            const startDate = new Date(slot.startTime + "T00:00:00");
            const endDate = new Date(slot.endTime + "T00:00:00");

            return {
                start: startDate,
                end: endDate,
            };
        });
    };

    isDateInAvailableRange = (
        date: Date,
        availableRanges?: DateRange[]
    ): boolean => {
        const ranges = availableRanges || this.getAvailableDateRanges();
        if (ranges.length === 0) return true;

        const dateOnly = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

        return ranges.some((range) => {
            const rangeStart = new Date(
                range.start.getFullYear(),
                range.start.getMonth(),
                range.start.getDate()
            );
            const rangeEnd = new Date(
                range.end.getFullYear(),
                range.end.getMonth(),
                range.end.getDate()
            );
            return dateOnly >= rangeStart && dateOnly <= rangeEnd;
        });
    };

    formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    getCurrentSchedule = (): IInstructorSchedule[] => {
        return this.schedule;
    };

    setSchedule = (schedule: IInstructorSchedule[]): void => {
        this.schedule = schedule;
    };
}

const createScheduleViewModel = (dispatch: AppDispatch) =>
    new ScheduleViewModel(dispatch);

export const useScheduleViewModel = (): ScheduleViewModel => {
    const dispatch = useAppDispatch();
    return useMemo(() => createScheduleViewModel(dispatch), [dispatch]);
};

export interface UseScheduleStep1Params {
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

export interface ScheduleCalendarViewModelProps {
    currentMonthDate: Date;
    selectedDate: string | null;
    onNavigateMonth: (direction: "prev" | "next") => void;
    onDayPress: (date: Date) => void;
    isDateFullyBusy: (date: Date) => boolean;
    isPastDate: (date: Date) => boolean;
    isDateInRange: (date: Date) => boolean;
    getDateStatus: (date: Date) => "free" | "partial" | "busy";
    formatDate: (date: Date) => string;
}

export interface ScheduleTimePickerState {
    startTimeHour: string;
    startTimeMinute: string;
    endTimeHour: string;
    endTimeMinute: string;
    selectedDurationPreset: number | null;
    timeError: string | null;
}

export interface ScheduleTimePickerHelpers {
    generateHourOptions: () => string[];
    generateMinuteOptions: () => string[];
    formatDurationWithMinutes: (hours: number) => string;
    formatTime: (time: string) => string;
}

export interface ScheduleTimePickerHandlers {
    onStartHourChange: (hour: string) => void;
    onStartMinuteChange: (minute: string) => void;
    onEndHourChange: (hour: string) => void;
    onEndMinuteChange: (minute: string) => void;
    onDurationPresetPress: (duration: number) => void;
}

export interface ScheduleStep1ViewModelResult {
    isLoading: boolean;
    calendarProps: ScheduleCalendarViewModelProps;
    expandedDateString: string | null;
    expandedDateLabel: string | null;
    expandedBusySlots: ScheduleBusyTime[];
    isExpandedDateFullyBusy: boolean;
    timePickerState: ScheduleTimePickerState;
    timePickerHelpers: ScheduleTimePickerHelpers;
    timePickerHandlers: ScheduleTimePickerHandlers;
}

export const useScheduleStep1ViewModel = (
    params: UseScheduleStep1Params
): ScheduleStep1ViewModelResult => {
    const {
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
    } = params;

    const dispatch = useAppDispatch();
    const scheduleViewModel = useMemo(
        () => createScheduleViewModel(dispatch),
        [dispatch]
    );
    const today = useMemo(() => new Date(), []);

    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [expandedDate, setExpandedDate] = useState<string | null>(null);
    const [startTimeHour, setStartTimeHour] = useState("");
    const [startTimeMinute, setStartTimeMinute] = useState("");
    const [endTimeHour, setEndTimeHour] = useState("");
    const [endTimeMinute, setEndTimeMinute] = useState("");
    const [timeError, setTimeError] = useState<string | null>(null);
    const [selectedDurationPreset, setSelectedDurationPreset] = useState<
        number | null
    >(null);
    const [instructorSchedule, setInstructorSchedule] = useState<
        IInstructorSchedule[]
    >([]);
    const [instructorBookedSessions, setInstructorBookedSessions] = useState<
        IInstructorBookedSession[]
    >([]);
    const [isLoading, setIsLoading] = useState(false);

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

    const fetchInstructorData = useCallback(async () => {
        setIsLoading(true);
        const scheduleResult = await dispatch(
            getInstructorSchedule({ instructorId })
        ).unwrap();
        const scheduleData = (scheduleResult as any).value || scheduleResult;
        setInstructorSchedule(scheduleData);
        
        scheduleViewModel.setSchedule(scheduleData);
        const sessionsResult = await dispatch(
            getInstructorBookedSessions({ instructorId })
        ).unwrap();
        const sessionsData = (sessionsResult as any).value || sessionsResult;
        setInstructorBookedSessions(sessionsData);

        setIsLoading(false);

    }, [dispatch, instructorId, scheduleViewModel]);

    useEffect(() => {
        fetchInstructorData();
    }, [fetchInstructorData]);

    const availableDateRanges = useMemo(
        () => scheduleViewModel.getAvailableDateRanges(instructorSchedule),
        [scheduleViewModel, instructorSchedule]
    );

    const formatDate = useCallback(
        (date: Date) => scheduleViewModel.formatDate(date),
        [scheduleViewModel]
    );

    const isDateSelectable = useCallback(
        (date: Date) =>
            scheduleViewModel.isDateInAvailableRange(date, availableDateRanges),
        [scheduleViewModel, availableDateRanges]
    );

    const isPastDate = useCallback(
        (date: Date) => {
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
        },
        [today]
    );

    const getBusyTimesForDate = useCallback(
        (date: Date): ScheduleBusyTime[] => {
            const dateStr = formatDate(date);
            const busySlots: ScheduleBusyTime[] = [];

            const mockBusyTime = instructorBusyTimes.find(
                (bt) => bt.date === dateStr
            );
            if (mockBusyTime) {
                busySlots.push(...mockBusyTime.busySlots);
            }

            const bookedForDate = instructorBookedSessions.filter((session) => {
                const sessionDate = getDateFromISO(session.startTime);
                return sessionDate === dateStr;
            });

            bookedForDate.forEach((session) => {
                const startTime = getTimeFromISO(session.startTime);
                const endTime = getTimeFromISO(session.endTime);
                busySlots.push({
                    startTime,
                    endTime,
                });
            });

            return busySlots;
        },
        [formatDate, instructorBusyTimes, instructorBookedSessions]
    );

    const getDateStatus = useCallback(
        (date: Date): "free" | "partial" | "busy" => {
            const busyTimes = getBusyTimesForDate(date);
            if (busyTimes.length === 0) return "free";

            const totalBusyHours = busyTimes.reduce((total, slot) => {
                return total + getDurationHoursBetweenTimes(slot.startTime, slot.endTime);
            }, 0);

            if (totalBusyHours >= 14) return "busy";
            return "partial";
        },
        [getBusyTimesForDate]
    );

    const isDateFullyBusy = useCallback(
        (date: Date) => getDateStatus(date) === "busy",
        [getDateStatus]
    );

    const currentMonthDate = useMemo(
        () => new Date(currentYear, currentMonth),
        [currentYear, currentMonth]
    );

    const navigateMonth = useCallback(
        (direction: "prev" | "next") => {
            setExpandedDate(null);
            if (direction === "prev") {
                if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear((prev) => prev - 1);
                } else {
                    setCurrentMonth((prev) => prev - 1);
                }
            } else {
                if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear((prev) => prev + 1);
                } else {
                    setCurrentMonth((prev) => prev + 1);
                }
            }
        },
        [currentMonth]
    );

    const handleDatePress = useCallback(
        (date: Date) => {
            const dateStr = formatDate(date);
            const fullyBusy = isDateFullyBusy(date);
            const past = isPastDate(date);
            const inRange = isDateSelectable(date);

            if (fullyBusy || past || !inRange) return;

            if (expandedDate === dateStr) {
                setExpandedDate(null);
            } else {
                setExpandedDate(dateStr);
                onDateSelect(dateStr);
                setStartTimeHour("");
                setStartTimeMinute("");
                setEndTimeHour("");
                setEndTimeMinute("");
                setTimeError(null);
                setSelectedDurationPreset(null);
            }
        },
        [
            expandedDate,
            formatDate,
            isDateFullyBusy,
            isPastDate,
            isDateSelectable,
            onDateSelect,
        ]
    );

    const validateTimeRange = useCallback(
        (
            startTime: string,
            endTime: string,
            duration: number,
            busySlots: ScheduleBusyTime[]
        ) => {
            setTimeError(null);

            const [startHour, startMin] = startTime.split(":").map(Number);
            const [endHour, endMin] = endTime.split(":").map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;

            if (startMinutes >= endMinutes) {
                setTimeError("Thời gian kết thúc phải sau thời gian bắt đầu");
                return;
            }

            for (const busySlot of busySlots) {
                const busyStart = busySlot.startTime.split(":").map(Number);
                const busyEnd = busySlot.endTime.split(":").map(Number);
                const busyStartMinutes = busyStart[0] * 60 + busyStart[1];
                const busyEndMinutes = busyEnd[0] * 60 + busyEnd[1];

                if (startMinutes < busyEndMinutes && endMinutes > busyStartMinutes) {
                    setTimeError(
                        `Khung giờ này trùng với thời gian bận: ${busySlot.startTime} - ${busySlot.endTime}`
                    );
                    return;
                }
            }

            if (remainTime !== undefined && duration > remainTime) {
                setTimeError(
                    `Thời lượng vượt quá thời gian còn lại (${remainTime}h)`
                );
                return;
            }

            if (maxDuration !== undefined && duration > maxDuration) {
                setTimeError(
                    `Thời lượng vượt quá thời lượng tối đa (${maxDuration}h)`
                );
                return;
            }

            onStartTimeSelect(startTime);
            onEndTimeSelect(endTime);
            onDurationChange(duration);
        },
        [remainTime, maxDuration, onStartTimeSelect, onEndTimeSelect, onDurationChange]
    );

    const validateAndUpdateTimeRange = useCallback(
        (busySlots: ScheduleBusyTime[]) => {
            if (!startTimeHour || !startTimeMinute || !endTimeHour || !endTimeMinute) {
                return;
            }

            const startHour = parseInt(startTimeHour, 10);
            const startMin = parseInt(startTimeMinute, 10);
            const endHour = parseInt(endTimeHour, 10);
            const endMin = parseInt(endTimeMinute, 10);

            if (
                Number.isNaN(startHour) ||
                Number.isNaN(startMin) ||
                Number.isNaN(endHour) ||
                Number.isNaN(endMin) ||
                startHour < 0 ||
                startHour > 23 ||
                startMin < 0 ||
                startMin > 59 ||
                endHour < 0 ||
                endHour > 23 ||
                endMin < 0 ||
                endMin > 59
            ) {
                setTimeError("Giờ không hợp lệ");
                return;
            }

            const startTime = `${startHour.toString().padStart(2, "0")}:${startMin
                .toString()
                .padStart(2, "0")}`;
            const endTime = `${endHour.toString().padStart(2, "0")}:${endMin
                .toString()
                .padStart(2, "0")}`;

            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            const duration = (endMinutes - startMinutes) / 60;

            setSelectedDurationPreset(null);
            validateTimeRange(startTime, endTime, duration, busySlots);
        },
        [
            endTimeHour,
            endTimeMinute,
            startTimeHour,
            startTimeMinute,
            validateTimeRange,
        ]
    );

    const expandedDateObj = useMemo(
        () => (expandedDate ? new Date(expandedDate + "T00:00:00") : null),
        [expandedDate]
    );

    const expandedBusySlots = useMemo(
        () =>
            expandedDateObj ? getBusyTimesForDate(expandedDateObj) : ([] as ScheduleBusyTime[]),
        [expandedDateObj, getBusyTimesForDate]
    );

    const isExpandedDateFullyBusy = useMemo(
        () => (expandedDateObj ? isDateFullyBusy(expandedDateObj) : false),
        [expandedDateObj, isDateFullyBusy]
    );

    const expandedDateLabel = useMemo(
        () => (expandedDateObj ? expandedDateObj.toLocaleDateString("vi-VN") : null),
        [expandedDateObj]
    );

    const validateStartTimeAgainstBusySlots = useCallback(
        (hour: string, minute: string, busySlots: ScheduleBusyTime[]) => {
            if (!hour || !minute) return true;
            const minutes = convertTimeToMinutes(hour, minute);
            const conflictSlot = findBusySlotForMinutes(minutes, busySlots);
            if (conflictSlot) {
                setTimeError(
                    `Giờ bắt đầu nằm trong khoảng bận ${conflictSlot.startTime} - ${conflictSlot.endTime}`
                );
                return false;
            }
            setTimeError(null);
            return true;
        },
        []
    );

    const handleStartHourChange = useCallback(
        (hour: string) => {
            setStartTimeHour(hour);
            setSelectedDurationPreset(null);
            if (startTimeMinute) {
                validateStartTimeAgainstBusySlots(hour, startTimeMinute, expandedBusySlots);
            } else {
                setTimeError(null);
            }
        },
        [
            expandedBusySlots,
            startTimeMinute,
            validateStartTimeAgainstBusySlots,
        ]
    );

    const handleStartMinuteChange = useCallback(
        (minute: string) => {
            setStartTimeMinute(minute);
            setSelectedDurationPreset(null);
            if (startTimeHour) {
                validateStartTimeAgainstBusySlots(startTimeHour, minute, expandedBusySlots);
            } else {
                setTimeError(null);
            }
        },
        [
            expandedBusySlots,
            startTimeHour,
            validateStartTimeAgainstBusySlots,
        ]
    );

    const handleEndHourChange = useCallback(
        (hour: string) => {
            setEndTimeHour(hour);
            setTimeout(() => validateAndUpdateTimeRange(expandedBusySlots), 100);
        },
        [expandedBusySlots, validateAndUpdateTimeRange]
    );

    const handleEndMinuteChange = useCallback(
        (minute: string) => {
            setEndTimeMinute(minute);
            setTimeout(() => validateAndUpdateTimeRange(expandedBusySlots), 100);
        },
        [expandedBusySlots, validateAndUpdateTimeRange]
    );

    const handleDurationPreset = useCallback(
        (duration: number) => {
            if (!startTimeHour || !startTimeMinute) {
                setTimeError("Vui lòng chọn thời gian bắt đầu trước");
                return;
            }

            const startHour = parseInt(startTimeHour, 10);
            const startMin = parseInt(startTimeMinute, 10);

            if (Number.isNaN(startHour) || Number.isNaN(startMin)) {
                return;
            }

            const startMinutes = startHour * 60 + startMin;
            const endMinutes = startMinutes + duration * 60;
            const endHour = Math.floor(endMinutes / 60);
            const endMin = endMinutes % 60;

            if (endHour > 23) {
                setTimeError(
                    `Thời lượng ${formatDurationWithMinutesValue(
                        duration
                    )} vượt quá 24h. Vui lòng chọn thời gian bắt đầu sớm hơn.`
                );
                return;
            }

            setEndTimeHour(endHour.toString().padStart(2, "0"));
            setEndTimeMinute(endMin.toString().padStart(2, "0"));
            setSelectedDurationPreset(duration);

            setTimeout(() => {
                const startTime = `${startHour.toString().padStart(2, "0")}:${startMin
                    .toString()
                    .padStart(2, "0")}`;
                const endTime = `${endHour.toString().padStart(2, "0")}:${endMin
                    .toString()
                    .padStart(2, "0")}`;
                validateTimeRange(startTime, endTime, duration, expandedBusySlots);
            }, 100);
        },
        [
            expandedBusySlots,
            startTimeHour,
            startTimeMinute,
            validateTimeRange,
        ]
    );

    const generateHourOptions = useCallback(
        () => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")),
        []
    );

    const generateMinuteOptions = useCallback(
        () => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0")),
        []
    );

    return {
        isLoading,
        calendarProps: {
            currentMonthDate,
            selectedDate,
            onNavigateMonth: navigateMonth,
            onDayPress: handleDatePress,
            isDateFullyBusy,
            isPastDate,
            isDateInRange: isDateSelectable,
            getDateStatus,
            formatDate,
        },
        expandedDateString: expandedDate,
        expandedDateLabel,
        expandedBusySlots,
        isExpandedDateFullyBusy,
        timePickerState: {
            startTimeHour,
            startTimeMinute,
            endTimeHour,
            endTimeMinute,
            selectedDurationPreset,
            timeError,
        },
        timePickerHelpers: {
            generateHourOptions,
            generateMinuteOptions,
            formatDurationWithMinutes: formatDurationWithMinutesValue,
            formatTime: formatTimeLabel,
        },
        timePickerHandlers: {
            onStartHourChange: handleStartHourChange,
            onStartMinuteChange: handleStartMinuteChange,
            onEndHourChange: handleEndHourChange,
            onEndMinuteChange: handleEndMinuteChange,
            onDurationPresetPress: handleDurationPreset,
        },
    };
};
