import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import { RootState } from "@/lib/redux/store";
import {
  getInstructorById,
  getListInstructors,
  getRecommendedInstructors,
} from "@/features/instructor/instructorThunk";
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
  setPagination,
  setLoading,
  setError,
  setSuccess,
  clearError,
} from "@/features/instructor/instructorSlice";
import {
  IInstructors,
  GetInstructorsParams,
} from "@/models/instructor/instructor.type";
import {
  FilterState,
  SortType,
} from "@/models/instructor/instructor-filter.type";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "expo-router";

type InstructorState = RootState["instructor"];

export class InstructorViewModel extends BaseViewModel<InstructorState> {
  // Fetch instructors from API với pagination và search
  async fetchInstructors(params?: GetInstructorsParams): Promise<void> {
    await this.executeAsync(
      async () => {
        const currentState = this.getCurrentState();

        // Build params từ state hoặc override bằng params truyền vào
        const requestParams: GetInstructorsParams = {
          searchKey: params?.searchKey ?? currentState.searchQuery,
          pageNumber: params?.pageNumber ?? currentState.pagination.currentPage,
          pageSize: params?.pageSize ?? currentState.pagination.itemsPerPage,
        };

        const result = await this.dispatch(
          getListInstructors(requestParams)
        ).unwrap();

        // Extract data từ GenericResponse
        const paginatedData = (result as any).value || result;

        // Update instructors
        this.dispatch(setAllInstructors(paginatedData.pageContent));
        this.dispatch(setFilteredInstructors(paginatedData.pageContent));
        this.dispatch(setDisplayedInstructors(paginatedData.pageContent));

        // Update pagination info
        this.dispatch(
          setPagination({
            currentPage: paginatedData.currentPage,
            itemsPerPage: paginatedData.pageSize,
            totalItems: paginatedData.totalCount,
          })
        );
      },
      () => {
        console.log("Instructors loaded successfully");
      },
      (error) => {
        console.error("Failed to load instructors:", error);
      },
      {
        setLoading,
        setError,
        setSuccess,
      }
    );
  }


  async getInstructor(id: string): Promise<IInstructors | null> {
    return await this.executeAsync(
      async () => {
        const result = await this.dispatch(getInstructorById({ id })).unwrap();
        return result.value as IInstructors;
      },
    );
  }
  handleInstructorPress = (instructor: IInstructors) => {
    useRouter().push({
      pathname: (ROUTES.NO_TABS + ROUTES.INSTRUCTOR_DETAIL) as any,
      params: {
        instructorId: instructor.id,
        instructorData: JSON.stringify(instructor),
      },
    });
  };
  async loadPage(pageNumber: number): Promise<void> {
    await this.fetchInstructors({ pageNumber });
  }

  // Load more instructors cho infinite scroll (append data)
  async loadMoreInstructors(): Promise<void> {
    const currentState = this.getCurrentState();
    const nextPage = currentState.pagination.currentPage + 1;
    const totalPages = Math.ceil(
      currentState.pagination.totalItems / currentState.pagination.itemsPerPage
    );

    // Nếu đã hết trang, không load thêm
    if (nextPage > totalPages) return;

    await this.executeAsync(
      async () => {
        const requestParams: GetInstructorsParams = {
          searchKey: currentState.searchQuery,
          pageNumber: nextPage,
          pageSize: currentState.pagination.itemsPerPage,
        };

        const result = await this.dispatch(
          getListInstructors(requestParams)
        ).unwrap();
        const paginatedData = (result as any).value || result;

        const updatedInstructors = [
          ...currentState.allInstructors,
          ...paginatedData.pageContent,
        ];

        this.dispatch(setAllInstructors(updatedInstructors));
        this.dispatch(setFilteredInstructors(updatedInstructors));
        this.dispatch(setDisplayedInstructors(updatedInstructors));

        this.dispatch(
          setPagination({
            currentPage: paginatedData.currentPage,
            itemsPerPage: paginatedData.pageSize,
            totalItems: paginatedData.totalCount,
          })
        );
      },
      () => {
        console.log("More instructors loaded");
      },
      (error) => {
        console.error("Failed to load more instructors:", error);
      },
      {
        setLoading,
        setError,
        setSuccess,
      }
    );
  }

  // Search với debounce (reset về page 1)
  async searchInstructors(searchKey: string): Promise<void> {
    this.dispatch(setSearchQuery(searchKey));
    // Reset về page 1 khi search
    await this.fetchInstructors({ searchKey, pageNumber: 1 });
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

  // Refresh data (giữ lại search query, reset về page 1)
  async refreshInstructors(): Promise<void> {
    this.dispatch(setIsRefreshing(true));
    const currentState = this.getCurrentState();
    // Giữ lại search query hiện tại, reset về page 1
    await this.fetchInstructors({
      searchKey: currentState.searchQuery,
      pageNumber: 1,
    });
    this.dispatch(setIsRefreshing(false));
  }

  // Clear error
  clearErrorMessage(): void {
    this.dispatch(clearError());
  }

  async fetchInstructorById(id: string): Promise<IInstructors | null> {
    return await this.executeAsync(
      async (): Promise<IInstructors> => {
        const result = await this.dispatch(getInstructorById({ id })).unwrap();
        return result.value as IInstructors;
      },
      () => {
        console.log("Instructor loaded successfully");
      },
      (error) => {
        console.error("Failed to load instructor:", error);
      },
      {
        setLoading,
        setError,
        setSuccess,
      }
    );
  }

  async fetchRecommendedInstructors(): Promise<IInstructors[] | null> {
    return await this.executeAsync(async (): Promise<IInstructors[]> => {
      const result = await this.dispatch(getRecommendedInstructors()).unwrap();
      return (result as any).value;
    });
  }
}
