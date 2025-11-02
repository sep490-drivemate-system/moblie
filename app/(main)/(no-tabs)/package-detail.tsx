import React from "react";
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
import { ArrowLeft, Clock, MapPin, Calendar, Car, CheckCircle, XCircle, Package as PackageIcon } from "lucide-react-native";
import { userPackagesData } from "@/data/user_packages_data";
import { AppColors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";

export default function PackageDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const packageId = params.packageId as string;

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
      case "scheduled":
        return <Calendar size={16} color="#3b82f6" strokeWidth={2} />;
      case "completed":
        return <CheckCircle size={16} color={AppColors.primary} strokeWidth={2} />;
      case "cancelled":
        return <XCircle size={16} color="#ef4444" strokeWidth={2} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "#3b82f6";
      case "completed":
        return AppColors.primary;
      case "cancelled":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Đã đặt lịch";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

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
      <LinearGradient
        colors={[AppColors.primary, "#059669"]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={AppColors.white} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết gói</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

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

          {/* Package Dates */}
          <View style={styles.datesRow}>
            <View>
              <Text style={styles.dateLabel}>Ngày mua</Text>
              <Text style={styles.dateValue}>
                {new Date(packageData.purchaseDate).toLocaleDateString("vi-VN")}
              </Text>
            </View>
            {packageData.expiryDate && (
              <View>
                <Text style={styles.dateLabel}>Hạn sử dụng</Text>
                <Text style={styles.dateValue}>
                  {new Date(packageData.expiryDate).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Sessions Section */}
        <View style={styles.sessionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Lịch học đã đặt ({packageData.sessions.length})
            </Text>
          </View>

          {packageData.sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#cbd5e1" strokeWidth={1.5} />
              <Text style={styles.emptyText}>Chưa có buổi học nào</Text>
              <Text style={styles.emptySubtext}>
                Đặt lịch học đầu tiên của bạn
              </Text>
            </View>
          ) : (
            <View style={styles.sessionsList}>
              {packageData.sessions.map((session) => (
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
            <LinearGradient
              colors={[AppColors.primary, "#059669"]}
              style={styles.bookButtonGradient}
            >
              <PackageIcon size={20} color={AppColors.white} strokeWidth={2} />
              <Text style={styles.bookButtonText}>Đặt buổi học mới</Text>
            </LinearGradient>
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
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: AppColors.white,
  },
});

