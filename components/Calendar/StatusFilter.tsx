import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type StatusFilterType = 'all' | 'busy' | 'available';

interface StatusFilterProps {
    selectedStatus: StatusFilterType;
    onStatusChange: (status: StatusFilterType) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ selectedStatus, onStatusChange }) => {
    const statusOptions = [
        {
            key: 'all' as StatusFilterType,
            title: 'Tất cả',
            icon: '📅',
            description: 'Hiển thị tất cả',
            color: '#4ecdc4'
        },
        {
            key: 'busy' as StatusFilterType,
            title: 'Bận',
            icon: '🔴',
            description: 'Chỉ hiển thị bận',
            color: '#ff4757'
        },
        {
            key: 'available' as StatusFilterType,
            title: 'Rảnh',
            icon: '🟢',
            description: 'Chỉ hiển thị rảnh',
            color: '#2ed573'
        }
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lọc theo trạng thái:</Text>
            <View style={styles.filtersContainer}>
                {statusOptions.map((option) => (
                    <TouchableOpacity
                        key={option.key}
                        style={[
                            styles.filterButton,
                            selectedStatus === option.key && styles.filterButtonSelected,
                            { borderColor: option.color }
                        ]}
                        onPress={() => onStatusChange(option.key)}
                    >
                        <View style={[
                            styles.filterIcon,
                            { backgroundColor: selectedStatus === option.key ? option.color : '#f8f9fa' }
                        ]}>
                            <Text style={styles.filterIconText}>{option.icon}</Text>
                        </View>
                        <Text style={[
                            styles.filterTitle,
                            selectedStatus === option.key && styles.filterTitleSelected
                        ]}>
                            {option.title}
                        </Text>
                        <Text style={[
                            styles.filterDescription,
                            selectedStatus === option.key && styles.filterDescriptionSelected
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

export default StatusFilter;



