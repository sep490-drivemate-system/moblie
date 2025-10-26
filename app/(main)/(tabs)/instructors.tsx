import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";
import { LucideUsers, Search, X, Filter, Star, MapPin } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { Instructor } from "@/models/instructor/instructor.type";
import {
  FilterType,
  DistanceFilter,
  ExperienceLevel,
  MinimumRating,
  SortType,
} from "@/models/instructor/instructor-filter.type";
// import { useInstructorViewModel } from "@/viewmodels/instructor/InstructorViewModel";
// import { useInstructorViewModel } from "../../../viewmodels/instructor/InstructorViewModel";

// Mock data for instructors
const mockInstructors: Instructor[] = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    experience: "5 năm kinh nghiệm",
    experienceYears: 5,
    rating: 4.8,
    price: 350000,
    specialties: ["Lái xe cơ bản", "Lái xe nâng cao", "Đỗ xe song song"],
    phone: "0901234567",
    email: "nguyenvanan@example.com",
    description: "Giảng viên chuyên nghiệp với nhiều năm kinh nghiệm",
    totalBookings: 120,
    gender: "male" as any
  },
  {
    id: "2",
    name: "Trần Thị Bình",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    experience: "8 năm kinh nghiệm",
    experienceYears: 8,
    rating: 4.9,
    price: 400000,
    specialties: ["Lái xe phòng thủ", "Lái xe ban đêm", "Vượt xe an toàn"],
    phone: "0912345678",
    email: "tranthibinh@example.com",
    description: "Chuyên gia đào tạo lái xe an toàn",
    totalBookings: 200,
    gender: "female" as any
  },
  {
    id: "3",
    name: "Lê Minh Cường",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    experience: "3 năm kinh nghiệm",
    experienceYears: 3,
    rating: 4.6,
    price: 300000,
    specialties: ["Lái xe cơ bản", "Qua ngã tư", "Lên xuống dốc"],
    phone: "0923456789",
    email: "leminhcuong@example.com",
    description: "Giảng viên trẻ, nhiệt tình",
    totalBookings: 85,
    gender: "male" as any
  },
  {
    id: "4",
    name: "Phạm Thị Dung",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    experience: "10 năm kinh nghiệm",
    experienceYears: 10,
    rating: 5.0,
    price: 450000,
    specialties: ["Lái xe nâng cao", "Lái xe phòng thủ", "Đào tạo giảng viên"],
    phone: "0934567890",
    email: "phamthidung@example.com",
    description: "Giảng viên cao cấp, chuyên đào tạo nâng cao",
    totalBookings: 300,
    gender: "female" as any
  },
  {
    id: "5",
    name: "Hoàng Văn Em",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    experience: "6 năm kinh nghiệm",
    experienceYears: 6,
    rating: 4.7,
    price: 380000,
    specialties: ["Lái xe ban đêm", "Đường cao tốc", "Chuyển làn"],
    phone: "0945678901",
    email: "hoangvanem@example.com",
    description: "Chuyên gia lái xe đường dài",
    totalBookings: 150,
    gender: "male" as any
  }
];

const initialFilters = {
  availability: FilterType.All,
  distance: DistanceFilter.All,
  experience: ExperienceLevel.All,
  priceRange: [200000, 500000] as [number, number],
  minRating: MinimumRating.All,
};

function InstructorsScreen() {
  const router = useRouter();
  
  // Local state to replace ViewModel
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState(SortType.Rating);
  const [sortAscending, setSortAscending] = useState(false);
  const [allInstructors] = useState(mockInstructors);
  const [filteredInstructors, setFilteredInstructors] = useState(mockInstructors);
  const [displayedInstructors, setDisplayedInstructors] = useState(mockInstructors);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Computed values
  const activeFilterCount = (() => {
    let count = 0;
    if (filters.experience !== ExperienceLevel.All) count++;
    if (filters.priceRange[0] !== 200000 || filters.priceRange[1] !== 500000) count++;
    if (filters.minRating !== MinimumRating.All) count++;
    return count;
  })();
  
  const hasMoreInstructors = displayedInstructors.length < filteredInstructors.length;
  
  // Filter and sort logic
  useEffect(() => {
    let filtered = [...allInstructors];
    
    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(instructor => 
        instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        instructor.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    // Apply filters
    if (filters.experience !== ExperienceLevel.All) {
      const expYears = parseInt(filters.experience.split('-')[0]) || 0;
      filtered = filtered.filter(instructor => instructor.experienceYears >= expYears);
    }
    
    if (filters.minRating !== MinimumRating.All) {
      const minRating = parseFloat(filters.minRating.replace('+', ''));
      filtered = filtered.filter(instructor => instructor.rating >= minRating);
    }
    
    // Apply price range
    filtered = filtered.filter(instructor => 
      instructor.price >= filters.priceRange[0] && instructor.price <= filters.priceRange[1]
    );
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case SortType.Rating:
          comparison = a.rating - b.rating;
          break;
        case SortType.Price:
          comparison = a.price - b.price;
          break;
        case SortType.Experience:
          comparison = a.experienceYears - b.experienceYears;
          break;
        default:
          comparison = 0;
      }
      return sortAscending ? comparison : -comparison;
    });
    
    setFilteredInstructors(filtered);
    setDisplayedInstructors(filtered);
  }, [searchQuery, filters, sortBy, sortAscending, allInstructors]);
  
  // Action handlers
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };
  
  const handleTempFilterChange = (newTempFilters: typeof tempFilters) => {
    setTempFilters(newTempFilters);
  };
  
  const handleResetFilters = () => {
    setFilters(initialFilters);
    setTempFilters(initialFilters);
  };
  
  const handleApplyTempFilters = () => {
    setFilters(tempFilters);
    setShowFilterModal(false);
  };
  
  const handleSortChange = (sortType: SortType) => {
    if (sortBy === sortType) {
      setSortAscending(!sortAscending);
    } else {
      setSortBy(sortType);
      setSortAscending(false);
    }
  };
  
  const handleShowFilterModal = (show: boolean) => {
    setShowFilterModal(show);
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  const loadMoreInstructors = () => {
    // Mock load more functionality
    console.log('Load more instructors');
  };
  
  const setError = (error: string | null) => {
    setErrorMessage(error);
  };

  const handleInstructorPress = (instructor: Instructor) => {
    router.push({
      pathname: "/instructor-detail",
      params: { instructorId: instructor.id },
    });
  };

  const renderInstructorCard = ({ item }: { item: Instructor }) => (
    <TouchableOpacity
      style={styles.instructorCard}
      onPress={() => handleInstructorPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Avatar bên trái */}
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        
        {/* Thông tin chính ở giữa */}
        <View style={styles.mainInfo}>
          <Text style={styles.instructorName}>{item.name}</Text>
          <Text style={styles.experience}>{item.experience}</Text>
          <Text style={styles.price}>{item.price.toLocaleString()}đ/giờ</Text>
        </View>
        
        {/* Thông tin phụ bên phải */}
        <View style={styles.rightInfo}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          <Text style={styles.bookings}>({item.totalBookings} đặt)</Text>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => handleInstructorPress(item)}
          >
            <Text style={styles.detailButtonText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLoadingFooter = () => {
    if (!isLoading || !hasMoreInstructors) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#70E000" />
        <Text style={styles.loadingText}>Đang tải thêm...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <LucideUsers size={64} color={AppColors.gray300} />
      <Text style={styles.emptyTitle}>Không tìm thấy giảng viên</Text>
      <Text style={styles.emptySubtitle}>
        Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
      </Text>
      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetFilters}
      >
        <Text style={styles.resetButtonText}>Đặt lại bộ lọc</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
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

      {/* Search Container */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color={AppColors.gray400} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm giảng viên..."
            placeholderTextColor={AppColors.gray400}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange("")}>
              <X size={20} color={AppColors.gray400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => handleShowFilterModal(true)}
          >
            <Filter size={16} color={AppColors.gray600} strokeWidth={2} />
            <Text style={styles.filterButtonText}>Bộ lọc</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              sortBy === SortType.Rating && styles.filterButtonActive,
            ]}
            onPress={() => handleSortChange(SortType.Rating)}
          >
            <Text
              style={[
                styles.filterButtonText,
                sortBy === SortType.Rating && styles.filterButtonTextActive,
              ]}
            >
              Đánh giá {sortBy === SortType.Rating && (sortAscending ? "↑" : "↓")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              sortBy === SortType.Price && styles.filterButtonActive,
            ]}
            onPress={() => handleSortChange(SortType.Price)}
          >
            <Text
              style={[
                styles.filterButtonText,
                sortBy === SortType.Price && styles.filterButtonTextActive,
              ]}
            >
              Giá thuê {sortBy === SortType.Price && (sortAscending ? "↑" : "↓")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              sortBy === SortType.Experience && styles.filterButtonActive,
            ]}
            onPress={() => handleSortChange(SortType.Experience)}
          >
            <Text
              style={[
                styles.filterButtonText,
                sortBy === SortType.Experience && styles.filterButtonTextActive,
              ]}
            >
              Kinh nghiệm {sortBy === SortType.Experience && (sortAscending ? "↑" : "↓")}
            </Text>
          </TouchableOpacity>

          {activeFilterCount > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleResetFilters}
            >
              <Text style={styles.clearButtonText}>✕ Xóa</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => handleShowFilterModal(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Bộ lọc</Text>
            <TouchableOpacity onPress={handleApplyTempFilters}>
              <Text style={styles.modalApplyButton}>Áp dụng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Experience Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Kinh nghiệm</Text>
              <View style={styles.optionGrid}>
                {[
                  ExperienceLevel.All,
                  ExperienceLevel.OneToThree,
                  ExperienceLevel.ThreeToFive,
                  ExperienceLevel.FiveToTen,
                  ExperienceLevel.TenPlus,
                ].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      tempFilters.experience === option &&
                        styles.optionButtonActive,
                    ]}
                    onPress={() =>
                      handleTempFilterChange({ ...tempFilters, experience: option })
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        tempFilters.experience === option &&
                          styles.optionTextActive,
                      ]}
                    >
                      {option === ExperienceLevel.All
                        ? "Tất cả"
                        : option === ExperienceLevel.TenPlus
                        ? "10+ năm"
                        : `${option} năm`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rating Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Đánh giá tối thiểu</Text>
              <View style={styles.optionGrid}>
                {[
                  MinimumRating.All,
                  MinimumRating.ThreePlus,
                  MinimumRating.FourPlus,
                  MinimumRating.FourPointFivePlus,
                  MinimumRating.Five,
                ].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.optionButton,
                      tempFilters.minRating === rating &&
                        styles.optionButtonActive,
                    ]}
                    onPress={() =>
                      handleTempFilterChange({ ...tempFilters, minRating: rating })
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        tempFilters.minRating === rating &&
                          styles.optionTextActive,
                      ]}
                    >
                      {rating === MinimumRating.All ? "Tất cả" : `${rating.replace('+', '')}⭐+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Reset Filters */}
            <View style={styles.filterSection}>
              <TouchableOpacity
                style={styles.resetFiltersButton}
                onPress={handleResetFilters}
              >
                <Text style={styles.resetFiltersText}>Đặt lại</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Instructor List */}
      <FlatList
        data={displayedInstructors}
        renderItem={renderInstructorCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#70E000"]}
            tintColor="#70E000"
          />
        }
        onEndReached={loadMoreInstructors}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderLoadingFooter}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Error Message */}
      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.dismissError}>Đóng</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
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
  headerContent: {
    zIndex: 2,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
    zIndex: 2,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
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
  headerTextContainer: {
    flex: 1,
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
  premiumHeaderSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "400",
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
    backgroundColor: AppColors.gray50,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: AppColors.textPrimary,
  },
  filterBar: {
    backgroundColor: AppColors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    backgroundColor: AppColors.white,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: "#70E000",
    borderColor: "#70E000",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.gray600,
  },
  filterButtonTextActive: {
    color: AppColors.white,
  },
  filterBadge: {
    backgroundColor: AppColors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.white,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: AppColors.error,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.white,
  },
  listContainer: {
    padding: 20,
    gap: 20,
  },
  instructorCard: {
    backgroundColor: AppColors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  mainInfo: {
    flex: 1,
    justifyContent: "flex-start",
    paddingRight: 8,
  },
  rightInfo: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 64,
    paddingLeft: 8,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 6,
    lineHeight: 24,
  },
  experience: {
    fontSize: 14,
    color: AppColors.gray600,
    marginBottom: 6,
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#70E000",
    lineHeight: 22,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.textPrimary,
  },
  bookings: {
    fontSize: 12,
    color: AppColors.gray500,
    marginBottom: 10,
    lineHeight: 16,
  },
  specialtiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  specialtyTag: {
    backgroundColor: AppColors.gray50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyText: {
    fontSize: 12,
    color: AppColors.gray600,
    fontWeight: "500",
  },
  moreSpecialties: {
    fontSize: 12,
    color: AppColors.gray500,
    fontStyle: "italic",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailButton: {
    backgroundColor: "#70E000",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    minWidth: 70,
    alignItems: "center",
  },
  detailButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.white,
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
    color: AppColors.gray500,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: AppColors.gray500,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: "#70E000",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  modalCloseButton: {
    fontSize: 24,
    color: AppColors.gray500,
    fontWeight: "300",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.textPrimary,
  },
  modalApplyButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#70E000",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    backgroundColor: AppColors.white,
  },
  optionButtonActive: {
    backgroundColor: "#70E000",
    borderColor: "#70E000",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.gray600,
  },
  optionTextActive: {
    color: AppColors.white,
  },
  resetFiltersButton: {
    backgroundColor: AppColors.gray100,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  resetFiltersText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.gray600,
  },
  errorContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: AppColors.error,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    flex: 1,
    color: AppColors.white,
    fontWeight: "500",
  },
  dismissError: {
    color: AppColors.white,
    fontWeight: "600",
    marginLeft: 12,
  },
});

export default InstructorsScreen;
