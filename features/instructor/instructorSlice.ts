import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BaseState } from '@/models/generic/baseState';
import { Instructor } from '@/models/instructor/instructor.type';
import {
  FilterType,
  DistanceFilter,
  ExperienceLevel,
  MinimumRating,
  SortType,
  FilterState,
} from '@/models/instructor/instructor-filter.type';

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

interface InstructorState extends BaseState {
  // Data
  allInstructors: Instructor[];
  filteredInstructors: Instructor[];
  displayedInstructors: Instructor[];
  
  // Search & Filter
  searchQuery: string;
  filters: FilterState;
  tempFilters: FilterState;
  
  // Sorting
  sortBy: SortType;
  sortAscending: boolean;
  
  // UI State
  showFilterModal: boolean;
  isRefreshing: boolean;
  
  // Pagination
  pagination: PaginationState;
}

const initialFilterState: FilterState = {
  availability: FilterType.All,
  distance: DistanceFilter.All,
  experience: ExperienceLevel.All,
  priceRange: [200000, 500000],
  minRating: MinimumRating.All,
};

const initialState: InstructorState = {
  // Data
  allInstructors: [],
  filteredInstructors: [],
  displayedInstructors: [],
  
  // Search & Filter
  searchQuery: '',
  filters: initialFilterState,
  tempFilters: initialFilterState,
  
  // Sorting
  sortBy: SortType.Rating,
  sortAscending: false,
  
  // UI State
  showFilterModal: false,
  isRefreshing: false,
  
  // Pagination
  pagination: {
    currentPage: 1,
    itemsPerPage: 8,
    totalItems: 0,
  },
  
  // Base State
  isLoading: false,
  errorMessage: null,
  isSuccess: false,
};

const instructorSlice = createSlice({
  name: 'instructor',
  initialState,
  reducers: {
    // Data Actions
    setAllInstructors: (state, action: PayloadAction<Instructor[]>) => {
      state.allInstructors = action.payload;
    },
    setFilteredInstructors: (state, action: PayloadAction<Instructor[]>) => {
      state.filteredInstructors = action.payload;
    },
    setDisplayedInstructors: (state, action: PayloadAction<Instructor[]>) => {
      state.displayedInstructors = action.payload;
    },
    
    // Search & Filter Actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<FilterState>) => {
      state.filters = action.payload;
    },
    setTempFilters: (state, action: PayloadAction<FilterState>) => {
      state.tempFilters = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialFilterState;
      state.tempFilters = initialFilterState;
    },
    applyTempFilters: (state) => {
      state.filters = state.tempFilters;
    },
    
    // Sorting Actions
    setSortBy: (state, action: PayloadAction<SortType>) => {
      state.sortBy = action.payload;
    },
    setSortAscending: (state, action: PayloadAction<boolean>) => {
      state.sortAscending = action.payload;
    },
    toggleSortOrder: (state) => {
      state.sortAscending = !state.sortAscending;
    },
    
    // UI State Actions
    setShowFilterModal: (state, action: PayloadAction<boolean>) => {
      state.showFilterModal = action.payload;
    },
    setIsRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
    
    // Pagination Actions
    setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetPagination: (state) => {
      state.pagination = {
        currentPage: 1,
        itemsPerPage: 8,
        totalItems: 0,
      };
    },
    
    // Base State Actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.errorMessage = action.payload;
      state.isLoading = false;
    },
    setSuccess: (state, action: PayloadAction<boolean>) => {
      state.isSuccess = action.payload;
    },
    clearError: (state) => {
      state.errorMessage = null;
    },
  },
});

export const {
  // Data Actions
  setAllInstructors,
  setFilteredInstructors,
  setDisplayedInstructors,
  
  // Search & Filter Actions
  setSearchQuery,
  setFilters,
  setTempFilters,
  resetFilters,
  applyTempFilters,
  
  // Sorting Actions
  setSortBy,
  setSortAscending,
  toggleSortOrder,
  
  // UI State Actions
  setShowFilterModal,
  setIsRefreshing,
  
  // Pagination Actions
  setPagination,
  resetPagination,
  
  // Base State Actions
  setLoading,
  setError,
  setSuccess,
  clearError,
} = instructorSlice.actions;

export default instructorSlice.reducer;
