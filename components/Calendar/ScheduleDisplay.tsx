import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarEvent } from './Calendar';

interface ScheduleDisplayProps {
    events: CalendarEvent[];
    selectedDates: string[];
    selectedMode: 'session' | 'day' | 'week' | 'cycle';
    onEventPress?: (event: CalendarEvent) => void;
    onRemoveEvent?: (eventId: string) => void;
}

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({
    events,
    selectedDates,
    selectedMode,
    onEventPress,
    onRemoveEvent
}) => {
    // Lọc events theo selected dates
    const filteredEvents = events.filter(event =>
        selectedDates.includes(event.date)
    );

    // Nhóm events theo ngày
    const groupedEvents = filteredEvents.reduce((acc, event) => {
        if (!acc[event.date]) {
            acc[event.date] = [];
        }
        acc[event.date].push(event);
        return acc;
    }, {} as Record<string, CalendarEvent[]>);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (event: CalendarEvent) => {
        if (event.startTime && event.endTime) {
            return `${event.startTime} - ${event.endTime}`;
        }
        return event.time || 'N/A';
    };

    const getEventStatusText = (event: CalendarEvent) => {
        if (event.type === 'busy') {
            return 'Bận';
        }
        return 'Rảnh';
    };

    const getEventStatusColor = (event: CalendarEvent) => {
        if (event.type === 'busy') {
            return '#ff6b6b';
        }
        return '#4ecdc4';
    };

    const getSessionText = (session?: 'morning' | 'afternoon') => {
        if (!session) return '';
        return session === 'morning' ? 'Sáng' : 'Chiều';
    };

    if (selectedDates.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    {selectedMode === 'session' && 'Chọn ngày và buổi để xem lịch'}
                    {selectedMode === 'day' && 'Chọn ngày để xem lịch'}
                    {selectedMode === 'week' && 'Chọn tuần và các ngày để xem lịch'}
                    {selectedMode === 'cycle' && 'Chọn các ngày để xem lịch'}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Lịch đã chọn</Text>
                <Text style={styles.headerSubtitle}>
                    {selectedDates.length} ngày được chọn
                </Text>
            </View>

            <ScrollView style={styles.eventsContainer} showsVerticalScrollIndicator={false}>
                {Object.entries(groupedEvents).map(([date, dayEvents]) => (
                    <View key={date} style={styles.dayContainer}>
                        <Text style={styles.dayTitle}>{formatDate(date)}</Text>

                        {dayEvents.length === 0 ? (
                            <View style={styles.noEventsContainer}>
                                <Text style={styles.noEventsText}>Không có sự kiện</Text>
                            </View>
                        ) : (
                            <View style={styles.eventsList}>
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
                                            <View style={styles.eventHeader}>
                                                <Text style={[
                                                    styles.eventStatus,
                                                    { color: getEventStatusColor(event) }
                                                ]}>
                                                    {getEventStatusText(event)}
                                                </Text>
                                                {onRemoveEvent && (
                                                    <TouchableOpacity
                                                        style={styles.removeButton}
                                                        onPress={() => onRemoveEvent(event.id)}
                                                    >
                                                        <Text style={styles.removeButtonText}>×</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>

                                            <Text style={styles.eventTime}>
                                                Thời gian: {formatTime(event)}
                                            </Text>

                                            {event.session && (
                                                <Text style={styles.eventSession}>
                                                    Buổi: {getSessionText(event.session)}
                                                </Text>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                ))}

                {selectedDates.length > 0 && Object.keys(groupedEvents).length === 0 && (
                    <View style={styles.noEventsContainer}>
                        <Text style={styles.noEventsText}>
                            Không có sự kiện nào trong các ngày đã chọn
                        </Text>
                    </View>
                )}
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
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d4150',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6c757d',
    },
    eventsContainer: {
        flex: 1,
    },
    dayContainer: {
        marginBottom: 16,
    },
    dayTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d4150',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f8f9fa',
    },
    eventsList: {
        paddingHorizontal: 16,
    },
    eventItem: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 12,
        marginVertical: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#4ecdc4',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
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
        fontSize: 14,
        fontWeight: '600',
    },
    removeButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ff6b6b',
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    eventTime: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 4,
    },
    eventSession: {
        fontSize: 12,
        color: '#6c757d',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        lineHeight: 24,
    },
    noEventsContainer: {
        padding: 16,
        alignItems: 'center',
    },
    noEventsText: {
        fontSize: 14,
        color: '#6c757d',
        fontStyle: 'italic',
    },
});

export default ScheduleDisplay;
