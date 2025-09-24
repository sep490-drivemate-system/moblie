import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type CalendarMode = 'session' | 'day' | 'week' | 'cycle';

interface ModeSelectorProps {
    selectedMode: CalendarMode;
    onModeChange: (mode: CalendarMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onModeChange }) => {
    const modes = [
        {
            key: 'session' as CalendarMode,
            title: 'Theo buổi',
            description: 'Chọn ngày trước, sau đó chọn buổi (sáng/chiều)',
            icon: '🕐'
        },
        {
            key: 'day' as CalendarMode,
            title: 'Theo ngày',
            description: 'Chỉ chọn ngày',
            icon: '📅'
        },
        {
            key: 'week' as CalendarMode,
            title: 'Theo tuần',
            description: 'Chọn tuần, sau đó chọn các ngày trong tuần',
            icon: '📆'
        },
        {
            key: 'cycle' as CalendarMode,
            title: 'Theo chu kỳ',
            description: 'Chọn các ngày trong tháng',
            icon: '🔄'
        }
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chọn chế độ đặt lịch:</Text>
            <View style={styles.modesContainer}>
                {modes.map((mode) => (
                    <TouchableOpacity
                        key={mode.key}
                        style={[
                            styles.modeButton,
                            selectedMode === mode.key && styles.modeButtonSelected
                        ]}
                        onPress={() => onModeChange(mode.key)}
                    >
                        <Text style={styles.modeIcon}>{mode.icon}</Text>
                        <Text style={[
                            styles.modeTitle,
                            selectedMode === mode.key && styles.modeTitleSelected
                        ]}>
                            {mode.title}
                        </Text>
                        <Text style={[
                            styles.modeDescription,
                            selectedMode === mode.key && styles.modeDescriptionSelected
                        ]}>
                            {mode.description}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: '#2d4150',
    },
    modesContainer: {
        gap: 12,
    },
    modeButton: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
        borderWidth: 2,
        borderColor: '#e9ecef',
        alignItems: 'center',
    },
    modeButtonSelected: {
        backgroundColor: '#e8f5e8',
        borderColor: '#4ecdc4',
    },
    modeIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    modeTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: '#2d4150',
    },
    modeTitleSelected: {
        color: '#4ecdc4',
    },
    modeDescription: {
        fontSize: 12,
        textAlign: 'center',
        color: '#6c757d',
        lineHeight: 16,
    },
    modeDescriptionSelected: {
        color: '#4ecdc4',
    },
});

export default ModeSelector;
