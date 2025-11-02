import { gender } from "@/constants/enums";
import { Car } from "../car/car";

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
  name: string;
  avatar: string;
  experience: string;
  averageRating: number;
  totalBookings: number;
  totalPackages: number;
}

export interface IInstructor {
  id: string;
  name: string;
  avatar: string;
  experience: string;
  experienceYears: number;
  rating: number;
  description: string;
  totalBookings: number;
  gender: gender;
  vehicels?: Car[];
  packages?: InstructorPackage[];
  price?: number; // Base price for display purposes
}

// Type for InstructorItem component (with price for display)
export type Instructor = IInstructor & {
  price: number;
};
