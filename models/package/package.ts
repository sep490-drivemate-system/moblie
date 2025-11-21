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
  id: string
}


export interface IMyPackgesResponse {
  id: string;
  namePackage: string;
  buyDate: string;
  bookingStatus: BookingStatus;
  duration: number;
  durationInUse: number;
  precentInUse: number;
  remainingTime: number;
  instructorId: string;
  roadTypes: string[];
  drivingSkills: string[];
}