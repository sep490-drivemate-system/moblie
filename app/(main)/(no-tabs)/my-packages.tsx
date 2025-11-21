import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Package,
  Clock,
  ChevronRight,
  Calendar,
} from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { BookingStatus } from "@/models/package/user-package";
import { IMyPackgesResponse } from "@/models/package/package";
import { ROUTES } from "@/constants/routes";
import { useBookingViewModel } from "@/viewmodels/booking/BookingViewModel";

export default function MyPackagesScreen() {
  const router = useRouter();
  const bookingViewModel = useBookingViewModel();

  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(BookingStatus.All);
  const [allPackages, setAllPackages] = useState<IMyPackgesResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const statusOptions = useMemo(
    () => bookingViewModel.getStatusOptions(),
    [bookingViewModel]
  );

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
      const packagesData = await bookingViewModel.fetchMyPackages();
      setAllPackages(packagesData);
    } catch (error) {
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

  const displayedPackages = useMemo(
    () => bookingViewModel.filterPackages(allPackages, selectedStatus),
    [allPackages, selectedStatus, bookingViewModel]
  );

  const statusCounts = useMemo(
    () => bookingViewModel.calculateStatusCounts(allPackages),
    [allPackages, bookingViewModel]
  );

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
                : bookingViewModel.getStatusColor(opt.key);
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
          displayedPackages.map((pkg: IMyPackgesResponse) => {
            const progressPercentage =
              bookingViewModel.getProgressPercentage(pkg.precentInUse);
            const statusColor = bookingViewModel.getStatusColor(
              pkg.bookingStatus
            );
            const purchaseDateLabel =
              bookingViewModel.formatPurchaseDate(pkg.buyDate);
            return (
              <TouchableOpacity
                key={pkg.id}
                style={styles.packageCard}
                activeOpacity={0.7}
              >

                {/* Package Name with Status */}
                <View style={styles.packageNameRow}>
                  <Text style={styles.packageName}>
                    {pkg.namePackage}
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
                      {bookingViewModel.getStatusText(pkg.bookingStatus)}
                    </Text>
                  </View>
                </View>

                {/* Purchase Date */}
                <View style={styles.purchaseDateRow}>
                  <Calendar
                    size={16}
                    color="#64748b"
                    strokeWidth={2}
                  />
                  <Text style={styles.purchaseDateText}>
                    {purchaseDateLabel}
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
                  <TouchableOpacity onPress={() => router.push({
                    pathname: ROUTES.MY_PACKAGE_DETAIL,
                    params: {
                      packageData: JSON.stringify(pkg),
                    },
                  })}>
                    <Text style={styles.viewDetailText}>Xem chi tiết</Text>
                  </TouchableOpacity>
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
  packageNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  packageName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    lineHeight: 28,
    flex: 1,
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
