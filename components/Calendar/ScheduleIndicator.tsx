import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalendarEvent } from './Calendar';

interface ScheduleIndicatorProps {
    events: CalendarEvent[];
    date: string;
}

const ScheduleIndicator: React.FC<ScheduleIndicatorProps> = ({ events, date }) => {
    const dayEvents = events.filter(event => event.date === date);

    if (dayEvents.length === 0) {
        return null;
    }

    const morningEvent = dayEvents.find(e => e.session === 'morning');
    const afternoonEvent = dayEvents.find(e => e.session === 'afternoon');

    return (
        <View style={styles.container}>
            <View style={styles.dotsContainer}>
                {morningEvent && (
                    <View style={[
                        styles.dot,
                        morningEvent.type === 'busy' ? styles.dotBusy : styles.dotAvailable
                    ]} />
                )}
                {afternoonEvent && (
                    <View style={[
                        styles.dot,
                        afternoonEvent.type === 'busy' ? styles.dotBusy : styles.dotAvailable
                    ]} />
                )}
            </View>

            <View style={styles.timeContainer}>
                {morningEvent && (
                    <Text style={[
                        styles.timeText,
                        morningEvent.type === 'busy' ? styles.timeTextBusy : styles.timeTextAvailable
                    ]}>
                        {morningEvent.startTime?.substring(0, 5) || '7:00'}
                    </Text>
                )}
                {afternoonEvent && (
                    <Text style={[
                        styles.timeText,
                        afternoonEvent.type === 'busy' ? styles.timeTextBusy : styles.timeTextAvailable
                    ]}>
                        {afternoonEvent.startTime?.substring(0, 5) || '13:00'}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 2,
        left: 2,
        right: 2,
        alignItems: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        marginBottom: 1,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 1,
    },
    dotBusy: {
        backgroundColor: '#ff4757',
    },
    dotAvailable: {
        backgroundColor: '#2ed573',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    timeText: {
        fontSize: 6,
        fontWeight: '600',
        marginHorizontal: 1,
    },
    timeTextBusy: {
        color: '#ff4757',
    },
    timeTextAvailable: {
        color: '#2ed573',
    },
});

export default ScheduleIndicator;
