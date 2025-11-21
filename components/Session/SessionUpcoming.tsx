import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { IBookingSession } from "@/models/booking/booking";
import { SessionStatus } from "@/models/session/session.enum";
import { AppColors } from "@/constants/Colors";
import { useAppDispatch } from "@/lib/redux/hooks";
import { getAllSessions } from "@/features/booking/bookingThunk";

export default function RouteUpcoming() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [sessions, setSessions] = useState<IBookingSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sessions with Upcoming status
  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await dispatch(
        getAllSessions({ status: SessionStatus.Upcoming })
      ).unwrap();

      const sessionsData = (result as any).value || result;
      const normalizedSessions = Array.isArray(sessionsData)
        ? sessionsData.map((s: any) => ({
            ...s,
            status:
              typeof s.status === "string" ? parseInt(s.status) : s.status,
          }))
        : sessionsData;
      setSessions(normalizedSessions);
    } catch (err: any) {
      console.log("Failed to fetch upcoming sessions:", err);
      setError(err.message || "Không thể tải dữ liệu");
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

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleViewRoute = (session: IBookingSession) => {
    const sessionStatus =
      typeof session.status === "string"
        ? parseInt(session.status)
        : session.status;

    router.push({
      pathname: "/(main)/(no-tabs)/routes" as any,
      params: {
        sessionId: session.id,
        pickupLocation: session.displayStartLocationName || "Điểm đón",
        startingLatitude: session.startingLatitude?.toString() || "10.8231",
        startingLongtitude:
          session.startingLongtitude?.toString() || "106.6297",
        duration: session.duration?.toString() || "2",
        status: sessionStatus.toString(),
        displayStartLocationName: session.displayStartLocationName || "",
        displayEndLocationName: session.displayEndLocationName || "",
        endingLatitude: session.endingLatitude?.toString() || "",
        endingLongtitude: session.endingLongtitude?.toString() || "",
      },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[AppColors.primary, AppColors.gradientStart, AppColors.gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Sắp diễn ra</Text>
            <Text style={styles.headerSubtitle}>
              Danh sách các buổi huấn luyện sắp diễn ra
            </Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{sessions.length}</Text>
              <Text style={styles.statLabel}>Lộ trình</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

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
        ) : sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Calendar size={48} color={AppColors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>
              Chưa có buổi huấn luyện sắp diễn ra
            </Text>
            <Text style={styles.emptySubtitle}>
              Các buổi huấn luyện có trạng thái "Sắp diễn ra" sẽ hiển thị ở đây
            </Text>
          </View>
        ) : (
          sessions.map((session) => {
            const sessionStatus =
              typeof session.status === "string"
                ? parseInt(session.status)
                : session.status;

            return (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionCard}
                onPress={() => handleViewRoute(session)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#ffffff", "#f8fafc"]}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.statusBadge}>
                      <Calendar
                        size={16}
                        color="#10b981"
                        strokeWidth={2}
                      />
                      <Text style={[styles.statusText, { color: "#10b981" }]}>
                        Sắp diễn ra
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#cbd5e1" strokeWidth={2} />
                  </View>

                  {session.packageName && (
                    <View style={styles.packageContainer}>
                      <Text style={styles.packageName}>{session.packageName}</Text>
                    </View>
                  )}

                  <View style={styles.sessionDetails}>
                    <View style={styles.detailRow}>
                      <Calendar size={16} color="#6b7280" strokeWidth={2} />
                      <Text style={styles.detailText}>{formatDate(session.date)}</Text>
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
                        {session.displayStartLocationName || "Chưa có địa điểm"}
                      </Text>
                    </View>
                    {session.displayEndLocationName && (
                      <View style={styles.detailRow}>
                        <MapPin size={16} color="#6b7280" strokeWidth={2} />
                        <Text style={styles.detailText} numberOfLines={2}>
                          Điểm thả: {session.displayEndLocationName}
                        </Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
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
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
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
  sessionCard: {
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    backgroundColor: "#10b98115",
    borderWidth: 1,
    borderColor: "#10b98130",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  packageContainer: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  packageName: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
  },
  sessionDetails: {
    gap: 8,
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
});

