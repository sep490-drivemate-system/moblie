import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CalendarEvent } from './Calendar';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2; // 2 cột với margin

interface GridViewProps {
    events: CalendarEvent[];
    selectedDates: string[];
    onDateSelect: (date: string, session?: 'morning' | 'afternoon') => void;
    onEventPress?: (event: CalendarEvent) => void;
}

const GridView: React.FC<GridViewProps> = ({
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
            month: date.toLocaleDateString('vi-VN', { month: 'short' }),
            weekday: date.toLocaleDateString('vi-VN', { weekday: 'short' })
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
        return session === 'morning' ? 'S' : 'C';
    };

    const isDateSelected = (date: string) => {
        return selectedDates.includes(date);
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
                {sortedDates.map((date, index) => {
                    const dateInfo = formatDate(date);
                    const dayEvents = groupedEvents[date];
                    const morningEvent = dayEvents.find(e => e.session === 'morning');
                    const afternoonEvent = dayEvents.find(e => e.session === 'afternoon');

                    return (
                        <TouchableOpacity
                            key={date}
                            style={[
                                styles.gridItem,
                                isDateSelected(date) && styles.gridItemSelected
                            ]}
                            onPress={() => onDateSelect(date)}
                        >
                            <View style={styles.dateHeader}>
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
                                        styles.weekdayText,
                                        isDateSelected(date) && styles.weekdayTextSelected
                                    ]}>
                                        {dateInfo.weekday}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.scheduleContainer}>
                                {morningEvent && (
                                    <View style={styles.scheduleItem}>
                                        <View style={[
                                            styles.scheduleDot,
                                            { backgroundColor: getEventStatusColor(morningEvent) }
                                        ]} />
                                        <Text style={[
                                            styles.scheduleText,
                                            { color: getEventStatusColor(morningEvent) }
                                        ]}>
                                            {getSessionText(morningEvent.session)} {morningEvent.startTime?.substring(0, 5)}
                                        </Text>
                                    </View>
                                )}

                                {afternoonEvent && (
                                    <View style={styles.scheduleItem}>
                                        <View style={[
                                            styles.scheduleDot,
                                            { backgroundColor: getEventStatusColor(afternoonEvent) }
                                        ]} />
                                        <Text style={[
                                            styles.scheduleText,
                                            { color: getEventStatusColor(afternoonEvent) }
                                        ]}>
                                            {getSessionText(afternoonEvent.session)} {afternoonEvent.startTime?.substring(0, 5)}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.statusContainer}>
                                <Text style={[
                                    styles.statusText,
                                    isDateSelected(date) && styles.statusTextSelected
                                ]}>
                                    {isDateSelected(date) ? 'ĐÃ CHỌN' : 'CHƯA CHỌN'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        justifyContent: 'space-between',
    },
    gridItem: {
        width: itemWidth,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    gridItemSelected: {
        borderColor: '#4ecdc4',
        backgroundColor: '#e8f5e8',
    },
    dateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dayNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2d4150',
        marginRight: 8,
    },
    dayNumberSelected: {
        color: '#2e7d32',
    },
    dateInfo: {
        flex: 1,
    },
    monthText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6c757d',
    },
    monthTextSelected: {
        color: '#4caf50',
    },
    weekdayText: {
        fontSize: 10,
        color: '#6c757d',
    },
    weekdayTextSelected: {
        color: '#4caf50',
    },
    scheduleContainer: {
        marginBottom: 8,
    },
    scheduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    scheduleDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    scheduleText: {
        fontSize: 10,
        fontWeight: '500',
        flex: 1,
    },
    statusContainer: {
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6c757d',
    },
    statusTextSelected: {
        color: '#4ecdc4',
    },
});

export default GridView;
