import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "react-native";
import { LucideUsers, Search, X, Star } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { IInstructors } from "@/models/instructor/instructor.type";
import {
  FilterType,
  ExperienceLevel,
  MinimumRating,
  SortType,
} from "@/models/instructor/instructor-filter.type";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { InstructorViewModel } from "@/viewmodels/instructor/InstructorViewModel";
import { setFilteredInstructors, setDisplayedInstructors } from "@/features/instructor/instructorSlice";

const initialFilters = {
  availability: FilterType.All,
  experience: ExperienceLevel.All,
  minRating: MinimumRating.All,
};

function InstructorsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const instructorState = useAppSelector((state) => state.instructor);
  
  // Initialize ViewModel
  const instructorViewModel = useMemo(
    () => new InstructorViewModel(dispatch, () => instructorState),
    [dispatch, instructorState]
  );

  // Get data from Redux state
  const {
    allInstructors,
    filteredInstructors,
    displayedInstructors,
    searchQuery,
    filters,
    sortBy,
    sortAscending,
    isRefreshing,
    isLoading,
    errorMessage,
  } = instructorState;
  
  
  const hasMoreInstructors = displayedInstructors.length < filteredInstructors.length;
  
  // Fetch instructors on mount
  useEffect(() => {
    instructorViewModel.fetchInstructors();
  }, []);

  // Client-side filtering and sorting
  useEffect(() => {
    if (allInstructors.length === 0) return;

    let filtered = [...allInstructors];

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(instructor =>
        instructor.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.experience !== ExperienceLevel.All) {
      const expYears = parseInt(filters.experience.split('-')[0]) || 0;
      filtered = filtered.filter(instructor => {
        const instructorYears = parseInt(instructor.experienceYear.split(' ')[0]) || 0;
        return instructorYears >= expYears;
      });
    }

    if (filters.minRating !== MinimumRating.All) {
      const minRating = parseFloat(filters.minRating.replace('+', ''));
      filtered = filtered.filter(instructor => instructor.averageRating >= minRating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case SortType.Rating:
          comparison = a.averageRating - b.averageRating;
          break;
        case SortType.Experience:
          const aYears = parseInt(a.experienceYear.split(' ')[0]) || 0;
          const bYears = parseInt(b.experienceYear.split(' ')[0]) || 0;
          comparison = aYears - bYears;
          break;
        case SortType.Price:
          comparison = a.packageCount - b.packageCount;
          break;
        default:
          comparison = 0;
      }

      return sortAscending ? comparison : -comparison;
    });

    // Update Redux state
    instructorViewModel.updateFilters(filters);
    dispatch(setFilteredInstructors(filtered));
    dispatch(setDisplayedInstructors(filtered));
  }, [searchQuery, filters, sortBy, sortAscending, allInstructors]);
  
  // Action handlers
  const handleSearchChange = (query: string) => {
    instructorViewModel.updateSearchQuery(query);
  };
  
  const handleResetFilters = () => {
    instructorViewModel.resetAllFilters();
  };
  
  const handleSortChange = (sortType: SortType) => {
    instructorViewModel.updateSort(sortType);
  };
  
  const handleRefresh = async () => {
    await instructorViewModel.refreshInstructors();
  };
  
  const loadMoreInstructors = () => {
    // Mock load more functionality
   // console.log('Load more instructors');
  };

  const handleInstructorPress = (instructor: IInstructors) => {
    router.push({
      pathname: "/instructor-detail",
      params: { 
        instructorId: instructor.id,
        instructorData: JSON.stringify(instructor)
      },
    });
  };

  const renderInstructorCard = ({ item }: { item: IInstructors }) => (
    <TouchableOpacity
      style={styles.instructorCard}
      onPress={() => handleInstructorPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      
        <View style={styles.mainInfo}>
          <Text style={styles.instructorName}>{item.fullName}</Text>
          <Text style={styles.experience}>{item.experienceYear} năm kinh nghiệm</Text>
          <Text style={styles.packages}>{item.packageCount} gói thuê</Text>
        </View>
        
        <View style={styles.rightInfo}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.rating}>{item.averageRating}</Text>
          </View>
          <Text style={styles.bookings}>({item.bookingCount} lượt đặt)</Text>
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
    if (!hasMoreInstructors) return null;
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
      <Text style={styles.emptyTitle}>Không tìm thấy người hướng dẫn</Text>
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

      {/* Search Container */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color={AppColors.gray500} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm giảng viên..."
            placeholderTextColor={AppColors.gray500}
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
      {/* <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >

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
              Số gói {sortBy === SortType.Price && (sortAscending ? "↑" : "↓")}
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

          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleResetFilters}
          >
            <Text style={styles.clearButtonText}>✕ Đặt lại</Text>
          </TouchableOpacity>
        </ScrollView>
      </View> */}


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
          <TouchableOpacity onPress={() => instructorViewModel.clearErrorMessage()}>
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
  searchContainer: {
    backgroundColor: AppColors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  packages: {
    fontSize: 14,
    fontWeight: "600",
    color: "#70E000",
    lineHeight: 20,
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
