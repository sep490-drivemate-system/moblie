import { HttpMethod } from "@/models/enum/HttpMethods";
import { createThunk } from "../genericCreateThunk";
import { IInstructorBookedSession, IInstructorSchedule } from "../booking/bookingThunk";

const INSTRUCTOR_PATH = "instructors";
const BOOKING_PATH = "booking";

export const getInstructorSchedule = createThunk<
    IInstructorSchedule[],
    { instructorId: string }
>(
    HttpMethod.GET,
    "getInstructorSchedule",
    `/${INSTRUCTOR_PATH}`,
    {
        buildUrl: (payload) => `/${INSTRUCTOR_PATH}/${payload.instructorId}/schedule`
    }
);

export const getInstructorBookedSessions = createThunk<
    IInstructorBookedSession[],
    { instructorId: string }
>(
    HttpMethod.GET,
    "getInstructorBookedSessions",
    `/${INSTRUCTOR_PATH}`,
    {
        buildUrl: (payload) => `/${BOOKING_PATH}/instructor/${payload.instructorId}/upcoming-sessions`
    }
);

export const updateInstructorSchedule = createThunk<
    boolean,
    { instructorId: string; startTime: string; endTime: string }
>(
    HttpMethod.POST,
    "updateInstructorSchedule",
    `/${INSTRUCTOR_PATH}`,
    {
        buildUrl: (payload) => `/${INSTRUCTOR_PATH}/${payload.instructorId}/schedule`
    }
);
