import React, { useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import {
  Clock,
  MapPin,
  Package as PackageIcon,
  Zap,
} from "lucide-react-native";
import CustomFilter, {
  FilterOptionType as CustomFilterOptionType,
} from "@/components/Commons/CustomFilter";
import { AppColors } from "@/constants/Colors";
import { PackageFilterOption } from "@/models/package/package.enum";
import { DrivingSkill, Package, RoadType } from "@/models/package/package";
interface PackageFilterListProps {
  packages: Package[];
  roadTypes: RoadType[];
  drivingSkills?: DrivingSkill[];
  filterOptions: CustomFilterOptionType[];
  onPackagePress: (pkg: Package) => void;
  bottomPadding?: number;
  pageSize?: number;
  totalCount?: number;
  onRefresh?: () => Promise<void> | void;
  onLoadMore?: () => Promise<void> | void;
  isRefreshing?: boolean;
  isLoadingMore?: boolean;
  // Filter state from parent
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filterHasVehicle?: boolean | null;
  onFilterHasVehicleChange?: (value: boolean | null) => void;
  selectedRoadTypes?: string[];
  onSelectedRoadTypesChange?: (types: string[]) => void;
  selectedDrivingSkills?: string[];
  onSelectedDrivingSkillsChange?: (skills: string[]) => void;
}

const PackageFilterList: React.FC<PackageFilterListProps> = ({
  packages,
  roadTypes,
  drivingSkills = [],
  filterOptions,
  onPackagePress,
  bottomPadding = 20,
  totalCount,
  onRefresh,
  onLoadMore,
  isRefreshing,
  isLoadingMore = false,
  searchQuery: externalSearchQuery,
  onSearchChange,
  filterHasVehicle: externalFilterHasVehicle,
  onFilterHasVehicleChange,
  selectedRoadTypes: externalSelectedRoadTypes,
  onSelectedRoadTypesChange,
  selectedDrivingSkills: externalSelectedDrivingSkills,
  onSelectedDrivingSkillsChange,
}) => {
  // Use external state if provided, otherwise use internal state
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [internalFilterHasVehicle, setInternalFilterHasVehicle] = useState<
    boolean | null
  >(null);
  const [internalSelectedRoadTypes, setInternalSelectedRoadTypes] = useState<
    string[]
  >([]);
  const [internalSelectedDrivingSkills, setInternalSelectedDrivingSkills] = useState<
    string[]
  >([]);

  const searchQuery =
    externalSearchQuery !== undefined
      ? externalSearchQuery
      : internalSearchQuery;
  const filterHasVehicle =
    externalFilterHasVehicle !== undefined
      ? externalFilterHasVehicle
      : internalFilterHasVehicle;
  const selectedRoadTypes =
    externalSelectedRoadTypes !== undefined
      ? externalSelectedRoadTypes
      : internalSelectedRoadTypes;
  const selectedDrivingSkills =
    externalSelectedDrivingSkills !== undefined
      ? externalSelectedDrivingSkills
      : internalSelectedDrivingSkills;

  const setSearchQuery = onSearchChange || setInternalSearchQuery;
  const setFilterHasVehicle =
    onFilterHasVehicleChange || setInternalFilterHasVehicle;
  const setSelectedRoadTypes =
    onSelectedRoadTypesChange || setInternalSelectedRoadTypes;
  const setSelectedDrivingSkills =
    onSelectedDrivingSkillsChange || setInternalSelectedDrivingSkills;

  const [showFilter, setShowFilter] = useState(false);
  const [showRoadTypeModal, setShowRoadTypeModal] = useState(false);
  const [showDrivingSkillsModal, setShowDrivingSkillsModal] = useState(false);
  
  // Temporary state for modal selections (chưa apply)
  const [tempSelectedRoadTypes, setTempSelectedRoadTypes] = useState<string[]>([]);
  const [tempSelectedDrivingSkills, setTempSelectedDrivingSkills] = useState<string[]>([]);
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const isExternalRefreshing = typeof isRefreshing === "boolean";
  const refreshing = isExternalRefreshing
    ? Boolean(isRefreshing)
    : internalRefreshing;

  // Server-side filtering: packages đã được filter từ API
  // Thêm client-side filter để đảm bảo chính xác
  const filteredPackages = useMemo(() => {
    let result = packages;

    // Filter theo search query (nếu có)
    if (searchQuery) {
      result = result.filter((pkg) => {
        return (
          pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.instructorName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Filter theo vehicle (đảm bảo chính xác)
    if (filterHasVehicle !== null) {
      result = result.filter((pkg) => {
        return pkg.allowSelfCar === filterHasVehicle;
      });
    }

    return result;
  }, [packages, searchQuery, filterHasVehicle]);

  // Tính toán xem còn data để load không
  const hasMorePages = totalCount ? packages.length < totalCount : false;

  const handleLoadMore = async () => {
    if (!hasMorePages || refreshing || isLoadingMore || !onLoadMore) {
      return;
    }
    try {
      await Promise.resolve(onLoadMore());
    } catch (error) {
      console.error("Error loading more packages:", error);
    }
  };

  const handleRefresh = async () => {
    if (!isExternalRefreshing) {
      setInternalRefreshing(true);
    }
    try {
      if (onRefresh) {
        await Promise.resolve(onRefresh());
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } finally {
      if (!isExternalRefreshing) {
        setInternalRefreshing(false);
      }
    }
  };

  // Khi mở modal, copy current selections vào temporary state
  const handleOpenRoadTypeModal = () => {
    setTempSelectedRoadTypes([...selectedRoadTypes]);
    setShowRoadTypeModal(true);
  };

  const handleOpenDrivingSkillsModal = () => {
    setTempSelectedDrivingSkills([...selectedDrivingSkills]);
    setShowDrivingSkillsModal(true);
  };

  // Toggle trong modal (chỉ update temporary state)
  const toggleRoadTypeInModal = (roadType: string) => {
    setTempSelectedRoadTypes((prev) =>
      prev.includes(roadType)
        ? prev.filter((type: string) => type !== roadType)
        : [...prev, roadType]
    );
  };

  const toggleDrivingSkillInModal = (skillId: string) => {
    setTempSelectedDrivingSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id: string) => id !== skillId)
        : [...prev, skillId]
    );
  };

  // Áp dụng selections từ modal (trigger API)
  const handleApplyRoadTypes = () => {
    if (onSelectedRoadTypesChange) {
      setSelectedRoadTypes([...tempSelectedRoadTypes]);
    } else {
      setInternalSelectedRoadTypes([...tempSelectedRoadTypes]);
    }
    setShowRoadTypeModal(false);
  };

  const handleApplyDrivingSkills = () => {
    if (onSelectedDrivingSkillsChange) {
      setSelectedDrivingSkills([...tempSelectedDrivingSkills]);
    } else {
      setInternalSelectedDrivingSkills([...tempSelectedDrivingSkills]);
    }
    setShowDrivingSkillsModal(false);
  };

  // Đóng modal mà không apply (reset về current state)
  const handleCloseRoadTypeModal = () => {
    setTempSelectedRoadTypes([...selectedRoadTypes]);
    setShowRoadTypeModal(false);
  };

  const handleCloseDrivingSkillsModal = () => {
    setTempSelectedDrivingSkills([...selectedDrivingSkills]);
    setShowDrivingSkillsModal(false);
  };

  // Clear trong modal (chỉ clear temporary state)
  const clearRoadTypeFiltersInModal = () => {
    setTempSelectedRoadTypes([]);
  };

  const clearDrivingSkillsFiltersInModal = () => {
    setTempSelectedDrivingSkills([]);
  };

  // Clear filters (dùng khi nhấn "Tất cả" hoặc clear từ bên ngoài)
  const clearRoadTypeFilters = () => {
    if (onSelectedRoadTypesChange) {
      setSelectedRoadTypes([]);
    } else {
      setInternalSelectedRoadTypes([]);
    }
  };

  const clearDrivingSkillsFilters = () => {
    if (onSelectedDrivingSkillsChange) {
      setSelectedDrivingSkills([]);
    } else {
      setInternalSelectedDrivingSkills([]);
    }
  };

  const renderFilterOptionItem = ({
    item,
  }: {
    item: CustomFilterOptionType;
  }) => {
    const isActive =
      item.id === PackageFilterOption.All
        ? filterHasVehicle === null && selectedRoadTypes.length === 0 && selectedDrivingSkills.length === 0
        : item.type === "vehicle"
        ? filterHasVehicle === item.value
        : item.type === "roadType"
        ? selectedRoadTypes.length > 0
        : item.type === "drivingSkills"
        ? selectedDrivingSkills.length > 0
        : false;

    const handlePress = () => {
      if (item.id === PackageFilterOption.All) {
        setFilterHasVehicle(null);
        setSelectedRoadTypes([]);
        setSelectedDrivingSkills([]);
      } else if (item.type === "vehicle") {
        setFilterHasVehicle(item.value);
      } else if (item.type === "roadType") {
        handleOpenRoadTypeModal();
      } else if (item.type === "drivingSkills") {
        handleOpenDrivingSkillsModal();
      }
    };

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
          {item.type === "roadType" &&
            selectedRoadTypes.length > 0 &&
            ` (${selectedRoadTypes.length})`}
          {item.type === "drivingSkills" &&
            selectedDrivingSkills.length > 0 &&
            ` (${selectedDrivingSkills.length})`}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRoadTypeItem = ({ item }: { item: RoadType }) => {
    // Sử dụng tempSelectedRoadTypes khi modal đang mở
    const isSelected = showRoadTypeModal 
      ? tempSelectedRoadTypes.includes(item.id)
      : selectedRoadTypes.includes(item.id);
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.roadTypePill, isSelected && styles.roadTypePillActive]}
        onPress={() => {
          if (showRoadTypeModal) {
            toggleRoadTypeInModal(item.id);
          } else {
            // Nếu không phải trong modal, apply ngay (backward compatibility)
            if (onSelectedRoadTypesChange) {
              const newTypes = selectedRoadTypes.includes(item.id)
                ? selectedRoadTypes.filter((type: string) => type !== item.id)
                : [...selectedRoadTypes, item.id];
              setSelectedRoadTypes(newTypes);
            } else {
              setInternalSelectedRoadTypes((prev: string[]) =>
                prev.includes(item.id)
                  ? prev.filter((type: string) => type !== item.id)
                  : [...prev, item.id]
              );
            }
          }
        }}
        activeOpacity={1}
      >
        <Text
          style={[
            styles.roadTypePillText,
            isSelected && styles.roadTypePillTextActive,
          ]}
        >
          {item.name ?? "Không xác định"}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDrivingSkillItem = ({ item }: { item: DrivingSkill }) => {
    // Sử dụng tempSelectedDrivingSkills khi modal đang mở
    const isSelected = showDrivingSkillsModal
      ? tempSelectedDrivingSkills.includes(item.id)
      : selectedDrivingSkills.includes(item.id);
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.roadTypePill, isSelected && styles.roadTypePillActive]}
        onPress={() => {
          if (showDrivingSkillsModal) {
            toggleDrivingSkillInModal(item.id);
          } else {
            // Nếu không phải trong modal, apply ngay (backward compatibility)
            if (onSelectedDrivingSkillsChange) {
              const newSkills = selectedDrivingSkills.includes(item.id)
                ? selectedDrivingSkills.filter((id: string) => id !== item.id)
                : [...selectedDrivingSkills, item.id];
              setSelectedDrivingSkills(newSkills);
            } else {
              setInternalSelectedDrivingSkills((prev: string[]) =>
                prev.includes(item.id)
                  ? prev.filter((id: string) => id !== item.id)
                  : [...prev, item.id]
              );
            }
          }
        }}
        activeOpacity={1}
      >
        <Text
          style={[
            styles.roadTypePillText,
            isSelected && styles.roadTypePillTextActive,
          ]}
        >
          {item.display_name ?? "Không xác định"}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPackageCard = ({ item }: { item: Package }) => (
    <View style={styles.packageCard}>
      <View style={styles.packageHeader}>
        <Text style={styles.packageName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.bookingCount > 0 && (
          <View style={styles.bookingCountBadge}>
            <Text style={styles.bookingCountBadgeText}>
              {item.bookingCount} lượt mua
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardHeader}>
        <View style={styles.instructorRow}>
          <Image
            source={{ uri: item.instructorAvatar }}
            style={styles.instructorAvatar}
          />
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorName}>{item.instructorName}</Text>
            {item.carCount > 0 ? (
              <View style={styles.badgeWithVehicle}>
                <Text style={styles.badgeText}>Người hướng dẫn và xe</Text>
              </View>
            ) : (
              <View style={styles.badgeInstructor}>
                <Text style={styles.badgeText}>Chỉ người hướng dẫn</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Clock size={16} color="#64748b" strokeWidth={2} />
          <Text style={styles.detailText}>{item.duration} giờ</Text>
        </View>
        <View style={styles.detailItem}>
          <MapPin size={16} color="#64748b" strokeWidth={2} />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.roadTypes.length} loại đường
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Zap size={16} color="#64748b" strokeWidth={2} />
          <Text style={styles.detailText}>{item.skills.length} kỹ năng</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {item.price.toLocaleString("vi-VN")} đ
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => onPackagePress(item)}
          >
            <Text style={styles.detailButtonText}>Chi tiết</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => onPackagePress(item)}
          >
            <Text style={styles.buyButtonText}>Mua ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <PackageIcon size={80} color="#cbd5e1" strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>Không tìm thấy gói nào</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Vui lòng thử lại sau"}
      </Text>
    </View>
  );

  const renderLoadingFooter = () => {
    if (!hasMorePages && !isLoadingMore) {
      return null;
    }
    if (isLoadingMore) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color={AppColors.primary} />
          <Text style={styles.loadingText}>Đang tải thêm...</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <CustomFilter
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        filterHasVehicle={filterHasVehicle}
        showFilter={showFilter}
        onToggleFilter={() => setShowFilter(!showFilter)}
        filterOptions={filterOptions}
        renderFilterOptionItem={renderFilterOptionItem}
        showRoadTypeModal={showRoadTypeModal}
        onCloseRoadTypeModal={handleCloseRoadTypeModal}
        onApplyRoadTypes={handleApplyRoadTypes}
        roadTypes={roadTypes}
        renderRoadTypeItem={renderRoadTypeItem}
        onClearRoadTypeFilters={clearRoadTypeFiltersInModal}
        showDrivingSkillsModal={showDrivingSkillsModal}
        onCloseDrivingSkillsModal={handleCloseDrivingSkillsModal}
        onApplyDrivingSkills={handleApplyDrivingSkills}
        drivingSkills={drivingSkills}
        renderDrivingSkillItem={renderDrivingSkillItem}
        onClearDrivingSkillsFilters={clearDrivingSkillsFiltersInModal}
      />

      <FlatList
        data={filteredPackages}
        renderItem={renderPackageCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.25}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderLoadingFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[AppColors.primary]}
            tintColor={AppColors.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    marginRight: 12,
  },
  filterOptionActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  filterOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  filterOptionTextActive: {
    color: "#ffffff",
  },
  packagesList: {
    gap: 16,
  },
  packageCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  packageName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    lineHeight: 24,
    flex: 1,
  },
  bookingCountBadge: {
    backgroundColor: AppColors.primary + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.primary + "40",
  },
  bookingCountBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: AppColors.primary,
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
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
    gap: 12,
  },
  instructorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e2e8f0",
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
    marginBottom: 4,
  },
  badgeWithVehicle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#86efac",
    alignSelf: "flex-start",
  },
  badgeInstructor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fcd34d",
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1f2937",
  },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    minWidth: "30%",
  },
  detailText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  priceContainer: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  detailButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: AppColors.primary,
    backgroundColor: "#ffffff",
  },
  detailButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.primary,
  },
  buyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: AppColors.primary,
  },
  buyButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  price: {
    fontSize: 20,
    fontWeight: "800",
    color: AppColors.primary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#475569",
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  roadTypePill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    minWidth: 90,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  roadTypePillActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  roadTypePillText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  roadTypePillTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 16,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: AppColors.primary,
  },
  paginationButtonDisabled: {
    borderColor: "#cbd5e1",
  },
  paginationButtonText: {
    color: AppColors.primary,
    fontWeight: "700",
  },
  paginationButtonTextDisabled: {
    color: "#94a3b8",
  },
  paginationInfo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
});

export default PackageFilterList;
