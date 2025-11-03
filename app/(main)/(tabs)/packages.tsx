import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Search, Filter, Package, Clock, Car, User, MapPin, Star, Zap, ChevronRight } from "lucide-react-native";
import { popularPackages } from "@/data/home_data";
import { AppColors } from "@/constants/Colors";
import { instructorsData } from "@/data/instructors_data";

const { width } = Dimensions.get("window");

export default function PackagesScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterHasVehicle, setFilterHasVehicle] = useState<boolean | null>(null);

  // Filter packages
  const filteredPackages = popularPackages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.instructorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVehicleFilter =
      filterHasVehicle === null || pkg.hasVehicle === filterHasVehicle;

    return matchesSearch && matchesVehicleFilter;
  });

  const handlePackagePress = (pkg: typeof popularPackages[0]) => {
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
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Danh Sách Gói</Text>
          <Text style={styles.headerSubtitle}>
            {filteredPackages.length} gói có sẵn
          </Text>
        </View>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#94a3b8" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm gói hoặc người hướng dẫn..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            (filterHasVehicle !== null) && styles.filterButtonActive,
          ]}
          onPress={() => setShowFilter(!showFilter)}
        >
          <Filter size={18} color={filterHasVehicle !== null ? "#ffffff" : AppColors.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      {showFilter && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Lọc theo:</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filterHasVehicle === null && styles.filterOptionActive,
              ]}
              onPress={() => setFilterHasVehicle(null)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filterHasVehicle === null && styles.filterOptionTextActive,
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filterHasVehicle === true && styles.filterOptionActive,
              ]}
              onPress={() => setFilterHasVehicle(true)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filterHasVehicle === true && styles.filterOptionTextActive,
                ]}
              >
                Có xe
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filterHasVehicle === false && styles.filterOptionActive,
              ]}
              onPress={() => setFilterHasVehicle(false)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  filterHasVehicle === false && styles.filterOptionTextActive,
                ]}
              >
                Chỉ hướng dẫn
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
                      {pkg.rating && (
                        <View style={styles.ratingRow}>
                          <Star size={14} color="#fbbf24" fill="#fbbf24" strokeWidth={2} />
                          <Text style={styles.ratingText}>{pkg.rating}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {pkg.hasVehicle ? (
                    <View style={styles.badgeWithVehicle}>
                      <Car size={14} color="#16a34a" strokeWidth={2} />
                      <Text style={styles.badgeText}>Có xe</Text>
                    </View>
                  ) : (
                    <View style={styles.badgeInstructor}>
                      <User size={14} color="#92400e" strokeWidth={2} />
                      <Text style={styles.badgeText}>Hướng dẫn</Text>
                    </View>
                  )}
                </View>

                {/* Package Name */}
                <Text style={styles.packageName} numberOfLines={2}>
                  {pkg.name}
                </Text>

                {/* Details */}
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Clock size={16} color="#64748b" strokeWidth={2} />
                    <Text style={styles.detailText}>{pkg.duration} giờ</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MapPin size={16} color="#64748b" strokeWidth={2} />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {pkg.roadTypes.slice(0, 2).join(", ")}
                      {pkg.roadTypes.length > 2 && " +"}
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
                    <Text style={styles.priceLabel}>Giá từ</Text>
                    <Text style={styles.price}>
                      {pkg.basePrice.toLocaleString("vi-VN")} đ
                    </Text>
                  </View>
                  {pkg.bookingCount && (
                    <View style={styles.bookingCount}>
                      <Text style={styles.bookingCountText}>
                        {pkg.bookingCount}+ đặt
                      </Text>
                    </View>
                  )}
                  <ChevronRight size={20} color={AppColors.primary} strokeWidth={2} />
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
    backgroundColor: AppColors.primary,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
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
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    flexDirection: "row",
    gap: 12,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
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
    gap: 6,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  badgeInstructor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1f2937",
  },
  packageName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 16,
    lineHeight: 28,
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
});

