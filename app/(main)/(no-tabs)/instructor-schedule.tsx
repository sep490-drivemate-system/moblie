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
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
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
} from 'lucide-react-native';

interface BookingEvent {
  id: string;
  studentName: string;
  date: string;
  time: string;
  location: string;
  status: 'confirmed' | 'pending' | 'completed';
  hasRoute: boolean;
  routeId?: string;
}

export default function InstructorScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = params.bookingId as string;

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState<BookingEvent[]>([
    {
      id: bookingId || '1',
      studentName: 'Nguyễn Văn A',
      date: '2025-01-15',
      time: 'Ca sáng (6:00 - 10:00)',
      location: '123 Nguyễn Văn Linh, Quận 7',
      status: 'confirmed',
      hasRoute: false,
    },
    {
      id: '2',
      studentName: 'Trần Thị B',
      date: '2025-01-16',
      time: 'Ca chiều (14:00 - 18:00)',
      location: '456 Lê Văn Việt, Quận 9',
      status: 'confirmed',
      hasRoute: true,
      routeId: 'route_2',
    },
  ]);

  const getMarkedDates = () => {
    const marked: any = {};
    bookings.forEach(booking => {
      marked[booking.date] = {
        marked: true,
        dotColor: booking.hasRoute ? '#10b981' : '#f59e0b',
        selectedColor: booking.date === selectedDate ? '#3b82f6' : undefined,
        selected: booking.date === selectedDate,
      };
    });
    return marked;
  };

  const getBookingsForDate = (date: string) => {
    return bookings.filter(booking => booking.date === date);
  };

  const handleCreateRoute = (bookingId: string) => {
    router.push({
      pathname: '/(main)/(no-tabs)/create-route',
      params: { bookingId }
    });
  };

  const handleEditRoute = (routeId: string) => {
    router.push({
      pathname: '/(main)/(no-tabs)/edit-route',
      params: { routeId }
    });
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
                    booking.hasRoute ? styles.statusComplete : styles.statusPending
                  ]}>
                    {booking.hasRoute ? (
                      <CheckCircle size={16} color="#10b981" strokeWidth={2} />
                    ) : (
                      <AlertCircle size={16} color="#f59e0b" strokeWidth={2} />
                    )}
                    <Text style={[
                      styles.statusText,
                      booking.hasRoute ? styles.statusCompleteText : styles.statusPendingText
                    ]}>
                      {booking.hasRoute ? 'Có lộ trình' : 'Chưa có lộ trình'}
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
                </View>

                <View style={styles.actionButtons}>
                  {booking.hasRoute ? (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditRoute(booking.routeId!)}
                    >
                      <Edit3 size={16} color="#3b82f6" strokeWidth={2} />
                      <Text style={styles.editButtonText}>Chỉnh sửa lộ trình</Text>
                    </TouchableOpacity>
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
});
