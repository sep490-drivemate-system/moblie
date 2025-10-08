import React, { useState } from 'react';
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
  Route,
  Clock,
  MapPin,
  Target,
  User,
  CheckCircle,
  X,
  Eye,
  Calendar,
} from 'lucide-react-native';

interface RoutePoint {
  id: string;
  address: string;
  description: string;
  estimatedTime: string;
  skills: string[];
}

interface RouteData {
  id: string;
  title: string;
  description: string;
  totalDuration: string;
  instructorName: string;
  bookingDate: string;
  bookingTime: string;
  points: RoutePoint[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function RouteNotificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const routeId = params.routeId as string;

  const [route, setRoute] = useState<RouteData>({
    id: routeId || '1',
    title: 'Lộ trình học lái cơ bản',
    description: 'Lộ trình được thiết kế để học viên làm quen với các kỹ năng lái xe cơ bản trong môi trường thành phố.',
    totalDuration: '3 giờ 30 phút',
    instructorName: 'Thầy Nguyễn Văn B',
    bookingDate: '2025-01-15',
    bookingTime: 'Ca sáng (6:00 - 10:00)',
    points: [
      {
        id: '1',
        address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
        description: 'Điểm đón - Kiểm tra xe và hướng dẫn cơ bản',
        estimatedTime: '15 phút',
        skills: ['Điều khiển cơ bản'],
      },
      {
        id: '2',
        address: 'Khu dân cư Trung Sơn, Quận 7',
        description: 'Luyện tập lái xe trong khu dân cư vắng',
        estimatedTime: '45 phút',
        skills: ['Điều khiển cơ bản', 'Chuyển làn'],
      },
      {
        id: '3',
        address: 'Siêu thị Lotte Mart Quận 7',
        description: 'Luyện tập đỗ xe trong bãi đỗ xe lớn',
        estimatedTime: '30 phút',
        skills: ['Đỗ xe'],
      },
      {
        id: '4',
        address: 'Đường Nguyễn Thị Thập, Quận 7',
        description: 'Luyện tập lái xe trên đường có lưu lượng xe trung bình',
        estimatedTime: '60 phút',
        skills: ['Chuyển làn', 'Vượt xe', 'Qua ngã tư'],
      },
      {
        id: '5',
        address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
        description: 'Điểm trả - Tổng kết buổi học',
        estimatedTime: '20 phút',
        skills: [],
      },
    ],
    status: 'pending',
    createdAt: '2025-01-12 10:30',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleAcceptRoute = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setRoute(prev => ({ ...prev, status: 'accepted' }));
      
      Alert.alert(
        'Đã chấp nhận lộ trình!',
        'Bạn đã chấp nhận lộ trình học. Lịch học đã được lưu vào lịch của bạn.',
        [
          {
            text: 'Xem lịch học',
            onPress: () => {
              router.push('/(main)/(tabs)/bookings');
            }
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chấp nhận lộ trình. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectRoute = async () => {
    Alert.alert(
      'Từ chối lộ trình',
      'Bạn có chắc chắn muốn từ chối lộ trình này? Giáo viên sẽ cần tạo lộ trình mới.',
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
              
              setRoute(prev => ({ ...prev, status: 'rejected' }));
              
              Alert.alert(
                'Đã từ chối',
                'Bạn đã từ chối lộ trình này. Giáo viên sẽ được thông báo.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể từ chối lộ trình. Vui lòng thử lại.');
            } finally {
              setIsProcessing(false);
            }
          }
        }
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
        <Text style={styles.headerTitle}>Lộ trình học mới</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Badge */}
        <View style={styles.notificationBadge}>
          <Bell size={24} color="#3b82f6" strokeWidth={2} />
          <Text style={styles.notificationText}>Giáo viên đã gửi lộ trình học!</Text>
        </View>

        {/* Route Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Route size={24} color="#3b82f6" strokeWidth={2} />
            <Text style={styles.cardTitle}>Thông tin lộ trình</Text>
          </View>
          
          <Text style={styles.routeTitle}>{route.title}</Text>
          {route.description && (
            <Text style={styles.routeDescription}>{route.description}</Text>
          )}

          <View style={styles.routeInfoGrid}>
            <View style={styles.infoItem}>
              <User size={16} color="#6b7280" strokeWidth={2} />
              <Text style={styles.infoLabel}>Giáo viên:</Text>
              <Text style={styles.infoValue}>{route.instructorName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Calendar size={16} color="#6b7280" strokeWidth={2} />
              <Text style={styles.infoLabel}>Ngày học:</Text>
              <Text style={styles.infoValue}>{route.bookingDate}</Text>
            </View>
            <View style={styles.infoItem}>
              <Clock size={16} color="#6b7280" strokeWidth={2} />
              <Text style={styles.infoLabel}>Thời gian:</Text>
              <Text style={styles.infoValue}>{route.bookingTime}</Text>
            </View>
            <View style={styles.infoItem}>
              <Clock size={16} color="#6b7280" strokeWidth={2} />
              <Text style={styles.infoLabel}>Tổng thời gian:</Text>
              <Text style={styles.infoValue}>{route.totalDuration}</Text>
            </View>
          </View>
        </View>

        {/* Route Points */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={24} color="#10b981" strokeWidth={2} />
            <Text style={styles.cardTitle}>Chi tiết lộ trình ({route.points.length} điểm)</Text>
          </View>

          {route.points.map((point, index) => (
            <View key={point.id} style={styles.routePoint}>
              <View style={styles.pointHeader}>
                <View style={styles.pointNumber}>
                  <Text style={styles.pointNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.pointInfo}>
                  <Text style={styles.pointAddress}>{point.address}</Text>
                  <Text style={styles.pointTime}>⏱️ {point.estimatedTime}</Text>
                </View>
              </View>

              {point.description && (
                <Text style={styles.pointDescription}>{point.description}</Text>
              )}

              {point.skills.length > 0 && (
                <View style={styles.skillsContainer}>
                  <Text style={styles.skillsLabel}>Kỹ năng luyện tập:</Text>
                  <View style={styles.skillsTags}>
                    {point.skills.map((skill, skillIndex) => (
                      <View key={skillIndex} style={styles.skillTag}>
                        <Text style={styles.skillTagText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {index < route.points.length - 1 && (
                <View style={styles.routeLine} />
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Action Buttons */}
      {route.status === 'pending' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleRejectRoute}
            disabled={isProcessing}
          >
            <X size={20} color="#ffffff" strokeWidth={2} />
            <Text style={styles.rejectButtonText}>Từ chối</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAcceptRoute}
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

      {route.status === 'accepted' && (
        <View style={styles.statusContainer}>
          <View style={styles.acceptedStatus}>
            <CheckCircle size={24} color="#10b981" strokeWidth={2} />
            <Text style={styles.acceptedText}>Đã chấp nhận lộ trình</Text>
          </View>
        </View>
      )}

      {route.status === 'rejected' && (
        <View style={styles.statusContainer}>
          <View style={styles.rejectedStatus}>
            <X size={24} color="#ef4444" strokeWidth={2} />
            <Text style={styles.rejectedText}>Đã từ chối lộ trình</Text>
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
    backgroundColor: '#dbeafe',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  notificationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d4ed8',
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
  routeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  routeDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  routeInfoGrid: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    flex: 1,
  },
  routePoint: {
    marginBottom: 16,
    position: 'relative',
  },
  pointHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  pointNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  pointInfo: {
    flex: 1,
  },
  pointAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  pointTime: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  pointDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 40,
    marginBottom: 8,
    lineHeight: 18,
  },
  skillsContainer: {
    marginLeft: 40,
  },
  skillsLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  skillsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: '#fef3c7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  skillTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#d97706',
  },
  routeLine: {
    position: 'absolute',
    left: 13,
    top: 28,
    bottom: -16,
    width: 2,
    backgroundColor: '#e5e7eb',
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
