import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Modal,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline } from 'react-native-maps';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Route,
  Plus,
  Edit3,
  CheckCircle,
  AlertCircle,
  Send,
  Eye,
  Navigation,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface RoutePoint {
  id: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isStart?: boolean;
  isEnd?: boolean;
}

interface Route {
  id: string;
  bookingId: string;
  points: RoutePoint[];
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  notes?: string;
  createdAt: string;
}

interface BookingEvent {
  id: string;
  studentName: string;
  date: string;
  time: string;
  location: string;
  status: 'requested' | 'pending_confirmation' | 'rejected' | 'in_progress' | 'completed';
  packageType: 'instructor' | 'full';
  selectedRoadTypes: string[];
  selectedSkills: string[];
  hasRoute: boolean;
  route?: Route;
}

export default function InstructorScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = params.bookingId as string;

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [bookings, setBookings] = useState<BookingEvent[]>([
    {
      id: bookingId || '1',
      studentName: 'Nguyễn Văn A',
      date: '2025-01-15',
      time: 'Ca sáng (6:00 - 10:00)',
      location: 'FPT University Hồ Chí Minh',
      status: 'requested',
      packageType: 'instructor',
      selectedRoadTypes: ['urban', 'highway'],
      selectedSkills: ['basic_control', 'parking'],
      hasRoute: false,
    },
    {
      id: '2',
      studentName: 'Trần Thị B',
      date: '2025-01-16',
      time: 'Ca chiều (14:00 - 18:00)',
      location: 'FPT University Hà Nội',
      status: 'pending_confirmation',
      packageType: 'full',
      selectedRoadTypes: ['residential', 'urban'],
      selectedSkills: ['lane_change', 'overtaking'],
      hasRoute: true,
      route: {
        id: 'route_2',
        bookingId: '2',
        points: [
          {
            id: '1',
            address: '129 Thống Nhất, Thủ đức, Hồ Chí Minh',
            coordinates: { latitude: 10.8231, longitude: 106.6297 },
            isStart: true,
          },
          {
            id: '2',
            address: '30 Cống Quỳnh, Quận 1, Hồ Chí Minh',
            coordinates: { latitude: 10.7769, longitude: 106.7009 },
          },
          {
            id: '3',
            address: '11 Sư Vạn Hạnh, Quận 10, Hồ Chí Minh',
            coordinates: { latitude: 10.7720, longitude: 106.6662 },
            isEnd: true,
          },
        ],
        status: 'draft',
        notes: 'Lộ trình luyện tập kỹ năng chuyển làn và vượt xe',
        createdAt: '2025-01-12T10:00:00Z',
      },
    },
    {
      id: '3',
      studentName: 'Lê Văn C',
      date: '2025-01-17',
      time: 'Ca tối (18:00 - 22:00)',
      location: 'FPT University Đà Nẵng',
      status: 'in_progress',
      packageType: 'instructor',
      selectedRoadTypes: ['highway', 'night'],
      selectedSkills: ['night_driving', 'defensive_driving'],
      hasRoute: true,
      route: {
        id: 'route_3',
        bookingId: '3',
        points: [
          {
            id: '1',
            address: 'FPT University Đà Nẵng',
            coordinates: { latitude: 16.0544, longitude: 108.2022 },
            isStart: true,
          },
          {
            id: '2',
            address: 'Cầu Rồng, Đà Nẵng',
            coordinates: { latitude: 16.0619, longitude: 108.2278 },
          },
          {
            id: '3',
            address: 'Bãi biển Mỹ Khê, Đà Nẵng',
            coordinates: { latitude: 16.0583, longitude: 108.2431 },
            isEnd: true,
          },
        ],
        status: 'accepted',
        notes: 'Luyện tập lái xe ban đêm và kỹ năng phòng thủ',
        createdAt: '2025-01-10T14:30:00Z',
      },
    },
  ]);

  const getMarkedDates = () => {
    const marked: any = {};
    bookings.forEach(booking => {
      let dotColor = '#f59e0b'; // Default: pending

      if (booking.status === 'completed') {
        dotColor = '#10b981'; // Green: completed
      } else if (booking.status === 'in_progress') {
        dotColor = '#3b82f6'; // Blue: in progress
      } else if (booking.status === 'rejected') {
        dotColor = '#ef4444'; // Red: rejected
      } else if (booking.hasRoute) {
        dotColor = '#8b5cf6'; // Purple: has route
      }

      marked[booking.date] = {
        marked: true,
        dotColor,
        selectedColor: booking.date === selectedDate ? '#3b82f6' : undefined,
        selected: booking.date === selectedDate,
      };
    });
    return marked;
  };

  const getBookingsForDate = (date: string) => {
    return bookings.filter(booking => booking.date === date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return '#f59e0b';
      case 'pending_confirmation': return '#3b82f6';
      case 'rejected': return '#ef4444';
      case 'in_progress': return '#8b5cf6';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'requested': return 'Yêu cầu';
      case 'pending_confirmation': return 'Đợi xác nhận';
      case 'rejected': return 'Từ chối';
      case 'in_progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      default: return 'Không xác định';
    }
  };

  const handleCreateRoute = (bookingId: string) => {
    router.push({
      pathname: '/(main)/(no-tabs)/create-route',
      params: { bookingId }
    });
  };

  const handleEditRoute = (routeId: string) => {
    router.push({
      pathname: '/(main)/(no-tabs)/create-route',
      params: { routeId }
    });
  };

  const handleViewRoute = (route: Route) => {
    setSelectedRoute(route);
    setShowRouteModal(true);
  };

  const handleSendRoute = (bookingId: string) => {
    Alert.alert(
      'Xác nhận gửi lộ trình',
      'Bạn có chắc chắn muốn gửi lộ trình này cho học viên?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi',
          onPress: () => {
            // Update booking status to pending_confirmation
            setBookings(prev => prev.map(booking =>
              booking.id === bookingId
                ? { ...booking, status: 'pending_confirmation' as const }
                : booking
            ));
            Alert.alert('Thành công', 'Lộ trình đã được gửi cho học viên');
          }
        }
      ]
    );
  };

  const selectedBookings = getBookingsForDate(selectedDate);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch dạy của tôi</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View style={styles.calendarCard}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={getMarkedDates()}
            theme={{
              todayTextColor: '#3b82f6',
              selectedDayBackgroundColor: '#3b82f6',
              selectedDayTextColor: '#ffffff',
              arrowColor: '#3b82f6',
              monthTextColor: '#1e293b',
              textDayFontWeight: '500',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600',
            }}
          />

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>Chưa có lộ trình</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Đã có lộ trình</Text>
            </View>
          </View>
        </View>

        {/* Selected Date Bookings */}
        <View style={styles.bookingsSection}>
          <Text style={styles.sectionTitle}>
            Lịch học ngày {selectedDate}
          </Text>

          {selectedBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <CalendarIcon size={48} color="#9ca3af" strokeWidth={1} />
              <Text style={styles.emptyText}>Không có lịch học nào</Text>
            </View>
          ) : (
            selectedBookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <View style={styles.studentInfo}>
                    <User size={20} color="#3b82f6" strokeWidth={2} />
                    <Text style={styles.studentName}>{booking.studentName}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(booking.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(booking.status) }
                    ]}>
                      {getStatusText(booking.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <Clock size={16} color="#6b7280" strokeWidth={2} />
                    <Text style={styles.detailText}>{booking.time}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin size={16} color="#6b7280" strokeWidth={2} />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {booking.location}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Route size={16} color="#6b7280" strokeWidth={2} />
                    <Text style={styles.detailText}>
                      {booking.packageType === 'instructor' ? 'Thuê người hướng dẫn' : 'Thuê trọn gói'}
                    </Text>
                  </View>
                </View>

                {booking.hasRoute && booking.route && (
                  <View style={styles.routeSection}>
                    <View style={styles.routeHeader}>
                      <Text style={styles.routeTitle}>Lộ trình đã tạo</Text>
                      <TouchableOpacity
                        style={styles.viewRouteButton}
                        onPress={() => handleViewRoute(booking.route!)}
                      >
                        <Eye size={16} color="#3b82f6" strokeWidth={2} />
                        <Text style={styles.viewRouteText}>Xem chi tiết</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.routePoints}>
                      {booking.route.points.map((point, index) => (
                        <View key={point.id} style={styles.routePoint}>
                          <View style={[
                            styles.pointIndicator,
                            point.isStart && styles.startPoint,
                            point.isEnd && styles.endPoint
                          ]}>
                            {point.isStart && <Text style={styles.pointText}>Bắt đầu</Text>}
                            {point.isEnd && <Text style={styles.pointText}>Kết thúc</Text>}
                            {!point.isStart && !point.isEnd && <Text style={styles.pointText}>{index}</Text>}
                          </View>
                          <Text style={styles.pointAddress} numberOfLines={2}>
                            {point.address}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  {booking.hasRoute ? (
                    <View style={styles.routeActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditRoute(booking.route!.id)}
                      >
                        <Edit3 size={16} color="#3b82f6" strokeWidth={2} />
                        <Text style={styles.editButtonText}>Chỉnh sửa</Text>
                      </TouchableOpacity>

                      {booking.route?.status === 'draft' && (
                        <TouchableOpacity
                          style={styles.sendButton}
                          onPress={() => handleSendRoute(booking.id)}
                        >
                          <LinearGradient
                            colors={['#3b82f6', '#2563eb']}
                            style={styles.sendButtonGradient}
                          >
                            <Send size={16} color="#ffffff" strokeWidth={2} />
                            <Text style={styles.sendButtonText}>Gửi lộ trình</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.createButton}
                      onPress={() => handleCreateRoute(booking.id)}
                    >
                      <LinearGradient
                        colors={['#10b981', '#059669']}
                        style={styles.createButtonGradient}
                      >
                        <Plus size={16} color="#ffffff" strokeWidth={2} />
                        <Text style={styles.createButtonText}>Tạo lộ trình</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Route Modal with Google Maps */}
      <Modal
        visible={showRouteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRouteModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowRouteModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Chi tiết lộ trình</Text>
            <View style={styles.modalRight} />
          </View>

          {selectedRoute && (
            <ScrollView style={styles.modalContent}>
              {/* Route Info */}
              <View style={styles.routeInfoCard}>
                <Text style={styles.routeInfoTitle}>Thông tin lộ trình</Text>
                <View style={styles.routeInfoRow}>
                  <Text style={styles.routeInfoLabel}>Trạng thái:</Text>
                  <Text style={[
                    styles.routeInfoValue,
                    { color: getStatusColor(selectedRoute.status) }
                  ]}>
                    {getStatusText(selectedRoute.status)}
                  </Text>
                </View>
                {selectedRoute.notes && (
                  <View style={styles.routeInfoRow}>
                    <Text style={styles.routeInfoLabel}>Ghi chú:</Text>
                    <Text style={styles.routeInfoValue}>{selectedRoute.notes}</Text>
                  </View>
                )}
              </View>

              {/* Route Points */}
              <View style={styles.routePointsCard}>
                <Text style={styles.routePointsTitle}>Các điểm dừng</Text>
                {selectedRoute.points.map((point, index) => (
                  <View key={point.id} style={styles.routePointItem}>
                    <View style={styles.routePointNumber}>
                      {point.isStart ? (
                        <Text style={styles.routePointStartText}>Bắt đầu</Text>
                      ) : point.isEnd ? (
                        <Text style={styles.routePointEndText}>Kết thúc</Text>
                      ) : (
                        <Text style={styles.routePointNumberText}>{index}</Text>
                      )}
                    </View>
                    <Text style={styles.routePointAddress}>{point.address}</Text>
                  </View>
                ))}
              </View>

              {/* Google Maps */}
              <View style={styles.mapContainer}>
                <Text style={styles.mapTitle}>Bản đồ lộ trình</Text>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: selectedRoute.points[0].coordinates.latitude,
                    longitude: selectedRoute.points[0].coordinates.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                >
                  {selectedRoute.points.map((point, index) => (
                    <Marker
                      key={point.id}
                      coordinate={point.coordinates}
                      title={point.isStart ? 'Bắt đầu' : point.isEnd ? 'Kết thúc' : `Điểm ${index}`}
                      description={point.address}
                    >
                      <View style={[
                        styles.markerContainer,
                        point.isStart && styles.startMarker,
                        point.isEnd && styles.endMarker,
                        !point.isStart && !point.isEnd && styles.waypointMarker
                      ]}>
                        <Text style={styles.markerText}>
                          {point.isStart ? 'B' : point.isEnd ? 'K' : index}
                        </Text>
                      </View>
                    </Marker>
                  ))}

                  {/* Route Line */}
                  <Polyline
                    coordinates={selectedRoute.points.map(point => point.coordinates)}
                    strokeColor="#3b82f6"
                    strokeWidth={3}
                    lineDashPattern={[5, 5]}
                  />
                </MapView>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalEditButton}
                  onPress={() => {
                    setShowRouteModal(false);
                    handleEditRoute(selectedRoute.id);
                  }}
                >
                  <Edit3 size={20} color="#3b82f6" strokeWidth={2} />
                  <Text style={styles.modalEditText}>Chỉnh sửa lộ trình</Text>
                </TouchableOpacity>

                {selectedRoute.status === 'draft' && (
                  <TouchableOpacity
                    style={styles.modalSendButton}
                    onPress={() => {
                      setShowRouteModal(false);
                      handleSendRoute(selectedRoute.bookingId);
                    }}
                  >
                    <LinearGradient
                      colors={['#3b82f6', '#2563eb']}
                      style={styles.modalSendGradient}
                    >
                      <Send size={20} color="#ffffff" strokeWidth={2} />
                      <Text style={styles.modalSendText}>Gửi lộ trình</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
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
  calendarCard: {
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  bookingsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  statusComplete: {
    backgroundColor: '#dcfce7',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusCompleteText: {
    color: '#16a34a',
  },
  statusPendingText: {
    color: '#d97706',
  },
  bookingDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  createButton: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 8,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  // Route Section Styles
  routeSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  viewRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    gap: 4,
  },
  viewRouteText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  routePoints: {
    gap: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startPoint: {
    backgroundColor: '#10b981',
  },
  endPoint: {
    backgroundColor: '#ef4444',
  },
  pointText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  pointAddress: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  // Route Actions
  routeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  sendButton: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 8,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalRight: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Route Info Card
  routeInfoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  routeInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  routeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  routeInfoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  // Route Points Card
  routePointsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  routePointsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  routePointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  routePointNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routePointStartText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10b981',
  },
  routePointEndText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ef4444',
  },
  routePointNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  routePointAddress: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  // Map Container
  mapContainer: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  map: {
    height: 300,
    width: '100%',
  },
  // Markers
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  startMarker: {
    backgroundColor: '#10b981',
  },
  endMarker: {
    backgroundColor: '#ef4444',
  },
  waypointMarker: {
    backgroundColor: '#3b82f6',
  },
  markerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  modalEditButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    gap: 8,
  },
  modalEditText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  modalSendButton: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 8,
  },
  modalSendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  modalSendText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});
