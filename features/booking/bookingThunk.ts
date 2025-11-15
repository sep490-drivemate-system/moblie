import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { IUserPackageAPI, IGetUserPackagesParams, BookingStatus } from "@/models/package/user-package";
import { IBookingSessionAPI, IGetBookingSessionsParams, IGetAllSessionsParams } from "@/models/booking/booking";
import { ISaveSessionRoutesPayload, IGetSessionRoutesResponse } from "@/models/route/route";
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
export interface IInstructorSchedule {
  startTime: string; // Date string format: YYYY-MM-DD (e.g., "2025-11-12")
  endTime: string; // Date string format: YYYY-MM-DD (e.g., "2025-11-19")
}

export interface IInstructorBookedSession {
  id?: string; // Optional - may not be included in API response
  startTime: string; // ISO datetime format (e.g., "2025-11-13T10:00:00")
  endTime: string; // ISO datetime format (e.g., "2025-11-13T11:00:00")
  status?: number; // Optional - booking status
}

export interface INoviceDriverAddress {
  id: string;
  addressString: string;
  latitude: number;
  longitude: number;
  displayName: string;
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
  IBookingSessionAPI[],
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

// Get all sessions (for rental screen) with optional status filter
// API endpoint: booking/sessions?status=1
export const getAllSessions = createThunk<
  IBookingSessionAPI[],
  IGetAllSessionsParams | undefined
>(
  HttpMethod.GET,
  "getAllSessions",
  `/${BOOKING_PATH}/sessions`,
  {
    buildUrl: (payload) => {
      const params = new URLSearchParams();

      // Add status filter if provided
      if (payload?.status !== undefined) {
        params.append('status', payload.status.toString());
      }

      const queryString = params.toString();
      return `/${BOOKING_PATH}/sessions${queryString ? `?${queryString}` : ''}`;
    }
  }
);

// Get instructor available schedule
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

// Get instructor booked sessions
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
export const getNoviceDriverAddresses = createThunk<
  INoviceDriverAddress[],
  void
>(
  HttpMethod.GET,
  "getNoviceDriverAddresses",
  `/${NOVICE_DRIVER_PATH}/address`
);

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
// API returns boolean: true if success, false if failed
export const createSession = createThunk<
  boolean,
  ICreateSessionRequest
>(
  HttpMethod.POST,
  "createSession",
  `/${SESSION_PATH}`
);

// Save session routes
// API endpoint: POST session/{sessionId}/routes
// Request body: array of route items
// Note: Using custom approach because we need sessionId in URL but routes array in body
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

// Get session routes
// API endpoint: GET session/{sessionId}/routes
// Response: { sessionStartingLat, sessionStartingLong, routes: [] }
export const getSessionRoutes = createAsyncThunk<
  GenericResponse<IGetSessionRoutesResponse>,
  string, // sessionId
  { rejectValue: string }
>(
  "getSessionRoutes",
  async (sessionId, { rejectWithValue }) => {
    try {
      const url = `/${SESSION_PATH}/${sessionId}/routes`;

      console.log("🚀 Fetching routes from:", url);

      const response = await axiosInstance.get<GenericResponse<IGetSessionRoutesResponse>>(
        url
      );

      console.log("✅ Routes fetched successfully:", response.data);
      return response.data;
    } catch (err) {
      const error = err as any;
      console.error("❌ API Error:", error.response?.data || error.message);
      const message = error.response?.data?.message || "Không thể lấy thông tin lộ trình";
      return rejectWithValue(message);
    }
  }
);

// Add session log (tracking)
// API endpoint: POST session/{sessionId}/session-log
// Request body: { streetName, latitude, longitude, heading, speed }
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
