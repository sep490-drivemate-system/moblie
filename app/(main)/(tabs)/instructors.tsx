import React, { useState, useEffect } from "react";
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
import { useRouter, useFocusEffect } from "expo-router";
import { Image } from "react-native";
import { LucideUsers, Search, X, Star } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { IInstructors } from "@/models/instructor/instructor.type";
import {
  SortType,
  SortOrder,
} from "@/models/instructor/instructor-filter.type";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { InstructorViewModel } from "@/viewmodels/instructor/InstructorViewModel";
import { setFilteredInstructors, setDisplayedInstructors, setSortBy, setSortAscending } from "@/features/instructor/instructorSlice";
import HeaderList from "@/components/Commons/HeaderList";
import SearchBar from "@/components/Commons/SearchBar";
import TabFilter from "@/components/Commons/TabFilter";
import { ROUTES } from "@/constants/routes";
import { UserRole } from "@/models/enum/UserRole.enum";
import { RootState } from "@/lib/redux/store";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";


function InstructorsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userRole = useAppSelector((state: RootState) => state.auth.user?.role ?? null);

  const [instructorState, instructorViewModel] = useViewModel(
    InstructorViewModel,
    (state) => state.instructor
  );

  // Get data from Redux state
  const {
    allInstructors,
    displayedInstructors,
    searchQuery,
    filters,
    sortBy,
    sortAscending,
    isRefreshing,
    isLoading,
    errorMessage,
    pagination,
  } = instructorState;

  // Local search state để debounce
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  // Pagination helpers
  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);
  const hasMorePages = pagination.currentPage < totalPages;

  // Chỉ fetch instructors khi tab được focus và user là NoviceDriver
  useFocusEffect(
    React.useCallback(() => {
      if (userRole === UserRole.NoviceDriver) {
        instructorViewModel.fetchInstructors();
      }
    }, [userRole, instructorViewModel])
  );

  // Sync localSearchQuery với searchQuery từ Redux khi component mount
  useEffect(() => {
    if (searchQuery && !localSearchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        // Gọi API backend với SearchKey parameter
        instructorViewModel.searchInstructors(localSearchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  useEffect(() => {
    if (allInstructors.length === 0) return;
    let sorted = [...allInstructors];

    // Sort by Experience or Rating
    if (sortBy === SortType.Experience) {
      sorted.sort((a, b) => {
        const aYears = parseInt(a.experienceYear) || 0;
        const bYears = parseInt(b.experienceYear) || 0;
        return sortAscending ? aYears - bYears : bYears - aYears;
      });
    } else if (sortBy === SortType.Rating) {
      sorted.sort((a, b) => {
        return sortAscending
          ? a.averageRating - b.averageRating
          : b.averageRating - a.averageRating;
      });
    }

    dispatch(setFilteredInstructors(sorted));
    dispatch(setDisplayedInstructors(sorted));
  }, [sortBy, sortAscending, allInstructors, dispatch]);

  // Action handlers
  const handleSearchChange = (query: string) => {
    setLocalSearchQuery(query);
    instructorViewModel.updateSearchQuery(query);
  };

  const handleSortChange = (value: string) => {
    if (value === 'exp') {
      if (sortBy === SortType.Experience) {
        // Nếu đang sort theo kinh nghiệm, toggle giữa tăng/giảm
        dispatch(setSortAscending(!sortAscending));
      } else {
        // Nếu chưa sort theo kinh nghiệm, bắt đầu với tăng dần
        dispatch(setSortBy(SortType.Experience));
        dispatch(setSortAscending(true));
      }
    } else if (value === 'rating') {
      if (sortBy === SortType.Rating) {
        // Nếu đang sort theo rating, toggle giữa tăng/giảm
        dispatch(setSortAscending(!sortAscending));
      } else {
        // Nếu chưa sort theo rating, bắt đầu với tăng dần
        dispatch(setSortBy(SortType.Rating));
        dispatch(setSortAscending(true));
      }
    }
  };


  const handleResetFilters = () => {
    instructorViewModel.resetAllFilters();
  };

  const handleRefresh = async () => {
    await instructorViewModel.refreshInstructors();
  };

  // Infinite scroll - load more và append data
  const loadMoreInstructors = () => {
    if (hasMorePages && !isLoading) {
      instructorViewModel.loadMoreInstructors();
    }
  };



  const renderInstructorCard = ({ item }: { item: IInstructors }) => (
    <View style={styles.instructorCard}>
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
          <Text style={styles.bookings}>({item.bookingCount} lượt thuê)</Text>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => router.push({
              pathname: ROUTES.INSTRUCTOR_DETAIL,
              params: {
                instructorId: item.id,
              },
            })}
          >
            <Text style={styles.detailButtonText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderLoadingFooter = () => {
    if (!hasMorePages) return null;
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
      <HeaderList title="Danh sách người hướng dẫn" />
      {/* <SearchBar
        value={localSearchQuery}
        onChangeText={handleSearchChange}
        placeholder="Tìm kiếm người hướng dẫn..."
      />


      <TabFilter
        options={[
          {
            value: 'exp',
            label: sortBy === SortType.Experience
              ? (sortAscending ? 'Kinh nghiệm ↑' : 'Kinh nghiệm ↓')
              : 'Kinh nghiệm'
          },
          {
            value: 'rating',
            label: sortBy === SortType.Rating
              ? (sortAscending ? 'Đánh giá ↑' : 'Đánh giá ↓')
              : 'Đánh giá'
          },
        ]}
        activeValue={sortBy === SortType.Experience ? 'exp' : sortBy === SortType.Rating ? 'rating' : ''}
        onSelect={handleSortChange}
        showCount={false}
      /> */}
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
        // Infinite scroll pagination
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
    backgroundColor: AppColors.backgroundLight,
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.gray200,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 10,
    marginLeft: 20,
    marginTop: 4,
  },
  tabFilterContainer: {
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
    paddingTop: 0,
    paddingBottom: 0,
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
