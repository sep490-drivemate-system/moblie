import React, { useState, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { AppColors } from "@/constants/Colors";
import FilterModal from "@/components/FilterModal";
import SearchBar from "@/components/ui/searchbar";
import { FilterType } from "@/constants/FilterOptions";
import { RootState } from "@/lib/redux/store";
import { ListCarViewModel } from "@/viewmodels/listCar/listCarViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  Car,
  MapPin,
  Star,
  Users,
  Fuel,
  Settings,
  Search,
  Filter,
} from "lucide-react-native";

type CarCategory = "all" | "economy" | "luxury" | "suv";

interface CarWithCategory {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  location: string;
  rating: number;
  seats: number;
  type: string;
  fuel: string;
  totalRentalCount?: number;
  category: CarCategory;
}

export default function CarsScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const [listCarState, viewModel] = useViewModel(
    ListCarViewModel,
    (state: RootState) => state.listCar
  );

  const [activeFilter, setActiveFilter] = useState<CarCategory>("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilterType, setSelectedFilterType] =
    useState<FilterType | null>(null);
  const [selectedFilterTitle, setSelectedFilterTitle] = useState("");
  const [query, setQuery] = useState("");

  // Categorize cars based on price and brand
  const carsWithCategory: CarWithCategory[] = useMemo(() => {
    return viewModel.filteredCars.map((car) => {
      let category: CarCategory = "economy";
      
      // Luxury brands
      if (["Mercedes", "BMW", "Audi", "Porsche", "Lexus", "Land Rover"].includes(car.brand)) {
        category = "luxury";
      }
      // SUV/Large vehicles
      else if (car.seats >= 7 || ["Honda CR-V", "Mazda CX-5", "Ford Ranger", "Isuzu Mu-X"].some(model => car.name.includes(model.split(' ')[0]))) {
        category = "suv";
      }
      // High-end economy
      else if (car.price > 2000000) {
        category = "luxury";
      }

      return { ...car, category };
    });
  }, [viewModel.filteredCars]);

  // Calculate statistics by category
  const stats = useMemo(() => {
    const total = carsWithCategory.length;
    const economy = carsWithCategory.filter((c) => c.category === "economy").length;
    const luxury = carsWithCategory.filter((c) => c.category === "luxury").length;
    const suv = carsWithCategory.filter((c) => c.category === "suv").length;
    return { total, economy, luxury, suv };
  }, [carsWithCategory]);

  // Get filtered cars
  const filteredCars = useMemo(() => {
    if (activeFilter === "all") {
      return carsWithCategory;
    }
    return carsWithCategory.filter((car) => car.category === activeFilter);
  }, [carsWithCategory, activeFilter]);

  // Handle car press
  const handleCarPress = (car: CarWithCategory) => {
    // Navigate to car detail page
    router.push(`/(main)/(no-tabs)/car-detail?carId=${car.id}`);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ/ngày';
  };

  // Render car card
  const renderCarCard = ({ item }: { item: CarWithCategory }) => (
    <Pressable onPress={() => handleCarPress(item)}>
      <View style={styles.carCard}>
        <LinearGradient
          colors={["#ffffff", "#f8fafc"]}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.carImage} />
          
          <View style={styles.carInfo}>
            <View style={styles.carHeader}>
              <Text style={styles.carName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {item.category === "luxury" ? "Cao cấp" : 
                   item.category === "suv" ? "SUV" : "Phổ thông"}
                </Text>
              </View>
            </View>

            <View style={styles.carDetails}>
              <View style={styles.detailRow}>
                <MapPin size={14} color="#6b7280" strokeWidth={2} />
                <Text style={styles.detailText}>{item.location}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Users size={14} color="#6b7280" strokeWidth={2} />
                <Text style={styles.detailText}>{item.seats} chỗ</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Fuel size={14} color="#6b7280" strokeWidth={2} />
                <Text style={styles.detailText}>{item.fuel}</Text>
              </View>
            </View>

            <View style={styles.carFooter}>
              <View style={styles.ratingContainer}>
                <Star size={16} color="#fbbf24" fill="#fbbf24" strokeWidth={2} />
                <Text style={styles.ratingText}>{item.rating}</Text>
                <Text style={styles.rentalCount}>
                  ({item.totalRentalCount || 0} lượt thuê)
                </Text>
              </View>
              
              <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Modern Header with Gradient */}
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
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Danh sách xe</Text>
            <Text style={styles.headerSubtitle}>
              Tìm kiếm xe phù hợp với bạn
            </Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {filteredCars.length}
              </Text>
              <Text style={styles.statLabel}>Xe</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerCurve} />
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm kiếm xe..."
        />
      </View>

      {/* Modern Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          <TouchableOpacity
            style={[styles.tab, activeFilter === "all" && styles.activeTab]}
            onPress={() => setActiveFilter("all")}
          >
            <View style={styles.tabContent}>
              <Car
                size={16}
                color={activeFilter === "all" ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  activeFilter === "all" && styles.activeTabText,
                ]}
              >
                Tất cả ({stats.total})
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeFilter === "economy" && styles.activeTab]}
            onPress={() => setActiveFilter("economy")}
          >
            <View style={styles.tabContent}>
              <Settings
                size={16}
                color={activeFilter === "economy" ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  activeFilter === "economy" && styles.activeTabText,
                ]}
              >
                Phổ thông ({stats.economy})
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeFilter === "suv" && styles.activeTab]}
            onPress={() => setActiveFilter("suv")}
          >
            <View style={styles.tabContent}>
              <Users
                size={16}
                color={activeFilter === "suv" ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  activeFilter === "suv" && styles.activeTabText,
                ]}
              >
                SUV ({stats.suv})
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeFilter === "luxury" && styles.activeTab]}
            onPress={() => setActiveFilter("luxury")}
          >
            <View style={styles.tabContent}>
              <Star
                size={16}
                color={activeFilter === "luxury" ? "#ffffff" : "#6b7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  activeFilter === "luxury" && styles.activeTabText,
                ]}
              >
                Cao cấp ({stats.luxury})
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Cars List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredCars.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Car size={48} color={AppColors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>Không tìm thấy xe</Text>
            <Text style={styles.emptySubtitle}>
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm xe.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredCars}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCarCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.carsList,
              { paddingBottom: tabBarHeight + 100 }
            ]}
          />
        )}
      </ScrollView>

      {modalVisible && selectedFilterType && (
        <FilterModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          filterType={selectedFilterType}
          title={selectedFilterTitle}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
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
  searchContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    marginTop: -25,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 1,
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
    paddingHorizontal: 16,
    paddingTop: 10,
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
  },
  carCard: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
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
});
