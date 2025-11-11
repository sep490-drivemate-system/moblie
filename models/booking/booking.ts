import { BookingStatus, RouteStatus } from "@/constants/enums";

export type PackageType = "instructor" | "full";

export type BookingMode = "daily" | "recurring";
export type ShiftType = "morning" | "afternoon" | "evening";

export interface Shift {
  id: ShiftType;
  label: string;
  time: string;
}

export interface Skill {
  id: string;
  label: string;
  icon: string;
}

export interface RoadType {
  id: string;
  label: string;
  icon: string;
}

export interface IBookingSession {
  id: string;
  date: string;
  time: string;
  status: string;
  completed?: boolean;
}

// For rental screen specific booking structure
export interface IBookingItem {
  id: string;
  instructorName: string;
  date: string;
  time: string;
  location: string;
  status: BookingStatus;
  hasRoute: boolean;
  routeStatus?: RouteStatus;
}

// For car detail screen booking
export interface ICarBooking {
  id: string;
  instructorName: string;
  date: string;
  time: string;
  duration: string;
}

export interface RoutePoint {
  id: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isStart?: boolean;
  isEnd?: boolean;
}

export interface InstructorRoute {
  id: string;
  bookingId: string;
  points: RoutePoint[];
  status: "draft" | "sent" | "accepted" | "rejected";
  notes?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  date: string;
  time: string;
  duration: number; // in minutes
  instructorName: string;
  instructorAvatar: string;
  instructorRating: number;
  vehicleType: string;
  pickupLocation: string;
  status:
    | "upcoming"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "requested"
    | "pending_confirmation"
    | "rejected";
  price: number;
  packageType: "basic" | "standard" | "premium" | "instructor" | "full";
  learningRoute?: LearningRoute;
  hasRoute?: boolean;
  route?: InstructorRoute;
  studentName?: string;
  selectedRoadTypes?: string[];
  selectedSkills?: string[];
  coins?: number;
  sessions?: BookingSession[];
  isMultiSession?: boolean;
}

export interface BookingSession {
  id: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  price: number;
}

export interface CancelRefundInfo {
  refundAmount: number;
  refundPercentage: number;
  penaltyAmount: number;
  hoursUntilSession: number;
  cancellationFee: number;
  instructorCompensation: number;
  systemFee: number;
}

export interface LearningRoute {
  id: string;
  title: string;
  description: string;
  steps: RouteStep[];
  totalDuration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  progress: number; // 0-100
}

export interface RouteStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  roadType: string;
  skills: string[];
  location: string;
  completed: boolean;
}

export interface MapPoint {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description: string;
  type: "start" | "waypoint" | "end";
  roadType?: string;
  skills?: string[];
}

export interface RouteSegment {
  id: string;
  startPoint: MapPoint;
  endPoint: MapPoint;
  distance: number; // in meters
  duration: number; // in minutes
  roadType: string;
  difficulty: "easy" | "medium" | "hard";
  coordinates: Array<{ latitude: number; longitude: number }>;
}

// Session Status Enum
export enum SessionStatus {
  Pending = 1,
  Confirmed = 2,
  Completed = 3,
  Cancelled = 4,
  Rescheduled = 5, // Đổi lịch
}

// API Response types for booking sessions
export interface IBookingSessionAPI {
  id: string;
  packageId: string;
  packageName: string;
  noviceDriverName: string;
  displayName: string | null; // Tên hiển thị của địa điểm
  noviceAvatar: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  duration: number; // in hours
  location: string; // Address text
  vehicleId: string | null;
  startingLatitude: number; // Latitude của điểm đón
  startingLongtitude: number; // Longitude của điểm đón (lưu ý: API dùng "Longtitude" không phải "Longitude")
  vehicleName: string | null;
  status: SessionStatus; // Enum: Pending=1, Confirmed=2, Completed=3, Cancelled=4, Rescheduled=5
  statusDisplayString: string; // "planning", "upcoming", "completed", "cancelled"
  createdAt: string; // ISO datetime
  hasRoute: boolean;
  priceForCar: number | null;
}

export interface IGetBookingSessionsParams {
  bookingId?: string; // Optional for getting all sessions
  status?: number; // Optional status filter
}

export interface IGetAllSessionsParams {
  status?: SessionStatus; // Optional status filter
}
