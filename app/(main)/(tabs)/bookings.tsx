import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  Route,
  Eye,
} from 'lucide-react-native';
import { IBookingItem } from '@/models/booking/booking';
import { BookingStatus, RouteStatus } from '@/constants/enums';


export default function BookingsScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'completed'>('upcoming');

  const bookings: IBookingItem[] = [
    {
      id: '1',
      instructorName: 'Thầy Nguyễn Văn B',
      date: '2025-01-15',
      time: 'Ca sáng (6:00 - 10:00)',
      location: '123 Nguyễn Văn Linh, Quận 7',
      status: BookingStatus.Upcoming,
      hasRoute: true,
      routeStatus: RouteStatus.Accepted,
    },
    {
      id: '2',
      instructorName: 'Thầy Trần Văn C',
      date: '2025-01-18',
      time: 'Ca chiều (14:00 - 18:00)',
      location: '456 Lê Văn Việt, Quận 9',
      status: BookingStatus.Upcoming,
      hasRoute: true,
      routeStatus: RouteStatus.Pending,
    },
    {
      id: '3',
      instructorName: 'Thầy Lê Văn D',
      date: '2025-01-12',
      time: 'Ca sáng (6:00 - 10:00)',
      location: '789 Võ Văn Kiệt, Quận 5',
      status: BookingStatus.Completed,
      hasRoute: true,
      routeStatus: RouteStatus.Accepted,
    },
  ];

  const getFilteredBookings = () => {
    return bookings.filter(booking => {
      if (selectedTab === 'upcoming') {
        return booking.status === 'upcoming';
      } else {
        return booking.status === 'completed';
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Đã chấp nhận';
      case 'pending': return 'Chờ phản hồi';
      case 'rejected': return 'Đã từ chối';
      default: return 'Chưa có lộ trình';
    }
  };

  const handleViewRoute = (bookingId: string) => {
    router.push({
      pathname: '/(main)/(no-tabs)/route-notification',
      params: { routeId: bookingId }
    });
  };

  const filteredBookings = getFilteredBookings();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch học của tôi</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'upcoming' && styles.activeTab]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.activeTabText]}>
            Sắp tới
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
            Đã hoàn thành
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#9ca3af" strokeWidth={1} />
            <Text style={styles.emptyText}>
              {selectedTab === 'upcoming' ? 'Không có lịch học sắp tới' : 'Chưa có lịch học nào hoàn thành'}
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View style={styles.instructorInfo}>
                  <User size={20} color="#3b82f6" strokeWidth={2} />
                  <Text style={styles.instructorName}>{booking.instructorName}</Text>
                </View>
                {booking.hasRoute && (
                  <View style={[
                    styles.routeStatusBadge,
                    { backgroundColor: getStatusColor(booking.routeStatus!) + '20' }
                  ]}>
                    <View style={[
                      styles.routeStatusDot,
                      { backgroundColor: getStatusColor(booking.routeStatus!) }
                    ]} />
                    <Text style={[
                      styles.routeStatusText,
                      { color: getStatusColor(booking.routeStatus!) }
                    ]}>
                      {getStatusText(booking.routeStatus!)}
                    </Text>
                  </View>
                )}
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
              </View>

              {booking.hasRoute && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.viewRouteButton}
                    onPress={() => handleViewRoute(booking.id)}
                  >
                    <Route size={16} color="#3b82f6" strokeWidth={2} />
                    <Text style={styles.viewRouteButtonText}>Xem lộ trình</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
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
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
    textAlign: 'center',
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
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
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  routeStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  routeStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  routeStatusText: {
    fontSize: 12,
    fontWeight: '500',
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
  viewRouteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    gap: 6,
  },
  viewRouteButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
});


