import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CalendarEvent } from './Calendar';

const { width } = Dimensions.get('window');

interface WeekViewProps {
    events: CalendarEvent[];
    selectedDates: string[];
    onDateSelect: (date: string, session?: 'morning' | 'afternoon') => void;
    onEventPress?: (event: CalendarEvent) => void;
    currentMonth: Date;
    onMonthChange: (month: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
    events,
    selectedDates,
    onDateSelect,
    onEventPress,
    currentMonth,
    onMonthChange
}) => {
    const [currentWeek, setCurrentWeek] = useState(new Date());

    const getWeekDates = (date: Date) => {
        const week = [];
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day;
        startOfWeek.setDate(diff);

        for (let i = 0; i < 7; i++) {
            const weekDate = new Date(startOfWeek);
            weekDate.setDate(startOfWeek.getDate() + i);
            week.push(weekDate);
        }
        return week;
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newWeek = new Date(currentWeek);
        if (direction === 'prev') {
            newWeek.setDate(newWeek.getDate() - 7);
        } else {
            newWeek.setDate(newWeek.getDate() + 7);
        }
        setCurrentWeek(newWeek);
        onMonthChange(newWeek);
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
        return session === 'morning' ? 'Sáng' : 'Chiều';
    };

    const isDateSelected = (date: Date) => {
        return selectedDates.includes(formatDate(date));
    };

    const weekDates = getWeekDates(currentWeek);
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    return (
        <View style={styles.container}>
            {/* Header với tuần */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigateWeek('prev')} style={styles.navButton}>
                    <Text style={styles.navButtonText}>‹</Text>
                </TouchableOpacity>

                <View style={styles.weekTitle}>
                    <Text style={styles.weekTitleText}>
                        Tuần {Math.ceil(currentWeek.getDate() / 7)} - {currentWeek.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                    </Text>
                </View>

                <TouchableOpacity onPress={() => navigateWeek('next')} style={styles.navButton}>
                    <Text style={styles.navButtonText}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Week Days */}
            <View style={styles.weekDaysContainer}>
                {weekDates.map((date, index) => {
                    const dateString = formatDate(date);
                    const isSelected = isDateSelected(date);
                    const dayEvents = getDayEvents(date);

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.weekDay,
                                isSelected && styles.weekDaySelected
                            ]}
                            onPress={() => onDateSelect(dateString)}
                        >
                            <View style={styles.dayHeader}>
                                <Text style={[
                                    styles.weekDayText,
                                    isSelected && styles.weekDayTextSelected
                                ]}>
                                    {weekDays[index]}
                                </Text>
                                <Text style={[
                                    styles.dayNumber,
                                    isSelected && styles.dayNumberSelected
                                ]}>
                                    {date.getDate()}
                                </Text>
                                {isSelected && (
                                    <View style={styles.selectionIndicator}>
                                        <Text style={styles.selectionText}>✓</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.eventsContainer}>
                                {dayEvents.map((event) => (
                                    <TouchableOpacity
                                        key={event.id}
                                        style={[
                                            styles.eventItem,
                                            { borderLeftColor: getEventStatusColor(event) }
                                        ]}
                                        onPress={() => onEventPress?.(event)}
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
                                            <Text style={styles.eventTime}>
                                                {event.startTime?.substring(0, 5)}
                                            </Text>
                                            <Text style={styles.eventTitle} numberOfLines={1}>
                                                {event.title}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
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
    weekTitle: {
        flex: 1,
        alignItems: 'center',
    },
    weekTitleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d4150',
    },
    weekDaysContainer: {
        flexDirection: 'row',
        flex: 1,
    },
    weekDay: {
        flex: 1,
        borderRightWidth: 1,
        borderColor: '#e9ecef',
        backgroundColor: '#ffffff',
    },
    weekDaySelected: {
        backgroundColor: '#e8f5e8',
    },
    dayHeader: {
        padding: 12,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6c757d',
        marginBottom: 4,
    },
    weekDayTextSelected: {
        color: '#4caf50',
    },
    dayNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d4150',
        marginBottom: 4,
    },
    dayNumberSelected: {
        color: '#2e7d32',
    },
    selectionIndicator: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#4ecdc4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectionText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    eventsContainer: {
        flex: 1,
        padding: 8,
    },
    eventItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 6,
        padding: 8,
        marginBottom: 6,
        borderLeftWidth: 3,
    },
    eventContent: {
        flex: 1,
    },
    eventStatus: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    eventSession: {
        fontSize: 10,
        color: '#6c757d',
        marginBottom: 2,
    },
    eventTime: {
        fontSize: 10,
        color: '#2d4150',
        fontWeight: '500',
        marginBottom: 2,
    },
    eventTitle: {
        fontSize: 10,
        color: '#2d4150',
        fontWeight: '500',
    },
});

export default WeekView;



