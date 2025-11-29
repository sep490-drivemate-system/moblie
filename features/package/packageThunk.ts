import { HttpMethod } from "@/models/enum/HttpMethods";
import { createThunk } from "../genericCreateThunk";
import { IInstructorPackages } from "@/models/instructor/instructor.type";
import {
  CreatePackageForm,
  DrivingSkill,
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

export const createInstructorPackage = createThunk<
  boolean,
  CreatePackageForm
>(HttpMethod.POST, "createPackage", `${PACKAGE_PATH}`);
