import { BookingStatus } from "./user-package";

export interface IRentalPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
}

export interface IInstructorOption {
  id: number;
  imageUrl: any;
  title: string;
  description: string;
}

export interface IBuyPackageRequest {
  durationWhenBought: number;
  priceAtBuyingTime: number;
  carId: string | null;
  packageId: string;
  instructorId: string;
}

export interface IBuyPackageResponse {
  id: string;
}

export interface IMyPackges {
  id: string;
  namePackage: string;
  buyDate: string;
  bookingStatus: BookingStatus;
  duration: number;
  price: number;
  durationInUse: number;
  precentInUse: number;
  remainingTime: number;
  instructorId: string;
  roadTypes: string[];
  drivingSkills: string[];
}

export interface DrivingSkill {
  id: string;
  display_name: string;
}

export type RoadType = {
  id: string;
  name: string;
  description: string | null;
};

export interface CreatePackageForm {
  name: string;
  description: string;
  duration: number;
  roadTypes: string[];
  drivingSkills: string[];
  price: number;
  allowNoviceCar: boolean;
  packageCars: string[];
}

export interface Package {
  id: string;
  name: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  allowSelfCar: boolean;
  duration: number;
  roadTypes: string[];
  skills: string[];
  price: number;
  carCount: number;
  bookingCount: number;
}

// Paginated response từ backend
export interface PaginatedPackagesResponse {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  pageContent: Package[];
}

// Request params cho API get packages
export interface GetPackagesParams {
  searchKey?: string;
  allowSelfCar?: boolean;
  roadTypes?: string[];
  drivingSkills?: string[];
  pageNumber?: number;
  pageSize?: number;
}