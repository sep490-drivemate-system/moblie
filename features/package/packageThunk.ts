import { HttpMethod } from "@/models/enum/HttpMethods";
import { createThunk } from "../genericCreateThunk";
import { IInstructorPackages } from "@/models/instructor/instructor.type";

export const PACKAGE_PATH = "package";

export const getInstructorPackages = createThunk<IInstructorPackages[], { id: string }>(
    HttpMethod.GET,
    "getPackagesByInstructorId",
    `${PACKAGE_PATH}/instructor/:id`,
    {
        buildUrl: (payload) => `${PACKAGE_PATH}/instructor/${payload.id}`,
    }
);
