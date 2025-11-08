import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { IInstructors, InstructorPackageAPI, InstructorCarAPI } from "@/models/instructor/instructor.type";
import { IBuyPackageRequest, IBuyPackageResponse } from "@/models/package/package";

export const INSTRUCTOR_PATH = "instructors";


export const getListInstructors = createThunk<IInstructors[], void>(
    HttpMethod.GET,
    "getListInstructors",
    `/${INSTRUCTOR_PATH}`,
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
