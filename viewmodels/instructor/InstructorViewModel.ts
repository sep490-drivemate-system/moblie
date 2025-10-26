import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { Instructor, IInstructors } from '@/models/instructor/instructor.type';
import {
  FilterType,
  DistanceFilter,
  ExperienceLevel,
  MinimumRating,
  SortType,
  FilterState,
} from '@/models/instructor/instructor-filter.type';
import {
  setAllInstructors,
  setFilteredInstructors,
  setDisplayedInstructors,
  setSearchQuery,
  setFilters,
  setTempFilters,
  resetFilters,
  applyTempFilters,
  setSortBy,
  setSortAscending,
  toggleSortOrder,
  setShowFilterModal,
  setIsRefreshing,
  setPagination,
  resetPagination,
  setLoading,
  setError,
  setSuccess,
  clearError,
} from '@/features/instructor/instructorSlice';
import { getListInstructors, IGetInstructorsRequest, IGetInstructorsResponse } from '@/features/instructor/instructorThunk';

export const useInstructorViewModel = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.instructor);

  // Initialize data
  const initializeInstructors = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const requestParams: IGetInstructorsRequest = {
        page: 1,
        limit: 20,
      };
      const response = await dispatch(getListInstructors(requestParams)).unwrap();
      
      // Check if response has data property (GenericResponse structure)
      const responseData = (response as any).data || response;
      
      // Convert IInstructors[] to Instructor[] if needed
      const instructors: Instructor[] = (responseData as IGetInstructorsResponse).instructors.map((item: IInstructors) => ({
        id: item.id,
        name: item.name,
        avatar: item.avatar,
        experience: item.experience,
        experienceYears: parseInt(item.experience.split(' ')[0]) || 0,
        rating: item.averageRating,
        price: item.pricePerHour,
        specialties: ['Lái xe cơ bản', 'Lái xe nâng cao'], // Default specialties
        phone: '0123456789', // Default phone
        email: `${item.name.toLowerCase().replace(' ', '.')}@example.com`, // Generated email
        description: 'Giảng viên chuyên nghiệp',
        totalBookings: item.totalBookings,
        gender: 'male' as any, // Default gender
      }));
      
      dispatch(setAllInstructors(instructors));
      dispatch(setPagination({ 
        totalItems: responseData.totalCount,
        currentPage: responseData.currentPage 
      }));
    } catch (error) {
      dispatch(setError('Không thể tải danh sách giảng viên'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Filter and sort logic - now uses API
  const applyFiltersAndSort = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const requestParams: IGetInstructorsRequest = {
        filters: state.filters,
        sortBy: state.sortBy,
        sortAscending: state.sortAscending,
        searchQuery: state.searchQuery,
        page: 1,
        limit: 20,
      };
      
      const response = await dispatch(getListInstructors(requestParams)).unwrap();
      const responseData = (response as any).data || response;
      
      // Convert IInstructors[] to Instructor[] if needed
      const instructors: Instructor[] = (responseData as IGetInstructorsResponse).instructors.map((item: IInstructors) => ({
        id: item.id,
        name: item.name,
        avatar: item.avatar,
        experience: item.experience,
        experienceYears: parseInt(item.experience.split(' ')[0]) || 0,
        rating: item.averageRating,
        price: item.pricePerHour,
        specialties: ['Lái xe cơ bản', 'Lái xe nâng cao'],
        phone: '0123456789',
        email: `${item.name.toLowerCase().replace(' ', '.')}@example.com`,
        description: 'Giảng viên chuyên nghiệp',
        totalBookings: item.totalBookings,
        gender: 'male' as any,
      }));

      dispatch(setFilteredInstructors(instructors));
      dispatch(setDisplayedInstructors(instructors));
      dispatch(setPagination({ 
        currentPage: (responseData as IGetInstructorsResponse).currentPage,
        totalItems: (responseData as IGetInstructorsResponse).totalCount 
      }));
    } catch (error) {
      dispatch(setError('Không thể tải danh sách giảng viên'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [
    state.filters,
    state.sortBy,
    state.sortAscending,
    state.searchQuery,
    dispatch,
  ]);

  // Update displayed instructors based on pagination
  const updateDisplayedInstructors = useCallback((
    instructors: Instructor[],
    page: number
  ) => {
    const startIndex = (page - 1) * state.pagination.itemsPerPage;
    const endIndex = startIndex + state.pagination.itemsPerPage;
    const displayed = instructors.slice(0, endIndex); // For lazy loading
    dispatch(setDisplayedInstructors(displayed));
  }, [state.pagination.itemsPerPage, dispatch]);

  // Load more instructors (for lazy loading)
  const loadMoreInstructors = useCallback(() => {
    if (state.displayedInstructors.length < state.filteredInstructors.length) {
      const nextPage = Math.floor(state.displayedInstructors.length / state.pagination.itemsPerPage) + 1;
      updateDisplayedInstructors(state.filteredInstructors, nextPage);
    }
  }, [
    state.displayedInstructors.length,
    state.filteredInstructors,
    state.pagination.itemsPerPage,
    updateDisplayedInstructors,
  ]);

  // Search actions
  const handleSearchChange = useCallback((query: string) => {
    dispatch(setSearchQuery(query));
  }, [dispatch]);

  // Filter actions
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const handleTempFilterChange = useCallback((newTempFilters: FilterState) => {
    dispatch(setTempFilters(newTempFilters));
  }, [dispatch]);

  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  const handleApplyTempFilters = useCallback(() => {
    dispatch(applyTempFilters());
    dispatch(setShowFilterModal(false));
  }, [dispatch]);

  // Sort actions
  const handleSortChange = useCallback((sortType: SortType) => {
    if (state.sortBy === sortType) {
      dispatch(toggleSortOrder());
    } else {
      dispatch(setSortBy(sortType));
      dispatch(setSortAscending(false));
    }
  }, [state.sortBy, dispatch]);

  // UI actions
  const handleShowFilterModal = useCallback((show: boolean) => {
    dispatch(setShowFilterModal(show));
  }, [dispatch]);

  // Refresh action
  const handleRefresh = useCallback(() => {
    dispatch(setIsRefreshing(true));
    setTimeout(() => {
      dispatch(resetPagination());
      applyFiltersAndSort();
      dispatch(setIsRefreshing(false));
    }, 1000);
  }, [dispatch, applyFiltersAndSort]);

  // Helper functions
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (state.filters.experience !== ExperienceLevel.All) count++;
    if (state.filters.priceRange[0] !== 200000 || state.filters.priceRange[1] !== 500000) count++;
    if (state.filters.minRating !== MinimumRating.All) count++;
    return count;
  }, [state.filters]);

  const hasMoreInstructors = useCallback(() => {
    return state.displayedInstructors.length < state.filteredInstructors.length;
  }, [state.displayedInstructors.length, state.filteredInstructors.length]);

  // Effects
  useEffect(() => {
    initializeInstructors();
  }, [initializeInstructors]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  return {
    // State
    ...state,
    
    // Computed values
    activeFilterCount: getActiveFilterCount(),
    hasMoreInstructors: hasMoreInstructors(),
    
    // Actions
    initializeInstructors,
    handleSearchChange,
    handleFilterChange,
    handleTempFilterChange,
    handleResetFilters,
    handleApplyTempFilters,
    handleSortChange,
    handleShowFilterModal,
    handleRefresh,
    loadMoreInstructors,
    
    // Utility actions
    setLoading: (loading: boolean) => dispatch(setLoading(loading)),
    setError: (error: string | null) => dispatch(setError(error)),
    setSuccess: (success: boolean) => dispatch(setSuccess(success)),
    clearError: () => dispatch(clearError()),
  };
};
