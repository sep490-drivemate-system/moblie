import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarEvent } from './Calendar';

interface CardViewProps {
    events: CalendarEvent[];
    selectedDates: string[];
    onDateSelect: (date: string, session?: 'morning' | 'afternoon') => void;
    onEventPress?: (event: CalendarEvent) => void;
}

const CardView: React.FC<CardViewProps> = ({
    events,
    selectedDates,
    onDateSelect,
    onEventPress
}) => {
    // Nhóm events theo ngày
    const groupedEvents = events.reduce((acc, event) => {
        if (!acc[event.date]) {
            acc[event.date] = [];
        }
        acc[event.date].push(event);
        return acc;
    }, {} as Record<string, CalendarEvent[]>);

    // Sắp xếp các ngày
    const sortedDates = Object.keys(groupedEvents).sort();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('vi-VN', { month: 'long' }),
            weekday: date.toLocaleDateString('vi-VN', { weekday: 'long' }),
            year: date.getFullYear()
        };
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

    const isDateSelected = (date: string) => {
        return selectedDates.includes(date);
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {sortedDates.map((date) => {
                const dateInfo = formatDate(date);
                const dayEvents = groupedEvents[date];
                const morningEvent = dayEvents.find(e => e.session === 'morning');
                const afternoonEvent = dayEvents.find(e => e.session === 'afternoon');

                return (
                    <TouchableOpacity
                        key={date}
                        style={[
                            styles.card,
                            isDateSelected(date) && styles.cardSelected
                        ]}
                        onPress={() => onDateSelect(date)}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.dateSection}>
                                <Text style={[
                                    styles.dayNumber,
                                    isDateSelected(date) && styles.dayNumberSelected
                                ]}>
                                    {dateInfo.day}
                                </Text>
                                <View style={styles.dateInfo}>
                                    <Text style={[
                                        styles.monthText,
                                        isDateSelected(date) && styles.monthTextSelected
                                    ]}>
                                        {dateInfo.month}
                                    </Text>
                                    <Text style={[
                                        styles.yearText,
                                        isDateSelected(date) && styles.yearTextSelected
                                    ]}>
                                        {dateInfo.year}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.weekdaySection}>
                                <Text style={[
                                    styles.weekdayText,
                                    isDateSelected(date) && styles.weekdayTextSelected
                                ]}>
                                    {dateInfo.weekday}
                                </Text>
                                <View style={[
                                    styles.selectionBadge,
                                    isDateSelected(date) && styles.selectionBadgeSelected
                                ]}>
                                    <Text style={[
                                        styles.selectionText,
                                        isDateSelected(date) && styles.selectionTextSelected
                                    ]}>
                                        {isDateSelected(date) ? 'ĐÃ CHỌN' : 'CHƯA CHỌN'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.scheduleSection}>
                            {morningEvent && (
                                <View style={styles.scheduleCard}>
                                    <View style={styles.scheduleHeader}>
                                        <View style={[
                                            styles.statusIndicator,
                                            { backgroundColor: getEventStatusColor(morningEvent) }
                                        ]} />
                                        <Text style={[
                                            styles.sessionText,
                                            isDateSelected(date) && styles.sessionTextSelected
                                        ]}>
                                            {getSessionText(morningEvent.session)}
                                        </Text>
                                        <Text style={[
                                            styles.statusText,
                                            { color: getEventStatusColor(morningEvent) }
                                        ]}>
                                            {getEventStatusText(morningEvent)}
                                        </Text>
                                    </View>
                                    <Text style={[
                                        styles.timeText,
                                        isDateSelected(date) && styles.timeTextSelected
                                    ]}>
                                        {morningEvent.startTime} - {morningEvent.endTime}
                                    </Text>
                                    <Text style={[
                                        styles.titleText,
                                        isDateSelected(date) && styles.titleTextSelected
                                    ]}>
                                        {morningEvent.title}
                                    </Text>
                                </View>
                            )}

                            {afternoonEvent && (
                                <View style={styles.scheduleCard}>
                                    <View style={styles.scheduleHeader}>
                                        <View style={[
                                            styles.statusIndicator,
                                            { backgroundColor: getEventStatusColor(afternoonEvent) }
                                        ]} />
                                        <Text style={[
                                            styles.sessionText,
                                            isDateSelected(date) && styles.sessionTextSelected
                                        ]}>
                                            {getSessionText(afternoonEvent.session)}
                                        </Text>
                                        <Text style={[
                                            styles.statusText,
                                            { color: getEventStatusColor(afternoonEvent) }
                                        ]}>
                                            {getEventStatusText(afternoonEvent)}
                                        </Text>
                                    </View>
                                    <Text style={[
                                        styles.timeText,
                                        isDateSelected(date) && styles.timeTextSelected
                                    ]}>
                                        {afternoonEvent.startTime} - {afternoonEvent.endTime}
                                    </Text>
                                    <Text style={[
                                        styles.titleText,
                                        isDateSelected(date) && styles.titleTextSelected
                                    ]}>
                                        {afternoonEvent.title}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    cardSelected: {
        borderColor: '#4ecdc4',
        backgroundColor: '#e8f5e8',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    dateSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dayNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2d4150',
        marginRight: 12,
    },
    dayNumberSelected: {
        color: '#2e7d32',
    },
    dateInfo: {
        flex: 1,
    },
    monthText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d4150',
        marginBottom: 2,
    },
    monthTextSelected: {
        color: '#2e7d32',
    },
    yearText: {
        fontSize: 14,
        color: '#6c757d',
    },
    yearTextSelected: {
        color: '#4caf50',
    },
    weekdaySection: {
        alignItems: 'flex-end',
    },
    weekdayText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d4150',
        marginBottom: 8,
    },
    weekdayTextSelected: {
        color: '#2e7d32',
    },
    selectionBadge: {
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    selectionBadgeSelected: {
        backgroundColor: '#4ecdc4',
        borderColor: '#4ecdc4',
    },
    selectionText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6c757d',
    },
    selectionTextSelected: {
        color: '#ffffff',
    },
    scheduleSection: {
        gap: 12,
    },
    scheduleCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    scheduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    sessionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d4150',
        marginRight: 8,
    },
    sessionTextSelected: {
        color: '#2e7d32',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 'auto',
    },
    timeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2d4150',
        marginBottom: 4,
    },
    timeTextSelected: {
        color: '#2e7d32',
    },
    titleText: {
        fontSize: 14,
        color: '#6c757d',
    },
    titleTextSelected: {
        color: '#4caf50',
    },
});

export default CardView;
