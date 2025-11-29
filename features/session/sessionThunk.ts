import { HttpMethod } from "@/models/enum/HttpMethods";
import { createThunk } from "../genericCreateThunk";
import { GenericResponse } from "@/models/generic/genericResponse";
import { IRescheduleSessionRequest } from "../booking/bookingThunk";
import { ISessionDetailDTO } from "@/models/session/session.type";

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


export const getSessionDetail = createThunk<
    ISessionDetailDTO,
    { sessionId: string }
>(
    HttpMethod.GET,
    "getSessionDetail",
    `/${SESSION_PATH}`,
    { buildUrl: (payload) => `/${SESSION_PATH}/${payload.sessionId}` }
);