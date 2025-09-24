import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarMode } from './ModeSelector';

interface SelectionSummaryProps {
    selectedDates: string[];
    selectedMode: CalendarMode;
    onClearSelection: () => void;
}

const SelectionSummary: React.FC<SelectionSummaryProps> = ({
    selectedDates,
    selectedMode,
    onClearSelection
}) => {
    if (selectedDates.length === 0) {
        return null;
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: 'numeric',
            month: 'short'
        });
    };

    const getModeText = () => {
        switch (selectedMode) {
            case 'session': return 'buổi';
            case 'day': return 'ngày';
            case 'week': return 'tuần';
            case 'cycle': return 'chu kỳ';
            default: return 'ngày';
        }
    };

    const getSelectedDatesText = () => {
        if (selectedDates.length <= 3) {
            return selectedDates.map(formatDate).join(', ');
        }
        return `${formatDate(selectedDates[0])}, ${formatDate(selectedDates[1])}, ... +${selectedDates.length - 2} ${getModeText()}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.info}>
                    <Text style={styles.title}>
                        Đã chọn {selectedDates.length} {getModeText()}
                    </Text>
                    <Text style={styles.dates}>
                        {getSelectedDatesText()}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={onClearSelection}
                >
                    <Text style={styles.clearButtonText}>Xóa</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#e8f5e8',
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4ecdc4',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2e7d32',
        marginBottom: 2,
    },
    dates: {
        fontSize: 12,
        color: '#4caf50',
    },
    clearButton: {
        backgroundColor: '#ff6b6b',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    clearButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default SelectionSummary;
