import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { 
  IInstructors, 
  InstructorPackageAPI, 
  InstructorCarAPI,
  PaginatedInstructorsResponse,
  GetInstructorsParams 
} from "@/models/instructor/instructor.type";
import { IBuyPackageRequest, IBuyPackageResponse } from "@/models/package/package";

export const INSTRUCTOR_PATH = "instructors";


export const getListInstructors = createThunk<
  PaginatedInstructorsResponse, 
  GetInstructorsParams
>(
  HttpMethod.GET,
  "getListInstructors",
  `/${INSTRUCTOR_PATH}`,
  {
    buildUrl: (payload) => {
      const params = new URLSearchParams();
      if (payload?.searchKey) params.append('SearchKey', payload.searchKey);
      if (payload?.pageNumber) params.append('PageNumber', payload.pageNumber.toString());
      if (payload?.pageSize) params.append('PageSize', payload.pageSize.toString());
      
      const queryString = params.toString();
      return `/${INSTRUCTOR_PATH}${queryString ? `?${queryString}` : ''}`;
    }
  }
);

export const getInstructorById = createThunk<IInstructors, { id: string }>(
    HttpMethod.GET,
    "getInstructorById",
    `${INSTRUCTOR_PATH}/:id`,
);

export const getInstructorPackages = createThunk<InstructorPackageAPI[], { id: string }>(
    HttpMethod.GET,
    "getInstructorPackages",
    `package/instructor/:id`,
    {
        buildUrl: (payload) => `package/instructor/${payload.id}`,
    }
);

export const getInstructorCars = createThunk<InstructorCarAPI[], { id: string }>(
    HttpMethod.GET,
    "getInstructorCars",
    `car/instructor/:id/cars`,
    {
        buildUrl: (payload) => `car/instructor/${payload.id}/cars`,
    }
);

export const buyPackage = createThunk<IBuyPackageResponse, IBuyPackageRequest>(
    HttpMethod.POST,
    "buyPackage",
    `package/buy-package`
);
