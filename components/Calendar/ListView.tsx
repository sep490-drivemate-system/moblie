import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarEvent } from './Calendar';

interface ListViewProps {
    events: CalendarEvent[];
    selectedDates: string[];
    onDateSelect: (date: string, session?: 'morning' | 'afternoon') => void;
    onEventPress?: (event: CalendarEvent) => void;
}

const ListView: React.FC<ListViewProps> = ({
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
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    const formatTime = (time: string) => {
        return time;
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
            {sortedDates.map((date) => (
                <View key={date} style={styles.dayContainer}>
                    <TouchableOpacity
                        style={[
                            styles.dayHeader,
                            isDateSelected(date) && styles.dayHeaderSelected
                        ]}
                        onPress={() => onDateSelect(date)}
                    >
                        <View style={styles.dayInfo}>
                            <Text style={[
                                styles.dayTitle,
                                isDateSelected(date) && styles.dayTitleSelected
                            ]}>
                                {formatDate(date)}
                            </Text>
                            <Text style={[
                                styles.daySubtitle,
                                isDateSelected(date) && styles.daySubtitleSelected
                            ]}>
                                {groupedEvents[date].length} sự kiện
                            </Text>
                        </View>
                        <View style={[
                            styles.selectionIndicator,
                            isDateSelected(date) && styles.selectionIndicatorSelected
                        ]}>
                            <Text style={[
                                styles.selectionText,
                                isDateSelected(date) && styles.selectionTextSelected
                            ]}>
                                {isDateSelected(date) ? '✓' : ''}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.eventsContainer}>
                        {groupedEvents[date].map((event) => (
                            <TouchableOpacity
                                key={event.id}
                                style={[
                                    styles.eventItem,
                                    { borderLeftColor: getEventStatusColor(event) }
                                ]}
                                onPress={() => onEventPress?.(event)}
                            >
                                <View style={styles.eventContent}>
                                    <View style={styles.eventHeader}>
                                        <Text style={[
                                            styles.eventStatus,
                                            { color: getEventStatusColor(event) }
                                        ]}>
                                            {getEventStatusText(event)}
                                        </Text>
                                        <Text style={styles.eventSession}>
                                            {getSessionText(event.session)}
                                        </Text>
                                    </View>

                                    <Text style={styles.eventTime}>
                                        {event.startTime} - {event.endTime}
                                    </Text>

                                    <Text style={styles.eventTitle}>
                                        {event.title}
                                    </Text>

                                    {event.description && (
                                        <Text style={styles.eventDescription}>
                                            {event.description}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    dayContainer: {
        marginBottom: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    dayHeaderSelected: {
        backgroundColor: '#e8f5e8',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    dayInfo: {
        flex: 1,
    },
    dayTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d4150',
        marginBottom: 2,
    },
    dayTitleSelected: {
        color: '#2e7d32',
    },
    daySubtitle: {
        fontSize: 12,
        color: '#6c757d',
    },
    daySubtitleSelected: {
        color: '#4caf50',
    },
    selectionIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#dee2e6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectionIndicatorSelected: {
        backgroundColor: '#4ecdc4',
        borderColor: '#4ecdc4',
    },
    selectionText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6c757d',
    },
    selectionTextSelected: {
        color: '#ffffff',
    },
    eventsContainer: {
        padding: 16,
    },
    eventItem: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#4ecdc4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    eventContent: {
        flex: 1,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    eventStatus: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    eventSession: {
        fontSize: 12,
        color: '#6c757d',
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    eventTime: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d4150',
        marginBottom: 4,
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2d4150',
        marginBottom: 4,
    },
    eventDescription: {
        fontSize: 12,
        color: '#6c757d',
        lineHeight: 16,
    },
});

export default ListView;
