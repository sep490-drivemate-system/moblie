import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CalendarEvent } from './Calendar';

interface ColorBarIndicatorProps {
    events: CalendarEvent[];
    date: string;
}

const ColorBarIndicator: React.FC<ColorBarIndicatorProps> = ({ events, date }) => {
    const dayEvents = events.filter(event => event.date === date);

    if (dayEvents.length === 0) {
        return null;
    }

    const morningEvent = dayEvents.find(e => e.session === 'morning');
    const afternoonEvent = dayEvents.find(e => e.session === 'afternoon');

    return (
        <View style={styles.container}>
            <View style={styles.barsContainer}>
                {morningEvent && (
                    <View style={[
                        styles.bar,
                        morningEvent.type === 'busy' ? styles.barBusy : styles.barAvailable
                    ]} />
                )}
                {afternoonEvent && (
                    <View style={[
                        styles.bar,
                        afternoonEvent.type === 'busy' ? styles.barBusy : styles.barAvailable
                    ]} />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
    },
    barsContainer: {
        flexDirection: 'row',
        height: '100%',
    },
    bar: {
        flex: 1,
        height: '100%',
    },
    barBusy: {
        backgroundColor: '#ff4757',
    },
    barAvailable: {
        backgroundColor: '#2ed573',
    },
});

export default ColorBarIndicator;
