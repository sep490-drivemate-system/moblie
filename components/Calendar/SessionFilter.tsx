import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type SessionFilterType = 'all' | 'morning' | 'afternoon';

interface SessionFilterProps {
    selectedSession: SessionFilterType;
    onSessionChange: (session: SessionFilterType) => void;
}

const SessionFilter: React.FC<SessionFilterProps> = ({ selectedSession, onSessionChange }) => {
    const sessionOptions = [
        {
            key: 'all' as SessionFilterType,
            title: 'Tất cả',
            icon: '🌅',
            description: 'Cả sáng và chiều',
            color: '#4ecdc4'
        },
        {
            key: 'morning' as SessionFilterType,
            title: 'Sáng',
            icon: '☀️',
            description: '7:00 - 11:00',
            color: '#ffa726'
        },
        {
            key: 'afternoon' as SessionFilterType,
            title: 'Chiều',
            icon: '🌅',
            description: '13:00 - 17:00',
            color: '#42a5f5'
        }
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lọc theo buổi:</Text>
            <View style={styles.filtersContainer}>
                {sessionOptions.map((option) => (
                    <TouchableOpacity
                        key={option.key}
                        style={[
                            styles.filterButton,
                            selectedSession === option.key && styles.filterButtonSelected,
                            { borderColor: option.color }
                        ]}
                        onPress={() => onSessionChange(option.key)}
                    >
                        <View style={[
                            styles.filterIcon,
                            { backgroundColor: selectedSession === option.key ? option.color : '#f8f9fa' }
                        ]}>
                            <Text style={styles.filterIconText}>{option.icon}</Text>
                        </View>
                        <Text style={[
                            styles.filterTitle,
                            selectedSession === option.key && styles.filterTitleSelected
                        ]}>
                            {option.title}
                        </Text>
                        <Text style={[
                            styles.filterDescription,
                            selectedSession === option.key && styles.filterDescriptionSelected
                        ]}>
                            {option.description}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d4150',
        marginBottom: 12,
    },
    filtersContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    filterButton: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
        borderWidth: 2,
        borderColor: '#e9ecef',
        alignItems: 'center',
    },
    filterButtonSelected: {
        backgroundColor: '#e8f5e8',
    },
    filterIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    filterIconText: {
        fontSize: 20,
    },
    filterTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d4150',
        marginBottom: 4,
    },
    filterTitleSelected: {
        color: '#2e7d32',
    },
    filterDescription: {
        fontSize: 10,
        color: '#6c757d',
        textAlign: 'center',
        lineHeight: 12,
    },
    filterDescriptionSelected: {
        color: '#4caf50',
    },
});

export default SessionFilter;



