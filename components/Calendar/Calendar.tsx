import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import ColorBarIndicator from './ColorBarIndicator';

export interface CalendarEvent {
    id: string;
    date: string;
    time?: string;
    startTime?: string;
    endTime?: string;
    type: 'busy' | 'available';
    session?: 'morning' | 'afternoon';
    title?: string;
    description?: string;
}

export interface CalendarProps {
    events: CalendarEvent[];
    onDateSelect: (date: string, session?: 'morning' | 'afternoon') => void;
    onWeekSelect: (weekStart: string, weekEnd: string) => void;
    onMultipleDateSelect: (dates: string[]) => void;
    mode: 'session' | 'day' | 'week' | 'cycle';
    selectedDates: string[];
    selectedWeek?: { start: string; end: string };
    onMonthChange?: (month: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({
    events,
    onDateSelect,
    onWeekSelect,
    onMultipleDateSelect,
    mode,
    selectedDates,
    selectedWeek,
    onMonthChange
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedSession, setSelectedSession] = useState<'morning' | 'afternoon' | null>(null);
    const [weekDates, setWeekDates] = useState<string[]>([]);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());


    // Lấy các ngày trong tuần
    const getWeekDates = (date: string) => {
        const startDate = new Date(date);
        const day = startDate.getDay();
        const diff = startDate.getDate() - day;
        const weekStart = new Date(startDate.setDate(diff));

        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            weekDates.push(date.toISOString().split('T')[0]);
        }
        return weekDates;
    };

    // Lấy thông tin sự kiện cho một ngày
    const getDayEvents = (dateString: string) => {
        return events.filter(event => event.date === dateString);
    };

    // Lấy thời gian rảnh/bận cho một ngày
    const getDaySchedule = (dateString: string) => {
        const dayEvents = getDayEvents(dateString);
        const morningEvents = dayEvents.filter(e => e.session === 'morning');
        const afternoonEvents = dayEvents.filter(e => e.session === 'afternoon');

        return {
            morning: morningEvents.length > 0 ? morningEvents[0] : null,
            afternoon: afternoonEvents.length > 0 ? afternoonEvents[0] : null
        };
    };

    // Tạo danh sách năm
    const generateYears = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
            years.push(i);
        }
        return years;
    };

    // Tạo danh sách tháng
    const generateMonths = () => {
        return [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
    };

    // Cập nhật tháng hiện tại
    const updateCurrentMonth = (year: number, month: number) => {
        const newDate = new Date(year, month, 1);
        setCurrentMonth(newDate);
        setSelectedYear(year);
        setSelectedMonth(month);
    };

    const handleDatePress = (day: any) => {
        const dateString = day.dateString;

        if (mode === 'session') {
            setSelectedDate(dateString);
            setSelectedSession(null);
        } else if (mode === 'day') {
            if (selectedDates.includes(dateString)) {
                onMultipleDateSelect(selectedDates.filter(d => d !== dateString));
            } else {
                onMultipleDateSelect([...selectedDates, dateString]);
            }
        } else if (mode === 'week') {
            const weekDates = getWeekDates(dateString);
            setWeekDates(weekDates);
            onWeekSelect(weekDates[0], weekDates[6]);
        } else if (mode === 'cycle') {
            // Trong chế độ chu kỳ, chọn tất cả ngày cùng thứ trong tuần
            const selectedDayOfWeek = new Date(dateString).getDay();
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();

            // Lấy tất cả ngày cùng thứ trong tháng
            const allDaysInMonth: string[] = [];
            for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
                const date = new Date(year, month, day);
                if (date.getDay() === selectedDayOfWeek) {
                    allDaysInMonth.push(date.toISOString().split('T')[0]);
                }
            }

            // Kiểm tra xem tất cả ngày cùng thứ đã được chọn chưa
            const allSelected = allDaysInMonth.every(day => selectedDates.includes(day));

            if (allSelected) {
                // Nếu đã chọn tất cả, thì bỏ chọn tất cả
                onMultipleDateSelect(selectedDates.filter(d => !allDaysInMonth.includes(d)));
            } else {
                // Nếu chưa chọn tất cả, thì chọn tất cả ngày cùng thứ
                const newSelectedDates = [...selectedDates];
                allDaysInMonth.forEach(day => {
                    if (!newSelectedDates.includes(day)) {
                        newSelectedDates.push(day);
                    }
                });
                onMultipleDateSelect(newSelectedDates);
            }
        }
    };

    const handleSessionSelect = (session: 'morning' | 'afternoon') => {
        setSelectedSession(session);
        onDateSelect(selectedDate, session);
    };

    const renderSessionSelector = () => {
        if (mode !== 'session' || !selectedDate) return null;

        return (
            <View style={styles.sessionContainer}>
                <Text style={styles.sessionTitle}>Chọn buổi:</Text>
                <View style={styles.sessionButtons}>
                    <TouchableOpacity
                        style={[
                            styles.sessionButton,
                            selectedSession === 'morning' && styles.sessionButtonSelected
                        ]}
                        onPress={() => handleSessionSelect('morning')}
                    >
                        <Text style={[
                            styles.sessionButtonText,
                            selectedSession === 'morning' && styles.sessionButtonTextSelected
                        ]}>
                            Sáng
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.sessionButton,
                            selectedSession === 'afternoon' && styles.sessionButtonSelected
                        ]}
                        onPress={() => handleSessionSelect('afternoon')}
                    >
                        <Text style={[
                            styles.sessionButtonText,
                            selectedSession === 'afternoon' && styles.sessionButtonTextSelected
                        ]}>
                            Chiều
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderWeekSelector = () => {
        if (mode !== 'week' || weekDates.length === 0) return null;

        return (
            <View style={styles.weekContainer}>
                <Text style={styles.weekTitle}>Chọn các ngày trong tuần:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.weekDays}>
                        {weekDates.map((date, index) => {
                            const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                            const isSelected = selectedDates.includes(date);
                            const isBusy = events.some(e => e.date === date && e.type === 'busy');

                            return (
                                <TouchableOpacity
                                    key={date}
                                    style={[
                                        styles.weekDayButton,
                                        isSelected && styles.weekDayButtonSelected,
                                        isBusy && styles.weekDayButtonBusy
                                    ]}
                                    onPress={() => {
                                        if (isBusy) return;
                                        if (isSelected) {
                                            onMultipleDateSelect(selectedDates.filter(d => d !== date));
                                        } else {
                                            onMultipleDateSelect([...selectedDates, date]);
                                        }
                                    }}
                                >
                                    <Text style={[
                                        styles.weekDayText,
                                        isSelected && styles.weekDayTextSelected,
                                        isBusy && styles.weekDayTextBusy
                                    ]}>
                                        {dayNames[index]}
                                    </Text>
                                    <Text style={[
                                        styles.weekDayDate,
                                        isSelected && styles.weekDayTextSelected,
                                        isBusy && styles.weekDayTextBusy
                                    ]}>
                                        {new Date(date).getDate()}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>
        );
    };

    // Tạo calendar grid
    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        // Header với tên các ngày
        const headerDays = dayNames.map(day => (
            <View key={day} style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>{day}</Text>
            </View>
        ));

        // Tạo 6 tuần (42 ngày)
        for (let week = 0; week < 6; week++) {
            const weekDays = [];
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (week * 7) + day);

                const dateString = currentDate.toISOString().split('T')[0];
                const isCurrentMonth = currentDate.getMonth() === month;
                const isToday = dateString === new Date().toISOString().split('T')[0];
                const isSelected = selectedDates.includes(dateString);
                const daySchedule = getDaySchedule(dateString);
                const hasEvents = daySchedule.morning || daySchedule.afternoon;

                weekDays.push(
                    <TouchableOpacity
                        key={dateString}
                        style={[
                            styles.dayButton,
                            !isCurrentMonth && styles.dayButtonOtherMonth,
                            isToday && styles.dayButtonToday,
                            isSelected && styles.dayButtonSelected,
                            hasEvents && styles.dayButtonWithEvents
                        ]}
                        onPress={() => handleDatePress({ dateString })}
                    >
                        <Text style={[
                            styles.dayText,
                            !isCurrentMonth && styles.dayTextOtherMonth,
                            isToday && styles.dayTextToday,
                            isSelected && styles.dayTextSelected
                        ]}>
                            {currentDate.getDate()}
                        </Text>

                        <ColorBarIndicator events={events} date={dateString} />

                        {hasEvents && (
                            <View style={styles.daySchedule}>
                                {daySchedule.morning && (
                                    <View style={styles.scheduleRow}>
                                        <View style={[
                                            styles.scheduleBar,
                                            daySchedule.morning.type === 'busy' ? styles.scheduleBarBusy : styles.scheduleBarAvailable
                                        ]} />
                                        <View style={styles.scheduleInfo}>
                                            <Text style={[
                                                styles.scheduleTime,
                                                daySchedule.morning.type === 'busy' ? styles.scheduleTimeBusy : styles.scheduleTimeAvailable
                                            ]}>
                                                {daySchedule.morning.startTime || '7:00'}-{daySchedule.morning.endTime || '11:00'}
                                            </Text>
                                            <Text style={[
                                                styles.scheduleIcon,
                                                daySchedule.morning.type === 'busy' ? styles.scheduleIconBusy : styles.scheduleIconAvailable
                                            ]}>
                                                {daySchedule.morning.type === 'busy' ? '🔴' : '🟢'}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                                {daySchedule.afternoon && (
                                    <View style={styles.scheduleRow}>
                                        <View style={[
                                            styles.scheduleBar,
                                            daySchedule.afternoon.type === 'busy' ? styles.scheduleBarBusy : styles.scheduleBarAvailable
                                        ]} />
                                        <View style={styles.scheduleInfo}>
                                            <Text style={[
                                                styles.scheduleTime,
                                                daySchedule.afternoon.type === 'busy' ? styles.scheduleTimeBusy : styles.scheduleTimeAvailable
                                            ]}>
                                                {daySchedule.afternoon.startTime || '13:00'}-{daySchedule.afternoon.endTime || '17:00'}
                                            </Text>
                                            <Text style={[
                                                styles.scheduleIcon,
                                                daySchedule.afternoon.type === 'busy' ? styles.scheduleIconBusy : styles.scheduleIconAvailable
                                            ]}>
                                                {daySchedule.afternoon.type === 'busy' ? '🔴' : '🟢'}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}
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
            <View style={styles.calendarGrid}>
                <View style={styles.calendarHeader}>
                    <TouchableOpacity
                        style={styles.monthButton}
                        onPress={() => {
                            const newMonth = new Date(currentMonth);
                            newMonth.setMonth(newMonth.getMonth() - 1);
                            setCurrentMonth(newMonth);
                            onMonthChange?.(newMonth);
                        }}
                    >
                        <Text style={styles.monthButtonText}>‹</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.monthTitleContainer}
                        onPress={() => setShowMonthPicker(!showMonthPicker)}
                    >
                        <Text style={styles.monthTitle}>
                            {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.monthButton}
                        onPress={() => {
                            const newMonth = new Date(currentMonth);
                            newMonth.setMonth(newMonth.getMonth() + 1);
                            setCurrentMonth(newMonth);
                            onMonthChange?.(newMonth);
                        }}
                    >
                        <Text style={styles.monthButtonText}>›</Text>
                    </TouchableOpacity>
                </View>

                {showMonthPicker && (
                    <View style={styles.pickerContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.yearPicker}>
                                {generateYears().map(year => (
                                    <TouchableOpacity
                                        key={year}
                                        style={[
                                            styles.pickerItem,
                                            selectedYear === year && styles.pickerItemSelected
                                        ]}
                                        onPress={() => {
                                            setSelectedYear(year);
                                            updateCurrentMonth(year, selectedMonth);
                                        }}
                                    >
                                        <Text style={[
                                            styles.pickerText,
                                            selectedYear === year && styles.pickerTextSelected
                                        ]}>
                                            {year}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.monthPicker}>
                                {generateMonths().map((monthName, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.pickerItem,
                                            selectedMonth === index && styles.pickerItemSelected
                                        ]}
                                        onPress={() => {
                                            setSelectedMonth(index);
                                            updateCurrentMonth(selectedYear, index);
                                            setShowMonthPicker(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.pickerText,
                                            selectedMonth === index && styles.pickerTextSelected
                                        ]}>
                                            {monthName}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}

                <View style={styles.dayHeaders}>
                    {headerDays}
                </View>

                {days}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {renderCalendar()}

            {renderSessionSelector()}
            {renderWeekSelector()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    calendarGrid: {
        padding: 16,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    monthButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4ecdc4',
    },
    monthTitleContainer: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d4150',
    },
    pickerContainer: {
        backgroundColor: '#f8f9fa',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    yearPicker: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    monthPicker: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    pickerItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    pickerItemSelected: {
        backgroundColor: '#4ecdc4',
        borderColor: '#4ecdc4',
    },
    pickerText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6c757d',
    },
    pickerTextSelected: {
        color: '#ffffff',
    },
    dayHeaders: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    dayHeader: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    dayHeaderText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6c757d',
    },
    weekRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    dayButton: {
        flex: 1,
        minHeight: 80,
        alignItems: 'center',
        justifyContent: 'flex-start',
        margin: 2,
        borderRadius: 8,
        position: 'relative',
        paddingTop: 4,
    },
    dayButtonOtherMonth: {
        opacity: 0.3,
    },
    dayButtonToday: {
        backgroundColor: '#e8f5e8',
        borderWidth: 2,
        borderColor: '#4ecdc4',
    },
    dayButtonSelected: {
        backgroundColor: '#4ecdc4',
    },
    dayButtonBusy: {
        backgroundColor: '#ffebee',
        borderWidth: 1,
        borderColor: '#ffcdd2',
    },
    dayButtonAvailable: {
        backgroundColor: '#e8f5e8',
        borderWidth: 1,
        borderColor: '#4ecdc4',
    },
    dayButtonWithEvents: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    daySchedule: {
        width: '100%',
        marginTop: 2,
    },
    scheduleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 1,
        height: 12,
    },
    scheduleBar: {
        width: 3,
        height: 10,
        borderRadius: 2,
        marginRight: 4,
    },
    scheduleBarBusy: {
        backgroundColor: '#ff4757',
    },
    scheduleBarAvailable: {
        backgroundColor: '#2ed573',
    },
    scheduleInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    scheduleTime: {
        fontSize: 8,
        fontWeight: '500',
        flex: 1,
    },
    scheduleTimeBusy: {
        color: '#ff4757',
    },
    scheduleTimeAvailable: {
        color: '#2ed573',
    },
    scheduleIcon: {
        fontSize: 8,
        marginLeft: 2,
    },
    scheduleIconBusy: {
        // Màu đỏ cho icon bận
    },
    scheduleIconAvailable: {
        // Màu xanh cho icon rảnh
    },
    dayText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2d4150',
    },
    dayTextOtherMonth: {
        color: '#d9e1e8',
    },
    dayTextToday: {
        color: '#4ecdc4',
        fontWeight: 'bold',
    },
    dayTextSelected: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    dayTextBusy: {
        color: '#f44336',
    },
    dayTextAvailable: {
        color: '#4ecdc4',
    },
    dayDot: {
        position: 'absolute',
        bottom: 4,
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    dayDotBusy: {
        backgroundColor: '#ff6b6b',
    },
    dayDotAvailable: {
        backgroundColor: '#4ecdc4',
    },
    sessionContainer: {
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    sessionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#2d4150',
    },
    sessionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    sessionButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#dee2e6',
        alignItems: 'center',
    },
    sessionButtonSelected: {
        backgroundColor: '#4ecdc4',
        borderColor: '#4ecdc4',
    },
    sessionButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6c757d',
    },
    sessionButtonTextSelected: {
        color: '#ffffff',
    },
    weekContainer: {
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    weekTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#2d4150',
    },
    weekDays: {
        flexDirection: 'row',
        gap: 8,
    },
    weekDayButton: {
        width: 60,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#dee2e6',
        alignItems: 'center',
    },
    weekDayButtonSelected: {
        backgroundColor: '#4ecdc4',
        borderColor: '#4ecdc4',
    },
    weekDayButtonBusy: {
        backgroundColor: '#ffebee',
        borderColor: '#ffcdd2',
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6c757d',
        marginBottom: 4,
    },
    weekDayTextSelected: {
        color: '#ffffff',
    },
    weekDayTextBusy: {
        color: '#f44336',
    },
    weekDayDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d4150',
    },
});

export default Calendar;
