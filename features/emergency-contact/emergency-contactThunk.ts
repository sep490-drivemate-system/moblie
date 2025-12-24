import { HttpMethod } from "@/models/enum/HttpMethods";
import { createThunk } from "../genericCreateThunk";
import { IEmergencyContact } from "@/models/address/emergency-contact";

export const USER_PATH = "users";

export const getEmergencyContact = createThunk<IEmergencyContact[], { id: string }>(
    HttpMethod.GET,
    "getEmergencyContact",
    `${USER_PATH}/emergency-contact`,
    {
        buildUrl: (payload) => `${USER_PATH}/emergency-contact/${payload.id}`
    }
);