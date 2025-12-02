import { HttpMethod } from "@/models/enum/HttpMethods";
import { ISessionDetailDTO, ISessionRouteDetai } from "@/models/session/session.type";
import { IRescheduleSessionRequest } from "../booking/bookingThunk";
import { createThunk } from "../genericCreateThunk";

const SESSION_PATH = "session";

export const cancelSession = createThunk<boolean, { sessionId: string }>(
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
    {
        buildUrl: (payload) => `/${SESSION_PATH}/${payload.sessionId}/reschedule`,
        config: () => ({
            headers: {
                "Content-Type": "application/json",
            },
            transformRequest: [
                (data: any) => {
                    if (data && typeof data === "object" && "rescheduleData" in data) {
                        return JSON.stringify((data as any).rescheduleData);
                    }
                    return JSON.stringify(data);
                },
            ],
        }),
    }
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

export const saveSessionRoutes = createThunk<
    boolean,
    { sessionId: string; body: ISessionRouteDetai }
>(
    HttpMethod.POST,
    "saveSessionRoutes",
    `/${SESSION_PATH}`,
    {
        buildUrl: (payload) => `/${SESSION_PATH}/${payload.sessionId}/routes`,
        config: () => ({
            headers: {
                "Content-Type": "application/json",
            },
            transformRequest: [
                (data: any) => {
                    if (data && typeof data === "object" && "body" in data) {
                        return JSON.stringify((data as any).body);
                    }
                    return JSON.stringify(data);
                },
            ],
        }),
    }
);