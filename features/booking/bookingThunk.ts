import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { IUserPackageAPI, IGetUserPackagesParams, BookingStatus } from "@/models/package/user-package";
import { IBookingSessionAPI, IGetBookingSessionsParams } from "@/models/booking/booking";

const BOOKING_PATH = "booking";
const SESSION_PATH = "session";
const INSTRUCTOR_PATH = "instructors";
const NOVICE_DRIVER_PATH = "novice-driver";
const POLICY_PATH = "policy";

// API Response Interfaces
export interface IInstructorSchedule {
  startTime: string; // ISO format
  endTime: string; // ISO format
}

export interface IInstructorBookedSession {
  id: string;
  startTime: string; // ISO format
  endTime: string; // ISO format
  status: number;
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

// Get user packages with optional status filter
export const getUserPackages = createThunk<
  IUserPackageAPI[],
  IGetUserPackagesParams | undefined
>(
  HttpMethod.GET,
  "getUserPackages",
  `/${BOOKING_PATH}`,
  {
    buildUrl: (payload) => {
      const params = new URLSearchParams();
      
      // Nếu có bookingStatus và khác 0 (All), thêm vào query
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
