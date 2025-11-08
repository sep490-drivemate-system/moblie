import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Package,
  Clock,
  User,
  ChevronRight,
  Calendar,
  TrendingUp,
} from "lucide-react-native";
import { userPackagesData } from "@/data/user_packages_data";
import { AppColors } from "@/constants/Colors";

export default function MyPackagesScreen() {
  const router = useRouter();

  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const statusOptions = useMemo(
    () => [
      { key: "all", label: "Tất cả" },
      { key: "paid", label: "Đã mua" },
      { key: "in_progress", label: "Đang sử dụng" },
      { key: "completed", label: "Đã sử dụng" },
      { key: "refunded", label: "Hủy có hoàn trả" },
      { key: "not_refund", label: "Hủy không hoàn trả" },
    ],
    []
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: userPackagesData.length,
      paid: 0,
      in_progress: 0,
      completed: 0,
      refunded: 0,
      not_refund: 0,
    };
    userPackagesData.forEach((p) => {
      if (counts[p.status] !== undefined) counts[p.status] += 1;
    });
    return counts;
  }, []);

  const filteredPackages = useMemo(() => {
    if (selectedStatus === "all") return userPackagesData;
    return userPackagesData.filter((p) => p.status === selectedStatus);
  }, [selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return AppColors.yellow;
      case "in_progress":
        return AppColors.primary;
      case "completed":
        return AppColors.gray;
      case "refunded":
        return AppColors.blue;
      case "not_refund":
        return AppColors.red;
      default:
        return AppColors.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Đã mua";
      case "in_progress":
        return "Đang sử dụng";
      case "completed":
        return "Đã sử dụng";
      case "refunded":
        return "Hủy có hoàn trả";
      case "not_refund":
        return "Hủy không hoàn trả";
      default:
        return status;
    }
  };

  const handlePackagePress = (packageId: string) => {
    router.push({
      pathname: "/(main)/(no-tabs)/package-detail",
      params: { packageId },
    });
  };

  const getProgressPercentage = (usedHours: number, totalHours: number) => {
    return Math.min((usedHours / totalHours) * 100, 100);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(main)/(tabs)/home")}
        >
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gói Đã Mua</Text>
          <Text style={styles.headerSubtitle}>
            {filteredPackages.length} gói phù hợp
          </Text>
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBarScroll}
        >
          {statusOptions.map((opt) => {
            const isActive = selectedStatus === opt.key;
            const color =
              opt.key === "all"
                ? AppColors.gray
                : getStatusColor(opt.key as string);
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setSelectedStatus(opt.key)}
                activeOpacity={0.8}
                style={[
                  styles.filterChip,
                  isActive && {
                    backgroundColor: color + "15",
                    borderColor: color,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isActive ? color : "#475569" },
                  ]}
                >
                  {opt.label}
                </Text>
                <View
                  style={[
                    styles.filterCount,
                    { backgroundColor: isActive ? color : "#e2e8f0" },
                  ]}
                >
                  <Text style={styles.filterCountText}>
                    {statusCounts[opt.key] ?? 0}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredPackages.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={80} color="#cbd5e1" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Bạn chưa có gói nào</Text>
            <Text style={styles.emptySubtitle}>
              Khám phá và chọn gói phù hợp với bạn
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push("/(main)/(tabs)/home")}
            >
              <Text style={styles.exploreButtonText}>Khám phá gói</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredPackages.map((pkg) => {
            const progressPercentage = getProgressPercentage(
              pkg.usedHours,
              pkg.totalHours
            );
            const statusColor = getStatusColor(pkg.status);

            return (
              <TouchableOpacity
                key={pkg.id}
                style={styles.packageCard}
                onPress={() => handlePackagePress(pkg.id)}
                activeOpacity={0.7}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.instructorRow}>
                    <Image
                      source={{ uri: pkg.instructorAvatar }}
                      style={styles.instructorAvatar}
                    />
                    <View style={styles.instructorInfo}>
                      <Text style={styles.instructorName}>
                        {pkg.instructorName}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: statusColor + "15",
                            borderColor: statusColor,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: statusColor },
                          ]}
                        />
                        <Text
                          style={[styles.statusText, { color: statusColor }]}
                        >
                          {getStatusText(pkg.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Package Name */}
                <Text style={styles.packageName}>{pkg.packageName}</Text>

                {/* Progress Section */}
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <View style={styles.progressHeaderLeft}>
                      <Clock
                        size={18}
                        color={AppColors.primary}
                        strokeWidth={2}
                      />
                      <Text style={styles.progressTitle}>Tiến độ sử dụng</Text>
                    </View>
                    <Text style={styles.progressPercentage}>
                      {progressPercentage.toFixed(0)}%
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${progressPercentage}%`,
                            backgroundColor: AppColors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Hours Stats */}
                  <View style={styles.hoursStats}>
                    <View style={styles.hoursStatItem}>
                      <Text style={styles.hoursStatLabel}>Tổng</Text>
                      <Text style={styles.hoursStatValue}>
                        {pkg.totalHours}h
                      </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.hoursStatItem}>
                      <Text style={styles.hoursStatLabel}>Đã dùng</Text>
                      <Text style={styles.hoursStatValueUsed}>
                        {pkg.usedHours}h
                      </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.hoursStatItem}>
                      <Text style={styles.hoursStatLabel}>Còn lại</Text>
                      <Text
                        style={[
                          styles.hoursStatValue,
                          {
                            color:
                              pkg.remainingHours > 0
                                ? AppColors.primary
                                : "#ef4444",
                            fontWeight: "800",
                          },
                        ]}
                      >
                        {pkg.remainingHours}h
                      </Text>
                    </View>
                  </View>
                </View>


                {/* Footer */}
                <View style={styles.cardFooter}>
                  <Text style={styles.viewDetailText}>Xem chi tiết</Text>
                  <ChevronRight
                    size={18}
                    color={AppColors.primary}
                    strokeWidth={2}
                  />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: AppColors.primary,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerContent: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.9,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  filterBarContainer: {
    backgroundColor: "#ffffff",
    borderBottomColor: "#e2e8f0",
    borderBottomWidth: 1,
  },
  filterBarScroll: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    gap: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
  filterCount: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  packageCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  instructorRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  instructorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e2e8f0",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#f1f5f9",
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  packageName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 20,
    lineHeight: 28,
  },
  progressSection: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  progressHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "800",
    color: AppColors.primary,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: AppColors.primary,
  },
  hoursStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  hoursStatItem: {
    alignItems: "center",
    flex: 1,
  },
  hoursStatLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 6,
    fontWeight: "600",
  },
  hoursStatValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1e293b",
  },
  hoursStatValueUsed: {
    fontSize: 22,
    fontWeight: "800",
    color: "#64748b",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 8,
  },
  viewDetailText: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.primary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#475569",
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
