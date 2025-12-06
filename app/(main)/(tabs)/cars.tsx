import React, { useState, useMemo, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { AppColors } from "@/constants/Colors";
import { RootState } from "@/lib/redux/store";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  Car,
  MapPin,
  Star,
  Users,
  Fuel,
  Search,
} from "lucide-react-native";
import { CarViewModel } from "@/viewmodels/car/CarViewModel";
import { ICar, PaginatedCarsResponse, GetCarsParams } from "@/models/car/car";
import HeaderList from "@/components/Commons/HeaderList";
import { useCallback } from "react";
import { RefreshControl } from "react-native";
import CarFilter, {
  CarFilterOptionType,
} from "@/components/Car/CarFilter";
import FilterModal from "@/components/Car/FilterModal";
import {
  SEAT_OPTIONS,
  BRAND_OPTIONS,
  FUEL_OPTIONS,
} from "@/constants/FilterOptions";

type CarCategory = "all" | "economy" | "luxury" | "suv";

enum CarFilterOption {
  All = "all",
  Seats = "seats",
  Brand = "brand",
  Fuel = "fuel",
}

export default function CarsScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const [carState, viewModel] = useViewModel(
    CarViewModel,
    (state: RootState) => state.car
  );

  const [cars, setCars] = useState<ICar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const PAGE_SIZE = 4;
  
  // Filter states
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
  
  // Modal states
  const [showSeatsModal, setShowSeatsModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  
  // Temporary states for modals
  const [tempSelectedSeats, setTempSelectedSeats] = useState<number[]>([]);
  const [tempSelectedBrands, setTempSelectedBrands] = useState<string[]>([]);
  const [tempSelectedFuels, setTempSelectedFuels] = useState<string[]>([]);

  // Categories
  const categories: { id: CarCategory; label: string; icon: any }[] = [
    { id: "all", label: "Tất cả", icon: Car },
    { id: "economy", label: "Tiết kiệm", icon: Car },
    { id: "luxury", label: "Cao cấp", icon: Car },
    { id: "suv", label: "SUV", icon: Car },
  ];

  // Filter options
  const filterOptions: CarFilterOptionType[] = [
    {
      id: CarFilterOption.All,
      label: "Tất cả",
      value: null,
      type: "all" as const,
    },
    {
      id: CarFilterOption.Seats,
      label: "Số chỗ",
      value: null,
      type: "seats" as const,
    },
    {
      id: CarFilterOption.Brand,
      label: "Hãng xe",
      value: null,
      type: "brand" as const,
    },
    {
      id: CarFilterOption.Fuel,
      label: "Nhiên liệu",
      value: null,
      type: "fuel" as const,
    },
  ];

  // Load cars with filters and pagination
  const loadCars = useCallback(async (page: number, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const params: GetCarsParams = {
        page: page,
        size: PAGE_SIZE,
      };

      // Add filter params - API chỉ hỗ trợ single value, lấy giá trị đầu tiên
      if (selectedSeats.length > 0) {
        params.seats = selectedSeats[0];
      }

      if (selectedBrands.length > 0) {
        params.brand = selectedBrands[0];
      }

      if (selectedFuels.length > 0) {
        params.fuel = selectedFuels[0];
      }

      const response = await viewModel.getCars(params);

      // Log để debug
      if (response.pageContent && response.pageContent.length > 0) {
        console.log("Sample car data:", JSON.stringify(response.pageContent[0], null, 2));
      }

      if (append) {
        setCars((prev) => [...prev, ...(response.pageContent ?? [])]);
      } else {
        setCars(response.pageContent ?? []);
      }

      setTotalCount(response.totalCount ?? 0);
      setCurrentPage(response.currentPage ?? page);
    } catch (error) {
      console.error("Error loading cars:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [viewModel, selectedSeats, selectedBrands, selectedFuels]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || cars.length >= totalCount) {
      return;
    }
    await loadCars(currentPage + 1, true);
  }, [currentPage, isLoadingMore, cars.length, totalCount, loadCars]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    try {
      await loadCars(1, false);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadCars]);

  // Load cars when filters change or on mount
  useEffect(() => {
    setCurrentPage(1);
    loadCars(1, false);
  }, [loadCars]);


  // Render car card
  const renderCarCard = ({ item }: { item: ICar }) => (
    <Pressable
      onPress={() => {
        // Navigate to car detail if needed
        // router.push(`/car/${item.id}`);
      }}
    >
      <View style={styles.carCard}>
        <LinearGradient
          colors={["#ffffff", "#f8fafc"]}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.carImage}
            resizeMode="cover"
          />

          <View style={styles.carInfo}>
            <View style={styles.carHeader}>
              <Text style={styles.carName} numberOfLines={1}>
                {item.modelName}
              </Text>
            </View>

            <View style={styles.carDetails}>
              <View style={styles.detailRow}>
                <Users size={14} color="#6b7280" strokeWidth={2} />
                <Text style={styles.detailText}>
                  {item.seatCounts ?? 0} chỗ
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Fuel size={14} color="#6b7280" strokeWidth={2} />
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.fuel ?? "N/A"}
                </Text>
              </View>
            </View>

            <View style={styles.carFooter}>
              <View style={styles.ratingContainer}>
                <Star
                  size={16}
                  color="#fbbf24"
                  fill="#fbbf24"
                  strokeWidth={2}
                />
                <Text style={styles.ratingText}>
                  {item.average_rating?.toFixed(1) || "0.0"}
                </Text>
                <Text style={styles.rentalCount}>
                  ({item.booking_count || 0} lượt thuê)
                </Text>
              </View>

              <Text style={styles.priceText}>
                {item.unitPrice?.toLocaleString("vi-VN")} đ/giờ
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );

  // Filter handlers
  const hasActiveFilters =
    selectedSeats.length > 0 ||
    selectedBrands.length > 0 ||
    selectedFuels.length > 0;

  const handleOpenSeatsModal = () => {
    setTempSelectedSeats([...selectedSeats]);
    setShowSeatsModal(true);
  };

  const handleOpenBrandModal = () => {
    setTempSelectedBrands([...selectedBrands]);
    setShowBrandModal(true);
  };

  const handleOpenFuelModal = () => {
    setTempSelectedFuels([...selectedFuels]);
    setShowFuelModal(true);
  };

  const handleApplySeats = () => {
    setSelectedSeats([...tempSelectedSeats]);
    setShowSeatsModal(false);
  };

  const handleApplyBrands = () => {
    setSelectedBrands([...tempSelectedBrands]);
    setShowBrandModal(false);
  };

  const handleApplyFuels = () => {
    setSelectedFuels([...tempSelectedFuels]);
    setShowFuelModal(false);
  };

  const handleCloseSeatsModal = () => {
    setTempSelectedSeats([...selectedSeats]);
    setShowSeatsModal(false);
  };

  const handleCloseBrandModal = () => {
    setTempSelectedBrands([...selectedBrands]);
    setShowBrandModal(false);
  };

  const handleCloseFuelModal = () => {
    setTempSelectedFuels([...selectedFuels]);
    setShowFuelModal(false);
  };

  const clearSeatsFilters = () => {
    setTempSelectedSeats([]);
  };

  const clearBrandsFilters = () => {
    setTempSelectedBrands([]);
  };

  const clearFuelsFilters = () => {
    setTempSelectedFuels([]);
  };

  const renderFilterOptionItem = ({
    item,
  }: {
    item: CarFilterOptionType;
  }) => {
    const isActive =
      item.id === CarFilterOption.All
        ? !hasActiveFilters
        : item.type === "seats"
        ? selectedSeats.length > 0
        : item.type === "brand"
        ? selectedBrands.length > 0
        : item.type === "fuel"
        ? selectedFuels.length > 0
        : false;

    const handlePress = () => {
      if (item.id === CarFilterOption.All) {
        setSelectedSeats([]);
        setSelectedBrands([]);
        setSelectedFuels([]);
      } else if (item.type === "seats") {
        handleOpenSeatsModal();
      } else if (item.type === "brand") {
        handleOpenBrandModal();
      } else if (item.type === "fuel") {
        handleOpenFuelModal();
      }
    };

    const getCount = () => {
      if (item.type === "seats") return selectedSeats.length;
      if (item.type === "brand") return selectedBrands.length;
      if (item.type === "fuel") return selectedFuels.length;
      return 0;
    };

    const count = getCount();

    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.filterOption, isActive && styles.filterOptionActive]}
        onPress={handlePress}
      >
        <Text
          style={[
            styles.filterOptionText,
            isActive && styles.filterOptionTextActive,
          ]}
        >
          {item.label}
          {count > 0 && ` (${count})`}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Car size={40} color={AppColors.primary} strokeWidth={2} />
      </View>
      <Text style={styles.emptyTitle}>Không tìm thấy xe</Text>
      <Text style={styles.emptySubtitle}>
        {hasActiveFilters
          ? "Thử thay đổi bộ lọc"
          : "Hiện tại chưa có xe nào trong hệ thống"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderList title="Danh sách xe" />

      {/* Filter Component */}
      <CarFilter
        filterOptions={filterOptions}
        renderFilterOptionItem={renderFilterOptionItem}
      />

      {/* Seats Modal */}
      <FilterModal
        visible={showSeatsModal}
        onClose={handleCloseSeatsModal}
        onApply={handleApplySeats}
        onClear={clearSeatsFilters}
        title="Chọn số chỗ"
        data={SEAT_OPTIONS}
        renderItem={({ item }) => {
          const isSelected = tempSelectedSeats.includes(item.value);
          return (
            <TouchableOpacity
              style={[styles.filterPill, isSelected && styles.filterPillActive]}
              onPress={() => {
                setTempSelectedSeats((prev) =>
                  prev.includes(item.value)
                    ? prev.filter((v) => v !== item.value)
                    : [...prev, item.value]
                );
              }}
              activeOpacity={1}
            >
              <Text
                style={[
                  styles.filterPillText,
                  isSelected && styles.filterPillTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
      />

      {/* Brand Modal */}
      <FilterModal
        visible={showBrandModal}
        onClose={handleCloseBrandModal}
        onApply={handleApplyBrands}
        onClear={clearBrandsFilters}
        title="Chọn hãng xe"
        data={BRAND_OPTIONS}
        renderItem={({ item }) => {
          const isSelected = tempSelectedBrands.includes(item.value);
          return (
            <TouchableOpacity
              style={[styles.filterPill, isSelected && styles.filterPillActive]}
              onPress={() => {
                setTempSelectedBrands((prev) =>
                  prev.includes(item.value)
                    ? prev.filter((v) => v !== item.value)
                    : [...prev, item.value]
                );
              }}
              activeOpacity={1}
            >
              <Text
                style={[
                  styles.filterPillText,
                  isSelected && styles.filterPillTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
      />

      {/* Fuel Modal */}
      <FilterModal
        visible={showFuelModal}
        onClose={handleCloseFuelModal}
        onApply={handleApplyFuels}
        onClear={clearFuelsFilters}
        title="Chọn nhiên liệu"
        data={FUEL_OPTIONS}
        renderItem={({ item }) => {
          const isSelected = tempSelectedFuels.includes(item.value);
          return (
            <TouchableOpacity
              style={[styles.filterPill, isSelected && styles.filterPillActive]}
              onPress={() => {
                setTempSelectedFuels((prev) =>
                  prev.includes(item.value)
                    ? prev.filter((v) => v !== item.value)
                    : [...prev, item.value]
                );
              }}
              activeOpacity={1}
            >
              <Text
                style={[
                  styles.filterPillText,
                  isSelected && styles.filterPillTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
      />

      {/* Cars List */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.loadingText}>Đang tải danh sách xe...</Text>
          </View>
        ) : (
          <FlatList
            data={cars}
            renderItem={renderCarCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.carsList,
              { paddingBottom: tabBarHeight + 20 },
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[AppColors.primary]}
                tintColor={AppColors.primary}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.loadingFooter}>
                  <ActivityIndicator size="small" color={AppColors.primary} />
                  <Text style={styles.loadingFooterText}>Đang tải thêm...</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
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
  headerCurve: {
    position: "absolute",
    bottom: -25,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: AppColors.background,
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
    paddingTop: 10,
    paddingBottom: 20,
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
    backgroundColor: AppColors.background,
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
  carsList: {
    paddingTop: 10,
    paddingHorizontal: 16,
    backgroundColor: AppColors.white,
    flex: 1
  },
  carCard: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 2,
    overflow: "hidden",
  },
  cardGradient: {
    padding: 16,
  },
  carImage: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
  },
  carInfo: {
    gap: 12,
  },
  carHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  carName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: `${AppColors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${AppColors.primary}30`,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.primary,
  },
  carDetails: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  carFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  rentalCount: {
    fontSize: 12,
    color: "#6b7280",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  loadingFooterText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  filterOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    marginRight: 0,
    minHeight: 40,
  },
  filterOptionActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    letterSpacing: 0.2,
  },
  filterOptionTextActive: {
    color: "#ffffff",
  },
  filterPill: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  filterPillActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  filterPillTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
