import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CalendarEvent } from './Calendar';

const { width } = Dimensions.get('window');

interface TimelineViewProps {
    events: CalendarEvent[];
    selectedDates: string[];
    onDateSelect: (date: string, session?: 'morning' | 'afternoon') => void;
    onEventPress?: (event: CalendarEvent) => void;
    currentMonth: Date;
    onMonthChange: (month: Date) => void;
    mode?: 'session' | 'day' | 'week' | 'cycle';
    selectedSessions?: { [date: string]: ('morning' | 'afternoon')[] };
}

const TimelineView: React.FC<TimelineViewProps> = ({
    events,
    selectedDates,
    onDateSelect,
    onEventPress,
    currentMonth,
    onMonthChange,
    mode = 'day',
    selectedSessions = {}
}) => {
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const [weekAnchor, setWeekAnchor] = useState<Date>(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    );

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        // Chuyển sang chuẩn Thứ 2 -> Chủ nhật
        const mondayIndex = (firstDay + 6) % 7; // 0 = Thứ 2, 6 = Chủ nhật

        const days = [];

        // Thêm các ngày trống cho tuần đầu theo chuẩn Thứ 2 đầu tuần
        for (let i = 0; i < mondayIndex; i++) {
            days.push(null);
        }

        // Thêm các ngày trong tháng
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const getDayEvents = (date: Date) => {
        const dateString = formatDate(date);
        const busyEvents = events.filter(event => event.date === dateString);

        // Nếu là ngày quá khứ, không hiển thị events
        if (isPastDate(date)) {
            return [];
        }

        if (mode === 'session') {
            // Mode theo buổi: hiển thị cả sáng và chiều riêng lẻ
            const allEvents = [];

            // Kiểm tra sáng
            const morningBusy = busyEvents.find(event => event.session === 'morning');
            if (morningBusy) {
                allEvents.push(morningBusy);
            } else {
                allEvents.push({
                    id: `${dateString}-morning-available`,
                    date: dateString,
                    type: 'available' as const,
                    session: 'morning' as const,
                    title: 'Rảnh',
                    description: 'Có thể thuê'
                });
            }

            // Kiểm tra chiều
            const afternoonBusy = busyEvents.find(event => event.session === 'afternoon');
            if (afternoonBusy) {
                allEvents.push(afternoonBusy);
            } else {
                allEvents.push({
                    id: `${dateString}-afternoon-available`,
                    date: dateString,
                    type: 'available' as const,
                    session: 'afternoon' as const,
                    title: 'Rảnh',
                    description: 'Có thể thuê'
                });
            }

            return allEvents;
        } else {
            // Mode theo ngày/tuần/chu kỳ: hiển thị trạng thái tổng thể
            const hasAnyBusy = busyEvents.length > 0;
            const dayStatus = hasAnyBusy ? 'busy' : 'available';
            const dayTitle = hasAnyBusy ? 'Bận' : 'Rảnh';
            const dayDescription = hasAnyBusy ? 'Có lịch bận' : 'Có thể thuê';

            return [{
                id: `${dateString}-day-${dayStatus}`,
                date: dateString,
                type: dayStatus as 'busy' | 'available',
                session: undefined,
                title: dayTitle,
                description: dayDescription
            }];
        }
    };

    const getEventStatusColor = (event: CalendarEvent) => {
        return event.type === 'busy' ? '#ff4757' : '#2ed573';
    };

    const getEventStatusText = (event: CalendarEvent) => {
        return event.type === 'busy' ? 'BẬN' : 'RẢNH';
    };

    const getSessionText = (session?: 'morning' | 'afternoon') => {
        if (!session) return mode === 'session' ? '' : 'Cả ngày';
        switch (session) {
            case 'morning': return 'Sáng';
            case 'afternoon': return 'Chiều';
            default: return '';
        }
    };

    const isDateSelected = (date: Date) => {
        return selectedDates.includes(formatDate(date));
    };

    const isSessionSelected = (date: Date, session: 'morning' | 'afternoon') => {
        const dateString = formatDate(date);
        const sessions = selectedSessions[dateString] || [];
        return sessions.includes(session);
    };

    const isPastDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate < today;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newMonth = new Date(currentMonth);
        if (direction === 'prev') {
            newMonth.setMonth(newMonth.getMonth() - 1);
        } else {
            newMonth.setMonth(newMonth.getMonth() + 1);
        }
        onMonthChange(newMonth);
        if (viewMode === 'week') {
            setWeekAnchor(new Date(newMonth.getFullYear(), newMonth.getMonth(), 1));
        }
    };

    const getWeekStartMonday = (date: Date) => {
        const start = new Date(date);
        const day = start.getDay();
        const diffToMonday = (day + 6) % 7;
        start.setDate(start.getDate() - diffToMonday);
        start.setHours(0, 0, 0, 0);
        return start;
    };

    const navigate = (direction: 'prev' | 'next') => {
        if (viewMode === 'week') {
            const currentStart = getWeekStartMonday(anchorDate);
            const delta = direction === 'prev' ? -7 : 7;
            const nextStart = new Date(currentStart);
            nextStart.setDate(currentStart.getDate() + delta);
            setWeekAnchor(nextStart);
            if (
                nextStart.getFullYear() !== currentMonth.getFullYear() ||
                nextStart.getMonth() !== currentMonth.getMonth()
            ) {
                onMonthChange(new Date(nextStart.getFullYear(), nextStart.getMonth(), 1));
            }
            return;
        }
        navigateMonth(direction);
    };

    const generateMonths = () => {
        const months = [];
        const currentYear = currentMonth.getFullYear();
        for (let i = 0; i < 12; i++) {
            const month = new Date(currentYear, i, 1);
            months.push(month);
        }
        return months;
    };

    const anchorDate = useMemo(() => {
        if (viewMode === 'week') return weekAnchor;
        if (selectedDates && selectedDates.length > 0) {
            return new Date(selectedDates[0]);
        }
        return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    }, [selectedDates, currentMonth, viewMode, weekAnchor]);

    const getWeekFromAnchor = (date: Date) => {
        const start = new Date(date);
        // Bắt đầu từ Thứ 2
        const day = start.getDay();
        const diffToMonday = (day + 6) % 7; // 0 nếu Monday
        start.setDate(start.getDate() - diffToMonday);
        const result: (Date | null)[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            result.push(d);
        }
        return result;
    };

    const days = useMemo<(Date | null)[]>(() => {
        if (viewMode === 'week') {
            return getWeekFromAnchor(anchorDate);
        }
        return getDaysInMonth(currentMonth);
    }, [viewMode, anchorDate, currentMonth]);
    // Hiển thị từ Thứ 2 -> Chủ nhật
    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return (
        <View style={styles.container}>
            {/* Header với tháng/năm */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate('prev')} style={styles.navButton}>
                    <Text style={styles.navButtonText}>‹</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.monthTitle}
                    onPress={() => setShowMonthPicker(!showMonthPicker)}
                >
                    <Text style={styles.monthTitleText}>
                        {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigate('next')} style={styles.navButton}>
                    <Text style={styles.navButtonText}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Month Picker */}
            {showMonthPicker && (
                <View style={styles.monthPicker}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {generateMonths().map((month, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.monthItem,
                                    month.getMonth() === currentMonth.getMonth() && styles.monthItemSelected
                                ]}
                                onPress={() => {
                                    onMonthChange(month);
                                    setShowMonthPicker(false);
                                }}
                            >
                                <Text style={[
                                    styles.monthItemText,
                                    month.getMonth() === currentMonth.getMonth() && styles.monthItemTextSelected
                                ]}>
                                    {month.toLocaleDateString('vi-VN', { month: 'short' })}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Week/Month Toggle */}
            <View style={styles.toggleRow}>
                <TouchableOpacity
                    style={[styles.toggleBtn, viewMode === 'month' && styles.toggleBtnActive]}
                    onPress={() => setViewMode('month')}
                >
                    <Text style={[styles.toggleText, viewMode === 'month' && styles.toggleTextActive]}>Tháng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleBtn, viewMode === 'week' && styles.toggleBtnActive]}
                    onPress={() => setViewMode('week')}
                >
                    <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>Tuần</Text>
                </TouchableOpacity>
            </View>

            {/* Week Days Header */}
            <View style={styles.weekDaysHeader}>
                {weekDays.map((day, index) => (
                    <View key={index} style={styles.weekDay}>
                        <Text style={styles.weekDayText}>{day}</Text>
                    </View>
                ))}
            </View>

            {/* Timeline Grid */}
            <ScrollView style={styles.timelineContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.timelineGrid}>
                    {days.map((day, index) => {
                        if (!day) {
                            return <View key={index} style={styles.emptyDay} />;
                        }

                        const dayEvents = getDayEvents(day);
                        const dateString = formatDate(day);
                        const isSelected = isDateSelected(day);
                        const isPast = isPastDate(day);

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.timelineDay,
                                    isSelected && styles.timelineDaySelected,
                                    isPast && styles.timelineDayPast
                                ]}
                                onPress={() => {
                                    if (isPast) return; // Không cho phép chọn ngày quá khứ
                                    if (mode === 'session') {
                                        onDateSelect(dateString);
                                    } else {
                                        onDateSelect(dateString);
                                    }
                                }}
                                activeOpacity={isPast ? 1 : 0.7}
                                disabled={isPast}
                            >
                                <View style={styles.dayHeader}>
                                    <Text style={[
                                        styles.dayNumber,
                                        isSelected && styles.dayNumberSelected,
                                        isPast && styles.dayNumberPast
                                    ]}>
                                        {day.getDate()}
                                    </Text>
                                    {isSelected && !isPast && (
                                        <View style={styles.selectionIndicator}>
                                            <Text style={styles.selectionText}>✓</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.eventsContainer}>
                                    {dayEvents.map((event) => {
                                        const isSessionSelectedState = mode === 'session' && event.session ? isSessionSelected(day, event.session) : false;
                                        return (
                                            <TouchableOpacity
                                                key={event.id}
                                                style={[
                                                    styles.eventItem,
                                                    { borderLeftColor: getEventStatusColor(event) },
                                                    isSessionSelectedState && styles.eventItemSelected
                                                ]}
                                                onPress={(e) => {
                                                    e.stopPropagation(); // Ngăn event bubble lên parent
                                                    if (mode === 'session' && event.session) {
                                                        console.log('Session clicked:', dateString, event.session);
                                                        onDateSelect(dateString, event.session);
                                                    } else {
                                                        onEventPress?.(event);
                                                    }
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <View style={styles.eventContent}>
                                                    <Text style={[
                                                        styles.eventStatus,
                                                        { color: getEventStatusColor(event) }
                                                    ]}>
                                                        {getEventStatusText(event)}
                                                    </Text>
                                                    <Text style={styles.eventSession}>
                                                        {getSessionText(event.session)}
                                                    </Text>
                                                    {isSessionSelectedState && (
                                                        <View style={styles.sessionSelectionIndicator}>
                                                            <Text style={styles.sessionSelectionText}>✓</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    toggleRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
        gap: 8,
        backgroundColor: '#fff',
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#f1f3f5',
        alignItems: 'center',
    },
    toggleBtnActive: {
        backgroundColor: '#4ecdc4',
    },
    toggleText: {
        fontSize: 12,
        color: '#495057',
        fontWeight: '600',
    },
    toggleTextActive: {
        color: '#ffffff',
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4ecdc4',
    },
    monthTitle: {
        flex: 1,
        alignItems: 'center',
    },
    monthTitleText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d4150',
    },
    monthPicker: {
        backgroundColor: '#f8f9fa',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    monthItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 8,
        backgroundColor: '#ffffff',
    },
    monthItemSelected: {
        backgroundColor: '#4ecdc4',
    },
    monthItemText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2d4150',
    },
    monthItemTextSelected: {
        color: '#ffffff',
    },
    weekDaysHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#e9ecef',
    },
    weekDay: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: '#e9ecef',
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6c757d',
    },
    timelineContainer: {
        flex: 1,
    },
    timelineGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderLeftWidth: 1,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e9ecef',
    },
    emptyDay: {
        width: '14.2857%',
        height: 120,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e9ecef',
    },
    timelineDay: {
        width: '14.2857%',
        minHeight: 120,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e9ecef',
        padding: 4,
        backgroundColor: '#ffffff',
    },
    timelineDaySelected: {
        backgroundColor: '#e8f5e8',
    },
    timelineDayPast: {
        backgroundColor: '#f8f9fa',
        opacity: 0.5,
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d4150',
    },
    dayNumberSelected: {
        color: '#2e7d32',
    },
    dayNumberPast: {
        color: '#adb5bd',
    },
    selectionIndicator: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#4ecdc4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectionText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    eventsContainer: {
        flex: 1,
    },
    eventItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 4,
        padding: 2,
        marginBottom: 2,
        borderLeftWidth: 2,
    },
    eventContent: {
        flex: 1,
    },
    eventStatus: {
        fontSize: 8,
        fontWeight: 'bold',
    },
    eventSession: {
        fontSize: 8,
        color: '#6c757d',
    },
    eventItemSelected: {
        backgroundColor: '#e8f5e8',
        borderColor: '#4ecdc4',
        borderWidth: 1,
    },
    sessionSelectionIndicator: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4ecdc4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sessionSelectionText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    // Đã bỏ eventTime
});

export default TimelineView;


