import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';

interface CarLocation {
    id: string;
    title: string;
    description: string;
    price: string;
    available: boolean;
    location: string;
}

export default function RentalScreen() {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'available' | 'rented'>('all');

    // Mock data cho các xe cho thuê
    const carLocations: CarLocation[] = [
        {
            id: '1',
            title: 'Toyota Vios 2023',
            description: 'Xe sedan tiết kiệm nhiên liệu, phù hợp cho gia đình',
            price: '500,000 VNĐ/ngày',
            available: true,
            location: 'Quận Ba Đình, Hà Nội',
        },
        {
            id: '2',
            title: 'Honda City 2023',
            description: 'Xe sedan cao cấp, nội thất sang trọng',
            price: '550,000 VNĐ/ngày',
            available: true,
            location: 'Quận Hoàn Kiếm, Hà Nội',
        },
        {
            id: '3',
            title: 'Mazda CX-5 2023',
            description: 'SUV 7 chỗ sang trọng, phù hợp cho du lịch',
            price: '800,000 VNĐ/ngày',
            available: false,
            location: 'Quận Cầu Giấy, Hà Nội',
        },
        {
            id: '4',
            title: 'Hyundai Accent 2023',
            description: 'Xe sedan nhỏ gọn, dễ lái trong thành phố',
            price: '450,000 VNĐ/ngày',
            available: true,
            location: 'Quận Đống Đa, Hà Nội',
        },
        {
            id: '5',
            title: 'Ford EcoSport 2023',
            description: 'SUV compact, tiện lợi cho mọi địa hình',
            price: '650,000 VNĐ/ngày',
            available: false,
            location: 'Quận Hai Bà Trưng, Hà Nội',
        },
    ];

    const handleCarPress = (car: CarLocation) => {
        Alert.alert(
            car.title,
            `${car.description}\n\nGiá: ${car.price}\nĐịa điểm: ${car.location}\nTrạng thái: ${car.available ? 'Có sẵn' : 'Đã được thuê'}`,
            [
                { text: 'Hủy', style: 'cancel' },
                ...(car.available ? [{
                    text: 'Thuê xe',
                    onPress: () => Alert.alert('Thông báo', 'Chức năng thuê xe sẽ được phát triển')
                }] : [])
            ]
        );
    };

    const filteredCars = carLocations.filter(car => {
        if (selectedFilter === 'available') return car.available;
        if (selectedFilter === 'rented') return !car.available;
        return true;
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Xe cho thuê</Text>
                <Text style={styles.headerSubtitle}>Tìm xe phù hợp với bạn</Text>
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
                    onPress={() => setSelectedFilter('all')}
                >
                    <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
                        Tất cả ({carLocations.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, selectedFilter === 'available' && styles.filterButtonActive]}
                    onPress={() => setSelectedFilter('available')}
                >
                    <Text style={[styles.filterText, selectedFilter === 'available' && styles.filterTextActive]}>
                        Có sẵn ({carLocations.filter(c => c.available).length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, selectedFilter === 'rented' && styles.filterButtonActive]}
                    onPress={() => setSelectedFilter('rented')}
                >
                    <Text style={[styles.filterText, selectedFilter === 'rented' && styles.filterTextActive]}>
                        Đã thuê ({carLocations.filter(c => !c.available).length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Car List */}
            <ScrollView style={styles.carList} showsVerticalScrollIndicator={false}>
                {filteredCars.map((car) => (
                    <TouchableOpacity
                        key={car.id}
                        style={[
                            styles.carCard,
                            { borderLeftColor: car.available ? '#4ecdc4' : '#ff6b6b' }
                        ]}
                        onPress={() => handleCarPress(car)}
                    >
                        <View style={styles.carCardHeader}>
                            <Text style={styles.carCardTitle}>{car.title}</Text>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: car.available ? '#4ecdc4' : '#ff6b6b' }
                            ]}>
                                <Text style={styles.statusText}>
                                    {car.available ? 'Có sẵn' : 'Đã thuê'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.carCardDescription}>{car.description}</Text>
                        <View style={styles.carCardFooter}>
                            <Text style={styles.carCardPrice}>{car.price}</Text>
                            <Text style={styles.carCardLocation}>📍 {car.location}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
                
                {filteredCars.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>Không có xe nào phù hợp với bộ lọc</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2d4150',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6c757d',
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#ffffff',
        marginBottom: 8,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 4,
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    filterButtonActive: {
        backgroundColor: '#4ecdc4',
        borderColor: '#4ecdc4',
    },
    filterText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        color: '#6c757d',
    },
    filterTextActive: {
        color: '#ffffff',
    },
    carList: {
        flex: 1,
        padding: 16,
    },
    carCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    carCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    carCardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d4150',
        flex: 1,
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
    },
    carCardDescription: {
        fontSize: 14,
        color: '#6c757d',
        lineHeight: 20,
        marginBottom: 12,
    },
    carCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    carCardPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4ecdc4',
    },
    carCardLocation: {
        fontSize: 14,
        color: '#6c757d',
        flex: 1,
        textAlign: 'right',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
    },
});
