import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
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
  List,
  PlayCircle,
  RefreshCw,
} from "lucide-react-native";
import { IBookingSessionAPI, SessionStatus } from "@/models/booking/booking";
import { AppColors } from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { getAllSessions } from "@/features/booking/bookingThunk";

const { width } = Dimensions.get("window");

export default function RentalScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [selectedTab, setSelectedTab] = useState<
    | "all"
    | "planing"
    | "pending_confirmation"
    | "up_coming"
    | "in_progress"
    | "completed"
    | "reschedule"
    | "cancelled"
  >("all");
  
  const [sessions, setSessions] = useState<IBookingSessionAPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sessions from API
  const fetchSessions = async (status?: SessionStatus) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await dispatch(getAllSessions(status ? { status } : undefined)).unwrap();
      
      // Extract data from GenericResponse
      const sessionsData = (result as any).value || result;
      setSessions(sessionsData);
    } catch (err: any) {
      console.error('Failed to fetch sessions:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh sessions
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSessions();
    setIsRefreshing(false);
  };

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Map SessionStatus enum to display status string
  const mapStatusToDisplayString = (status: SessionStatus): string => {
    switch (status) {
      case SessionStatus.Pending:
        return "planing";
      case SessionStatus.Confirmed:
        return "up_coming";
      case SessionStatus.Completed:
        return "completed";
      case SessionStatus.Cancelled:
        return "cancelled";
      case SessionStatus.Rescheduled:
        return "reschedule";
      default:
        return "planing";
    }
  };

  // Removed mock data - now using API data from sessions state

  const getFilteredSessions = () => {
    if (selectedTab === "all") {
      return sessions;
    }
    return sessions.filter((session) => {
      const displayStatus = mapStatusToDisplayString(session.status);
      return displayStatus === selectedTab;
    });
  };

  const getStatusColor = (status: SessionStatus | string) => {
    const displayStatus = typeof status === 'number' ? mapStatusToDisplayString(status) : status;
    switch (displayStatus) {
      case "planing":
        return "#3b82f6";
      case "pending_confirmation":
        return "#f59e0b";
      case "up_coming":
        return "#10b981";
      case "in_progress":
        return "#10b981";
      case "completed":
        return "#6b7280";
      case "reschedule":
        return "#f59e0b";
      case "cancelled":
        return "#9ca3af";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: SessionStatus | string) => {
    const displayStatus = typeof status === 'number' ? mapStatusToDisplayString(status) : status;
    switch (displayStatus) {
      case "planing":
        return "Lên lộ trình";
      case "pending_confirmation":
        return "Đợi xác nhận";
      case "up_coming":
        return "Sắp diễn ra";
      case "in_progress":
        return "Đang diễn ra";
      case "completed":
        return "Hoàn thành";
      case "reschedule":
        return "Đổi lịch";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const getStatusIcon = (status: SessionStatus | string) => {
    const displayStatus = typeof status === 'number' ? mapStatusToDisplayString(status) : status;
    switch (displayStatus) {
      case "all":
        return List;
      case "planing":
        return Navigation;
      case "pending_confirmation":
        return AlertCircle;
      case "up_coming":
        return Calendar;
      case "in_progress":
        return PlayCircle;
      case "completed":
        return CheckCircle;
      case "reschedule":
        return RefreshCw;
      case "cancelled":
        return X;
      default:
        return Clock;
    }
  };

  // Parse location string "lat,lng" to readable address (placeholder)
  const parseLocation = (location: string): string => {
    // In production, you would use reverse geocoding API
    // For now, just return coordinates
    return location || "Chưa có địa điểm";
  };

  const handlePlanRoute = (session: IBookingSessionAPI) => {
    router.push({
      pathname: "/(main)/(no-tabs)/route-planning" as any,
      params: {
        sessionId: session.id,
        pickupLocation: session.location || "Điểm đón",
        startingLatitude: session.startingLatitude?.toString() || "10.8231",
        startingLongtitude: session.startingLongtitude?.toString() || "106.6297",
      },
    });
  };

  const handleViewRoute = (sessionId: string) => {
    router.push({
      pathname: "/(main)/(no-tabs)/route-notification",
      params: { routeId: sessionId },
    });
  };

  const formatDate = (dateString: string) => {
    // Convert from yyyy-mm-dd to dd/mm/yyyy
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const filteredSessions = getFilteredSessions();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={[
          AppColors.primary,
          AppColors.gradientStart,
          AppColors.gradientEnd,
        ]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Buổi huấn luyện của tôi</Text>
            <Text style={styles.headerSubtitle}>
              Quản lý các buổi huấn luyện đang diễn ra
            </Text>
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          <TouchableOpacity
            style={[styles.tab, selectedTab === "all" && styles.activeTab]}
            onPress={() => setSelectedTab("all")}
          >
            <View style={styles.tabContent}>
              <List
                size={16}
                color={selectedTab === "all" ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "all" && styles.activeTabText,
                ]}
              >
                Tất cả
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "planing" && styles.activeTab]}
            onPress={() => setSelectedTab("planing")}
          >
            <View style={styles.tabContent}>
              <Navigation
                size={16}
                color={selectedTab === "planing" ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "planing" && styles.activeTabText,
                ]}
              >
                Lên lộ trình
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "pending_confirmation" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("pending_confirmation")}
          >
            <View style={styles.tabContent}>
              <AlertCircle
                size={16}
                color={
                  selectedTab === "pending_confirmation" ? "#ffffff" : "#6b7280"
                }
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "pending_confirmation" &&
                    styles.activeTabText,
                ]}
              >
                Đợi xác nhận
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "up_coming" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("up_coming")}
          >
            <View style={styles.tabContent}>
              <Calendar
                size={16}
                color={selectedTab === "up_coming" ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "up_coming" && styles.activeTabText,
                ]}
              >
                Sắp diễn ra
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "in_progress" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("in_progress")}
          >
            <View style={styles.tabContent}>
              <PlayCircle
                size={16}
                color={selectedTab === "in_progress" ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "in_progress" && styles.activeTabText,
                ]}
              >
                Đang diễn ra
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "completed" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("completed")}
          >
            <View style={styles.tabContent}>
              <CheckCircle
                size={16}
                color={selectedTab === "completed" ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "completed" && styles.activeTabText,
                ]}
              >
                Hoàn thành
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "reschedule" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("reschedule")}
          >
            <View style={styles.tabContent}>
              <RefreshCw
                size={16}
                color={selectedTab === "reschedule" ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "reschedule" && styles.activeTabText,
                ]}
              >
                Đổi lịch
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "cancelled" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("cancelled")}
          >
            <View style={styles.tabContent}>
              <X
                size={16}
                color={selectedTab === "cancelled" ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "cancelled" && styles.activeTabText,
                ]}
              >
                Đã hủy
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[AppColors.primary]}
            tintColor={AppColors.primary}
          />
        }
      >
        {isLoading && sessions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : filteredSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Calendar size={48} color={AppColors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>
              {selectedTab === "all"
                ? "Chưa có buổi huấn luyện nào"
                : selectedTab === "planing"
                ? "Chưa có buổi huấn luyện cần lên lộ trình"
                : selectedTab === "pending_confirmation"
                ? "Chưa có buổi huấn luyện chờ xác nhận"
                : selectedTab === "up_coming"
                ? "Chưa có buổi huấn luyện sắp diễn ra"
                : selectedTab === "in_progress"
                ? "Chưa có buổi huấn luyện đang diễn ra"
                : selectedTab === "completed"
                ? "Chưa có buổi huấn luyện hoàn thành"
                : selectedTab === "reschedule"
                ? "Chưa có buổi huấn luyện cần đổi lịch"
                : "Chưa có buổi huấn luyện đã hủy"}
            </Text>
          </View>
        ) : (
          filteredSessions.map((session) => {
            const StatusIcon = getStatusIcon(session.status);
            return (
              <View key={session.id} style={styles.bookingCard}>
                <LinearGradient
                  colors={["#ffffff", "#f8fafc"]}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.bookingHeader}>
                    <View style={styles.instructorInfo}>
                      <Image
                        source={{
                          uri: session.noviceAvatar || "https://i.pravatar.cc/150?img=1",
                        }}
                        style={styles.instructorAvatarImage}
                      />
                      <View style={styles.instructorDetails}>
                        <Text style={styles.instructorName}>
                          {session.noviceDriverName}
                        </Text>
                        {session.packageName && (
                          <Text
                            style={styles.packageNameText}
                            numberOfLines={1}
                          >
                            {session.packageName}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusColor(session.status) + "15",
                        },
                      ]}
                    >
                      <StatusIcon
                        size={16}
                        color={getStatusColor(session.status)}
                        strokeWidth={2}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(session.status) },
                        ]}
                      >
                        {getStatusText(session.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                      <Calendar size={16} color="#6b7280" strokeWidth={2} />
                      <Text style={styles.detailText}>
                        {formatDate(session.date)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Clock size={16} color="#6b7280" strokeWidth={2} />
                      <Text style={styles.detailText}>
                        {session.startTime} - {session.endTime} (
                        {session.duration} giờ)
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MapPin size={16} color="#6b7280" strokeWidth={2} />
                      <Text style={styles.detailText} numberOfLines={2}>
                        {parseLocation(session.location)}
                      </Text>
                    </View>
                    {session.vehicleName && (
                      <View style={styles.detailRow}>
                        <FileText size={16} color="#6b7280" strokeWidth={2} />
                        <Text style={styles.detailText}>
                          Xe: {session.vehicleName}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.routeButton]}
                      onPress={() => handlePlanRoute(session)}
                    >
                      <Eye size={16} color="#ffffff" strokeWidth={2} />
                      <Text style={styles.routeButtonText}>Xem chi tiết</Text>
                    </TouchableOpacity>
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
    backgroundColor: "#f1f5f9",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: "relative",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
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
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  headerStats: {
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  headerCurve: {
    position: "absolute",
    bottom: -25,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "#f1f5f9",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  tabsContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: -25,
    borderRadius: 24,
    shadowColor: "#000",
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
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#f1f5f9",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  bookingCard: {
    borderRadius: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  cardGradient: {
    padding: 20,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  instructorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  instructorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: AppColors.primary,
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
    borderColor: "#e2e8f0",
  },
  packageNameText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    marginTop: 2,
  },
  routeButton: {
    backgroundColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  routeButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  instructorDetails: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fbbf24",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  bookingDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
  },
  routeSection: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  routeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  routeText: {
    fontSize: 13,
    color: "#15803d",
    lineHeight: 18,
    marginBottom: 8,
  },
  notesSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  notesText: {
    fontSize: 12,
    color: "#6b7280",
    flex: 1,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButton: {
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  rejectButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  viewButton: {
    backgroundColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  viewButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
