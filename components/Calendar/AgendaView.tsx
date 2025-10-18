import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CalendarEvent } from './Calendar';

const { width } = Dimensions.get('window');

interface AgendaViewProps {
    events: CalendarEvent[];
    selectedDates: string[];
    onDateSelect: (date: string, session?: 'morning' | 'afternoon') => void;
    onEventPress?: (event: CalendarEvent) => void;
    currentMonth: Date;
    onMonthChange: (month: Date) => void;
}

const AgendaView: React.FC<AgendaViewProps> = ({
    events,
    selectedDates,
    onDateSelect,
    onEventPress,
    currentMonth,
    onMonthChange
}) => {
    const [selectedDate, setSelectedDate] = useState(new Date());

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
        return session === 'morning' ? 'Sáng' : 'Chiều';
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

    const days = getDaysInMonth(currentMonth);
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const selectedDateEvents = getDayEvents(selectedDate);

    return (
        <View style={styles.container}>
            {/* Header với tháng/năm */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
                    <Text style={styles.navButtonText}>‹</Text>
                </TouchableOpacity>

                <View style={styles.monthTitle}>
                    <Text style={styles.monthTitleText}>
                        {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                    </Text>
                </View>

                <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
                    <Text style={styles.navButtonText}>›</Text>
                </TouchableOpacity>
            </View>

            {/* Mini Calendar */}
            <View style={styles.miniCalendar}>
                <View style={styles.weekDaysHeader}>
                    {weekDays.map((day, index) => (
                        <View key={index} style={styles.weekDay}>
                            <Text style={styles.weekDayText}>{day}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.miniGrid}>
                    {days.map((day, index) => {
                        if (!day) {
                            return <View key={index} style={styles.emptyDay} />;
                        }

                        const dayEvents = getDayEvents(day);
                        const dateString = formatDate(day);
                        const isSelected = isDateSelected(day);
                        const isCurrentDay = day.getDate() === selectedDate.getDate() &&
                            day.getMonth() === selectedDate.getMonth() &&
                            day.getFullYear() === selectedDate.getFullYear();

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.miniDay,
                                    isSelected && styles.miniDaySelected,
                                    isCurrentDay && styles.miniDayCurrent
                                ]}
                                onPress={() => {
                                    setSelectedDate(day);
                                    onDateSelect(dateString);
                                }}
                            >
                                <Text style={[
                                    styles.miniDayNumber,
                                    isSelected && styles.miniDayNumberSelected,
                                    isCurrentDay && styles.miniDayNumberCurrent
                                ]}>
                                    {day.getDate()}
                                </Text>
                                {dayEvents.length > 0 && (
                                    <View style={styles.eventIndicator}>
                                        <View style={[
                                            styles.eventDot,
                                            { backgroundColor: dayEvents[0].type === 'busy' ? '#ff4757' : '#2ed573' }
                                        ]} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Agenda Content */}
            <View style={styles.agendaContent}>
                <View style={styles.agendaHeader}>
                    <Text style={styles.agendaTitle}>
                        {selectedDate.toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                        })}
                    </Text>
                    <Text style={styles.agendaSubtitle}>
                        {selectedDateEvents.length} sự kiện
                    </Text>
                </View>

                <ScrollView style={styles.agendaList} showsVerticalScrollIndicator={false}>
                    {selectedDateEvents.length > 0 ? (
                        selectedDateEvents.map((event) => (
                            <TouchableOpacity
                                key={event.id}
                                style={[
                                    styles.agendaItem,
                                    { borderLeftColor: getEventStatusColor(event) }
                                ]}
                                onPress={() => onEventPress?.(event)}
                            >
                                <View style={styles.agendaItemContent}>
                                    <View style={styles.agendaItemHeader}>
                                        <Text style={[
                                            styles.agendaItemStatus,
                                            { color: getEventStatusColor(event) }
                                        ]}>
                                            {getEventStatusText(event)}
                                        </Text>
                                        <Text style={styles.agendaItemSession}>
                                            {getSessionText(event.session)}
                                        </Text>
                                    </View>

                                    <Text style={styles.agendaItemTime}>
                                        {event.startTime} - {event.endTime}
                                    </Text>

                                    <Text style={styles.agendaItemTitle}>
                                        {event.title}
                                    </Text>

                                    {event.description && (
                                        <Text style={styles.agendaItemDescription}>
                                            {event.description}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyAgenda}>
                            <Text style={styles.emptyAgendaText}>
                                Không có sự kiện nào trong ngày này
                            </Text>
                        </View>
                    )}
                </ScrollView>
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
    miniCalendar: {
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    weekDaysHeader: {
        flexDirection: 'row',
        backgroundColor: '#e9ecef',
    },
    weekDay: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6c757d',
    },
    miniGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    emptyDay: {
        width: width / 7,
        height: 40,
    },
    miniDay: {
        width: width / 7,
        height: 40,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e9ecef',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    miniDaySelected: {
        backgroundColor: '#e8f5e8',
    },
    miniDayCurrent: {
        backgroundColor: '#4ecdc4',
    },
    miniDayNumber: {
        fontSize: 12,
        fontWeight: '500',
        color: '#2d4150',
    },
    miniDayNumberSelected: {
        color: '#2e7d32',
    },
    miniDayNumberCurrent: {
        color: '#ffffff',
    },
    eventIndicator: {
        position: 'absolute',
        bottom: 2,
    },
    eventDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    agendaContent: {
        flex: 1,
    },
    agendaHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    agendaTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d4150',
        marginBottom: 4,
    },
    agendaSubtitle: {
        fontSize: 14,
        color: '#6c757d',
    },
    agendaList: {
        flex: 1,
        padding: 16,
    },
    agendaItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    agendaItemContent: {
        flex: 1,
    },
    agendaItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    agendaItemStatus: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    agendaItemSession: {
        fontSize: 12,
        color: '#6c757d',
        backgroundColor: '#ffffff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    agendaItemTime: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d4150',
        marginBottom: 4,
    },
    agendaItemTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2d4150',
        marginBottom: 4,
    },
    agendaItemDescription: {
        fontSize: 12,
        color: '#6c757d',
        lineHeight: 16,
    },
    emptyAgenda: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyAgendaText: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
    },
});

export default AgendaView;



