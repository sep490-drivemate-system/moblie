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
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Package,
  Clock,
  Calendar,
} from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { BookingStatus } from "@/models/package/user-package";
import { IMyPackges } from "@/models/package/package";
import { ROUTES } from "@/constants/routes";
import { BookingViewModel } from "@/viewmodels/booking/BookingViewModel";
import HeaderList from "@/components/Commons/HeaderList";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { RootState } from "@/lib/redux/store";

export default function MyPackagesScreen() {
  const router = useRouter();
  const [bookingState, bookingViewModel] = useViewModel<RootState["booking"], BookingViewModel>(BookingViewModel, (state) => state.booking);

  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(BookingStatus.All);
  const [allPackages, setAllPackages] = useState<IMyPackges[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalCount: 0 });

  const PAGE_SIZE = 10;

  const renderFilterBar = () => (
    <View style={styles.stickyFilterWrapper}>
      <FlatList
        data={tabOptions}
        keyExtractor={(item) => String(item.value)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScrollContent}
        renderItem={({ item }) => {
          const isActive = selectedStatus === item.value;
          const activeStyle = getActiveTabStyle(item.value);
          const activeTextStyle = getActiveTextStyle(item.value);
          return (
            <TouchableOpacity
              style={[
                styles.chip,
                isActive && {
                  backgroundColor: activeStyle.backgroundColor,
                  borderColor: activeStyle.borderColor,
                },
              ]}
              onPress={() => setSelectedStatus(item.value)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive && { color: activeTextStyle.color, fontWeight: "800" },
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );


  const statusOptions = useMemo(
    () => bookingViewModel.getStatusOptions(),
    [bookingViewModel]
  );

  useEffect(() => {
    loadPage(1, false, true);
  }, [selectedStatus]);

  const loadPage = async (page = 1, append = false, showSpinner = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else if (showSpinner) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const response = await bookingViewModel.fetchMyPackages({
        Status: selectedStatus,
        PageNumber: page,
        PageSize: PAGE_SIZE,
      });
      const items = response?.pageContent ?? [];
      setAllPackages((prev) => (append ? [...prev, ...items] : items));
      setPagination((prev) => ({
        page,
        totalCount: response?.totalCount ?? (append ? prev.totalCount : items.length),
      }));
    } catch (error) {
      if (!append) {
        setAllPackages([]);
        setPagination({ page: 1, totalCount: 0 });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    await loadPage(1, false, true);
  };

  const handleLoadMore = async () => {
    const { page, totalCount } = pagination;
    if (isLoadingMore || allPackages.length >= totalCount || isLoading) return;
    await loadPage(page + 1, true, false);
  };

  const statusCounts = useMemo(
    () => bookingViewModel.calculateStatusCounts(allPackages),
    [allPackages, bookingViewModel]
  );

  const tabOptions = useMemo(
    () =>
      statusOptions.map((opt) => ({
        value: opt.key,
        label: opt.label,
        count: statusCounts[opt.key] ?? 0,
      })),
    [statusOptions, statusCounts]
  );

  const hasFilter = tabOptions.length > 0;

  const getActiveTabStyle = (status: BookingStatus) => {
    const color =
      status === BookingStatus.All
        ? AppColors.gray
        : bookingViewModel.getStatusColor(status);
    return {
      backgroundColor: color + "15",
      borderColor: color,
    };
  };

  const getActiveTextStyle = (status: BookingStatus) => {
    const color =
      status === BookingStatus.All
        ? AppColors.gray
        : bookingViewModel.getStatusColor(status);
    return {
      color: color,
    };
  };

  return (
    <View style={styles.container}>
      <HeaderList actionReturnScreen={ROUTES.PROFILE as any} title="Gói Đã Mua" colors={[AppColors.primary, AppColors.gradientStart, AppColors.gradientEnd]} />

      <FlatList
        data={isLoading && allPackages.length === 0 ? [] : allPackages}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[AppColors.primary]}
            tintColor={AppColors.primary}
          />
        }
        ListHeaderComponent={hasFilter ? renderFilterBar : null}
        ListHeaderComponentStyle={hasFilter ? styles.listHeaderSpacing : undefined}
        stickyHeaderIndices={hasFilter ? [0] : []}
        renderItem={({ item: pkg }) => {
          const progressPercentage =
            bookingViewModel.getProgressPercentage(pkg.precentInUse);
          const statusColor = bookingViewModel.getStatusColor(
            pkg.bookingStatus
          );
          const purchaseDateLabel =
            bookingViewModel.formatPurchaseDate(pkg.buyDate);
          return (
            <TouchableOpacity
              style={styles.packageCard}
              activeOpacity={0.7}
            >

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

              {pkg.carName && (
                <View style={styles.carNameRow}>
                  <Text style={styles.carNameLabel}>Xe: </Text>
                  <Text style={styles.carNameText}>{pkg.carName}</Text>
                </View>
              )}

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

              <View style={styles.cardFooter}>
                <TouchableOpacity activeOpacity={1}
                  style={styles.viewDetailButton}
                  onPress={() => router.push({
                    pathname: ROUTES.MY_PACKAGE_DETAIL,
                    params: {
                      packageData: JSON.stringify(pkg),
                      carId: pkg.carId,
                      carName: pkg.carName,
                    },
                  })}
                >
                  <Text style={styles.viewDetailText}>Chi tiết</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={AppColors.primary} />
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Package size={80} color="#cbd5e1" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Bạn chưa có gói nào</Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push(ROUTES.PACKAGES)}
              >
                <Text style={styles.exploreButtonText}>Khám phá gói</Text>
              </TouchableOpacity>
            </View>
          )
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadMoreButton}>
              <ActivityIndicator color={AppColors.primary} />
            </View>
          ) : null
        }
      />
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
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  filterBarScroll: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    minWidth: undefined,
    shadowColor: undefined,
    shadowOffset: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined,
    elevation: 0,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    alignItems: "stretch",
  },
  packageCard: {
    width: "100%",
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
    justifyContent: "flex-start",
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
  carNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
  },
  carNameLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
  },
  carNameText: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.primary,
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
    gap: 12,
    paddingTop: 8,
  },
  viewDetailButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 4,
  },
  viewDetailText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
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
  // Custom chip styles
  chipScroll: {
    backgroundColor: "transparent",
  },
  chipScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    alignItems: "flex-start",
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    height: 36,
    marginRight: 6,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
  loadMoreButton: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.primary,
  },
  stickyFilterWrapper: {
    backgroundColor: "#f8fafc",
    paddingBottom: 2,
  },
  listHeaderSpacing: {
    paddingTop: 4,
    paddingBottom: 4,
  },
});
