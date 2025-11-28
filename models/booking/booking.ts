import { BookingStatus, RouteStatus } from "@/constants/enums";
import { SessionStatus } from "../session/session.enum";

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

// Old interface - replaced by API Response type below
// export interface IBookingSession {
//   id: string;
//   date: string;
//   time: string;
//   status: string;
//   completed?: boolean;
// }

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
export interface IBookingSession {
  id: string;
  packageName: string;
  displayStartLocationName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  startingLatitude: number;
  startingLongtitude: number;
  displayEndLocationName: string;
  endingLatitude: number;
  endingLongtitude: number;
  vehicleName: string | null;
  status: SessionStatus;
  createdAt: string;
}

export interface IGetBookingSessionsParams {
  bookingId?: string; // Optional for getting all sessions
  status?: number; // Optional status filter
}

export interface IGetAllSessionsParams {
  status?: SessionStatus; // Optional status filter
}

// Session Detail Response
export interface ISessionDetailResponse {
  displayStartLocationName: string;
  startingLatitude: number;
  startingLongtitude: number;
  displayEndLocationName: string;
  endingLatitude: number;
  endingLongtitude: number;
  status: SessionStatus;
}

export { SessionStatus };

