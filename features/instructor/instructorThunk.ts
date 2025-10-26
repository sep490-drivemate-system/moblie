import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { IInstructors } from "@/models/instructor/instructor.type";
import { FilterState, SortType } from "@/models/instructor/instructor-filter.type";

export const INSTRUCTOR_PATH = "instructors";

// Interface cho request parameters
export interface IGetInstructorsRequest {
  filters?: FilterState;
  sortBy?: SortType;
  sortAscending?: boolean;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

// Interface cho response
export interface IGetInstructorsResponse {
  instructors: IInstructors[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export const getListInstructors = createThunk<IGetInstructorsResponse, IGetInstructorsRequest>(
    HttpMethod.GET,
    "getListInstructors",
    `${INSTRUCTOR_PATH}/instructors`,
);

export const getInstructorById = createThunk<IInstructors, { id: string }>(
    HttpMethod.GET,
    "getInstructorById",
    `${INSTRUCTOR_PATH}/:id`,
);
