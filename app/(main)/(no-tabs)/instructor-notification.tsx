import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  Calendar,
  Clock,
  MapPin,
  User,
  Car,
  Route,
  CheckCircle,
  X,
  Phone,
  MessageCircle,
} from 'lucide-react-native';

interface BookingNotification {
  id: string;
  studentName: string;
  studentPhone: string;
  bookingDate: string;
  bookingTime: string;
  location: string;
  roadTypes: string[];
  skills: string[];
  packageType: 'daily' | 'recurring';
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  cost: number;
}

export default function InstructorNotificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<BookingNotification>({
    id: bookingId || '1',
    studentName: 'Nguyễn Văn A',
    studentPhone: '0901234567',
    bookingDate: '2025-01-15',
    bookingTime: 'Ca sáng (6:00 - 10:00)',
    location: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
    roadTypes: ['Đường đô thị', 'Đường cao tốc'],
    skills: ['Điều khiển cơ bản', 'Chuyển làn đường', 'Đỗ xe'],
    packageType: 'daily',
    status: 'pending',
    createdAt: '2025-01-10 14:30',
    cost: 200,
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleAcceptBooking = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBooking(prev => ({ ...prev, status: 'accepted' }));
      
      Alert.alert(
        'Đã chấp nhận lịch học!',
        'Bạn đã chấp nhận lịch học. Hệ thống sẽ chuyển bạn đến trang tạo lộ trình.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.push({
                pathname: '/(main)/(no-tabs)/instructor-schedule',
                params: { bookingId: booking.id }
              });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chấp nhận lịch học. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectBooking = async () => {
    Alert.alert(
      'Từ chối lịch học',
      'Bạn có chắc chắn muốn từ chối lịch học này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              setBooking(prev => ({ ...prev, status: 'rejected' }));
              
              Alert.alert(
                'Đã từ chối',
                'Bạn đã từ chối lịch học này.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể từ chối lịch học. Vui lòng thử lại.');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleContactStudent = () => {
    Alert.alert(
      'Liên hệ học viên',
      'Chọn phương thức liên hệ:',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Gọi điện', onPress: () => console.log('Call:', booking.studentPhone) },
        { text: 'Nhắn tin', onPress: () => console.log('Message:', booking.studentPhone) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo lịch học mới</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Badge */}
        <View style={styles.notificationBadge}>
          <Bell size={24} color="#f59e0b" strokeWidth={2} />
          <Text style={styles.notificationText}>Bạn có lịch học mới!</Text>
        </View>

        {/* Student Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <User size={24} color="#3b82f6" strokeWidth={2} />
            <Text style={styles.cardTitle}>Thông tin học viên</Text>
          </View>
          <View style={styles.studentInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tên học viên:</Text>
              <Text style={styles.infoValue}>{booking.studentName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số điện thoại:</Text>
              <Text style={styles.infoValue}>{booking.studentPhone}</Text>
            </View>
            <TouchableOpacity style={styles.contactButton} onPress={handleContactStudent}>
              <Phone size={16} color="#ffffff" strokeWidth={2} />
              <Text style={styles.contactButtonText}>Liên hệ học viên</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Booking Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={24} color="#10b981" strokeWidth={2} />
            <Text style={styles.cardTitle}>Chi tiết lịch học</Text>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Calendar size={20} color="#6b7280" strokeWidth={2} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Ngày học</Text>
                <Text style={styles.detailValue}>{booking.bookingDate}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Clock size={20} color="#6b7280" strokeWidth={2} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Thời gian</Text>
                <Text style={styles.detailValue}>{booking.bookingTime}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MapPin size={20} color="#6b7280" strokeWidth={2} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Địa điểm đón</Text>
                <Text style={styles.detailValue}>{booking.location}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Car size={20} color="#6b7280" strokeWidth={2} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Gói học</Text>
                <Text style={styles.detailValue}>
                  {booking.packageType === 'daily' ? 'Theo ca trong ngày' : 'Theo chu kỳ'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Road Types Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Route size={24} color="#8b5cf6" strokeWidth={2} />
            <Text style={styles.cardTitle}>Loại đường yêu cầu</Text>
          </View>
          <View style={styles.tagsContainer}>
            {booking.roadTypes.map((roadType, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{roadType}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Skills Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <CheckCircle size={24} color="#f59e0b" strokeWidth={2} />
            <Text style={styles.cardTitle}>Kỹ năng cần luyện tập</Text>
          </View>
          <View style={styles.tagsContainer}>
            {booking.skills.map((skill, index) => (
              <View key={index} style={[styles.tag, styles.skillTag]}>
                <Text style={[styles.tagText, styles.skillTagText]}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.costLabel}>Chi phí học:</Text>
            <Text style={styles.costValue}>{booking.cost} xu</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Action Buttons */}
      {booking.status === 'pending' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleRejectBooking}
            disabled={isProcessing}
          >
            <X size={20} color="#ffffff" strokeWidth={2} />
            <Text style={styles.rejectButtonText}>Từ chối</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAcceptBooking}
            disabled={isProcessing}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.acceptButtonGradient}
            >
              <CheckCircle size={20} color="#ffffff" strokeWidth={2} />
              <Text style={styles.acceptButtonText}>
                {isProcessing ? 'Đang xử lý...' : 'Chấp nhận'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {booking.status === 'accepted' && (
        <View style={styles.statusContainer}>
          <View style={styles.acceptedStatus}>
            <CheckCircle size={24} color="#10b981" strokeWidth={2} />
            <Text style={styles.acceptedText}>Đã chấp nhận lịch học</Text>
          </View>
        </View>
      )}

      {booking.status === 'rejected' && (
        <View style={styles.statusContainer}>
          <View style={styles.rejectedStatus}>
            <X size={24} color="#ef4444" strokeWidth={2} />
            <Text style={styles.rejectedText}>Đã từ chối lịch học</Text>
          </View>
        </View>
      )}
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
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1e293b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  notificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  notificationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d97706',
  },
  card: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  studentInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4338ca',
  },
  skillTag: {
    backgroundColor: '#fef3c7',
  },
  skillTagText: {
    color: '#d97706',
  },
  costLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  costValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  acceptedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  acceptedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
  },
  rejectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  rejectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
});
