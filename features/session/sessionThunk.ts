import { HttpMethod } from "@/models/enum/HttpMethods";
import { createThunk } from "../genericCreateThunk";
import { GenericResponse } from "@/models/generic/genericResponse";
import { IRescheduleSessionRequest } from "../booking/bookingThunk";

const SESSION_PATH = "session";
export const cancelSession = createThunk<
    boolean,
    { sessionId: string }
>(
    HttpMethod.POST,
    "cancelSession",
    `/${SESSION_PATH}`,
    { buildUrl: (payload) => `/${SESSION_PATH}/${payload.sessionId}/cancel` }
);

export const rescheduleSession = createThunk<
    boolean,
    { sessionId: string; rescheduleData: IRescheduleSessionRequest }
>(
    HttpMethod.POST,
    "rescheduleSession",
    `/${SESSION_PATH}`,
    { buildUrl: (payload) => `/${SESSION_PATH}/${payload.sessionId}/reschedule` }
);