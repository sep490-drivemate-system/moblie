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
import { LucideUsers, Search, X, Star, Filter } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { IInstructors } from "@/models/instructor/instructor.type";
import {
  SortType,
  SortOrder,
} from "@/models/instructor/instructor-filter.type";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { InstructorViewModel } from "@/viewmodels/instructor/InstructorViewModel";
import {
  setFilteredInstructors,
  setDisplayedInstructors,
  setSortBy,
  setSortAscending,
} from "@/features/instructor/instructorSlice";
import HeaderList from "@/components/Commons/HeaderList";
import SearchBar from "@/components/Commons/SearchBar";
import { ROUTES } from "@/constants/routes";
import { UserRole } from "@/models/enum/UserRole.enum";
import { RootState } from "@/lib/redux/store";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";

function InstructorsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userRole = useAppSelector(
    (state: RootState) => state.auth.user?.role ?? null
  );

  const [instructorState, instructorViewModel] = useViewModel(
    InstructorViewModel,
    (state) => state.instructor
  );

  const {
    allInstructors,
    displayedInstructors,
    searchQuery,
    sortBy,
    sortAscending,
    isRefreshing,
    isLoading,
    errorMessage,
    pagination,
  } = instructorState;

  const [localSearchQuery, setLocalSearchQuery] = useState("");

  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);
  const hasMorePages = pagination.currentPage < totalPages;

  useFocusEffect(
    React.useCallback(() => {
      if (userRole === UserRole.NoviceDriver) {
        instructorViewModel.fetchInstructors();
      }
    }, [userRole, instructorViewModel])
  );

  useEffect(() => {
    if (searchQuery && !localSearchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        instructorViewModel.searchInstructors(localSearchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  useEffect(() => {
    if (allInstructors.length === 0) return;
    let sorted = [...allInstructors];

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

  const handleSearchChange = (query: string) => {
    setLocalSearchQuery(query);
    instructorViewModel.updateSearchQuery(query);
  };

  const handleSortChange = (value: string) => {
    if (value === "exp") {
      if (sortBy === SortType.Experience) {
        dispatch(setSortAscending(!sortAscending));
      } else {
        dispatch(setSortBy(SortType.Experience));
        dispatch(setSortAscending(true));
      }
    } else if (value === "rating") {
      if (sortBy === SortType.Rating) {
        dispatch(setSortAscending(!sortAscending));
      } else {
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

  const [showSortFilter, setShowSortFilter] = useState(false);

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
          <Text style={styles.experience}>
            {item.experienceYear} năm kinh nghiệm
          </Text>
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
            onPress={() =>
              router.push({
                pathname: ROUTES.INSTRUCTOR_DETAIL,
                params: {
                  instructorId: item.id,
                },
              })
            }
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
        <ActivityIndicator size="small" color={AppColors.primary} />
        <Text style={styles.loadingText}>Đang tải thêm...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <LucideUsers size={64} color={AppColors.gray300} />
      <Text style={styles.emptyTitle}>Không tìm thấy người hướng dẫn</Text>
      <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
        <Text style={styles.resetButtonText}>Đặt lại bộ lọc</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderList title="Danh sách người hướng dẫn" />
      <View style={styles.filtersContainer}>
        <View style={styles.searchRow}>
          <SearchBar
            value={localSearchQuery}
            onChangeText={handleSearchChange}
            placeholder="Tìm kiếm người hướng dẫn..."
            style={styles.searchBarWrapper}
          />
          <TouchableOpacity
            style={[
              styles.filterButton,
              showSortFilter && styles.filterButtonActive,
            ]}
            activeOpacity={0.9}
            onPress={() => setShowSortFilter((prev) => !prev)}
          >
            <Filter
              size={18}
              color={showSortFilter ? "#ffffff" : AppColors.primary}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        {showSortFilter && (
          <View style={styles.sortChipsRow}>
            <TouchableOpacity
              style={[
                styles.sortChip,
                sortBy === SortType.Experience && styles.sortChipActive,
              ]}
              onPress={() => handleSortChange("exp")}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.sortChipText,
                  sortBy === SortType.Experience && styles.sortChipTextActive,
                ]}
              >
                Kinh nghiệm{" "}
                {sortBy === SortType.Experience
                  ? sortAscending
                    ? "↑"
                    : "↓"
                  : ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortChip,
                sortBy === SortType.Rating && styles.sortChipActive,
              ]}
              onPress={() => handleSortChange("rating")}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.sortChipText,
                  sortBy === SortType.Rating && styles.sortChipTextActive,
                ]}
              >
                Đánh giá{" "}
                {sortBy === SortType.Rating
                  ? sortAscending
                    ? "↑"
                    : "↓"
                  : ""}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
            colors={[AppColors.primary]}
            tintColor={AppColors.primary}
          />
        }
        onEndReached={loadMoreInstructors}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderLoadingFooter}
        ListEmptyComponent={renderEmptyState}
      />

      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            onPress={() => instructorViewModel.clearErrorMessage()}
          >
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
    backgroundColor: "#ffffff",
    borderBottomColor: AppColors.gray200,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBarWrapper: {
    flex: 1,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 15,
    borderWidth: 1,
    borderColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  filterButtonActive: {
    backgroundColor: AppColors.primary,
  },
  sortChipsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: AppColors.gray300,
    backgroundColor: "#f9fafb",
  },
  sortChipActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + "15",
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.gray700,
  },
  sortChipTextActive: {
    color: AppColors.primary,
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
    color: AppColors.primary,
    lineHeight: 22,
  },
  packages: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.primary,
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
    backgroundColor: AppColors.primary,
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
    backgroundColor: AppColors.primary,
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
