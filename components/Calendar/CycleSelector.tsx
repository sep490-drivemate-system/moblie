import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CycleSelectorProps {
    currentMonth: Date;
    selectedDates: string[];
    onSelectAllDays: () => void;
    onSelectWeekdays: () => void;
    onSelectWeekends: () => void;
    onSelectByWeekday: (dayOfWeek: number) => void;
    onClearSelection: () => void;
}

const CycleSelector: React.FC<CycleSelectorProps> = ({
    currentMonth,
    selectedDates,
    onSelectAllDays,
    onSelectWeekdays,
    onSelectWeekends,
    onSelectByWeekday,
    onClearSelection
}) => {
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = new Date(year, month, day).toISOString().split('T')[0];
            days.push(dateString);
        }
        return days;
    };

    const getWeekdaysInMonth = (date: Date) => {
        const allDays = getDaysInMonth(date);
        return allDays.filter(day => {
            const dayOfWeek = new Date(day).getDay();
            return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
        });
    };

    const getWeekendsInMonth = (date: Date) => {
        const allDays = getDaysInMonth(date);
        return allDays.filter(day => {
            const dayOfWeek = new Date(day).getDay();
            return dayOfWeek === 0 || dayOfWeek === 6; // Sunday and Saturday
        });
    };

    const getDaysByWeekday = (date: Date, dayOfWeek: number) => {
        const allDays = getDaysInMonth(date);
        return allDays.filter(day => {
            return new Date(day).getDay() === dayOfWeek;
        });
    };

    const allDays = getDaysInMonth(currentMonth);
    const weekdays = getWeekdaysInMonth(currentMonth);
    const weekends = getWeekendsInMonth(currentMonth);

    const weekdayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const weekdayColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chọn theo chu kỳ cho tháng {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}:</Text>

            <Text style={styles.subtitle}>Chọn theo ngày trong tuần:</Text>
            <View style={styles.weekdayButtons}>
                {weekdayNames.map((dayName, index) => {
                    const daysInWeekday = getDaysByWeekday(currentMonth, index);
                    const isSelected = daysInWeekday.length > 0 && daysInWeekday.every(day => selectedDates.includes(day));

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.weekdayButton,
                                { backgroundColor: weekdayColors[index] },
                                isSelected && styles.weekdayButtonSelected
                            ]}
                            onPress={() => onSelectByWeekday(index)}
                        >
                            <Text style={[
                                styles.weekdayButtonText,
                                isSelected && styles.weekdayButtonTextSelected
                            ]}>
                                {dayName}
                            </Text>
                            <Text style={[
                                styles.weekdayCount,
                                isSelected && styles.weekdayButtonTextSelected
                            ]}>
                                ({daysInWeekday.length})
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Text style={styles.subtitle}>Chọn nhanh:</Text>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={[styles.button, selectedDates.length === allDays.length && styles.buttonSelected]}
                    onPress={onSelectAllDays}
                >
                    <Text style={[styles.buttonText, selectedDates.length === allDays.length && styles.buttonTextSelected]}>
                        Tất cả ({allDays.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, selectedDates.length === weekdays.length && styles.buttonSelected]}
                    onPress={onSelectWeekdays}
                >
                    <Text style={[styles.buttonText, selectedDates.length === weekdays.length && styles.buttonTextSelected]}>
                        Ngày thường ({weekdays.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, selectedDates.length === weekends.length && styles.buttonSelected]}
                    onPress={onSelectWeekends}
                >
                    <Text style={[styles.buttonText, selectedDates.length === weekends.length && styles.buttonTextSelected]}>
                        Cuối tuần ({weekends.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.clearButton]}
                    onPress={onClearSelection}
                >
                    <Text style={[styles.buttonText, styles.clearButtonText]}>
                        Xóa tất cả
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.info}>
                Đã chọn {selectedDates.length} ngày trong tháng
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d4150',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6c757d',
        marginBottom: 8,
        marginTop: 8,
    },
    weekdayButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    weekdayButton: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 6,
        minWidth: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    weekdayButtonSelected: {
        borderWidth: 2,
        borderColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    weekdayButtonText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 2,
    },
    weekdayButtonTextSelected: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    weekdayCount: {
        fontSize: 9,
        color: '#ffffff',
        opacity: 0.8,
    },
    buttonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    button: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#dee2e6',
        minWidth: 80,
        alignItems: 'center',
    },
    buttonSelected: {
        backgroundColor: '#4ecdc4',
        borderColor: '#4ecdc4',
    },
    buttonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6c757d',
    },
    buttonTextSelected: {
        color: '#ffffff',
    },
    clearButton: {
        backgroundColor: '#ff6b6b',
        borderColor: '#ff6b6b',
    },
    clearButtonText: {
        color: '#ffffff',
    },
    info: {
        fontSize: 12,
        color: '#6c757d',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default CycleSelector;
