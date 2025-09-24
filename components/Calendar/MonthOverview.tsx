import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CalendarEvent } from './Calendar';

const { width } = Dimensions.get('window');

interface MonthOverviewProps {
    events: CalendarEvent[];
    selectedDates: string[];
    onDateSelect: (date: string, session?: 'morning' | 'afternoon') => void;
    onEventPress?: (event: CalendarEvent) => void;
    currentMonth: Date;
    onMonthChange: (month: Date) => void;
}

const MonthOverview: React.FC<MonthOverviewProps> = ({
    events,
    selectedDates,
    onDateSelect,
    onEventPress,
    currentMonth,
    onMonthChange
}) => {
    const [showYearPicker, setShowYearPicker] = useState(false);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        const days = [];

        // Thêm các ngày trống cho tuần đầu
        for (let i = 0; i < firstDay; i++) {
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
        return events.filter(event => event.date === dateString);
    };

    const getEventStatusColor = (event: CalendarEvent) => {
        return event.type === 'busy' ? '#ff4757' : '#2ed573';
    };

    const getEventStatusText = (event: CalendarEvent) => {
        return event.type === 'busy' ? 'BẬN' : 'RẢNH';
    };

    const getSessionText = (session?: 'morning' | 'afternoon') => {
        if (!session) return '';
        return session === 'morning' ? 'S' : 'C';
    };

    const isDateSelected = (date: Date) => {
        return selectedDates.includes(formatDate(date));
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newMonth = new Date(currentMonth);
        if (direction === 'prev') {
            newMonth.setMonth(newMonth.getMonth() - 1);
        } else {
            newMonth.setMonth(newMonth.getMonth() + 1);
        }
        onMonthChange(newMonth);
    };

    const generateYears = () => {
        const years = [];
        const currentYear = currentMonth.getFullYear();
        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
            years.push(i);
        }
        return years;
    };

    const days = getDaysInMonth(currentMonth);
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    return (
        <View style={styles.container}>
            {/* Header với tháng/năm */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
                    <Text style={styles.navButtonText}>‹</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.monthTitle}
                    onPress={() => setShowYearPicker(!showYearPicker)}
                >
                    <Text style={styles.monthTitleText}>
                        {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
                    <Text style={styles.navButtonText}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Year Picker */}
            {showYearPicker && (
                <View style={styles.yearPicker}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {generateYears().map((year) => (
                            <TouchableOpacity
                                key={year}
                                style={[
                                    styles.yearItem,
                                    year === currentMonth.getFullYear() && styles.yearItemSelected
                                ]}
                                onPress={() => {
                                    const newMonth = new Date(currentMonth);
                                    newMonth.setFullYear(year);
                                    onMonthChange(newMonth);
                                    setShowYearPicker(false);
                                }}
                            >
                                <Text style={[
                                    styles.yearItemText,
                                    year === currentMonth.getFullYear() && styles.yearItemTextSelected
                                ]}>
                                    {year}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Week Days Header */}
            <View style={styles.weekDaysHeader}>
                {weekDays.map((day, index) => (
                    <View key={index} style={styles.weekDay}>
                        <Text style={styles.weekDayText}>{day}</Text>
                    </View>
                ))}
            </View>

            {/* Month Grid */}
            <View style={styles.monthGrid}>
                {days.map((day, index) => {
                    if (!day) {
                        return <View key={index} style={styles.emptyDay} />;
                    }

                    const dayEvents = getDayEvents(day);
                    const dateString = formatDate(day);
                    const isSelected = isDateSelected(day);
                    const morningEvent = dayEvents.find(e => e.session === 'morning');
                    const afternoonEvent = dayEvents.find(e => e.session === 'afternoon');

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.monthDay,
                                isSelected && styles.monthDaySelected
                            ]}
                            onPress={() => onDateSelect(dateString)}
                        >
                            <View style={styles.dayHeader}>
                                <Text style={[
                                    styles.dayNumber,
                                    isSelected && styles.dayNumberSelected
                                ]}>
                                    {day.getDate()}
                                </Text>
                                {isSelected && (
                                    <View style={styles.selectionIndicator}>
                                        <Text style={styles.selectionText}>✓</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.eventsIndicator}>
                                {morningEvent && (
                                    <View style={[
                                        styles.eventDot,
                                        { backgroundColor: getEventStatusColor(morningEvent) }
                                    ]} />
                                )}
                                {afternoonEvent && (
                                    <View style={[
                                        styles.eventDot,
                                        { backgroundColor: getEventStatusColor(afternoonEvent) }
                                    ]} />
                                )}
                            </View>

                            <View style={styles.scheduleInfo}>
                                {morningEvent && (
                                    <Text style={[
                                        styles.scheduleText,
                                        { color: getEventStatusColor(morningEvent) }
                                    ]}>
                                        {getSessionText(morningEvent.session)} {morningEvent.startTime?.substring(0, 5)}
                                    </Text>
                                )}
                                {afternoonEvent && (
                                    <Text style={[
                                        styles.scheduleText,
                                        { color: getEventStatusColor(afternoonEvent) }
                                    ]}>
                                        {getSessionText(afternoonEvent.session)} {afternoonEvent.startTime?.substring(0, 5)}
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
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
    yearPicker: {
        backgroundColor: '#f8f9fa',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    yearItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 8,
        backgroundColor: '#ffffff',
    },
    yearItemSelected: {
        backgroundColor: '#4ecdc4',
    },
    yearItemText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2d4150',
    },
    yearItemTextSelected: {
        color: '#ffffff',
    },
    weekDaysHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    weekDay: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6c757d',
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
    },
    emptyDay: {
        width: width / 7,
        height: 100,
    },
    monthDay: {
        width: width / 7,
        height: 100,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e9ecef',
        padding: 4,
        backgroundColor: '#ffffff',
    },
    monthDaySelected: {
        backgroundColor: '#e8f5e8',
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
    eventsIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 4,
    },
    eventDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 1,
    },
    scheduleInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    scheduleText: {
        fontSize: 8,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 10,
    },
});

export default MonthOverview;



