import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

interface Car {
    id: string;
    name: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    fuelType: string;
    transmission: string;
    seats: number;
    image: string;
    features: string[];
    description: string;
}

export default function CarsScreen() {
    const router = useRouter();

    const cars: Car[] = [
        {
            id: '1',
            name: 'Toyota Vios',
            brand: 'Toyota',
            model: 'Vios',
            year: 2023,
            price: 500000,
            fuelType: 'Xăng',
            transmission: 'Số tự động',
            seats: 5,
            image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000&auto=format&fit=crop',
            features: ['Điều hòa', 'Bluetooth', 'Camera lùi', 'Cảm biến va chạm'],
            description: 'Xe sedan 4 chỗ tiết kiệm nhiên liệu, phù hợp cho gia đình'
        },
        {
            id: '2',
            name: 'Honda City',
            brand: 'Honda',
            model: 'City',
            year: 2023,
            price: 550000,
            fuelType: 'Xăng',
            transmission: 'Số tự động',
            seats: 5,
            image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000&auto=format&fit=crop',
            features: ['Điều hòa', 'Bluetooth', 'Camera lùi', 'Cảm biến va chạm', 'Navi'],
            description: 'Xe sedan cao cấp với nhiều tính năng hiện đại'
        },
        {
            id: '3',
            name: 'Hyundai Accent',
            brand: 'Hyundai',
            model: 'Accent',
            year: 2022,
            price: 480000,
            fuelType: 'Xăng',
            transmission: 'Số sàn',
            seats: 5,
            image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000&auto=format&fit=crop',
            features: ['Điều hòa', 'Bluetooth', 'Camera lùi'],
            description: 'Xe sedan giá rẻ, tiết kiệm nhiên liệu'
        },
        {
            id: '4',
            name: 'Mazda CX-5',
            brand: 'Mazda',
            model: 'CX-5',
            year: 2023,
            price: 800000,
            fuelType: 'Xăng',
            transmission: 'Số tự động',
            seats: 7,
            image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000&auto=format&fit=crop',
            features: ['Điều hòa', 'Bluetooth', 'Camera 360', 'Cảm biến va chạm', 'Navi', 'Sunroof'],
            description: 'SUV 7 chỗ sang trọng, phù hợp cho gia đình lớn'
        },
        {
            id: '5',
            name: 'Ford Ranger',
            brand: 'Ford',
            model: 'Ranger',
            year: 2022,
            price: 700000,
            fuelType: 'Diesel',
            transmission: 'Số sàn',
            seats: 5,
            image: 'https://via.placeholder.com/300x200?text=Ford+Ranger',
            features: ['Điều hòa', 'Bluetooth', 'Camera lùi', 'Cảm biến va chạm', '4WD'],
            description: 'Pickup mạnh mẽ, phù hợp cho công việc và du lịch'
        }
    ];

    const handleCarPress = (carId: string) => {
        router.push(`/detail?id=${carId}`);
    };

    const handleBackPress = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Danh sách xe</Text>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.carsContainer}>
                    {cars.map((car) => (
                        <View key={car.id} style={styles.carCard}>
                            <Image source={{ uri: car.image }} style={styles.carImage} />
                            <View style={styles.carInfo}>
                                <Text style={styles.carName}>{car.name}</Text>
                                <Text style={styles.carDetails}>{car.year} • {car.fuelType} • {car.transmission}</Text>
                                <Text style={styles.carDescription}>{car.description}</Text>
                                <Text style={styles.carPrice}>Từ {car.price.toLocaleString()} VNĐ/ngày</Text>
                                <View style={styles.featuresContainer}>
                                    {car.features.slice(0, 3).map((feature, index) => (
                                        <Text key={index} style={styles.featureItem}>
                                            • {feature}
                                        </Text>
                                    ))}
                                    {car.features.length > 3 && (
                                        <Text style={styles.moreFeatures}>+{car.features.length - 3} tính năng khác</Text>
                                    )}
                                </View>
                                <TouchableOpacity
                                    style={styles.detailButton}
                                    onPress={() => handleCarPress(car.id)}
                                >
                                    <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButton: {
        marginRight: 16,
    },
    backButtonText: {
        fontSize: 16,
        color: '#4ecdc4',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d4150',
    },
    content: {
        flex: 1,
    },
    carsContainer: {
        padding: 16,
    },
    carCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    carImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    carInfo: {
        padding: 16,
    },
    carName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2d4150',
        marginBottom: 4,
    },
    carDetails: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 8,
    },
    carDescription: {
        fontSize: 14,
        color: '#495057',
        marginBottom: 12,
        lineHeight: 20,
    },
    carPrice: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4ecdc4',
        marginBottom: 12,
    },
    featuresContainer: {
        marginBottom: 16,
    },
    featureItem: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 4,
    },
    moreFeatures: {
        fontSize: 12,
        color: '#4ecdc4',
        fontStyle: 'italic',
    },
    detailButton: {
        backgroundColor: '#4ecdc4',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    detailButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
});