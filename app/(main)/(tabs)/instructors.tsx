import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  FlatList,
  Modal,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { LucideUsers, Search, X } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import {
  instructorsData,
  getInstructorsByExperienceRange,
  sortInstructorsByRating,
  sortInstructorsByPrice,
  sortInstructorsByExperience,
} from "../../../data/instructors_data";
import { IInstructor } from "@/models/instructor/instructor";

type FilterType = "all" | "available" | "busy";
type DistanceFilter = "all" | "1-3" | "3-5" | "5-10" | "10+";
type ExperienceFilter = "all" | "1-3" | "3-5" | "5-10" | "10+";
type SortType = "rating" | "bookings" | "price" | "distance" | "experience";

interface FilterState {
  availability: FilterType;
  distance: DistanceFilter;
  experience: ExperienceFilter;
  priceRange: [number, number];
  minRating: number;
}

function InstructorsScreen() {
  const router = useRouter();

  // Modern filter state
  const [filters, setFilters] = useState<FilterState>({
    availability: "all",
    distance: "all",
    experience: "all",
    priceRange: [200000, 500000],
    minRating: 0,
  });
  const [sortBy, setSortBy] = useState<SortType>("rating");
  const [sortAscending, setSortAscending] = useState(false);
  const [instructorsWithDistance, setInstructorsWithDistance] =
    useState<IInstructor[]>(instructorsData);
  const [filteredInstructors, setFilteredInstructors] =
    useState<IInstructor[]>(instructorsData);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  useEffect(() => {
    applyFiltersAndSort();
  }, [filters, sortBy, sortAscending, instructorsWithDistance, searchQuery]);

  const applyFiltersAndSort = () => {
    let filtered = [...instructorsWithDistance];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (instructor) =>
          instructor.name.toLowerCase().includes(query) ||
          instructor.specialties.some((s) => s.toLowerCase().includes(query)) ||
          instructor.description.toLowerCase().includes(query)
      );
    }

    // Apply experience filter
    if (filters.experience !== "all") {
      switch (filters.experience) {
        case "1-3":
          filtered = getInstructorsByExperienceRange(filtered, 1, 3);
          break;
        case "3-5":
          filtered = getInstructorsByExperienceRange(filtered, 3, 5);
          break;
        case "5-10":
          filtered = getInstructorsByExperienceRange(filtered, 5, 10);
          break;
        case "10+":
          filtered = filtered.filter(
            (instructor) => instructor.experienceYears > 10
          );
          break;
      }
    }

    // Apply price range filter
    filtered = filtered.filter(
      (instructor) =>
        instructor.pricePerHour >= filters.priceRange[0] &&
        instructor.pricePerHour <= filters.priceRange[1]
    );

    // Apply minimum rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(
        (instructor) => instructor.rating >= filters.minRating
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "rating":
        filtered = sortInstructorsByRating(filtered, sortAscending);
        break;
      case "price":
        filtered = sortInstructorsByPrice(filtered, sortAscending);
        break;
      case "experience":
        filtered = sortInstructorsByExperience(filtered, sortAscending);
        break;
    }

    setFilteredInstructors(filtered);
  };

  // Helper functions for modern filter system
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.experience !== "all") count++;
    if (filters.priceRange[0] !== 200000 || filters.priceRange[1] !== 500000)
      count++;
    if (filters.minRating > 0) count++;
    return count;
  };

  const clearAllFilters = () => {
    setFilters({
      availability: "all",
      distance: "all",
      experience: "all",
      priceRange: [200000, 500000],
      minRating: 0,
    });
  };

  const applyTempFilters = () => {
    setFilters(tempFilters);
    setShowFilterModal(false);
  };

  const handleInstructorPress = (instructor: IInstructor) => {
    Alert.alert(
      `${instructor.name}`,
      `⭐ Rating: ${instructor.rating}/5 (${instructor.totalBookings} bookings)
💰 Pricing: ${instructor.pricing}
📚 Experience: ${instructor.experience}
📱 Phone: ${instructor.phone}
📧 Email: ${instructor.email}

🎯 Specialties:
${instructor.specialties.join(", ")}

📝 ${instructor.description}`,
      [
        { text: "Close", style: "cancel" },
        {
          text: "Call Now",
          onPress: () =>
            Alert.alert("Calling...", `Calling ${instructor.phone}`),
        },
      ]
    );
  };

  const renderInstructorCard = ({ item }: { item: IInstructor }) => (
    <TouchableOpacity
      style={styles.instructorCard}
      onPress={() => handleInstructorPress(item)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.instructorAvatar} />
      </View>

      <View style={styles.instructorInfo}>
        <View style={styles.headerRow}>
          <Text style={styles.instructorName}>
            {item.name} ({item.experienceYears} năm)
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.bookingsText}>{item.totalBookings} lượt đặt</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.instructorPrice}>{item.pricing}</Text>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() =>
              router.push({
                pathname: "/(main)/(no-tabs)/instructor-detail",
                params: { instructorId: item.id },
              })
            }
          >
            <Text style={styles.detailButtonText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.modernHeader}>
        <LinearGradient
          colors={[
            AppColors.gradientStart,
            AppColors.gradientMiddle,
            AppColors.gradientEnd,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Decorative Circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />
        </LinearGradient>

        {/* Glass Overlay */}
        <View style={styles.glassOverlay} />

        {/* Header Content */}
        <View style={styles.headerContent}>
          {/* Top Row */}
          <View style={styles.headerTopRow}>
            <View style={styles.headerLeft}>
              {/* Icon Container */}
              <View style={styles.iconContainer}>
                <LucideUsers
                  size={24}
                  color={AppColors.white}
                  strokeWidth={2.5}
                />
              </View>

              <View style={styles.headerTextContainer}>
                <Text style={styles.premiumHeaderTitle}>Người hướng dẫn</Text>
                <View style={styles.subtitleRow}>
                  <Text style={styles.premiumHeaderSubtitle}>
                    Tìm người hướng dẫn chuyên nghiệp
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color={AppColors.gray400} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm người hướng dẫn..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={20} color={AppColors.gray400} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.modernFilterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              setTempFilters(filters);
              setShowFilterModal(true);
            }}
          >
            <Text style={styles.filterButtonText}>🔍 Bộ lọc</Text>
            {getActiveFilterCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {getActiveFilterCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              sortBy === "rating" && styles.filterButtonActive,
            ]}
            onPress={() => {
              if (sortBy === "rating") {
                setSortAscending(!sortAscending);
              } else {
                setSortBy("rating");
                setSortAscending(false);
              }
            }}
          >
            <Text
              style={[
                styles.filterButtonText,
                sortBy === "rating" && styles.filterButtonTextActive,
              ]}
            >
              ⭐ Đánh giá {sortBy === "rating" && (sortAscending ? "↑" : "↓")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              sortBy === "price" && styles.filterButtonActive,
            ]}
            onPress={() => {
              if (sortBy === "price") {
                setSortAscending(!sortAscending);
              } else {
                setSortBy("price");
                setSortAscending(true);
              }
            }}
          >
            <Text
              style={[
                styles.filterButtonText,
                sortBy === "price" && styles.filterButtonTextActive,
              ]}
            >
              💰 Giá tiền {sortBy === "price" && (sortAscending ? "↑" : "↓")}
            </Text>
          </TouchableOpacity>

          {getActiveFilterCount() > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearButtonText}>✕ Xóa</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Results Count */}
      {searchQuery.length > 0 && (
        <View style={styles.resultsCount}>
          <Text style={styles.resultsCountText}>
            Tìm thấy {filteredInstructors.length} kết quả
          </Text>
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Lọc Người hướng dẫn</Text>
            <TouchableOpacity onPress={applyTempFilters}>
              <Text style={styles.modalApplyButton}>Áp dụng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Experience Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Kinh nghiệm</Text>
              <View style={styles.optionGrid}>
                {(
                  ["all", "1-3", "3-5", "5-10", "10+"] as ExperienceFilter[]
                ).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      tempFilters.experience === option &&
                        styles.optionButtonActive,
                    ]}
                    onPress={() =>
                      setTempFilters({ ...tempFilters, experience: option })
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        tempFilters.experience === option &&
                          styles.optionTextActive,
                      ]}
                    >
                      {option === "all"
                        ? "Tất cả"
                        : option === "10+"
                        ? "10+ năm"
                        : `${option} năm`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rating Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Đánh giá</Text>
              <View style={styles.optionGrid}>
                {[0, 3, 4, 4.5, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.optionButton,
                      tempFilters.minRating === rating &&
                        styles.optionButtonActive,
                    ]}
                    onPress={() =>
                      setTempFilters({ ...tempFilters, minRating: rating })
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        tempFilters.minRating === rating &&
                          styles.optionTextActive,
                      ]}
                    >
                      {rating === 0 ? "Tất cả" : `${rating}⭐+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Khoảng giá</Text>
              <View style={styles.priceRangeContainer}>
                <Text style={styles.priceLabel}>
                  {tempFilters.priceRange[0].toLocaleString()}đ -{" "}
                  {tempFilters.priceRange[1].toLocaleString()}đ
                </Text>
                <View style={styles.priceButtons}>
                  {[
                    [200000, 300000],
                    [300000, 400000],
                    [400000, 500000],
                    [200000, 500000],
                  ].map(([min, max], index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.priceButton,
                        tempFilters.priceRange[0] === min &&
                          tempFilters.priceRange[1] === max &&
                          styles.priceButtonActive,
                      ]}
                      onPress={() =>
                        setTempFilters({
                          ...tempFilters,
                          priceRange: [min, max],
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.priceButtonText,
                          tempFilters.priceRange[0] === min &&
                            tempFilters.priceRange[1] === max &&
                            styles.priceButtonTextActive,
                        ]}
                      >
                        {index === 3
                          ? "Tất cả"
                          : `${min / 1000}k-${max / 1000}k`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Results Count */}

      {/* Instructor List */}
      <FlatList
        data={filteredInstructors}
        renderItem={renderInstructorCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.instructorsList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Không tìm thấy giảng viên</Text>
            <Text style={styles.emptySubtext}>
              Hãy thử điều chỉnh bộ lọc hoặc mở rộng phạm vi tìm kiếm
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    backgroundColor: "#ffffff",
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    zIndex: 2,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchContainer: {
    backgroundColor: AppColors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.gray100,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: AppColors.gray800,
    padding: 0,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a202c",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "500",
    lineHeight: 20,
  },
  headerRight: {
    alignItems: "center",
  },
  statsContainer: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 80,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statsNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 26,
  },
  statsLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "600",
    textAlign: "left",
  },

  // Modern Header Styles
  modernHeader: {
    position: "relative",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  // Decorative Elements
  decorativeCircle1: {
    display: "none",
  },

  decorativeCircle2: {
    display: "none",
  },

  decorativeCircle3: {
    display: "none",
  },

  glassOverlay: {
    display: "none",
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
    zIndex: 2,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  premiumHeaderTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: AppColors.white,
    marginBottom: 4,
  },

  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.success,
    marginRight: 8,
  },

  premiumHeaderSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "400",
  },

  headerActions: {
    alignItems: "center",
  },

  premiumNotificationButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  notificationGlow: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -6,
    left: -6,
  },

  notificationIcon: {
    fontSize: 22,
  },

  premiumNotificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },

  premiumStatsCard: {
    flex: 1,
    position: "relative",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 14,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },

  statsGlowEffect: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  statsShimmer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },

  statsIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  statsIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  statsIcon: {
    fontSize: 18,
  },

  statsTextContainer: {
    flex: 1,
  },

  filterContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButton: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  filterButtonActive: {
    backgroundColor: AppColors.active,
    borderColor: AppColors.active,
  },
  filterButtonText: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  calloutContainer: {
    padding: 10,
    minWidth: 150,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d4150",
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 2,
  },
  myLocationButton: {
    position: "absolute",
    bottom: 20,
    left: 10,
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  myLocationText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  legend: {
    position: "absolute",
    top: 20,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2d4150",
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 10,
    color: "#6c757d",
  },
  instructorCardsContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 8,
    maxHeight: 140,
  },
  instructorCardsList: {
    paddingHorizontal: 8,
  },
  instructorCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  instructorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  instructorInfo: {
    flex: 1,
    justifyContent: "center",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  bookingsText: {
    fontSize: 12,
    color: "#6c757d",
    marginLeft: 8,
  },
  distanceText: {
    fontSize: 12,
    color: "#007bff",
    marginBottom: 4,
  },
  instructorName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 0,
    letterSpacing: -0.2,
    flex: 1,
  },
  instructorRating: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 4,
  },
  instructorPrice: {
    fontSize: 16,
    color: "#38a169",
    fontWeight: "700",
    marginBottom: 0,
  },
  availabilityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  availabilityText: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  // Tracking styles (like Grab)
  trackingButton: {
    position: "absolute",
    bottom: 80,
    left: 10,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  trackingButtonActive: {
    backgroundColor: "#FF3B30",
  },
  trackingText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  trackingTextActive: {
    color: "#ffffff",
  },
  trackingInfo: {
    position: "absolute",
    top: 80,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 8,
    padding: 8,
    minWidth: 120,
  },
  trackingInfoText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 2,
  },
  // User location marker styles
  userLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    borderWidth: 3,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  userLocationMarkerTracking: {
    backgroundColor: "#FF3B30",
    borderColor: "#ffffff",
  },
  userLocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  userLocationArrow: {
    position: "absolute",
    top: -15,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FF3B30",
  },
  // New styles for list view
  sortContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  sortButton: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  sortButtonActive: {
    backgroundColor: "#28a745",
    borderColor: "#28a745",
  },
  sortText: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "500",
  },
  sortTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  refreshLocationButton: {
    backgroundColor: "#4299e1",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#4299e1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshLocationText: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "700",
  },
  instructorsList: {
    paddingVertical: 4,
    paddingBottom: 20,
  },
  separator: {
    height: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#475569",
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  // Modern UI styles
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
    marginLeft: 4,
  },
  filterChip: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
    shadowColor: "#007bff",
    shadowOpacity: 0.3,
  },
  filterChipText: {
    fontSize: 13,
    color: "#6c757d",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
    marginLeft: 4,
  },
  sortChip: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sortChipActive: {
    backgroundColor: "#28a745",
    borderColor: "#28a745",
    shadowColor: "#28a745",
    shadowOpacity: 0.3,
  },
  sortChipText: {
    fontSize: 13,
    color: "#6c757d",
    fontWeight: "500",
  },
  sortChipTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  // Enhanced instructor card styles
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingContainer: {
    backgroundColor: "#fff3cd",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#856404",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  experienceText: {
    fontSize: 12,
    color: "#6f42c1",
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailButton: {
    backgroundColor: AppColors.active,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: AppColors.active,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  detailButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  // Modern Filter System Styles
  modernFilterBar: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  modernFilterButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4299e1",
  },
  filterBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#e53e3e",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  clearButton: {
    backgroundColor: AppColors.error,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  resultsCount: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  resultsCountText: {
    fontSize: 13,
    color: AppColors.success,
    fontWeight: "600",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalCloseButton: {
    fontSize: 24,
    fontWeight: "600",
    color: "#6b7280",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a202c",
  },
  modalApplyButton: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.active,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 16,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionButton: {
    backgroundColor: "#f7fafc",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    minWidth: 80,
    alignItems: "center",
  },
  optionButtonActive: {
    backgroundColor: AppColors.active,
    borderColor: AppColors.active,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a5568",
  },
  optionTextActive: {
    color: "#ffffff",
  },
  priceRangeContainer: {
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 16,
    textAlign: "center",
  },
  priceButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  priceButton: {
    backgroundColor: "#f7fafc",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    minWidth: 80,
    alignItems: "center",
  },
  priceButtonActive: {
    backgroundColor: AppColors.active,
    borderColor: AppColors.active,
  },
  priceButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a5568",
  },
  priceButtonTextActive: {
    color: "#ffffff",
  },
});

export default InstructorsScreen;
