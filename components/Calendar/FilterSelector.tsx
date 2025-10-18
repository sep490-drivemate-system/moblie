import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type FilterViewType = 'calendar' | 'timeline' | 'month' | 'agenda';

interface FilterSelectorProps {
    selectedView: FilterViewType;
    onViewChange: (view: FilterViewType) => void;
}

const FilterSelector: React.FC<FilterSelectorProps> = ({ selectedView, onViewChange }) => {
    const views = [
        {
            key: 'calendar' as FilterViewType,
            title: 'Lịch',
            icon: '📅',
            description: 'Xem dạng lịch truyền thống'
        },
        {
            key: 'timeline' as FilterViewType,
            title: 'Timeline',
            icon: '⏰',
            description: 'Xem dạng timeline theo tháng'
        },
        {
            key: 'month' as FilterViewType,
            title: 'Tháng',
            icon: '🗓️',
            description: 'Xem tổng quan tháng'
        },
        {
            key: 'agenda' as FilterViewType,
            title: 'Agenda',
            icon: '📝',
            description: 'Xem dạng agenda với mini calendar'
        }
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chọn cách hiển thị:</Text>
            <View style={styles.viewsContainer}>
                {views.map((view) => (
                    <TouchableOpacity
                        key={view.key}
                        style={[
                            styles.viewButton,
                            selectedView === view.key && styles.viewButtonSelected
                        ]}
                        onPress={() => onViewChange(view.key)}
                    >
                        <Text style={styles.viewIcon}>{view.icon}</Text>
                        <Text style={[
                            styles.viewTitle,
                            selectedView === view.key && styles.viewTitleSelected
                        ]}>
                            {view.title}
                        </Text>
                        <Text style={[
                            styles.viewDescription,
                            selectedView === view.key && styles.viewDescriptionSelected
                        ]}>
                            {view.description}
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
    viewsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    viewButton: {
        flex: 1,
        minWidth: 80,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
        borderWidth: 2,
        borderColor: '#e9ecef',
        alignItems: 'center',
    },
    viewButtonSelected: {
        backgroundColor: '#e8f5e8',
        borderColor: '#4ecdc4',
    },
    viewIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    viewTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2d4150',
        marginBottom: 2,
    },
    viewTitleSelected: {
        color: '#2e7d32',
    },
    viewDescription: {
        fontSize: 9,
        color: '#6c757d',
        textAlign: 'center',
        lineHeight: 12,
    },
    viewDescriptionSelected: {
        color: '#4caf50',
    },
});

export default FilterSelector;



