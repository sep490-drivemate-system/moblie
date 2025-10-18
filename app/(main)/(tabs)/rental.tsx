import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  Route,
  Eye,
  X,
  Check,
  FileText,
  MessageCircle,
  Star,
  XCircle,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

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

export default function RentalScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'all' | 'requested' | 'pending' | 'rejected' | 'in_progress'>('all');

  const bookings: BookingItem[] = [
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
    {
      id: '4',
      instructorName: 'Thầy Phạm Văn E',
      date: '2025-01-05',
      time: 'Ca tối (18:00 - 22:00)',
      location: 'FPT University Cần Thơ',
      status: 'completed',
      packageType: 'full',
      selectedRoadTypes: ['urban', 'night'],
      selectedSkills: ['night_driving', 'parking'],
      instructorRoute: 'Lộ trình đô thị ban đêm',
      instructorNotes: 'Hoàn thành tốt, cần cải thiện kỹ năng đỗ xe',
      studentResponse: 'accepted',
      createdAt: '2025-01-01T16:45:00Z',
      price: 350000,
      coins: 350,
    },
    {
      id: '5',
      instructorName: 'Thầy Hoàng Văn F',
      date: '2025-01-20',
      time: 'Ca sáng (6:00 - 10:00)',
      location: 'FPT University Quy Nhơn',
      status: 'rejected',
      packageType: 'instructor',
      selectedRoadTypes: ['construction', 'slippery'],
      selectedSkills: ['rain_driving', 'defensive_driving'],
      instructorNotes: 'Không thể thực hiện do thời tiết xấu và đường đang thi công',
      createdAt: '2025-01-15T11:20:00Z',
      price: 180000,
      coins: 180,
    },
  ];

  const getFilteredBookings = () => {
    if (selectedTab === 'all') {
      return bookings;
    }
    return bookings.filter(booking => {
      switch (selectedTab) {
        case 'requested':
          return booking.status === 'requested';
        case 'pending':
          return booking.status === 'pending_confirmation';
        case 'rejected':
          return booking.status === 'rejected';
        case 'in_progress':
          return booking.status === 'in_progress';
        default:
          return true;
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return '#3b82f6';
      case 'pending_confirmation': return '#f59e0b';
      case 'rejected': return '#ef4444';
      case 'in_progress': return '#10b981';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#9ca3af';
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
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested': return Clock;
      case 'pending_confirmation': return AlertCircle;
      case 'rejected': return X;
      case 'in_progress': return CheckCircle;
      case 'completed': return Check;
      case 'cancelled': return X;
      default: return Clock;
    }
  };

  const handleViewRoute = (bookingId: string) => {
    router.push({
      pathname: '/(main)/(no-tabs)/route-notification',
      params: { routeId: bookingId }
    });
  };

  const handleRespondToRoute = (bookingId: string, response: 'accepted' | 'rejected') => {
    // Handle student response to instructor route
    console.log(`Student ${response} route for booking ${bookingId}`);
    alert(`Đã ${response === 'accepted' ? 'chấp nhận' : 'từ chối'} lộ trình!`);
  };


  const handleCancelBooking = (booking: BookingItem) => {
    router.push({
      pathname: '/(main)/(no-tabs)/cancel-booking',
      params: { bookingId: booking.id }
    });
  };

  const filteredBookings = getFilteredBookings();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#8b5fbf']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Lịch sử đặt lịch</Text>

          </View>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{filteredBookings.length}</Text>
              <Text style={styles.statLabel}>Tổng</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerCurve} />
      </LinearGradient>

      {/* Modern Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
            onPress={() => setSelectedTab('all')}
          >
            <View style={styles.tabContent}>
              <Calendar size={16} color={selectedTab === 'all' ? '#ffffff' : '#6b7280'} strokeWidth={2} />
              <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
                Tất cả
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'requested' && styles.activeTab]}
            onPress={() => setSelectedTab('requested')}
          >
            <View style={styles.tabContent}>
              <Clock size={16} color={selectedTab === 'requested' ? '#ffffff' : '#6b7280'} strokeWidth={2} />
              <Text style={[styles.tabText, selectedTab === 'requested' && styles.activeTabText]}>
                Yêu cầu
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'pending' && styles.activeTab]}
            onPress={() => setSelectedTab('pending')}
          >
            <View style={styles.tabContent}>
              <AlertCircle size={16} color={selectedTab === 'pending' ? '#ffffff' : '#6b7280'} strokeWidth={2} />
              <Text style={[styles.tabText, selectedTab === 'pending' && styles.activeTabText]}>
                Đợi xác nhận
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'rejected' && styles.activeTab]}
            onPress={() => setSelectedTab('rejected')}
          >
            <View style={styles.tabContent}>
              <X size={16} color={selectedTab === 'rejected' ? '#ffffff' : '#6b7280'} strokeWidth={2} />
              <Text style={[styles.tabText, selectedTab === 'rejected' && styles.activeTabText]}>
                Từ chối
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'in_progress' && styles.activeTab]}
            onPress={() => setSelectedTab('in_progress')}
          >
            <View style={styles.tabContent}>
              <CheckCircle size={16} color={selectedTab === 'in_progress' ? '#ffffff' : '#6b7280'} strokeWidth={2} />
              <Text style={[styles.tabText, selectedTab === 'in_progress' && styles.activeTabText]}>
                Đang thực hiện
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Calendar size={48} color="#667eea" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>
              {selectedTab === 'all' ? 'Chưa có lịch đặt nào' :
                selectedTab === 'requested' ? 'Chưa có yêu cầu nào' :
                  selectedTab === 'pending' ? 'Chưa có yêu cầu chờ xác nhận' :
                    selectedTab === 'rejected' ? 'Chưa có yêu cầu bị từ chối' :
                      'Chưa có lịch đang thực hiện'}
            </Text>
            <Text style={styles.emptySubtitle}>
              Hãy đặt lịch với instructor để bắt đầu học lái xe
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking) => {
            const StatusIcon = getStatusIcon(booking.status);
            return (
              <View key={booking.id} style={styles.bookingCard}>
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.bookingHeader}>
                    <View style={styles.instructorInfo}>
                      <View style={styles.instructorAvatar}>
                        <User size={18} color="#ffffff" strokeWidth={2} />
                      </View>
                      <View style={styles.instructorDetails}>
                        <Text style={styles.instructorName}>{booking.instructorName}</Text>
                        <View style={styles.ratingContainer}>
                          <Star size={12} color="#fbbf24" strokeWidth={2} fill="#fbbf24" />
                          <Text style={styles.ratingText}>4.8</Text>
                        </View>
                      </View>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(booking.status) + '15' }
                    ]}>
                      <StatusIcon size={16} color={getStatusColor(booking.status)} strokeWidth={2} />
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
                      <Calendar size={16} color="#6b7280" strokeWidth={2} />
                      <Text style={styles.detailText}>{booking.date}</Text>
                    </View>
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
                      <FileText size={16} color="#6b7280" strokeWidth={2} />
                      <Text style={styles.detailText}>
                        {booking.packageType === 'instructor' ? 'Thuê người hướng dẫn' : 'Thuê trọn gói'}
                      </Text>
                    </View>
                  </View>

                  {/* Instructor Route & Notes */}
                  {booking.instructorRoute && (
                    <View style={styles.routeSection}>
                      <View style={styles.routeHeader}>
                        <Route size={16} color="#10b981" strokeWidth={2} />
                        <Text style={styles.routeTitle}>Lộ trình từ instructor</Text>
                      </View>
                      <Text style={styles.routeText}>{booking.instructorRoute}</Text>
                      {booking.instructorNotes && (
                        <View style={styles.notesSection}>
                          <MessageCircle size={14} color="#6b7280" strokeWidth={2} />
                          <Text style={styles.notesText}>{booking.instructorNotes}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    {booking.status === 'pending_confirmation' && (
                      <>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.acceptButton]}
                          onPress={() => handleRespondToRoute(booking.id, 'accepted')}
                        >
                          <Check size={16} color="#ffffff" strokeWidth={2} />
                          <Text style={styles.acceptButtonText}>Chấp nhận</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => handleRespondToRoute(booking.id, 'rejected')}
                        >
                          <X size={16} color="#ffffff" strokeWidth={2} />
                          <Text style={styles.rejectButtonText}>Từ chối</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {booking.instructorRoute && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.viewButton]}
                        onPress={() => handleViewRoute(booking.id)}
                      >
                        <Eye size={16} color="#3b82f6" strokeWidth={2} />
                        <Text style={styles.viewButtonText}>Xem chi tiết</Text>
                      </TouchableOpacity>
                    )}

                    {/* Cancel Button - Show for cancelable bookings */}
                    {(booking.status === 'requested' || booking.status === 'pending_confirmation' || booking.status === 'in_progress') && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => handleCancelBooking(booking)}
                      >
                        <XCircle size={16} color="#ffffff" strokeWidth={2} />
                        <Text style={styles.cancelButtonText}>Hủy lịch</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </LinearGradient>
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

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
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'relative',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerStats: {
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  headerCurve: {
    position: 'absolute',
    bottom: -25,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#f1f5f9',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  tabsContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: -25,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 1,
  },
  tabsScrollContent: {
    paddingHorizontal: 4,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#f1f5f9',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  bookingCard: {
    borderRadius: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  instructorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  instructorDetails: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
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
  routeSection: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
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
  notesSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  notesText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButton: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  viewButton: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
