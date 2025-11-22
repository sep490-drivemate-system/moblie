import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { IUserPackageAPI, IGetUserPackagesParams, BookingStatus } from "@/models/package/user-package";
import { IBookingSession, IGetBookingSessionsParams, IGetAllSessionsParams, ISessionDetailResponse } from "@/models/booking/booking";
import { ISaveSessionRoutesPayload, ISessionRoutes } from "@/models/route/route";
import axiosInstance from "@/lib/axios/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { GenericResponse } from "@/models/generic/genericResponse";
import { IMyPackgesResponse } from "@/models/package/package";

const BOOKING_PATH = "booking";
const SESSION_PATH = "session";
const INSTRUCTOR_PATH = "instructors";
const NOVICE_DRIVER_PATH = "novice-driver";
const POLICY_PATH = "policy";

// API Response Interfaces
export interface IUserInfo {
  userId: string;
  avatarUrl: string;
  phone: string;
  email: string;
  fullName: string;
  birthDate: string;
  role: number;
  instructor: any | null;
  noviceDriver: any | null;
}
export interface IInstructorSchedule {
  startTime: string;
  endTime: string;
}

export interface IInstructorBookedSession {
  id?: string;
  startTime: string;
  endTime: string;
  status?: number;
}

export interface INoviceDriverAddress {
  id: string;
  addressString: string;
  latitude: number;
  longitude: number;
}

export interface IPolicy {
  id: string;
  title: string;
  detail: string;
}

export enum PolicyType {
  Booking = 1,
}

// Create Session Request Interface
export interface ICreateSessionRequest {
  bookingId: string;
  startTime: string; // ISO datetime format
  startingLatitude: number;
  startingLongtitude: number; // Note: API has typo "Longtitude" instead of "Longitude"
  priceForCar: number;
  duration: number; // in hours
  sessionNote: string;
  displayName: string;
  displayStartLocationName?: string;
  displayEndLocationName?: string;
  endingLatitude?: number;
  endingLongtitude?: number;
}

// Session Log Request Interface
export interface ISessionLogRequest {
  streetName: string;
  latitude: number;
  longitude: number;
  heading: string;
  speed: number;
}

// Cancel Session Request Interface
export interface ICancelSessionRequest {
  note: string;
}

// Feedback Request Interface
export interface IFeedbackRequest {
  instructorRating: number;
  instructorFeedback: string;
  carRating: number | null;
  carFeedback: string | null;
  carId: string | null;
  bookingId: string;
  instructorId: string;
}

// Reschedule Session Request Interface
export interface IRescheduleSessionRequest {
  note: string;
  reschedule_start_time: string;
  reschedule_end_time: string;
}

export const getMyPackages = createThunk<
  IMyPackgesResponse[],
  IGetUserPackagesParams | undefined
>(
  HttpMethod.GET,
  "getMyPackages",
  `/${BOOKING_PATH}`,
  {
    buildUrl: (payload) => {
      const params = new URLSearchParams();
      if (payload?.bookingStatus !== undefined && payload.bookingStatus !== BookingStatus.All) {
        params.append('bookingStatus', payload.bookingStatus.toString());
      }

      const queryString = params.toString();
      return `/${BOOKING_PATH}${queryString ? `?${queryString}` : ''}`;
    }
  }
);

// Get booking sessions with optional status filter
export const getBookingSessions = createThunk<
  IBookingSession[],
  IGetBookingSessionsParams
>(
  HttpMethod.GET,
  "getBookingSessions",
  `/${SESSION_PATH}/${BOOKING_PATH}`,
  {
    buildUrl: (payload) => {
      const params = new URLSearchParams();

      // Add status filter if provided
      if (payload?.status !== undefined) {
        params.append('status', payload.status.toString());
      }

      const queryString = params.toString();
      return `/${SESSION_PATH}/${BOOKING_PATH}/${payload.bookingId}${queryString ? `?${queryString}` : ''}`;
    }
  }
);

export const getAllSessions = createThunk<
  IBookingSession[],
  IGetAllSessionsParams | undefined
>(
  HttpMethod.GET,
  "getAllSessions",
  `/${BOOKING_PATH}/sessions`,
  {
    buildUrl: (payload) => {
      const params = new URLSearchParams();
      if (payload?.status !== undefined) {
        params.append('status', payload.status.toString());
      }

      const queryString = params.toString();
      return `/${BOOKING_PATH}/sessions${queryString ? `?${queryString}` : ''}`;
    }
  }
);

export const getInstructorSchedule = createThunk<
  IInstructorSchedule[],
  { instructorId: string }
>(
  HttpMethod.GET,
  "getInstructorSchedule",
  `/${BOOKING_PATH}`,
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

// Get novice driver addresses

// Get policies by type
export const getPolicies = createThunk<
  IPolicy[],
  { policyType: PolicyType }
>(
  HttpMethod.GET,
  "getPolicies",
  `/${POLICY_PATH}`,
  {
    buildUrl: (payload) => `/${POLICY_PATH}?policyType=${payload.policyType}`
  }
);

// Create a new booking session
export const createSession = createThunk<
  boolean,
  ICreateSessionRequest
>(
  HttpMethod.POST,
  "createSession",
  `/${SESSION_PATH}`
);

export const saveSessionRoutes = createAsyncThunk<
  GenericResponse<boolean>,
  ISaveSessionRoutesPayload,
  { rejectValue: string }
>(
  "saveSessionRoutes",
  async (payload, { rejectWithValue }) => {
    try {
      const url = `/${SESSION_PATH}/${payload.sessionId}/routes`;

      console.log("🚀 Calling API:", url);
      console.log("📦 Request body:", payload.body);

      const response = await axiosInstance.post<GenericResponse<boolean>>(
        url,
        payload.body // Send only the routes array as body
      );

      console.log("✅ API Response:", response.data);
      return response.data;
    } catch (err) {
      const error = err as any;
      console.error("❌ API Error:", error.response?.data || error.message);
      const message = error.response?.data?.message || "Không thể lưu lộ trình";
      return rejectWithValue(message);
    }
  }
);

export const getSessionRoutes = createThunk<
  ISessionRoutes[],
  { sessionId: string }
>(
  HttpMethod.GET,
  "getSessionRoutes",
  `/${SESSION_PATH}`,
  {
    buildUrl: (payload) => `/${SESSION_PATH}/${payload.sessionId}/routes`
  }
);

// Get session detail by sessionId
export const getSessionDetail = createThunk<
  ISessionDetailResponse,
  { sessionId: string }
>(
  HttpMethod.GET,
  "getSessionDetail",
  `/${SESSION_PATH}`,
  {
    buildUrl: (payload) => `/${SESSION_PATH}/${payload.sessionId}`
  }
);

export const addSessionLog = createAsyncThunk<
  GenericResponse<boolean>,
  { sessionId: string; logData: ISessionLogRequest },
  { rejectValue: string }
>(
  "addSessionLog",
  async ({ sessionId, logData }, { rejectWithValue }) => {
    try {
      const url = `/${SESSION_PATH}/${sessionId}/session-log`;


      const response = await axiosInstance.post<GenericResponse<boolean>>(
        url,
        logData
      );

      console.log("✅ Session log added successfully:", response.data);
      return response.data;
    } catch (err) {
      const error = err as any;
      console.error("❌ API Error:", error.response?.data || error.message);
      const message = error.response?.data?.message || "Không thể thêm log";
      return rejectWithValue(message);
    }
  }
);

// Cancel session
// API endpoint: POST session/{sessionId}/cancel
// Request body: { note: string }
export const cancelSession = createAsyncThunk<
  GenericResponse<boolean>,
  { sessionId: string; cancelData: ICancelSessionRequest },
  { rejectValue: string }
>(
  "cancelSession",
  async ({ sessionId, cancelData }, { rejectWithValue }) => {
    try {
      const url = `/${SESSION_PATH}/${sessionId}/cancel`;

      console.log("🚀 Cancelling session:", url);
      console.log("📦 Cancel data:", cancelData);

      const response = await axiosInstance.post<GenericResponse<boolean>>(
        url,
        cancelData
      );

      console.log("✅ Session cancelled successfully:", response.data);
      return response.data;
    } catch (err) {
      const error = err as any;
      console.error("❌ API Error:", error.response?.data || error.message);
      const message = error.response?.data?.message || "Không thể hủy buổi tập lái";
      return rejectWithValue(message);
    }
  }
);

// Reschedule session
// API endpoint: POST session/{sessionId}/reschedule
// Request body: { note: string }
export const rescheduleSession = createAsyncThunk<
  GenericResponse<boolean>,
  { sessionId: string; rescheduleData: IRescheduleSessionRequest },
  { rejectValue: string }
>(
  "rescheduleSession",
  async ({ sessionId, rescheduleData }, { rejectWithValue }) => {
    try {
      const url = `/${SESSION_PATH}/${sessionId}/reschedule`;


      const response = await axiosInstance.post<GenericResponse<boolean>>(
        url,
        rescheduleData
      );

      console.log("✅ Session rescheduled successfully:", response.data);
      return response.data;
    } catch (err) {
      const error = err as any;
      console.error("❌ API Error:", error.response?.data || error.message);
      const message = error.response?.data?.message || "Không thể đổi lịch buổi tập lái";
      return rejectWithValue(message);
    }
  }
);

export const updateSessionStatus = createAsyncThunk<
  GenericResponse<boolean>,
  { sessionId: string; status: number }, // status is SessionStatus enum value
  { rejectValue: string }
>(
  "updateSessionStatus",
  async ({ sessionId, status }, { rejectWithValue }) => {
    try {
      const url = `/${SESSION_PATH}/${sessionId}/status`;

      console.log("🚀 Updating session status:", url);
      console.log("📦 Status:", status);

      const response = await axiosInstance.patch<GenericResponse<boolean>>(
        url,
        { status }
      );

      console.log("✅ Session status updated successfully:", response.data);
      return response.data;
    } catch (err) {
      const error = err as any;
      console.error("❌ API Error:", error.response?.data || error.message);
      const message = error.response?.data?.message || "Không thể cập nhật trạng thái buổi tập lái";
      return rejectWithValue(message);
    }
  }
);

// Submit feedback for a booking
export const submitFeedback = createAsyncThunk<
  GenericResponse<boolean>,
  IFeedbackRequest,
  { rejectValue: string }
>(
  "submitFeedback",
  async (feedbackData, { rejectWithValue }) => {
    try {
      const url = `/feedback`;

      console.log("🚀 Submitting feedback:", url);
      console.log("📦 Feedback data:", feedbackData);

      const response = await axiosInstance.post<GenericResponse<boolean>>(
        url,
        feedbackData
      );

      console.log("✅ Feedback submitted successfully:", response.data);
      return response.data;
    } catch (err) {
      const error = err as any;
      console.error("❌ API Error:", error.response?.data || error.message);
      const message = error.response?.data?.message || "Không thể gửi phản hồi";
      return rejectWithValue(message);
    }
  }
);



export const cancelBooking = createThunk<
  boolean,
  { bookingId: string }
>(
  HttpMethod.POST,
  "cancelBooking",
  `/${BOOKING_PATH}`,
  {
    buildUrl: (payload) => `/${BOOKING_PATH}/${payload.bookingId}/cancel`
  }
);