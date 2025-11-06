import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Clock, MapPin, Calendar, Car, CheckCircle, XCircle, Package as PackageIcon, Route, AlertCircle, RefreshCw, PlayCircle } from "lucide-react-native";
import { userPackagesData } from "@/data/user_packages_data";
import { AppColors } from "@/constants/Colors";

type StatusFilter = "all" | "route_planning" | "upcoming" | "cancelled" | "rescheduled" | "in_progress" | "completed";

export default function PackageDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const packageId = params.packageId as string;
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");

  const packageData = userPackagesData.find((pkg) => pkg.id === packageId);

  if (!packageData) {
    return (
      <View style={styles.container}>
        <Text>Package not found</Text>
      </View>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "route_planning":
      case "planning":
        return <Route size={16} color="#6366f1" strokeWidth={2} />;
      case "upcoming":
      case "scheduled":
        return <Calendar size={16} color="#3b82f6" strokeWidth={2} />;
      case "cancelled":
        return <XCircle size={16} color="#ef4444" strokeWidth={2} />;
      case "rescheduled":
      case "changed":
        return <RefreshCw size={16} color="#f59e0b" strokeWidth={2} />;
      case "in_progress":
      case "active":
        return <PlayCircle size={16} color="#10b981" strokeWidth={2} />;
      case "completed":
        return <CheckCircle size={16} color={AppColors.primary} strokeWidth={2} />;
      default:
        return <AlertCircle size={16} color="#64748b" strokeWidth={2} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "route_planning":
      case "planning":
        return "#6366f1"; // Indigo
      case "upcoming":
      case "scheduled":
        return "#3b82f6"; // Blue
      case "cancelled":
        return "#ef4444"; // Red
      case "rescheduled":
      case "changed":
        return "#f59e0b"; // Amber
      case "in_progress":
      case "active":
        return "#10b981"; // Green
      case "completed":
        return AppColors.primary; // Primary green
      default:
        return "#64748b"; // Gray
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "route_planning":
      case "planning":
        return "Lên lộ trình";
      case "upcoming":
      case "scheduled":
        return "Sắp tới";
      case "cancelled":
        return "Hủy lịch";
      case "rescheduled":
      case "changed":
        return "Đổi lịch";
      case "in_progress":
      case "active":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  // Filter sessions based on selected status
  const filteredSessions = useMemo(() => {
    if (!packageData) return [];
    if (selectedStatus === "all") return packageData.sessions;

    return packageData.sessions.filter((session) => {
      const sessionStatus = (session as any).status as string;
      if (!sessionStatus) return false;

      switch (selectedStatus) {
        case "route_planning":
          return sessionStatus === "route_planning" || sessionStatus === "planning";
        case "upcoming":
          return sessionStatus === "upcoming" || sessionStatus === "scheduled";
        case "cancelled":
          return sessionStatus === "cancelled";
        case "rescheduled":
          return sessionStatus === "rescheduled" || sessionStatus === "changed";
        case "in_progress":
          return sessionStatus === "in_progress" || sessionStatus === "active";
        case "completed":
          return sessionStatus === "completed";
        default:
          return true;
      }
    });
  }, [packageData, selectedStatus]);

  const statusFilters: { key: StatusFilter; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "Tất cả", icon: <Calendar size={16} color="#64748b" strokeWidth={2} /> },
    { key: "route_planning", label: "Lên lộ trình", icon: <Route size={16} color="#6366f1" strokeWidth={2} /> },
    { key: "upcoming", label: "Sắp tới", icon: <Calendar size={16} color="#3b82f6" strokeWidth={2} /> },
    { key: "cancelled", label: "Hủy lịch", icon: <XCircle size={16} color="#ef4444" strokeWidth={2} /> },
    { key: "rescheduled", label: "Đổi lịch", icon: <RefreshCw size={16} color="#f59e0b" strokeWidth={2} /> },
    { key: "in_progress", label: "Đang thực hiện", icon: <PlayCircle size={16} color="#10b981" strokeWidth={2} /> },
    { key: "completed", label: "Hoàn thành", icon: <CheckCircle size={16} color={AppColors.primary} strokeWidth={2} /> },
  ];

  const handleBookNewSession = () => {
    router.push({
      pathname: "/(main)/(no-tabs)/booking",
      params: {
        instructorId: packageData.instructorId,
        packageId: packageData.packageId,
        fromUserPackage: "true",
        userPackageId: packageData.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={AppColors.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết gói</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Package Info Card */}
        <View style={styles.packageCard}>
          <View style={styles.instructorSection}>
            <Image
              source={{ uri: packageData.instructorAvatar }}
              style={styles.instructorAvatar}
            />
            <View style={styles.instructorInfo}>
              <Text style={styles.instructorName}>
                {packageData.instructorName}
              </Text>
              <Text style={styles.packageName}>{packageData.packageName}</Text>
            </View>
          </View>

          {/* Hours Info */}
          <View style={styles.hoursCard}>
            <View style={styles.hoursRow}>
              <View style={styles.hoursItem}>
                <Text style={styles.hoursLabel}>Tổng giờ</Text>
                <Text style={styles.hoursValue}>{packageData.totalHours}h</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.hoursItem}>
                <Text style={styles.hoursLabel}>Đã dùng</Text>
                <Text style={[styles.hoursValue, { color: "#64748b" }]}>
                  {packageData.usedHours}h
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.hoursItem}>
                <Text style={styles.hoursLabel}>Còn lại</Text>
                <Text
                  style={[
                    styles.hoursValue,
                    {
                      color:
                        packageData.remainingHours > 0
                          ? AppColors.primary
                          : "#ef4444",
                    },
                  ]}
                >
                  {packageData.remainingHours}h
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(packageData.usedHours / packageData.totalHours) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(
                  (packageData.usedHours / packageData.totalHours) * 100
                )}
                % đã sử dụng
              </Text>
            </View>
          </View>

        </View>

        {/* Sessions Section */}
        <View style={styles.sessionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Lịch thuê đã đặt ({filteredSessions.length})
            </Text>
          </View>

          {/* Status Filter Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {statusFilters.map((filter) => {
              const isSelected = selectedStatus === filter.key;
              const filterColor = getStatusColor(filter.key === "all" ? "scheduled" : filter.key);
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    isSelected && [
                      styles.filterButtonSelected,
                      { borderColor: filterColor, backgroundColor: filterColor + "15" },
                    ],
                  ]}
                  onPress={() => setSelectedStatus(filter.key)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.filterIcon,
                    isSelected && { backgroundColor: filterColor + "20" }
                  ]}>
                    {filter.icon}
                  </View>
                  <Text
                    style={[
                      styles.filterText,
                      isSelected && { color: filterColor, fontWeight: "700" },
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {filteredSessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#cbd5e1" strokeWidth={1.5} />
              <Text style={styles.emptyText}>Chưa có buổi học nào</Text>
              <Text style={styles.emptySubtext}>
                Đặt lịch học đầu tiên của bạn
              </Text>
            </View>
          ) : (
            <View style={styles.sessionsList}>
              {filteredSessions.map((session) => (
                <View key={session.id} style={styles.sessionCard}>
                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColor(session.status) + "20",
                        borderColor: getStatusColor(session.status)
                      },
                    ]}
                  >
                    {getStatusIcon(session.status)}
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(session.status) },
                      ]}
                    >
                      {getStatusText(session.status)}
                    </Text>
                  </View>

                  {/* Date & Time */}
                  <View style={styles.sessionRow}>
                    <Calendar size={18} color="#64748b" strokeWidth={2} />
                    <Text style={styles.sessionText}>
                      {new Date(session.date).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>

                  <View style={styles.sessionRow}>
                    <Clock size={18} color="#64748b" strokeWidth={2} />
                    <Text style={styles.sessionText}>
                      {session.startTime} - {session.endTime} ({session.duration}h)
                    </Text>
                  </View>

                  {/* Location */}
                  <View style={styles.sessionRow}>
                    <MapPin size={18} color="#64748b" strokeWidth={2} />
                    <Text style={styles.sessionText} numberOfLines={1}>
                      {session.location}
                    </Text>
                  </View>

                  {/* Vehicle */}
                  {session.vehicleName && (
                    <View style={styles.sessionRow}>
                      <Car size={18} color="#64748b" strokeWidth={2} />
                      <Text style={styles.sessionText}>{session.vehicleName}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Book New Session Button */}
      {packageData.remainingHours > 0 && packageData.status === "active" && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookNewSession}
          >
            <View style={styles.bookButtonGradient}>
              <Text style={styles.bookButtonText}>Đặt buổi thuê mới</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#1AD562",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: AppColors.white,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  packageCard: {
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructorSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  instructorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e2e8f0",
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 4,
  },
  packageName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
  },
  hoursCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  hoursItem: {
    alignItems: "center",
  },
  hoursLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  hoursValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
  },
  divider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: AppColors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
  },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  sessionsSection: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    marginRight: 8,
  },
  filterButtonSelected: {
    borderWidth: 1.5,
  },
  filterIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  sessionsList: {
    gap: 12,
  },
  sessionCard: {
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  sessionText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  emptyState: {
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: AppColors.white,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bookButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  bookButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    backgroundColor: "#1AD562",
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: AppColors.white,
  },
});

