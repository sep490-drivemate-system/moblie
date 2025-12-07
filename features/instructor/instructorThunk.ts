import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";
import {
  IInstructors,
  IInstructorCar,
  PaginatedInstructorsResponse,
  GetInstructorsParams,
  InstructorApplicant,
} from "@/models/instructor/instructor.type";
import {
  IBuyPackageRequest,
  IBuyPackageResponse,
} from "@/models/package/package";

export const INSTRUCTOR_PATH = "instructors";

export const getListInstructors = createThunk<
  PaginatedInstructorsResponse,
  GetInstructorsParams
>(HttpMethod.GET, "getListInstructors", `/${INSTRUCTOR_PATH}`, {
  buildUrl: (payload) => {
    const params = new URLSearchParams();
    if (payload?.searchKey) params.append("SearchKey", payload.searchKey);
    if (payload?.pageNumber)
      params.append("PageNumber", payload.pageNumber.toString());
    if (payload?.pageSize)
      params.append("PageSize", payload.pageSize.toString());

    const queryString = params.toString();
    return `/${INSTRUCTOR_PATH}${queryString ? `?${queryString}` : ""}`;
  },
});

export const getInstructorById = createThunk<IInstructors, { id: string }>(
  HttpMethod.GET,
  "getInstructorById",
  `${INSTRUCTOR_PATH}/:id`,
  {
    buildUrl: (payload) => `${INSTRUCTOR_PATH}/${payload.id}`
  }
);


export const getInstructorCars = createThunk<
  IInstructorCar[],
  { id: string }
>(HttpMethod.GET, "getInstructorCars", `car/instructor/:id/cars`, {
  buildUrl: (payload) => `car/instructor/${payload.id}/cars`,
});



export const getInstructorApplicant = createThunk<
  InstructorApplicant,
  { instructorId: string }
>(
  HttpMethod.GET,
  "getInstructorApplicant",
  `/instructors/:instructorId/applicants`,
  {
    buildUrl: (payload) => `/instructors/${payload.instructorId}/applicants`,
  }
);

