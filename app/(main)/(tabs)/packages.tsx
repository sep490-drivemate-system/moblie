import { AppColors } from "@/constants/Colors";
import { popularPackages } from "@/data/home_data";
import { instructorsData } from "@/data/instructors_data";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Clock, MapPin, Package, Zap } from "lucide-react-native";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomFilter, {
  FilterOptionType as CustomFilterOptionType,
} from "@/components/Commons/CustomFilter";

const { width } = Dimensions.get("window");

// Road types list
const roadTypes = [
  "Đường khu dân cư",
  "Đường đô thị",
  "Quốc lộ",
  "Đường cao tốc",
  "Đường đèo",
  "Đường trường",
  "Đường qua khu đông dân cư",
  "Đường đang thi công",
  "Đường trơn trượt",
];

// Filter options data
const filterOptions = [
  {
    id: "all",
    label: "Tất cả",
    value: null as boolean | null,
    type: "vehicle" as const,
  },
  {
    id: "hasVehicle",
    label: "Có xe",
    value: true as boolean,
    type: "vehicle" as const,
  },
  {
    id: "instructorOnly",
    label: "Chỉ hướng dẫn",
    value: false as boolean,
    type: "vehicle" as const,
  },
  {
    id: "roadType",
    label: "Loại đường",
    value: null,
    type: "roadType" as const,
  },
];



export default function PackagesScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterHasVehicle, setFilterHasVehicle] = useState<boolean | null>(
    null
  );
  const [showRoadTypeModal, setShowRoadTypeModal] = useState(false);
  const [selectedRoadTypes, setSelectedRoadTypes] = useState<string[]>([]);

  // Filter packages
  const filteredPackages = popularPackages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.instructorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVehicleFilter =
      filterHasVehicle === null || pkg.hasVehicle === filterHasVehicle;

    const matchesRoadTypeFilter =
      selectedRoadTypes.length === 0 ||
      selectedRoadTypes.some((selectedType) =>
        pkg.roadTypes.some((pkgRoadType) =>
          pkgRoadType.toLowerCase().includes(selectedType.toLowerCase())
        )
      );

    return matchesSearch && matchesVehicleFilter && matchesRoadTypeFilter;
  });

  // Toggle road type selection
  const toggleRoadType = (roadType: string) => {
    setSelectedRoadTypes((prev) =>
      prev.includes(roadType)
        ? prev.filter((type) => type !== roadType)
        : [...prev, roadType]
    );
  };

  // Clear all road type filters
  const clearRoadTypeFilters = () => {
    setSelectedRoadTypes([]);
  };

  // Render filter option item for FlatList
  const renderFilterOptionItem = ({ item }: { item: CustomFilterOptionType }) => {
    const isActive =
      item.id === "all"
        ? filterHasVehicle === null && selectedRoadTypes.length === 0
        : item.type === "vehicle"
          ? filterHasVehicle === item.value
          : selectedRoadTypes.length > 0;

    const handlePress = () => {
      if (item.id === "all") {
        // Reset all filters when "Tất cả" is clicked
        setFilterHasVehicle(null);
        setSelectedRoadTypes([]);
      } else if (item.type === "vehicle") {
        setFilterHasVehicle(item.value);
      } else if (item.type === "roadType") {
        setShowRoadTypeModal(true);
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
        </Text>
      </TouchableOpacity>
    );
  };

  // Render road type item for FlatList
  const renderRoadTypeItem = ({ item }: { item: string }) => {
    const isSelected = selectedRoadTypes.includes(item);
    return (
      <TouchableOpacity
        style={[styles.roadTypeItem, isSelected && styles.roadTypeItemSelected]}
        onPress={() => toggleRoadType(item)}
        activeOpacity={1}
      >
        <View style={styles.roadTypeContent}>
          <View
            style={[styles.checkbox, isSelected && styles.checkboxSelected]}
          >
            {isSelected && <View style={styles.checkboxInner} />}
          </View>
          <Text
            style={[
              styles.roadTypeText,
              isSelected && styles.roadTypeTextSelected,
            ]}
          >
            {item}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handlePackagePress = (pkg: (typeof popularPackages)[0]) => {
    router.push({
      pathname: "/(main)/(no-tabs)/instructor-detail",
      params: { instructorId: pkg.instructorId },
    });
  };

  const getInstructorAvatar = (instructorId: string) => {
    const instructor = instructorsData.find((i) => i.id === instructorId);
    return instructor?.avatar || "https://i.pravatar.cc/150?img=1";
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

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
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{filteredPackages.length}</Text>
              <Text style={styles.statLabel}>Tổng</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerCurve} />
      </LinearGradient>

      <CustomFilter
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        filterHasVehicle={filterHasVehicle}
        showFilter={showFilter}
        onToggleFilter={() => setShowFilter(!showFilter)}
        filterOptions={filterOptions}
        renderFilterOptionItem={renderFilterOptionItem}
        showRoadTypeModal={showRoadTypeModal}
        onCloseRoadTypeModal={() => setShowRoadTypeModal(false)}
        roadTypes={roadTypes}
        renderRoadTypeItem={renderRoadTypeItem}
        onClearRoadTypeFilters={clearRoadTypeFilters}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredPackages.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={80} color="#cbd5e1" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Không tìm thấy gói nào</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Thử tìm kiếm với từ khóa khác"
                : "Vui lòng thử lại sau"}
            </Text>
          </View>
        ) : (
          <View style={styles.packagesList}>
            {filteredPackages.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={styles.packageCard}
                onPress={() => handlePackagePress(pkg)}
                activeOpacity={0.7}
              >
                {/* Package Name & Booking Count */}
                <View style={styles.packageHeader}>
                  <Text style={styles.packageName} numberOfLines={2}>
                    {pkg.name}
                  </Text>
                  {pkg.bookingCount && (
                    <View style={styles.bookingCountBadge}>
                      <Text style={styles.bookingCountBadgeText}>
                        {pkg.bookingCount} lượt mua
                      </Text>
                    </View>
                  )}
                </View>

                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.instructorRow}>
                    <Image
                      source={{ uri: getInstructorAvatar(pkg.instructorId) }}
                      style={styles.instructorAvatar}
                    />
                    <View style={styles.instructorInfo}>
                      <Text style={styles.instructorName}>
                        {pkg.instructorName}
                      </Text>
                      {pkg.hasVehicle ? (
                        <View style={styles.badgeWithVehicle}>
                          <Text style={styles.badgeText}>
                            Người hướng dẫn và xe
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.badgeInstructor}>
                          <Text style={styles.badgeText}>
                            Chỉ người hướng dẫn
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {/* Details */}
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Clock size={16} color="#64748b" strokeWidth={2} />
                    <Text style={styles.detailText}>{pkg.duration} giờ</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MapPin size={16} color="#64748b" strokeWidth={2} />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {pkg.roadTypes.length} loại đường
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Zap size={16} color="#64748b" strokeWidth={2} />
                    <Text style={styles.detailText}>
                      {pkg.skills.length} kỹ năng
                    </Text>
                  </View>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>
                      {pkg.basePrice.toLocaleString("vi-VN")} đ
                    </Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.detailButton}
                      onPress={() => handlePackagePress(pkg)}
                    >
                      <Text style={styles.detailButtonText}>Chi tiết</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.buyButton}
                      onPress={() => handlePackagePress(pkg)}
                    >
                      <Text style={styles.buyButtonText}>Mua ngay</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
    paddingTop: StatusBar.currentHeight,
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
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginTop: -25,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 1,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.primary,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: AppColors.primary,
  },
  filterContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 12,
  },
  filterOptions: {
    gap: 5,
    paddingRight: 16,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
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
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400e",
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
  priceLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
    fontWeight: "600",
  },
  price: {
    fontSize: 20,
    fontWeight: "800",
    color: AppColors.primary,
  },
  bookingCount: {
    backgroundColor: AppColors.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bookingCountText: {
    fontSize: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  roadTypesList: {
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  roadTypeItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    marginBottom: 12,
  },
  roadTypeItemSelected: {
    borderColor: AppColors.primary,
    backgroundColor: `${AppColors.primary}10`,
  },
  roadTypeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary,
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: "#ffffff",
  },
  roadTypeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
    flex: 1,
  },
  roadTypeTextSelected: {
    color: "#1e293b",
    fontWeight: "700",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748b",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
});
