import { HttpMethod } from "@/models/enum/HttpMethods";
import { createThunk } from "../genericCreateThunk";
import { IInstructorPackages, Instructor } from "@/models/instructor/instructor.type";
import {
  CreatePackageForm,
  DrivingSkill,
  GetPackagesParams,
  Package,
  PaginatedPackagesResponse,
  RoadType,
} from "@/models/package/package";

export const PACKAGE_PATH = "package";

export const getInstructorPackages = createThunk<
  IInstructorPackages[],
  { id: string }
>(
  HttpMethod.GET,
  "getPackagesByInstructorId",
  `${PACKAGE_PATH}/instructor/:id`,
  {
    buildUrl: (payload) => `${PACKAGE_PATH}/instructor/${payload.id}`,
  }
);

export const getDrivingSkills = createThunk<DrivingSkill[]>(
  HttpMethod.GET,
  "driving-skill",
  `skills`
);

export const getRoadTypes = createThunk<RoadType[]>(
  HttpMethod.GET,
  "road-type",
  `roadtypes`
);

export const createInstructorPackage = createThunk<boolean, CreatePackageForm>(
  HttpMethod.POST,
  "createPackage",
  `${PACKAGE_PATH}`
);

export const getPackages = createThunk<
  PaginatedPackagesResponse,
  GetPackagesParams
>(HttpMethod.GET, "packages", `${PACKAGE_PATH}`, {
  buildUrl: (payload) => {
    const params = new URLSearchParams();
    if (payload?.searchKey) params.append("SearchKey", payload.searchKey);
    if (payload?.allowSelfCar !== undefined)
      params.append("AllowSelfCar", payload.allowSelfCar.toString());
    if (payload?.roadTypes && payload.roadTypes.length > 0) {
      payload.roadTypes.forEach((roadType) => {
        params.append("RoadTypes", roadType);
      });
    }
    if (payload?.drivingSkills && payload.drivingSkills.length > 0) {
      payload.drivingSkills.forEach((skill) => {
        params.append("DrivingSkills", skill);
      });
    }
    if (payload?.pageNumber)
      params.append("PageNumber", payload.pageNumber.toString());
    if (payload?.pageSize)
      params.append("PageSize", payload.pageSize.toString());

    const queryString = params.toString();
    return `${PACKAGE_PATH}${queryString ? `?${queryString}` : ""}`;
  },
});

export const getRecommendedPackages = createThunk<Package[], void>(
  HttpMethod.GET,
  "recommendedPackages",
  `${PACKAGE_PATH}/recommended`,
);
