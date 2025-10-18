import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    Calendar,
    TimelineView,
    MonthOverview,
    CalendarEvent,
    CalendarMode
} from '../../../components/Calendar';

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

interface RentalPackage {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
    features: string[];
    carId: string;
}

export default function DetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // Calendar state
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [mode, setMode] = useState<CalendarMode>('day');
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [selectedWeek, setSelectedWeek] = useState<string[]>([]);
    const [currentView, setCurrentView] = useState<'timeline'>('timeline');
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2025, 8, 1));
    const [statusFilter, setStatusFilter] = useState<'all' | 'busy' | 'available'>('all');
    const [sessionFilter, setSessionFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
    const [selectedSessions, setSelectedSessions] = useState<{ [date: string]: ('morning' | 'afternoon')[] }>({});

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
            image: 'https://via.placeholder.com/300x200?text=Honda+City',
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
            image: 'https://via.placeholder.com/300x200?text=Hyundai+Accent',
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
            image: 'https://via.placeholder.com/300x200?text=Mazda+CX-5',
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

    // 4 gói theo cách đặt lịch (ấn gói → mới hiện lịch)
    const rentalPackages: RentalPackage[] = [
        {
            id: 'session',
            name: 'Theo buổi',
            description: 'Chọn buổi Sáng (07:00-11:00) hoặc Chiều (13:00-17:00)',
            price: 0,
            duration: '1 buổi',
            features: ['Chọn theo buổi', 'Xem bận/rảnh theo buổi'],
            carId: '1'
        },
        {
            id: 'day',
            name: 'Theo ngày',
            description: 'Chọn 1 ngày trong tháng',
            price: 0,
            duration: '1 ngày',
            features: ['Chọn một ngày', 'Xem bận/rảnh theo ngày'],
            carId: '1'
        },
        {
            id: 'week',
            name: 'Theo tuần',
            description: 'Chọn các ngày trong một tuần',
            price: 0,
            duration: '1 tuần',
            features: ['Chọn nhiều ngày trong tuần', 'Xem bận/rảnh theo tuần'],
            carId: '1'
        },
        {
            id: 'cycle',
            name: 'Theo chu kỳ',
            description: 'Chọn 1 thứ → tự động chọn tất cả thứ đó trong tháng',
            price: 0,
            duration: 'Trong tháng',
            features: ['Auto chọn cùng thứ', 'Xem bận/rảnh toàn tháng'],
            carId: '1'
        }
    ];

    // Mock calendar events for September 2025 - Chỉ lưu lịch bận
    const mockEvents: CalendarEvent[] = [
        { id: '1', date: '2025-09-01', time: 'Sáng', startTime: '07:00', endTime: '11:00', type: 'busy', session: 'morning', title: 'Đã thuê', description: 'Xe đã được thuê' },
        { id: '4', date: '2025-09-02', time: 'Chiều', startTime: '14:00', endTime: '18:00', type: 'busy', session: 'afternoon', title: 'Đã thuê', description: 'Xe đã được thuê' },
        { id: '5', date: '2025-09-03', time: 'Sáng', startTime: '07:30', endTime: '11:30', type: 'busy', session: 'morning', title: 'Đã thuê', description: 'Xe đã được thuê' },
        { id: '9', date: '2025-09-05', time: 'Sáng', startTime: '07:00', endTime: '11:00', type: 'busy', session: 'morning', title: 'Đã thuê', description: 'Xe đã được thuê' },
        { id: '10', date: '2025-09-05', time: 'Chiều', startTime: '13:00', endTime: '17:00', type: 'busy', session: 'afternoon', title: 'Đã thuê', description: 'Xe đã được thuê' },
        { id: '16', date: '2025-09-08', time: 'Chiều', startTime: '13:00', endTime: '17:00', type: 'busy', session: 'afternoon', title: 'Đã thuê', description: 'Xe đã được thuê' },
        { id: '17', date: '2025-09-10', time: 'Sáng', startTime: '07:00', endTime: '11:00', type: 'busy', session: 'morning', title: 'Đã thuê', description: 'Xe đã được thuê' },
        { id: '18', date: '2025-09-10', time: 'Chiều', startTime: '13:00', endTime: '17:00', type: 'busy', session: 'afternoon', title: 'Đã thuê', description: 'Xe đã được thuê' },
        { id: '19', date: '2025-09-12', time: 'Sáng', startTime: '07:00', endTime: '11:00', type: 'busy', session: 'morning', title: 'Đã thuê', description: 'Xe đã được thuê' },
        { id: '20', date: '2025-09-15', time: 'Chiều', startTime: '13:00', endTime: '17:00', type: 'busy', session: 'afternoon', title: 'Đã thuê', description: 'Xe đã được thuê' }
    ];

    const selectedCar = cars.find(car => car.id === id);
    const carPackages = rentalPackages.filter(pkg => pkg.carId === id);

    const handleBackPress = () => {
        router.back();
    };

    const handleDateSelect = (date: string, session?: 'morning' | 'afternoon') => {
        console.log('handleDateSelect called:', { date, session, mode, selectedPackage });
        // Chỉ cho phép chọn nếu đã chọn gói
        if (!selectedPackage) return;

        // Kiểm tra ngày quá khứ
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            Alert.alert('Thông báo', 'Không thể chọn ngày quá khứ');
            return;
        }

        if (mode === 'session') {
            // Mode theo buổi: có thể chọn nhiều ngày, mỗi ngày chọn buổi
            if (!session) {
                // Chọn ngày - chỉ thêm vào danh sách nếu chưa có, không toggle
                if (!selectedDates.includes(date)) {
                    setSelectedDates(prev => [...prev, date]);
                }
                return; // Không làm gì thêm khi chỉ chọn ngày
            } else {
                // Chọn buổi cụ thể - kiểm tra buổi đó có rảnh không
                console.log('Selecting session:', { date, session });
                const busyEvents = mockEvents.filter(event => event.date === date);
                const sessionBusy = busyEvents.find(event => event.session === session);
                if (sessionBusy) {
                    console.log('Session is busy:', sessionBusy);
                    Alert.alert('Thông báo', 'Thời gian này đã được thuê, vui lòng chọn thời gian khác');
                    return;
                }

                // Cập nhật selectedSessions
                setSelectedSessions(prevSessions => {
                    const currentSessions = prevSessions[date] || [];
                    console.log('Current sessions for date:', { date, currentSessions, session });

                    if (currentSessions.includes(session)) {
                        // Bỏ chọn session nếu đã chọn
                        console.log('Removing session:', session);
                        const newSessions = currentSessions.filter(s => s !== session);
                        
                        if (newSessions.length === 0) {
                            // Nếu không còn session nào, bỏ chọn ngày
                            setSelectedDates(prev => prev.filter(d => d !== date));
                            const newSelectedSessions = { ...prevSessions };
                            delete newSelectedSessions[date];
                            return newSelectedSessions;
                        } else {
                            return {
                                ...prevSessions,
                                [date]: newSessions
                            };
                        }
                    } else {
                        // Thêm session vào danh sách
                        console.log('Adding session:', session);
                        
                        // Đảm bảo ngày được thêm vào danh sách nếu chưa có
                        setSelectedDates(prev => {
                            if (!prev.includes(date)) {
                                return [...prev, date];
                            }
                            return prev;
                        });

                        return {
                            ...prevSessions,
                            [date]: [...currentSessions, session]
                        };
                    }
                });
            }
        } else {
            // Mode theo ngày/tuần/chu kỳ: kiểm tra trạng thái tổng thể
            const busyEvents = mockEvents.filter(event => event.date === date);

            if (mode === 'day') {
                // Kiểm tra có bất kỳ session nào bận không
                if (busyEvents.length > 0) {
                    Alert.alert('Thông báo', 'Ngày này có lịch bận, vui lòng chọn ngày khác');
                    return;
                }
                setSelectedDates([date]);
            } else if (mode === 'week') {
                // Trong chế độ tuần, chọn ngày đầu tiên để hiển thị tuần
                if (busyEvents.length > 0) {
                    Alert.alert('Thông báo', 'Ngày này có lịch bận, vui lòng chọn ngày khác');
                    return;
                }
                setSelectedWeek([date]);
            } else if (mode === 'cycle') {
                // Trong chế độ chu kỳ, chọn tất cả ngày cùng thứ trong tuần
                const selectedDayOfWeek = new Date(date).getDay();
                const year = 2025;
                const month = 8; // September (0-indexed)

                // Lấy tất cả ngày cùng thứ trong tháng
                const allDaysInMonth: string[] = [];
                for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
                    const dateObj = new Date(year, month, day);
                    if (dateObj.getDay() === selectedDayOfWeek) {
                        allDaysInMonth.push(dateObj.toISOString().split('T')[0]);
                    }
                }

                // Kiểm tra xem tất cả ngày cùng thứ có bận không
                const anyBusy = allDaysInMonth.some(dayDate => {
                    const busyEvents = mockEvents.filter(event => event.date === dayDate);
                    return busyEvents.length > 0;
                });

                if (anyBusy) {
                    Alert.alert('Thông báo', 'Một số ngày cùng thứ trong tháng đã được thuê');
                    return;
                }

                setSelectedDates(allDaysInMonth);
            }
        }
    };

    const handleWeekSelect = (weekStart: string, weekEnd: string) => {
        setSelectedWeek([weekStart, weekEnd]);
    };

    const handleMultipleDateSelect = (dates: string[]) => {
        setSelectedDates(dates);
    };

    const handleMonthChange = (month: Date) => {
        setCurrentMonth(month);
    };

    const handlePackageSelect = (packageId: string) => {
        setSelectedPackage(packageId);
        // Đồng bộ mode theo gói đã chọn
        if (packageId === 'session' || packageId === 'day' || packageId === 'week' || packageId === 'cycle') {
            setMode(packageId as CalendarMode);
        }
        setSelectedDates([]);
        setSelectedWeek([]);
        setSelectedSessions({});
    };

    // Auto-show week selector when mode is 'week' by preselecting current date
    useEffect(() => {
        if (selectedPackage && mode === 'week') {
            const today = new Date(2025, 8, 1); // Sep 1, 2025 as anchor
            handleDateSelect(today.toISOString().split('T')[0]);
        }
    }, [selectedPackage, mode]);

    const handleBookNow = () => {
        if (!selectedPackage) {
            Alert.alert('Thông báo', 'Vui lòng chọn gói thuê xe trước');
            return;
        }

        if (selectedDates.length === 0) {
            Alert.alert('Thông báo', 'Vui lòng chọn thời gian thuê xe');
            return;
        }

        Alert.alert(
            'Đặt xe thành công!',
            `Bạn đã đặt thành công gói thuê xe`,
            [
                {
                    text: 'OK',
                    onPress: () => router.back()
                }
            ]
        );
    };

    if (!selectedCar) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Quay lại</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Không tìm thấy xe</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Xe không tồn tại</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết xe</Text>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Car Information */}
                <View style={styles.carSection}>
                    <Image source={{ uri: selectedCar.image }} style={styles.carImage} />
                    <View style={styles.carInfo}>
                        <Text style={styles.carName}>{selectedCar.name}</Text>
                        <Text style={styles.carDetails}>{selectedCar.year} • {selectedCar.fuelType} • {selectedCar.transmission}</Text>
                        <Text style={styles.carDescription}>{selectedCar.description}</Text>
                        <Text style={styles.carPrice}>Từ {selectedCar.price.toLocaleString()} VNĐ/ngày</Text>
                    </View>
                </View>

                {/* Car Features */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tính năng xe:</Text>
                    <View style={styles.featuresGrid}>
                        {selectedCar.features.map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                <Text style={styles.featureIcon}>✓</Text>
                                <Text style={styles.featureText}>{feature}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Rental Packages */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chọn gói thuê xe:</Text>
                    {carPackages.map((pkg) => (
                        <TouchableOpacity
                            key={pkg.id}
                            style={[
                                styles.packageCard,
                                selectedPackage === pkg.id && styles.packageCardSelected
                            ]}
                            onPress={() => handlePackageSelect(pkg.id)}
                        >
                            <View style={styles.packageHeader}>
                                <Text style={styles.packageName}>{pkg.name}</Text>
                                <Text style={styles.packagePrice}>{pkg.price.toLocaleString()} VNĐ</Text>
                            </View>
                            <Text style={styles.packageDescription}>{pkg.description}</Text>
                            <Text style={styles.packageDuration}>Thời gian: {pkg.duration}</Text>
                            <View style={styles.packageFeatures}>
                                {pkg.features.map((feature, index) => (
                                    <Text key={index} style={styles.packageFeature}>• {feature}</Text>
                                ))}
                            </View>
                            {selectedPackage === pkg.id && (
                                <View style={styles.selectedIndicator}>
                                    <Text style={styles.selectedText}>✓ Đã chọn</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Calendar Section - Only show if package is selected */}
                {selectedPackage && (
                    <View style={styles.section}>

                        {/* Status Filter - Simple */}


                        {/* Session Filter */}
                        <View style={styles.simpleFilterContainer}>
                            <Text style={styles.filterLabel}>Thời gian:</Text>
                            <View style={styles.filterButtons}>
                                <TouchableOpacity
                                    style={[styles.filterButton, sessionFilter === 'all' && styles.filterButtonActive]}
                                    onPress={() => setSessionFilter('all')}
                                >
                                    <Text style={[styles.filterButtonText, sessionFilter === 'all' && styles.filterButtonTextActive]}>
                                        Tất cả
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.filterButton, sessionFilter === 'morning' && styles.filterButtonActive]}
                                    onPress={() => setSessionFilter('morning')}
                                >
                                    <Text style={[styles.filterButtonText, sessionFilter === 'morning' && styles.filterButtonTextActive]}>
                                        Sáng (7h-11h)
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.filterButton, sessionFilter === 'afternoon' && styles.filterButtonActive]}
                                    onPress={() => setSessionFilter('afternoon')}
                                >
                                    <Text style={[styles.filterButtonText, sessionFilter === 'afternoon' && styles.filterButtonTextActive]}>
                                        Chiều (13h-17h)
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>



                        {currentView === 'timeline' && (
                            <TimelineView
                                events={mockEvents.filter(event => {
                                    // Chỉ filter theo session, vì tất cả events trong mockEvents đều là 'busy'
                                    if (sessionFilter !== 'all' && event.session !== sessionFilter) return false;
                                    return true;
                                })}
                                selectedDates={selectedDates}
                                onDateSelect={handleDateSelect}
                                currentMonth={currentMonth}
                                onMonthChange={handleMonthChange}
                                mode={mode}
                                selectedSessions={selectedSessions}
                            />
                        )}


                        {/* Debug Info - Tạm thời */}
                        {mode === 'session' && (
                            <View style={styles.debugInfo}>
                                <Text style={styles.debugText}>Debug Mode: {mode}</Text>
                                <Text style={styles.debugText}>Selected Dates: {selectedDates.join(', ')}</Text>
                                <Text style={styles.debugText}>Selected Sessions: {JSON.stringify(selectedSessions)}</Text>
                            </View>
                        )}

                        {/* Selection Summary */}
                        {selectedDates.length > 0 && (
                            <View style={styles.selectionSummary}>
                                <Text style={styles.selectionText}>
                                    Đã chọn {selectedDates.length} ngày
                                </Text>
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={() => {
                                        setSelectedDates([]);
                                        setSelectedSessions({});
                                    }}
                                >
                                    <Text style={styles.clearButtonText}>Xóa</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Book Now Button */}
                        <TouchableOpacity
                            style={styles.bookNowButton}
                            onPress={handleBookNow}
                        >
                            <Text style={styles.bookNowButtonText}>Đặt xe ngay</Text>
                        </TouchableOpacity>
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
    carSection: {
        backgroundColor: '#ffffff',
        margin: 16,
        borderRadius: 12,
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
        fontSize: 24,
        fontWeight: '600',
        color: '#2d4150',
        marginBottom: 8,
    },
    carDetails: {
        fontSize: 16,
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
        fontSize: 20,
        fontWeight: '600',
        color: '#4ecdc4',
    },
    section: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2d4150',
        marginBottom: 12,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    featureItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    featureIcon: {
        fontSize: 16,
        color: '#4ecdc4',
        marginRight: 8,
        fontWeight: 'bold',
    },
    featureText: {
        fontSize: 14,
        color: '#2d4150',
    },
    packageCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    packageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    packageName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d4150',
    },
    packagePrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4ecdc4',
    },
    packageDescription: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 8,
    },
    packageDuration: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 8,
    },
    packageFeatures: {
        marginBottom: 12,
    },
    packageFeature: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 4,
    },
    bookButton: {
        backgroundColor: '#4ecdc4',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
    },
    bookButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    filtersContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#6c757d',
    },
    // Simple Mode Selector Styles
    simpleModeSelector: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 4,
        flexWrap: 'wrap',
    },
    modeButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 6,
        alignItems: 'center',
        minWidth: '22%',
    },
    modeButtonActive: {
        backgroundColor: '#4ecdc4',
    },
    modeButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6c757d',
        textAlign: 'center',
    },
    modeButtonTextActive: {
        color: '#ffffff',
        fontWeight: '600',
    },
    // Simple View Selector Styles
    simpleViewSelector: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 4,
    },
    viewButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    viewButtonActive: {
        backgroundColor: '#4ecdc4',
    },
    viewButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6c757d',
    },
    viewButtonTextActive: {
        color: '#ffffff',
        fontWeight: '600',
    },
    // Simple Filter Styles
    simpleFilterContainer: {
        marginBottom: 16,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d4150',
        marginBottom: 8,
    },
    filterButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
        minWidth: 100,
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#4ecdc4',
        borderColor: '#4ecdc4',
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6c757d',
    },
    filterButtonTextActive: {
        color: '#ffffff',
        fontWeight: '600',
    },
    // Selection Summary Styles
    selectionSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#e8f5e8',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    selectionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2d4150',
    },
    clearButton: {
        backgroundColor: '#ff6b6b',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    clearButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    // Debug styles - Tạm thời
    debugInfo: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        margin: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    debugText: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 4,
    },
    // Package Selection Styles
    packageCardSelected: {
        borderColor: '#4ecdc4',
        borderWidth: 2,
        backgroundColor: '#f0fdfa',
    },
    selectedIndicator: {
        backgroundColor: '#4ecdc4',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    selectedText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    // Book Now Button
    bookNowButton: {
        backgroundColor: '#4ecdc4',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    bookNowButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
});