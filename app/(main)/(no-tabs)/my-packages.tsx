import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
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
import { AppColors } from "@/constants/Colors";
import { useAppDispatch } from "@/lib/redux/hooks";
import { getUserPackages } from "@/features/booking/bookingThunk";
import { IUserPackageAPI, BookingStatus } from "@/models/package/user-package";

export default function MyPackagesScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(BookingStatus.All);
  const [allPackages, setAllPackages] = useState<IUserPackageAPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const statusOptions = useMemo(
    () => [
      { key: BookingStatus.All, label: "Tất cả" },
      { key: BookingStatus.Purchased, label: "Đã mua" },
      { key: BookingStatus.InUse, label: "Đang sử dụng" },
      { key: BookingStatus.Used, label: "Đã sử dụng" },
      { key: BookingStatus.CancellationWithRefund, label: "Hủy có hoàn trả" },
      { key: BookingStatus.CancellationWithoutRefund, label: "Hủy không hoàn trả" },
    ],
    []
  );

  // Fetch ALL packages once on mount để tính counts
  useEffect(() => {
    fetchAllPackages();
  }, []);

  const fetchAllPackages = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      // Fetch tất cả packages (không truyền bookingStatus hoặc truyền 0)
      const result = await dispatch(getUserPackages(undefined)).unwrap();
      
      const packagesData = (result as any).value || result;
      setAllPackages(packagesData);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      setAllPackages([]);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    await fetchAllPackages(true);
  };

  // Filter packages theo selected status (client-side)
  const displayedPackages = useMemo(() => {
    if (selectedStatus === BookingStatus.All) {
      return allPackages;
    }
    return allPackages.filter(p => p.bookingStatus === selectedStatus);
  }, [allPackages, selectedStatus]);

  // Tính counts từ ALL packages
  const statusCounts = useMemo(() => {
    const counts: Record<number, number> = {
      [BookingStatus.All]: allPackages.length,
      [BookingStatus.Purchased]: 0,
      [BookingStatus.InUse]: 0,
      [BookingStatus.Used]: 0,
      [BookingStatus.CancellationWithRefund]: 0,
      [BookingStatus.CancellationWithoutRefund]: 0,
    };
    allPackages.forEach((p) => {
      if (counts[p.bookingStatus] !== undefined) {
        counts[p.bookingStatus] += 1;
      }
    });
    return counts;
  }, [allPackages]);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.Purchased:
        return AppColors.yellow;
      case BookingStatus.InUse:
        return AppColors.primary;
      case BookingStatus.Used:
        return AppColors.gray;
      case BookingStatus.CancellationWithRefund:
        return AppColors.blue;
      case BookingStatus.CancellationWithoutRefund:
        return AppColors.red;
      default:
        return AppColors.gray;
    }
  };

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.Purchased:
        return "Đã mua";
      case BookingStatus.InUse:
        return "Đang sử dụng";
      case BookingStatus.Used:
        return "Đã sử dụng";
      case BookingStatus.CancellationWithRefund:
        return "Hủy có hoàn trả";
      case BookingStatus.CancellationWithoutRefund:
        return "Hủy không hoàn trả";
      default:
        return "Không xác định";
    }
  };

  const handlePackagePress = (packageId: string) => {
    router.push({
      pathname: "/(main)/(no-tabs)/package-detail",
      params: { packageId },
    });
  };

  const getProgressPercentage = (percentInUse: number) => {
    return Math.min(percentInUse, 100);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(main)/(tabs)/home")}
        >
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gói Đã Mua</Text>
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
              opt.key === BookingStatus.All
                ? AppColors.gray
                : getStatusColor(opt.key);
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[AppColors.primary]}
            tintColor={AppColors.primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : displayedPackages.length === 0 ? (
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
          displayedPackages.map((pkg: IUserPackageAPI) => {
            const progressPercentage = getProgressPercentage(pkg.precentInUse);
            const statusColor = getStatusColor(pkg.bookingStatus);

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
                      source={{ uri: pkg.avatarInstructor }}
                      style={styles.instructorAvatar}
                    />
                    <View style={styles.instructorInfo}>
                      <Text style={styles.instructorName}>
                        {pkg.nameInstructor}
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
                          {getStatusText(pkg.bookingStatus)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Package Name */}
                <Text style={styles.packageName}>
                  {pkg.namePackake || 'Gói học lái xe'}
                </Text>

                {/* Purchase Date */}
                <View style={styles.purchaseDateRow}>
                  <Calendar
                    size={16}
                    color="#64748b"
                    strokeWidth={2}
                  />
                  <Text style={styles.purchaseDateText}>
                    Mua ngày: {new Date(pkg.buyDate).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })} lúc {new Date(pkg.buyDate).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>

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
                        {pkg.duration}h
                      </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.hoursStatItem}>
                      <Text style={styles.hoursStatLabel}>Đã dùng</Text>
                      <Text style={styles.hoursStatValueUsed}>
                        {pkg.durationInUse}h
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
                              pkg.remainingTime > 0
                                ? AppColors.primary
                                : "#ef4444",
                            fontWeight: "800",
                          },
                        ]}
                      >
                        {pkg.remainingTime}h
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
    marginTop: 35,
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
    marginBottom: 12,
    lineHeight: 28,
  },
  purchaseDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  purchaseDateText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
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
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "600",
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
