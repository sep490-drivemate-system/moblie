import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import { RootState } from "@/lib/redux/store";
import { getListInstructors } from "@/features/instructor/instructorThunk";
import {
  setAllInstructors,
  setFilteredInstructors,
  setDisplayedInstructors,
  setSearchQuery,
  setFilters,
  resetFilters,
  setSortBy,
  setSortAscending,
  toggleSortOrder,
  setIsRefreshing,
  setLoading,
  setError,
  setSuccess,
  clearError,
} from "@/features/instructor/instructorSlice";
import { IInstructors } from "@/models/instructor/instructor.type";
import { FilterState, SortType } from "@/models/instructor/instructor-filter.type";

type InstructorState = RootState["instructor"];

export class InstructorViewModel extends BaseViewModel<InstructorState> {

  // Fetch instructors from API
  async fetchInstructors(): Promise<void> {
    await this.executeAsync(
      async () => {
        const result = await this.dispatch(getListInstructors()).unwrap();
        
        const instructors = (result as any).data?.value || (result as any).value || result;
        
        this.dispatch(setAllInstructors(instructors));
        this.dispatch(setFilteredInstructors(instructors));
        this.dispatch(setDisplayedInstructors(instructors));
      },
      () => {

      },
      (error) => {
        console.error('Failed to load instructors:', error);
      },
      {
        setLoading,
        setError,
        setSuccess,
      }
    );
  }

  // Search instructors
  updateSearchQuery(query: string): void {
    this.dispatch(setSearchQuery(query));
  }

  // Update filters
  updateFilters(filters: FilterState): void {
    this.dispatch(setFilters(filters));
  }

  // Reset filters
  resetAllFilters(): void {
    this.dispatch(resetFilters());
  }

  // Update sort
  updateSort(sortType: SortType): void {
    const currentState = this.getCurrentState();
    if (currentState.sortBy === sortType) {
      this.dispatch(toggleSortOrder());
    } else {
      this.dispatch(setSortBy(sortType));
      this.dispatch(setSortAscending(false));
    }
  }

  // Refresh data
  async refreshInstructors(): Promise<void> {
    this.dispatch(setIsRefreshing(true));
    await this.fetchInstructors();
    this.dispatch(setIsRefreshing(false));
  }

  // Clear error
  clearErrorMessage(): void {
    this.dispatch(clearError());
  }
}
