import { IUserInfo } from "@/models/user/user.type";
import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { INoviceDriverAddress } from "../booking/bookingThunk";

export const USER_PATH = "users";
export const NOVICE_DRIVER_PATH = "novice-driver";

export const getUserById = createThunk<
    IUserInfo,
    { id: string }
>(
    HttpMethod.GET,
    "getUserById",
    `/${USER_PATH}`,
    {
        buildUrl: (payload) => {
            if (!payload.id || payload.id.trim() === "") {
                throw new Error("User ID is required");
            }
            return `/${USER_PATH}/${payload.id}`;
        }
    }
);

export const getLicenseValidity = createThunk<
    boolean,
    void
>(
    HttpMethod.GET,
    "getLicenseValidity",
    `/${NOVICE_DRIVER_PATH}/license-validity`
);


export const getNoviceDriverAddresses = createThunk<
    INoviceDriverAddress[],
    void
>(
    HttpMethod.GET,
    "getNoviceDriverAddresses",
    `/${USER_PATH}/address`
);

