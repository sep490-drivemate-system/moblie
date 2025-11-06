import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  Check,
  FileText,
  Navigation,
} from 'lucide-react-native';
import { IDrivingSession } from '@/models/package/user-package';
import { instructorsData } from '@/data/instructors_data';

const { width } = Dimensions.get('window');

// Extended driving session with route planning status
interface IDrivingSessionExtended {
  id: string;
  packageId: string;
  instructorId: string;
  instructorName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  location: string;
  vehicleId?: string;
  vehicleName?: string;
  status: "requested" | "pending_confirmation" | "scheduled" | "completed" | "cancelled";
  createdAt: string;
  packageName?: string;
  instructorAvatar?: string;
  hasRoute?: boolean;
}

export default function RentalScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'all' | 'requested' | 'pending' | 'in_progress' | 'completed'>('all');

  // Mock driving sessions data
  const drivingSessions: IDrivingSessionExtended[] = [
    {
      id: 'session-1',
      packageId: 'user-pkg-1',
      instructorId: '1',
      instructorName: 'Nguyễn Văn An',
      date: '2025-11-15',
      startTime: '08:00',
      endTime: '11:00',
      duration: 3,
      location: '123 Nguyễn Huệ, Q1, TP.HCM',
      status: 'requested',
      createdAt: '2025-11-10T10:00:00Z',
      packageName: 'Gói Thành Phố Cơ Bản',
      instructorAvatar: 'https://i.pravatar.cc/150?img=1',
      hasRoute: false,
    },
    {
      id: 'session-2',
      packageId: 'user-pkg-1',
      instructorId: '1',
      instructorName: 'Nguyễn Văn An',
      date: '2025-11-18',
      startTime: '14:00',
      endTime: '16:00',
      duration: 2,
      location: '456 Lê Lợi, Q1, TP.HCM',
      status: 'pending_confirmation',
      createdAt: '2025-11-12T14:30:00Z',
      packageName: 'Gói Thành Phố Cơ Bản',
      instructorAvatar: 'https://i.pravatar.cc/150?img=1',
      hasRoute: false,
    },
    {
      id: 'session-3',
      packageId: 'user-pkg-2',
      instructorId: '2',
      instructorName: 'Trần Thị Bình',
      date: '2025-11-12',
      startTime: '09:00',
      endTime: '12:00',
      duration: 3,
      location: '789 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',
      status: 'scheduled',
      createdAt: '2025-11-08T09:15:00Z',
      packageName: 'Gói Cao Tốc + Xe',
      instructorAvatar: 'https://i.pravatar.cc/150?img=2',
      vehicleId: 'vehicle-1',
      vehicleName: 'Toyota Vios 2023',
      hasRoute: true,
    },
    {
      id: 'session-4',
      packageId: 'user-pkg-1',
      instructorId: '1',
      instructorName: 'Nguyễn Văn An',
      date: '2025-11-05',
      startTime: '08:00',
      endTime: '11:00',
      duration: 3,
      location: '123 Nguyễn Huệ, Q1, TP.HCM',
      status: 'completed',
      createdAt: '2025-10-25T10:00:00Z',
      packageName: 'Gói Thành Phố Cơ Bản',
      instructorAvatar: 'https://i.pravatar.cc/150?img=1',
      vehicleId: 'vehicle-1',
      vehicleName: 'Toyota Vios 2023',
      hasRoute: true,
    },
    {
      id: 'session-5',
      packageId: 'user-pkg-2',
      instructorId: '2',
      instructorName: 'Trần Thị Bình',
      date: '2025-11-20',
      startTime: '15:00',
      endTime: '17:00',
      duration: 2,
      location: '321 Võ Văn Tần, Q3, TP.HCM',
      status: 'requested',
      createdAt: '2025-11-15T11:20:00Z',
      packageName: 'Gói Cao Tốc + Xe',
      instructorAvatar: 'https://i.pravatar.cc/150?img=2',
      hasRoute: false,
    },
  ];

  const getFilteredSessions = () => {
    if (selectedTab === 'all') {
      return drivingSessions;
    }
    return drivingSessions.filter(session => {
      switch (selectedTab) {
        case 'requested':
          return session.status === 'requested';
        case 'pending':
          return session.status === 'pending_confirmation';
        case 'in_progress':
          return session.status === 'scheduled';
        case 'completed':
          return session.status === 'completed';
        default:
          return true;
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return '#3b82f6';
      case 'pending_confirmation': return '#f59e0b';
      case 'scheduled': return '#10b981';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#9ca3af';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'requested': return 'Đợi yêu cầu';
      case 'pending_confirmation': return 'Đợi xác nhận';
      case 'scheduled': return 'Đã lên lịch';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested': return Clock;
      case 'pending_confirmation': return AlertCircle;
      case 'scheduled': return CheckCircle;
      case 'completed': return Check;
      case 'cancelled': return X;
      default: return Clock;
    }
  };

  const handlePlanRoute = (sessionId: string, location: string) => {
    router.push({
      pathname: '/(main)/(no-tabs)/route-planning' as any,
      params: {
        sessionId,
        pickupLocation: location,
      }
    });
  };

  const handleViewRoute = (sessionId: string) => {
    router.push({
      pathname: '/(main)/(no-tabs)/route-notification',
      params: { routeId: sessionId }
    });
  };

  const getInstructorAvatar = (instructorId: string) => {
    const instructor = instructorsData.find(i => i.id === instructorId);
    return instructor?.avatar || 'https://i.pravatar.cc/150?img=1';
  };

  const filteredSessions = getFilteredSessions();

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
            <Text style={styles.headerTitle}>Buổi học của tôi</Text>
            <Text style={styles.headerSubtitle}>Quản lý các buổi học đang diễn ra</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{filteredSessions.length}</Text>
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
            style={[styles.tab, selectedTab === 'in_progress' && styles.activeTab]}
            onPress={() => setSelectedTab('in_progress')}
          >
            <View style={styles.tabContent}>
              <CheckCircle size={16} color={selectedTab === 'in_progress' ? '#ffffff' : '#6b7280'} strokeWidth={2} />
              <Text style={[styles.tabText, selectedTab === 'in_progress' && styles.activeTabText]}>
                Đã lên lịch
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
            onPress={() => setSelectedTab('completed')}
          >
            <View style={styles.tabContent}>
              <Check size={16} color={selectedTab === 'completed' ? '#ffffff' : '#6b7280'} strokeWidth={2} />
              <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
                Hoàn thành
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Calendar size={48} color="#667eea" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>
              {selectedTab === 'all' ? 'Chưa có buổi học nào' :
                selectedTab === 'requested' ? 'Chưa có buổi học đợi yêu cầu' :
                  selectedTab === 'pending' ? 'Chưa có buổi học chờ xác nhận' :
                    selectedTab === 'in_progress' ? 'Chưa có buổi học đã lên lịch' :
                      'Chưa có buổi học hoàn thành'}
            </Text>
            <Text style={styles.emptySubtitle}>
              Hãy đặt lịch với instructor để bắt đầu học lái xe
            </Text>
          </View>
        ) : (
          filteredSessions.map((session) => {
            const StatusIcon = getStatusIcon(session.status);
            return (
              <View key={session.id} style={styles.bookingCard}>
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.bookingHeader}>
                    <View style={styles.instructorInfo}>
                      <Image
                        source={{ uri: session.instructorAvatar || getInstructorAvatar(session.instructorId) }}
                        style={styles.instructorAvatarImage}
                      />
                      <View style={styles.instructorDetails}>
                        <Text style={styles.instructorName}>{session.instructorName}</Text>
                        {session.packageName && (
                          <Text style={styles.packageNameText} numberOfLines={1}>
                            {session.packageName}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(session.status) + '15' }
                    ]}>
                      <StatusIcon size={16} color={getStatusColor(session.status)} strokeWidth={2} />
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(session.status) }
                      ]}>
                        {getStatusText(session.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                      <Calendar size={16} color="#6b7280" strokeWidth={2} />
                      <Text style={styles.detailText}>{session.date}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Clock size={16} color="#6b7280" strokeWidth={2} />
                      <Text style={styles.detailText}>
                        {session.startTime} - {session.endTime} ({session.duration} giờ)
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MapPin size={16} color="#6b7280" strokeWidth={2} />
                      <Text style={styles.detailText} numberOfLines={2}>
                        {session.location}
                      </Text>
                    </View>
                    {session.vehicleName && (
                      <View style={styles.detailRow}>
                        <FileText size={16} color="#6b7280" strokeWidth={2} />
                        <Text style={styles.detailText}>Xe: {session.vehicleName}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.actionButtons}>                  
                    {(session.status === 'requested' || session.status === 'pending_confirmation') && !session.hasRoute && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.routeButton]}
                        onPress={() => handlePlanRoute(session.id, session.location)}
                      >
                        <Navigation size={16} color="#ffffff" strokeWidth={2} />
                        <Text style={styles.routeButtonText}>Xét lộ trình</Text>
                      </TouchableOpacity>
                    )}

                    {/* View Route button - Show for sessions with route */}
                    {session.hasRoute && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.viewButton]}
                        onPress={() => handleViewRoute(session.id)}
                      >
                        <Eye size={16} color="#ffffff" strokeWidth={2} />
                        <Text style={styles.viewButtonText}>Xem lộ trình</Text>
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
  instructorAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  packageNameText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  routeButton: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  routeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
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
