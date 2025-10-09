import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    User,
    DollarSign,
    AlertTriangle,
    Info,
    XCircle,
    CheckCircle,
    MessageCircle,
} from 'lucide-react-native';

interface BookingItem {
    id: string;
    instructorName: string;
    date: string;
    time: string;
    location: string;
    status: 'requested' | 'pending_confirmation' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
    packageType: 'instructor' | 'full';
    selectedRoadTypes: string[];
    selectedSkills: string[];
    instructorRoute?: string;
    instructorNotes?: string;
    studentResponse?: 'accepted' | 'rejected';
    studentNotes?: string;
    createdAt: string;
    price: number;
    coins: number;
    sessions?: BookingSession[];
    isMultiSession?: boolean;
}

interface BookingSession {
    id: string;
    date: string;
    time: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    price: number;
}

interface CancelRefundInfo {
    refundAmount: number;
    refundPercentage: number;
    penaltyAmount: number;
    hoursUntilSession: number;
    cancellationFee: number;
    instructorCompensation: number;
    systemFee: number;
}

export default function CancelBookingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [booking, setBooking] = useState<BookingItem | null>(null);
    const [refundInfo, setRefundInfo] = useState<CancelRefundInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Mock data - In real app, this would come from API or global state
    const mockBookings: BookingItem[] = [
        {
            id: '1',
            instructorName: 'Thầy Nguyễn Văn B',
            date: '2025-01-15',
            time: 'Ca sáng (6:00 - 10:00)',
            location: 'FPT University Hồ Chí Minh',
            status: 'requested',
            packageType: 'instructor',
            selectedRoadTypes: ['urban', 'highway'],
            selectedSkills: ['basic_control', 'parking'],
            createdAt: '2025-01-10T10:00:00Z',
            price: 200000,
            coins: 200,
        },
        {
            id: '2',
            instructorName: 'Thầy Trần Văn C',
            date: '2025-01-18',
            time: 'Ca chiều (14:00 - 18:00)',
            location: 'FPT University Hà Nội',
            status: 'pending_confirmation',
            packageType: 'full',
            selectedRoadTypes: ['residential', 'urban'],
            selectedSkills: ['lane_change', 'overtaking'],
            instructorRoute: 'Lộ trình từ FPT University → Khu vực luyện tập → Trở về',
            instructorNotes: 'Sẽ tập trung vào kỹ năng chuyển làn và vượt xe an toàn',
            createdAt: '2025-01-12T14:30:00Z',
            price: 300000,
            coins: 300,
        },
        {
            id: '3',
            instructorName: 'Thầy Lê Văn D',
            date: '2025-01-12',
            time: 'Ca sáng (6:00 - 10:00)',
            location: 'FPT University Đà Nẵng',
            status: 'in_progress',
            packageType: 'instructor',
            selectedRoadTypes: ['highway', 'mountain'],
            selectedSkills: ['highway_driving', 'defensive_driving'],
            instructorRoute: 'Lộ trình cao tốc Đà Nẵng → Đèo Hải Vân → Trở về',
            instructorNotes: 'Luyện tập lái xe cao tốc và đường đèo',
            studentResponse: 'accepted',
            createdAt: '2025-01-08T09:15:00Z',
            price: 250000,
            coins: 250,
            isMultiSession: true,
            sessions: [
                { id: '3-1', date: '2025-01-12', time: 'Ca sáng (6:00 - 10:00)', status: 'completed', price: 250000 },
                { id: '3-2', date: '2025-01-13', time: 'Ca sáng (6:00 - 10:00)', status: 'upcoming', price: 250000 },
                { id: '3-3', date: '2025-01-14', time: 'Ca sáng (6:00 - 10:00)', status: 'upcoming', price: 250000 },
            ],
        },
    ];

    const calculateRefundInfo = (booking: BookingItem): CancelRefundInfo => {
        const sessionDate = new Date(booking.date);
        const now = new Date();
        const hoursUntilSession = Math.max(0, (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        
        let refundPercentage = 0;
        let cancellationFee = 0;
        let penaltyAmount = 0;
        
        if (hoursUntilSession >= 48) {
            // Trước 48h: hoàn tiền 100%
            refundPercentage = 100;
        } else if (hoursUntilSession >= 24) {
            // 24-48h: hoàn tiền 50%
            refundPercentage = 50;
        } else if (hoursUntilSession >= 4) {
            // 4-24h: không hoàn tiền
            refundPercentage = 0;
        } else {
            // Dưới 4h: phí hủy 50% booking
            refundPercentage = 0;
            cancellationFee = booking.coins * 0.5;
        }
        
        const refundAmount = (booking.coins * refundPercentage) / 100;
        const instructorCompensation = booking.coins - refundAmount;
        const systemFee = cancellationFee * 0.1; // 10% system fee từ cancellation fee
        
        return {
            refundAmount,
            refundPercentage,
            penaltyAmount,
            hoursUntilSession,
            cancellationFee,
            instructorCompensation,
            systemFee,
        };
    };

    const calculateMultiSessionRefund = (booking: BookingItem): CancelRefundInfo => {
        if (!booking.sessions || !booking.isMultiSession) {
            return calculateRefundInfo(booking);
        }

        let totalRefund = 0;
        let totalPenalty = 0;
        let totalCancellationFee = 0;
        let totalInstructorCompensation = 0;
        let totalSystemFee = 0;

        const upcomingSessions = booking.sessions.filter(session => session.status === 'upcoming');
        
        upcomingSessions.forEach(session => {
            const sessionDate = new Date(session.date);
            const now = new Date();
            const hoursUntilSession = Math.max(0, (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60));
            
            let refundPercentage = 0;
            let cancellationFee = 0;
            
            if (hoursUntilSession >= 48) {
                refundPercentage = 100;
            } else if (hoursUntilSession >= 24) {
                refundPercentage = 50;
            } else if (hoursUntilSession >= 4) {
                refundPercentage = 0;
            } else {
                refundPercentage = 0;
                cancellationFee = (session.price / 1000) * 0.5; // Convert to coins
            }
            
            const sessionRefund = ((session.price / 1000) * refundPercentage) / 100;
            const sessionInstructorComp = (session.price / 1000) - sessionRefund;
            const sessionSystemFee = cancellationFee * 0.1;
            
            totalRefund += sessionRefund;
            totalCancellationFee += cancellationFee;
            totalInstructorCompensation += sessionInstructorComp;
            totalSystemFee += sessionSystemFee;
        });

        const avgHoursUntilSession = upcomingSessions.length > 0 
            ? upcomingSessions.reduce((sum, session) => {
                const sessionDate = new Date(session.date);
                const now = new Date();
                return sum + Math.max(0, (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60));
            }, 0) / upcomingSessions.length 
            : 0;

        return {
            refundAmount: totalRefund,
            refundPercentage: totalRefund > 0 ? (totalRefund / (upcomingSessions.length * (booking.coins / (booking.sessions.length || 1)))) * 100 : 0,
            penaltyAmount: totalPenalty,
            hoursUntilSession: avgHoursUntilSession,
            cancellationFee: totalCancellationFee,
            instructorCompensation: totalInstructorCompensation,
            systemFee: totalSystemFee,
        };
    };

    useEffect(() => {
        const bookingId = params.bookingId as string;
        if (bookingId) {
            // Find booking by ID
            const foundBooking = mockBookings.find(b => b.id === bookingId);
            if (foundBooking) {
                setBooking(foundBooking);
                
                // Calculate refund info
                const refundInfo = foundBooking.isMultiSession 
                    ? calculateMultiSessionRefund(foundBooking)
                    : calculateRefundInfo(foundBooking);
                    
                setRefundInfo(refundInfo);
            }
        }
        setIsLoading(false);
    }, [params.bookingId]);

    const handleConfirmCancel = () => {
        if (!booking || !refundInfo) return;
        
        Alert.alert(
            '✅ Hủy lịch thành công!',
            `Đã hủy lịch với ${booking.instructorName}\n\n` +
            `💰 Số tiền hoàn lại: ${refundInfo.refundAmount.toLocaleString()} xu\n` +
            `📧 Thông báo đã được gửi đến instructor\n` +
            `⏰ Tiền sẽ được chuyển vào ví trong 5-10 phút`,
            [
                {
                    text: 'OK',
                    onPress: () => {
                        router.back();
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Đang tải thông tin...</Text>
                </View>
            </View>
        );
    }

    if (!booking || !refundInfo) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.errorContainer}>
                    <XCircle size={48} color="#ef4444" strokeWidth={2} />
                    <Text style={styles.errorTitle}>Không tìm thấy thông tin lịch đặt</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <LinearGradient
                colors={['#ef4444', '#dc2626', '#b91c1c']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backIconContainer}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Hủy đặt lịch</Text>
                        <Text style={styles.headerSubtitle}>Xem chi tiết và xác nhận hủy</Text>
                    </View>
                    <View style={styles.headerIconContainer}>
                        <XCircle size={24} color="#ffffff" strokeWidth={2} />
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Booking Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin lịch đặt</Text>
                    <View style={styles.bookingCard}>
                        <LinearGradient
                            colors={['#ffffff', '#f8fafc']}
                            style={styles.cardGradient}
                        >
                            <View style={styles.instructorInfo}>
                                <View style={styles.instructorAvatar}>
                                    <User size={20} color="#ffffff" strokeWidth={2} />
                                </View>
                                <View style={styles.instructorDetails}>
                                    <Text style={styles.instructorName}>{booking.instructorName}</Text>
                                    <Text style={styles.packageType}>
                                        {booking.packageType === 'instructor' ? 'Thuê người hướng dẫn' : 'Thuê trọn gói'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.bookingDetails}>
                                <View style={styles.detailRow}>
                                    <Calendar size={16} color="#6b7280" strokeWidth={2} />
                                    <Text style={styles.detailLabel}>Ngày:</Text>
                                    <Text style={styles.detailValue}>{booking.date}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Clock size={16} color="#6b7280" strokeWidth={2} />
                                    <Text style={styles.detailLabel}>Giờ:</Text>
                                    <Text style={styles.detailValue}>{booking.time}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <MapPin size={16} color="#6b7280" strokeWidth={2} />
                                    <Text style={styles.detailLabel}>Địa điểm:</Text>
                                    <Text style={styles.detailValue} numberOfLines={2}>{booking.location}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <DollarSign size={16} color="#6b7280" strokeWidth={2} />
                                    <Text style={styles.detailLabel}>Giá:</Text>
                                    <Text style={styles.detailValue}>{booking.coins} xu</Text>
                                </View>
                            </View>

                            {booking.instructorRoute && (
                                <View style={styles.routeSection}>
                                    <View style={styles.routeHeader}>
                                        <MessageCircle size={16} color="#10b981" strokeWidth={2} />
                                        <Text style={styles.routeTitle}>Lộ trình từ instructor</Text>
                                    </View>
                                    <Text style={styles.routeText}>{booking.instructorRoute}</Text>
                                    {booking.instructorNotes && (
                                        <Text style={styles.notesText}>{booking.instructorNotes}</Text>
                                    )}
                                </View>
                            )}
                        </LinearGradient>
                    </View>
                </View>

                {/* Refund Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chi tiết hoàn tiền</Text>
                    <View style={styles.refundCard}>
                        <View style={styles.timeInfoRow}>
                            <Info size={16} color="#3b82f6" strokeWidth={2} />
                            <Text style={styles.timeInfoText}>
                                Còn {Math.round(refundInfo.hoursUntilSession)} giờ đến buổi học
                            </Text>
                        </View>

                        <View style={styles.refundRow}>
                            <Text style={styles.refundLabel}>Tỷ lệ hoàn tiền:</Text>
                            <Text style={[styles.refundValue, { color: refundInfo.refundPercentage > 0 ? '#10b981' : '#ef4444' }]}>
                                {refundInfo.refundPercentage}%
                            </Text>
                        </View>

                        <View style={styles.refundRow}>
                            <Text style={styles.refundLabel}>Số tiền hoàn lại:</Text>
                            <Text style={[styles.refundValue, styles.refundAmount]}>
                                {refundInfo.refundAmount.toLocaleString()} xu
                            </Text>
                        </View>

                        {refundInfo.cancellationFee > 0 && (
                            <View style={styles.refundRow}>
                                <Text style={styles.refundLabel}>Phí hủy (dưới 4h):</Text>
                                <Text style={[styles.refundValue, { color: '#ef4444' }]}>
                                    -{refundInfo.cancellationFee.toLocaleString()} xu
                                </Text>
                            </View>
                        )}

                        <View style={styles.refundRow}>
                            <Text style={styles.refundLabel}>Instructor nhận:</Text>
                            <Text style={styles.refundValue}>
                                {refundInfo.instructorCompensation.toLocaleString()} xu
                            </Text>
                        </View>

                        {booking.isMultiSession && (
                            <View style={styles.multiSessionInfo}>
                                <Text style={styles.multiSessionTitle}>📅 Gói nhiều buổi</Text>
                                <Text style={styles.multiSessionText}>
                                    Tính toán dựa trên từng buổi học còn lại
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Warning Section */}
                <View style={styles.section}>
                    <View style={styles.warningCard}>
                        <AlertTriangle size={20} color="#f59e0b" strokeWidth={2} />
                        <View style={styles.warningContent}>
                            <Text style={styles.warningTitle}>Lưu ý quan trọng</Text>
                            <Text style={styles.warningText}>
                                • Hành động này không thể hoàn tác{'\n'}
                                • Instructor sẽ nhận thông báo ngay lập tức{'\n'}
                                • Tiền hoàn lại sẽ vào ví trong 5-10 phút{'\n'}
                                {refundInfo.hoursUntilSession < 24 && '• Hủy muộn có thể ảnh hưởng đến uy tín'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => router.back()}
                >
                    <Text style={styles.cancelButtonText}>Quay lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.confirmButton]}
                    onPress={handleConfirmCancel}
                >
                    <XCircle size={16} color="#ffffff" strokeWidth={2} />
                    <Text style={styles.confirmButtonText}>Xác nhận hủy lịch</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextContainer: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    headerIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
    },
    bookingCard: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardGradient: {
        padding: 20,
    },
    instructorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    instructorAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#667eea',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    instructorDetails: {
        flex: 1,
    },
    instructorName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    packageType: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    bookingDetails: {
        gap: 12,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
        minWidth: 80,
    },
    detailValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '600',
        flex: 1,
    },
    routeSection: {
        backgroundColor: '#f0fdf4',
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
    },
    routeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    routeTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10b981',
    },
    routeText: {
        fontSize: 13,
        color: '#15803d',
        lineHeight: 18,
        marginBottom: 8,
    },
    notesText: {
        fontSize: 12,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    refundCard: {
        backgroundColor: '#f0f9ff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    timeInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
        backgroundColor: '#dbeafe',
        padding: 12,
        borderRadius: 8,
    },
    timeInfoText: {
        fontSize: 14,
        color: '#1e40af',
        fontWeight: '600',
    },
    refundRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    refundLabel: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    refundValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1f2937',
    },
    refundAmount: {
        color: '#10b981',
        fontSize: 16,
    },
    multiSessionInfo: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#fef3c7',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fbbf24',
    },
    multiSessionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#92400e',
        marginBottom: 4,
    },
    multiSessionText: {
        fontSize: 12,
        color: '#92400e',
        fontStyle: 'italic',
    },
    warningCard: {
        flexDirection: 'row',
        backgroundColor: '#fef3c7',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#fbbf24',
        gap: 12,
    },
    warningContent: {
        flex: 1,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#92400e',
        marginBottom: 8,
    },
    warningText: {
        fontSize: 14,
        color: '#92400e',
        lineHeight: 20,
    },
    bottomActions: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: '#ef4444',
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    confirmButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 16,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ef4444',
        textAlign: 'center',
    },
    backButton: {
        backgroundColor: '#667eea',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
