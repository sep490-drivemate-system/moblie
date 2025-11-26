import { gender } from "@/constants/enums";
import { Car, LicenseTier } from "../car/car";
import { Gender } from "../user/gender.enum";

export interface IInstructorPackages {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  instructorId: string;
  drivingSkills: string[];
  roadTypes: string[];
  isRentalCar: boolean;
}

export interface IInstructorCar {
  id: string;
  thumbnailUrl: string;
  modelName: string;
  licenseTier: LicenseTier;
  unitPrice: number;
  seatCounts: number;
  vehicleType: string | null;
}

// Legacy UI type (keep for compatibility)
export interface InstructorPackage {
  id: string;
  name: string;
  duration: number; // in hours
  roadTypes: string[]; // ['Khu dân cư', 'Đô thị', 'Cao tốc', etc.]
  skills: string[]; // ['Điều khiển cơ bản', 'Đỗ xe', 'Chuyển làn', etc.]
  hasVehicle: boolean;
  basePrice: number; // Giá cơ bản của gói
  vehiclePrice?: number; // Giá xe thêm (nếu có xe)
  vehicle?: Car;
}

export interface IInstructors {
  id: string;
  fullName: string;
  bio: string;
  avatar: string;
  gender: Gender;
  experienceYear: string;
  averageRating: number;
  bookingCount: number;
  packageCount: number;
}

// Paginated response từ backend
export interface PaginatedInstructorsResponse {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  pageContent: IInstructors[];
}

// Request params cho API
export interface GetInstructorsParams {
  searchKey?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface IInstructor {
  id: string;
  name: string;
  avatar: string;

  experienceYears: number;
  rating: number;
  bio: string;
  totalBookings: number;
  gender: gender;
  packages?: InstructorPackage[]; // Optional packages array
  price?: number; // Optional price for some instructors
  vehicels?: any[]; // Optional vehicles (typo in data, keeping for compatibility)
}

// Type for InstructorItem component (with price for display)
export type Instructor = IInstructor & {
  price: number;
};
